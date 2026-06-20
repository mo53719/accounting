import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getLocal, setLocal } from '../utils/storage'
import { idbGet, idbSet, IDB_STORES, bootstrapIDB } from '../utils/idb'
import dayjs from 'dayjs'

export interface Transaction {
  objectId: string
  bookId: string
  type: string
  amount: number
  date: string
  category: string
  paymentMethod: string
  note: string
  createdBy: string
  createdAt: string
  updatedAt: string
  source?: string
  autoParsed?: boolean
  tags?: string[]
  images?: string[]
  periodId?: string
  taxRate?: number
  taxAmount?: number
  netAmount?: number
  socialType?: {
    category: 'borrow' | 'redpacket' | 'gift' | 'advance'
    direction: 'out' | 'in'
    counterparty: string
    relationship: string
    settled: boolean
  }
  lendBorrow?: {
    direction: 'lend' | 'borrow'
    counterparty: string
    settled: boolean
  }
  reimbursement?: {
    status: 'pending' | 'approved' | 'rejected'
    applicant: string
  }
  savingsPlanId?: string
  reminderId?: string
}

/* 内存标记：是否已尝试从 IDB 加载（避免重复 IO） */
let _idbLoaded = false

/** 从 IDB 加载并合并到内存（仅加载一次） */
async function loadFromIDB(): Promise<Transaction[] | null> {
  await bootstrapIDB()
  const list = await idbGet<Transaction[]>(IDB_STORES.KV, 'transactions')
  return list
}

/** 异步写：写 IDB（主） + 写 localStorage（兜底） */
async function persistAll(list: Transaction[]): Promise<boolean> {
  // localStorage 同步写（可能抛 QuotaExceeded）
  try {
    setLocal('transactions', list)
  } catch (e) {
    console.warn('[transaction] localStorage 写入失败（IDB 兜底）', e)
  }
  // IDB 异步写
  const ok = await idbSet(IDB_STORES.KV, 'transactions', list)
  return ok
}

export const useTransactionStore = defineStore('transaction', () => {
  // 初始化：先从 localStorage 读（保证首屏立即有数据），再后台从 IDB 覆盖
  const transactions = ref<Transaction[]>(getLocal<Transaction[]>('transactions') || [])

  if (!_idbLoaded) {
    _idbLoaded = true
    loadFromIDB().then((list) => {
      if (list && Array.isArray(list)) {
        // 仅在 IDB 数据更全时覆盖（避免回退覆盖本地新增）
        if (list.length > transactions.value.length) {
          transactions.value = list
        } else if (list.length === transactions.value.length) {
          // 同长度但 IDB 版本更新则覆盖
          const localUpdated = transactions.value.reduce((max, t) => Math.max(max, new Date(t.updatedAt || 0).getTime()), 0)
          const idbUpdated = list.reduce((max, t) => Math.max(max, new Date(t.updatedAt || 0).getTime()), 0)
          if (idbUpdated > localUpdated) transactions.value = list
        }
      }
    }).catch(e => {
      console.warn('[transaction] IDB 加载失败，使用 localStorage 数据', e)
    })
  }

  function setTransactions(data: Transaction[]) {
    transactions.value = data
    persistAll(data)
  }

  function addTransaction(t: Transaction) {
    transactions.value.unshift(t)
    persistAll(transactions.value)
  }

  function removeTransaction(objectId: string) {
    transactions.value = transactions.value.filter(t => t.objectId !== objectId)
    persistAll(transactions.value)
  }

  function updateLocalId(localId: string, realId: string) {
    const t = transactions.value.find(t => t.objectId === localId)
    if (t) {
      t.objectId = realId
      persistAll(transactions.value)
    }
  }

  function updateTransaction(objectId: string, patch: Partial<Transaction>) {
    const t = transactions.value.find(x => x.objectId === objectId)
    if (!t) return
    Object.assign(t, patch, { updatedAt: new Date().toISOString() })
    persistAll(transactions.value)
  }

  // 总记录数
  const totalCount = computed(() => transactions.value.length)

  // 连续记账天数（从今天往前推）
  const consecutiveDays = computed(() => {
    if (transactions.value.length === 0) return 0
    const dates = new Set(transactions.value.map(t => t.date))
    let count = 0
    let d = dayjs()
    while (dates.has(d.format('YYYY-MM-DD'))) {
      count++
      d = d.subtract(1, 'day')
    }
    return count
  })

  // 坚持记账天数（从首条记录至今）
  const persistentDays = computed(() => {
    if (transactions.value.length === 0) return 0
    const dates = transactions.value.map(t => t.date).sort()
    const firstDate = dayjs(dates[0])
    const today = dayjs()
    return Math.max(1, today.diff(firstDate, 'day') + 1)
  })

  // 周期记账（按 periodId 分组）
  const periodGroups = computed(() => {
    const groups: Record<string, Transaction[]> = {}
    for (const t of transactions.value) {
      if (t.periodId) {
        if (!groups[t.periodId]) groups[t.periodId] = []
        groups[t.periodId].push(t)
      }
    }
    return groups
  })

  // 报销
  const reimbursementTransactions = computed(() =>
    transactions.value.filter(t => t.reimbursement)
  )

  // 税费
  const taxTransactions = computed(() =>
    transactions.value.filter(t => t.taxAmount !== undefined)
  )

  // 人情往来同步记录（记账中标记了 socialType 的）
  const socialTransactions = computed(() =>
    transactions.value.filter(t => t.socialType)
  )

  // 标签
  const allTags = computed(() => {
    const set = new Set<string>()
    for (const t of transactions.value) {
      if (t.tags) t.tags.forEach(tag => set.add(tag))
    }
    return Array.from(set)
  })

  return {
    transactions,
    setTransactions,
    addTransaction,
    removeTransaction,
    updateTransaction,
    updateLocalId,
    totalCount,
    consecutiveDays,
    persistentDays,
    periodGroups,
    reimbursementTransactions,
    taxTransactions,
    socialTransactions,
    allTags,
  }
})
