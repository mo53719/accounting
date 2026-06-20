// composables/useFilteredStats.ts
// 通用筛选统计：HomeView + StatsView 共享同一套计算逻辑
// 保证两处看到的数字 100% 一致
// ----------------------------------------------------------------

import { computed, type Ref } from 'vue'
import { useTransactionStore, type Transaction } from '../stores/transaction'
import { useCategoryStore } from '../stores/category'
import { useBookStore } from '../stores/book'
import dayjs from 'dayjs'

export type TimeRange = 'day' | 'month' | 'year' | 'all' | 'custom'

interface UseFilteredStatsOptions {
  /** 时间维度 */
  timeRange: Ref<TimeRange>
  /** 日/月/年维度的偏移（0=当前） */
  dateOffset: Ref<number>
  /** 自定义范围（仅 custom 时用） */
  customStart?: Ref<string>
  customEnd?: Ref<string>
  /** 是否限定当前账本（默认 true） */
  scopeToCurrentBook?: boolean
}

export function useFilteredStats(opts: UseFilteredStatsOptions) {
  const transactionStore = useTransactionStore()
  const categoryStore = useCategoryStore()
  const bookStore = useBookStore()

  /** 解析出当前筛选的时间区间 [start, end]（含端点） */
  const dateRange = computed<{ start: string; end: string }>(() => {
    const tr = opts.timeRange.value
    const off = opts.dateOffset.value
    if (tr === 'day') {
      const d = dayjs().add(off, 'day')
      return { start: d.format('YYYY-MM-DD'), end: d.format('YYYY-MM-DD') }
    }
    if (tr === 'month') {
      const d = dayjs().add(off, 'month')
      const start = d.startOf('month').format('YYYY-MM-DD')
      const end = d.endOf('month').format('YYYY-MM-DD')
      return { start, end }
    }
    if (tr === 'year') {
      const d = dayjs().add(off, 'year')
      const start = d.startOf('year').format('YYYY-MM-DD')
      const end = d.endOf('year').format('YYYY-MM-DD')
      return { start, end }
    }
    if (tr === 'custom') {
      const s = opts.customStart?.value || dayjs().format('YYYY-MM-DD')
      const e = opts.customEnd?.value || dayjs().format('YYYY-MM-DD')
      return s <= e ? { start: s, end: e } : { start: e, end: s }
    }
    // all
    return { start: '0000-01-01', end: '9999-12-31' }
  })

  /** 综合筛选后的账单列表（时间区间 + 账本） */
  const filteredTransactions = computed<Transaction[]>(() => {
    const { start, end } = dateRange.value
    const scopeBook = opts.scopeToCurrentBook !== false
    const currentBookId = bookStore.bookId
    return transactionStore.transactions.filter(t => {
      if (t.date < start || t.date > end) return false
      if (scopeBook && t.bookId !== currentBookId) return false
      return true
    })
  })

  const totalIncome = computed(() =>
    filteredTransactions.value
      .filter(t => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0)
  )
  const totalExpense = computed(() =>
    filteredTransactions.value
      .filter(t => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0)
  )
  const balance = computed(() => totalIncome.value - totalExpense.value)

  /** 支出按分类汇总（带分类元数据） */
  const expenseByCategory = computed(() => {
    const map: Record<string, number> = {}
    filteredTransactions.value
      .filter(t => t.type === 'expense')
      .forEach(t => {
        map[t.category] = (map[t.category] || 0) + t.amount
      })
    return Object.entries(map)
      .map(([name, value]) => {
        const cat = categoryStore.findCategory(name, 'expense')
        return {
          name,
          value: Math.round(value * 100) / 100,
          itemStyle: { color: cat?.color || '#BDC3C7' },
        }
      })
      .sort((a, b) => b.value - a.value)
  })

  const incomeByCategory = computed(() => {
    const map: Record<string, number> = {}
    filteredTransactions.value
      .filter(t => t.type === 'income')
      .forEach(t => {
        map[t.category] = (map[t.category] || 0) + t.amount
      })
    return Object.entries(map)
      .map(([name, value]) => {
        const cat = categoryStore.findCategory(name, 'income')
        return {
          name,
          value: Math.round(value * 100) / 100,
          itemStyle: { color: cat?.color || '#95A5A6' },
        }
      })
      .sort((a, b) => b.value - a.value)
  })

  /** 月度柱状图：基于当前时间维度的"对应自然年/全部"逐月 */
  const monthlyBarData = computed(() => {
    const tr = opts.timeRange.value
    const off = opts.dateOffset.value
    let months: string[] = []
    let incomes: number[] = []
    let expenses: number[] = []
    if (tr === 'year' || tr === 'all') {
      // year → 该年 12 个月；all → 当前年 12 个月
      const d = tr === 'year' ? dayjs().add(off, 'year') : dayjs()
      const year = d.year()
      for (let m = 1; m <= 12; m++) {
        const prefix = `${year}-${m < 10 ? '0' + m : String(m)}`
        months.push(`${m}月`)
        const monthTx = transactionStore.transactions.filter(t => t.date.startsWith(prefix) && (!opts.scopeToCurrentBook || t.bookId === bookStore.bookId))
        incomes.push(Math.round(monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) * 100) / 100)
        expenses.push(Math.round(monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0) * 100) / 100)
      }
    } else {
      // day / month / custom → 当前 ± 6 个月窗口
      const center = tr === 'day' ? dayjs().add(off, 'day')
        : tr === 'month' ? dayjs().add(off, 'month').startOf('month')
        : dayjs((opts.customStart?.value || dayjs().format('YYYY-MM-DD')))
      for (let i = 5; i >= 0; i--) {
        const d = center.subtract(i, 'month')
        const prefix = d.format('YYYY-MM')
        months.push(d.format('M月'))
        const monthTx = transactionStore.transactions.filter(t => t.date.startsWith(prefix) && (!opts.scopeToCurrentBook || t.bookId === bookStore.bookId))
        incomes.push(Math.round(monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) * 100) / 100)
        expenses.push(Math.round(monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0) * 100) / 100)
      }
    }
    return { months, incomes, expenses }
  })

  /** 笔数 */
  const expenseCount = computed(() => filteredTransactions.value.filter(t => t.type === 'expense').length)
  const incomeCount = computed(() => filteredTransactions.value.filter(t => t.type === 'income').length)

  /** 活跃天数（去重日期数） */
  const activeDays = computed(() => new Set(filteredTransactions.value.map(t => t.date)).size)

  return {
    dateRange,
    filteredTransactions,
    totalIncome,
    totalExpense,
    balance,
    expenseByCategory,
    incomeByCategory,
    monthlyBarData,
    expenseCount,
    incomeCount,
    activeDays,
  }
}
