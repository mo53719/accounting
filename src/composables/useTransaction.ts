import { computed } from 'vue'
import { useTransactionStore } from '../stores/transaction'
import { useBookStore } from '../stores/book'
import dayjs from 'dayjs'

export function useTransaction() {
  const transactionStore = useTransactionStore()
  const bookStore = useBookStore()

  const transactions = computed(() => transactionStore.transactions)

  const currentMonthTransactions = computed(() => {
    const now = dayjs()
    const year = now.year()
    const month = now.month() + 1
    const prefix = `${year}-${String(month).padStart(2, '0')}`
    return transactionStore.transactions.filter(t => t.date.startsWith(prefix))
  })

  // 按月份偏移获取交易（用于首页月份切换）
  function getMonthTransactions(offset: number) {
    const d = dayjs().add(offset, 'month')
    const prefix = d.format('YYYY-MM')
    return transactionStore.transactions.filter(t => t.date.startsWith(prefix))
  }

  // 获取指定月份的收支统计
  function getMonthStats(offset: number) {
    const monthTx = getMonthTransactions(offset)
    const income = monthTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const expense = monthTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    return { income, expense, balance: income - expense }
  }

  // 获取今日支出
  function getTodayExpense(offset: number = 0) {
    const d = dayjs().add(offset, 'month')
    const today = d.format('YYYY-MM-DD')
    // 只在当前月才计算今日支出
    if (offset !== 0) return 0
    return transactionStore.transactions
      .filter(t => t.type === 'expense' && t.date === today)
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const monthlyIncome = computed(() =>
    currentMonthTransactions.value.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  )

  const monthlyExpense = computed(() =>
    currentMonthTransactions.value.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  )

  const monthlyBalance = computed(() => monthlyIncome.value - monthlyExpense.value)

  function addTransaction(data: {
    type: string
    amount: number
    date: string
    category: string
    paymentMethod: string
    note: string
    createdBy?: string
    socialType?: {
      category: 'borrow' | 'redpacket' | 'gift' | 'advance'
      direction: 'out' | 'in'
      counterparty: string
      relationship: string
      settled: boolean
    }
  }) {
    const transaction = {
      bookId: bookStore.bookId,
      ...data,
      createdBy: data.createdBy || bookStore.deviceName,
    }

    // 直接写入本地存储（Capacitor WebView 中数据持久化到 /data/data/.../）
    const localId = `local_${Date.now()}`
    transactionStore.addTransaction({
      ...transaction,
      objectId: localId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }

  function removeTransaction(objectId: string) {
    transactionStore.removeTransaction(objectId)
  }

  function setTransactions(list: any[]) {
    transactionStore.setTransactions(list)
  }

  return {
    transactions,
    currentMonthTransactions,
    monthlyIncome,
    monthlyExpense,
    monthlyBalance,
    addTransaction,
    removeTransaction,
    setTransactions,
    getMonthTransactions,
    getMonthStats,
    getTodayExpense,
  }
}
