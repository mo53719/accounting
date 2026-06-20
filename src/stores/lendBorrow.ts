import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getLocal, setLocal } from '../utils/storage'
import { idbGet, idbSet, IDB_STORES, bootstrapIDB } from '../utils/idb'

/**
 * 人情往来 - 对象类型
 *  - borrow   : 借钱
 *  - redpacket: 红包
 *  - gift     : 礼金
 *  - advance  : 代付
 */
export type LendBorrowCategory = 'borrow' | 'redpacket' | 'gift' | 'advance'

export type LendDirection = 'out' | 'in'

export interface LendBorrowRecord {
  id: string
  category: LendBorrowCategory
  direction: LendDirection
  counterparty: string
  relationship: string
  amount: number
  date: string
  note: string
  settled: boolean
  source: 'manual' | 'sync'
  sourceTransactionId?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export const LendBorrowCategoryLabels: Record<LendBorrowCategory, string> = {
  borrow: '借钱',
  redpacket: '红包',
  gift: '礼金',
  advance: '代付',
}

export function getTypeLabel(category: LendBorrowCategory, direction: LendDirection): string {
  const base = LendBorrowCategoryLabels[category]
  if (category === 'borrow') return direction === 'out' ? '借出' : '借入'
  if (category === 'redpacket') return direction === 'out' ? '发红包' : '收红包'
  if (category === 'gift') return direction === 'out' ? '送礼' : '收礼'
  if (category === 'advance') return direction === 'out' ? '代付' : '代收'
  return base
}

let _idbLoaded = false

async function persist(list: LendBorrowRecord[]) {
  try {
    setLocal('lendBorrowRecords', list)
  } catch (e) {
    console.warn('[lendBorrow] localStorage 写入失败（IDB 兜底）', e)
  }
  await bootstrapIDB()
  await idbSet(IDB_STORES.KV, 'lendBorrowRecords', list)
}

export const useLendBorrowStore = defineStore('lendBorrow', () => {
  const records = ref<LendBorrowRecord[]>(getLocal<LendBorrowRecord[]>('lendBorrowRecords') || [])

  if (!_idbLoaded) {
    _idbLoaded = true
    ;(async () => {
      await bootstrapIDB()
      const list = await idbGet<LendBorrowRecord[]>(IDB_STORES.KV, 'lendBorrowRecords')
      if (list && Array.isArray(list) && list.length >= records.value.length) {
        records.value = list
      }
    })().catch(e => console.warn('[lendBorrow] IDB 加载失败', e))
  }

  function setRecords(list: LendBorrowRecord[]) {
    records.value = list
    persist(records.value)
  }

  function addRecord(data: Omit<LendBorrowRecord, 'id' | 'settled' | 'source' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString()
    const record: LendBorrowRecord = {
      id: `lb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      settled: false,
      source: 'manual',
      createdAt: now,
      updatedAt: now,
      ...data,
    }
    records.value.unshift(record)
    persist(records.value)
    return record
  }

  function removeRecord(id: string) {
    records.value = records.value.filter(r => r.id !== id)
    persist(records.value)
  }

  function updateRecord(id: string, patch: Partial<LendBorrowRecord>) {
    const r = records.value.find(x => x.id === id)
    if (!r) return
    Object.assign(r, patch, { updatedAt: new Date().toISOString() })
    persist(records.value)
  }

  function markSettled(id: string, settled: boolean = true) {
    updateRecord(id, { settled })
  }

  const lendTotal = computed(() =>
    records.value
      .filter(r => r.direction === 'out' && r.category === 'borrow' && !r.settled)
      .reduce((s, r) => s + r.amount, 0)
  )

  const borrowTotal = computed(() =>
    records.value
      .filter(r => r.direction === 'in' && r.category === 'borrow' && !r.settled)
      .reduce((s, r) => s + r.amount, 0)
  )

  const totalCount = computed(() => records.value.length)
  const settledCount = computed(() => records.value.filter(r => r.settled).length)
  const pendingCount = computed(() => records.value.filter(r => !r.settled).length)

  const pendingBorrowCount = computed(() =>
    records.value.filter(r => r.category === 'borrow' && !r.settled).length
  )

  return {
    records,
    setRecords,
    addRecord,
    removeRecord,
    updateRecord,
    markSettled,
    lendTotal,
    borrowTotal,
    totalCount,
    settledCount,
    pendingCount,
    pendingBorrowCount,
  }
})
