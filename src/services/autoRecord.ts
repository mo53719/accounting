// src/services/autoRecord.ts
// =====================================================================
// 自动记账 - 全局单例服务
// ---------------------------------------------------------------------
// 设计目标：
// 1. 服务在 App 启动时 init 一次，**与 Vue 组件实例解耦**
// 2. 离开"自动记账"页面、切换路由、App 切后台时，监听持续运行
// 3. App 进程被系统杀死时，Java 端 NotificationListenerService 仍工作
//    并把数据存进 SharedPreferences 队列
// 4. App 恢复前台时自动 flush 队列，补抓死亡期内的通知
// 5. 提供订阅者模式，UI 实时反映状态
// =====================================================================

import { registerPlugin } from '@capacitor/core'
import dayjs from 'dayjs'

/* ============= 共享类型 ============= */
export interface AutoRecordLastRecord {
  type: 'expense' | 'income'
  amount: number
  merchant: string
  source: string
  timestamp: number
  date: string
}

export interface AutoRecordState {
  enabled: boolean
  permissionGranted: boolean
  lastRecord: AutoRecordLastRecord | null
  isNative: boolean
  isListening: boolean
}

interface ParsedRecord extends AutoRecordLastRecord {
  paymentMethod: string
  category: string
  rawText: string
}

/* ============= 兼容 Web 端的空实现 ============= */
const AutoRecord: any = registerPlugin('AutoRecord', {
  web: () => ({
    checkPermission: async () => ({ granted: false }),
    requestPermission: async () => undefined,
    startListening: async () => ({ started: false }),
    stopListening: async () => ({ stopped: true }),
    flushQueue: async () => ({ records: [] }),
    addListener: async () => ({ remove: () => {} }),
  }),
})

/* ============= 支付方式映射 ============= */
const SOURCE_MAP: Record<string, { label: string; category: string; paymentMethod: string }> = {
  wechat: { label: '微信支付', category: '餐饮', paymentMethod: '微信支付' },
  alipay: { label: '支付宝', category: '购物', paymentMethod: '支付宝' },
  bank_icbc: { label: '工商银行', category: '居家', paymentMethod: '银行卡' },
  bank_ccb: { label: '建设银行', category: '居家', paymentMethod: '银行卡' },
  bank_cmb: { label: '招商银行', category: '居家', paymentMethod: '银行卡' },
  bank_abc: { label: '农业银行', category: '居家', paymentMethod: '银行卡' },
}

const STORAGE_KEYS = {
  enabled: 'autoRecordEnabled',
  pending: 'autoRecordPendingQueue',
  transactions: 'transactions',
  lastRecord: 'autoRecordLastRecord',
}

