import { computed, type Ref } from 'vue'
import { useTransactionStore } from '../stores/transaction'
import { useCategoryStore } from '../stores/category'
import dayjs from 'dayjs'

export function useStatistics(startDate: Ref<string>, endDate: Ref<string>) {
  const transactionStore = useTransactionStore()
  const categoryStore = useCategoryStore()

  const filteredTransactions = computed(() =>
    transactionStore.transactions.filter(t => t.date >= startDate.value && t.date <= endDate.value)
  )

  const totalIncome = computed(() =>
    filteredTransactions.value.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  )

  const totalExpense = computed(() =>
    filteredTransactions.value.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  )

  // 支出分类饼图数据
  const expenseByCategory = computed(() => {
    const map: Record<string, number> = {}
    filteredTransactions.value
      .filter(t => t.type === 'expense')
      .forEach(t => {
        map[t.category] = (map[t.category] || 0) + t.amount
      })
    return Object.entries(map).map(([name, value]) => {
      const cat = categoryStore.findCategory(name, 'expense')
      return { name, value: Math.round(value * 100) / 100, itemStyle: { color: cat?.color || '#BDC3C7' } }
    }).sort((a, b) => b.value - a.value)
  })

  // 收入分类饼图数据
  const incomeByCategory = computed(() => {
    const map: Record<string, number> = {}
    filteredTransactions.value
      .filter(t => t.type === 'income')
      .forEach(t => {
        map[t.category] = (map[t.category] || 0) + t.amount
      })
    return Object.entries(map).map(([name, value]) => {
      const cat = categoryStore.findCategory(name, 'income')
      return { name, value: Math.round(value * 100) / 100, itemStyle: { color: cat?.color || '#95A5A6' } }
    }).sort((a, b) => b.value - a.value)
  })

  // 月度收支柱状图数据（基于当前日期范围推算最近6个月）
  const monthlyBarData = computed(() => {
    const end = dayjs(endDate.value)
    const months: string[] = []
    const incomes: number[] = []
    const expenses: number[] = []
    for (let i = 5; i >= 0; i--) {
      const d = end.subtract(i, 'month')
      const prefix = d.format('YYYY-MM')
      months.push(d.format('M月'))
      const monthTx = transactionStore.transactions.filter(t => t.date.startsWith(prefix))
      incomes.push(Math.round(monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) * 100) / 100)
      expenses.push(Math.round(monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0) * 100) / 100)
    }
    return { months, incomes, expenses }
  })

  return {
    totalIncome,
    totalExpense,
    expenseByCategory,
    incomeByCategory,
    monthlyBarData,
  }
}