/* ============= 全局单例类 ============= */
class AutoRecordService {
  private _initialized = false
  private _enabled: boolean = (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEYS.enabled) === 'true')
  private _permissionGranted = false
  private _lastRecord: AutoRecordLastRecord | null = this._loadLastRecord()
  private _listeners: Set<(s: AutoRecordState) => void> = new Set()
  private _listenerHandle: any = null
  private _appStateUnsub: any = null

  /** App 启动时调用一次 */
  async init(): Promise<void> {
    if (this._initialized) return
    this._initialized = true
    console.info('[autoRecord] 服务初始化')

    try {
      const r = await AutoRecord.checkPermission()
      this._permissionGranted = !!(r as any)?.granted

      if (typeof AutoRecord.addListener === 'function') {
        this._listenerHandle = await AutoRecord.addListener('autoRecord', (data: any) => {
          this._handleNotification(data).catch((e: any) => console.warn('[autoRecord] 处理通知失败:', e))
        })
      }

      try {
        const { App } = await import('@capacitor/app')
        this._appStateUnsub = await App.addListener('appStateChange', ({ isActive }: { isActive: boolean }) => {
          if (isActive) this.flushPendingRecords().catch(() => {})
        })
      } catch (e) { /* App 插件不可用 */ }

      await this.flushPendingRecords()

      if (this._enabled && this._permissionGranted) {
        await this._startNative()
      }

      this._notify()
    } catch (e) {
      console.warn('[autoRecord] init 失败:', e)
    }
  }

  subscribe(fn: (s: AutoRecordState) => void): () => void {
    this._listeners.add(fn)
    try { fn(this.getState()) } catch (e) { /* ignore */ }
    return () => { this._listeners.delete(fn) }
  }

  private _notify() {
    const state = this.getState()
    this._listeners.forEach(fn => {
      try { fn(state) } catch (e) { /* ignore */ }
    })
  }

  getState(): AutoRecordState {
    return {
      enabled: this._enabled,
      permissionGranted: this._permissionGranted,
      lastRecord: this._lastRecord,
      isNative: typeof window !== 'undefined' && !!(window as any).Capacitor,
      isListening: this._enabled && this._permissionGranted,
    }
  }

  async checkPermission(): Promise<boolean> {
    try {
      const r = await AutoRecord.checkPermission()
      this._permissionGranted = !!(r as any)?.granted
      this._notify()
      return this._permissionGranted
    } catch (e) {
      this._permissionGranted = false
      return false
    }
  }

  async requestPermission(): Promise<void> {
    try { await AutoRecord.requestPermission() }
    catch (e) { console.warn('[autoRecord] requestPermission 失败:', e) }
  }

  async start(): Promise<boolean> {
    if (!this._permissionGranted) {
      const ok = await this.checkPermission()
      if (!ok) {
        await this.requestPermission()
        this._notify()
        return false
      }
    }
    await this._startNative()
    this._enabled = true
    try { localStorage.setItem(STORAGE_KEYS.enabled, 'true') } catch {}
    this._notify()
    return true
  }

  async stop(): Promise<void> {
    try { await AutoRecord.stopListening() } catch (e) { /* ignore */ }
    this._enabled = false
    try { localStorage.setItem(STORAGE_KEYS.enabled, 'false') } catch {}
    this._notify()
  }

  private async _startNative(): Promise<void> {
    try { await AutoRecord.startListening() } catch (e) { /* ignore */ }
  }

  private async _handleNotification(data: any): Promise<void> {
    const { source, amount, type, merchant, rawText, timestamp } = data || {}
    if (!source || !amount || amount <= 0) return

    const record = this._parseRecord(source, amount, type, merchant, rawText, timestamp)
    if (!record) return

    if (this._isDuplicate(record)) {
      console.info('[autoRecord] 重复记录跳过:', record.merchant, record.amount)
      return
    }

    await this._saveToStore(record)

    this._lastRecord = {
      type: record.type,
      amount: record.amount,
      merchant: record.merchant,
      source: record.source,
      timestamp: record.timestamp,
      date: record.date,
    }
    this._saveLastRecord(this._lastRecord)
    this._notify()
    console.info('[autoRecord] 已自动入账:', record)
  }

  private _parseRecord(source: string, amount: number, type: string | undefined, merchant: string | undefined, rawText: string | undefined, timestamp: number | undefined): ParsedRecord | null {
    const mapping = SOURCE_MAP[source] || { label: source, category: '其他', paymentMethod: '其他' }
    const text = rawText || ''

    let txType: 'expense' | 'income' = (type === 'income' || type === 'expense') ? type : 'expense'
    if (!type) {
      if (/(收到|收款|转入|入账)/.test(text)) txType = 'income'
      else txType = 'expense'
    }

    let extractedMerchant: string = merchant || ''
    if (!extractedMerchant) {
      const m1 = text.match(/你向\s*(.+?)\s*支付/)
      const m2 = text.match(/收到\s*(.+?)\s*转账/)
      const m3 = text.match(/向\s*(.+?)\s*付款/)
      const m4 = text.match(/(.+?)收款/)
      extractedMerchant = (m1 && m1[1]) || (m2 && m2[1]) || (m3 && m3[1]) || (m4 && m4[1]) || mapping.label
    }
    extractedMerchant = String(extractedMerchant).trim().slice(0, 30)

    return {
      source,
      type: txType,
      amount: Number(amount),
      merchant: extractedMerchant,
      paymentMethod: mapping.paymentMethod,
      category: txType === 'expense' ? mapping.category : '其他收入',
      rawText: text,
      timestamp: timestamp || Date.now(),
      date: dayjs(timestamp || Date.now()).format('YYYY-MM-DD'),
    }
  }

  private _isDuplicate(record: AutoRecordLastRecord): boolean {
    try {
      const list = this._readTransactions()
      const t = record.timestamp
      return list.some((tx: any) => {
        if (!tx.autoParsed) return false
        const created = tx.createdAt ? new Date(tx.createdAt).getTime() : 0
        return (
          Math.abs(created - t) < 60000 &&
          Number(tx.amount) === record.amount &&
          (tx.merchant === record.merchant || (tx.note && tx.note.includes(record.merchant)))
        )
      })
    } catch { return false }
  }

  private async _saveToStore(record: ParsedRecord): Promise<void> {
    const list = this._readTransactions()
    const localId = `auto_${record.timestamp}_${Math.floor(Math.random() * 10000)}`

    const tx: any = {
      objectId: localId,
      bookId: this._getCurrentBookId(),
      type: record.type,
      amount: record.amount,
      date: record.date,
      category: record.category,
      paymentMethod: record.paymentMethod,
      note: `自动记录 - ${record.merchant}`,
      source: record.source,
      autoParsed: true,
      merchant: record.merchant,
      createdAt: new Date(record.timestamp).toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: this._getDeviceName(),
    }
    list.push(tx)
    try { localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(list)) } catch {}

    try {
      const { useTransactionStore } = await import('../stores/transaction')
      const store = useTransactionStore()
      if (store && typeof store.setTransactions === 'function') {
        store.setTransactions(list)
      }
    } catch (e) { /* store 未初始化 */ }
  }

  async flushPendingRecords(): Promise<void> {
    try {
      if (typeof AutoRecord.flushQueue !== 'function') return
      const r: any = await AutoRecord.flushQueue()
      if (r && Array.isArray(r.records) && r.records.length) {
        console.info(`[autoRecord] 补抓 ${r.records.length} 条历史通知`)
        for (const data of r.records) {
          await this._handleNotification(data)
        }
      }
    } catch (e) { /* ignore */ }
  }

  private _readTransactions(): any[] {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.transactions) || '[]') }
    catch { return [] }
  }

  private _getCurrentBookId(): string {
    try { return localStorage.getItem('currentBookId') || 'default' } catch { return 'default' }
  }

  private _getDeviceName(): string {
    try { return localStorage.getItem('deviceName') || '我' } catch { return '我' }
  }

  private _loadLastRecord(): AutoRecordLastRecord | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.lastRecord)
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  }

  private _saveLastRecord(record: AutoRecordLastRecord): void {
    try { localStorage.setItem(STORAGE_KEYS.lastRecord, JSON.stringify(record)) } catch { /* ignore */ }
  }
}

/* 导出全局单例 */
export const autoRecordService = new AutoRecordService()

/* 兼容旧 API */
export function useAutoRecord() {
  return {
    isAutoRecordEnabled: { value: autoRecordService.getState().enabled },
    isPermissionGranted: { value: autoRecordService.getState().permissionGranted },
    autoRecordSource: { value: autoRecordService.getState().lastRecord?.source || '' },
    checkPermission: autoRecordService.checkPermission.bind(autoRecordService),
    requestPermission: autoRecordService.requestPermission.bind(autoRecordService),
    startAutoRecord: autoRecordService.start.bind(autoRecordService),
    stopAutoRecord: autoRecordService.stop.bind(autoRecordService),
    initAutoRecord: autoRecordService.init.bind(autoRecordService),
  }
}
