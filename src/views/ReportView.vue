<!--
  ReportView - 全局数据报表
  入口：设置页 → 「账单统计」
  与底部 StatsView 的分工：
    - 底部 StatsView：当月快速查看（只显示单月数据 + 简单图表）
    - ReportView：年/季度/自定义区间，多维度分类汇总、趋势图，支持账本 & 支付方式筛选
-->
<template>
  <div class="report-page">
    <!-- 顶部页头 -->
    <div class="page-header">
      <span class="back-btn" @click="$router.back()">
        <Icon name="arrowLeft" :size="20" />
      </span>
      <div class="flex-1">
        <h1 class="page-title">全局数据报表</h1>
        <p class="page-subtitle">多维度分析收支，支持账本 / 支付方式筛选</p>
      </div>
    </div>

    <div class="report-content">
      <!-- 周期切换 -->
      <div class="seg-control period-seg">
        <button
          v-for="p in periods"
          :key="p.value"
          @click="setPeriod(p.value)"
          class="seg-item"
          :class="{ active: period === p.value }"
        >{{ p.label }}</button>
      </div>

      <!-- 周期详情选择（按当前 period 类型显示） -->
      <div class="period-detail">
        <template v-if="period === 'year'">
          <div class="picker-row">
            <span class="picker-label">年份</span>
            <div class="year-quick">
              <span
                v-for="y in yearOptions"
                :key="y"
                class="year-chip"
                :class="{ active: yearOffset === y - dayjs().year() }"
                @click="yearOffset = y - dayjs().year()"
              >{{ y }}</span>
            </div>
          </div>
        </template>

        <template v-else-if="period === 'quarter'">
          <div class="picker-row">
            <span class="picker-label">年份</span>
            <div class="year-quick">
              <span
                v-for="y in yearOptions"
                :key="y"
                class="year-chip"
                :class="{ active: yearOffset === y - dayjs().year() }"
                @click="yearOffset = y - dayjs().year()"
              >{{ y }}</span>
            </div>
          </div>
          <div class="picker-row">
            <span class="picker-label">季度</span>
            <div class="quarter-quick">
              <span
                v-for="q in 4"
                :key="q"
                class="quarter-chip"
                :class="{ active: quarter === q }"
                @click="quarter = q"
              >第{{ q }}季度</span>
            </div>
          </div>
        </template>

        <template v-else-if="period === 'month'">
          <div class="picker-row">
            <span class="picker-label">月份</span>
            <div class="month-picker-trigger" @click="showMonthPicker = true">
              <span>{{ monthLabel }}</span>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="picker-row">
            <span class="picker-label">起</span>
            <input v-model="customStart" type="date" class="date-input" />
            <span class="picker-label">至</span>
            <input v-model="customEnd" type="date" class="date-input" />
          </div>
        </template>
      </div>

      <!-- 筛选器：账本 + 支付方式 -->
      <div class="filter-row">
        <div class="filter-chip" @click="showBookFilter = true">
          <span class="filter-label">账本</span>
          <span class="filter-value">{{ activeBookName }}</span>
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div class="filter-chip" @click="showPayFilter = true">
          <span class="filter-label">支付方式</span>
          <span class="filter-value">{{ activePayName }}</span>
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>

      <!-- 汇总卡片：收入 / 支出 / 结余 / 笔数，各带独立主题插画（对齐 HomeView 方案：用 <img> 元素 + block 文字层） -->
      <div class="summary-grid">
        <div
          class="summary-card income"
          :class="{ 'has-illustration': hasIllustBg(0) }"
        >
          <img
            v-if="hasIllustBg(0)"
            :src="summaryCardUrls[0]"
            class="summary-card-bg"
            alt=""
            aria-hidden="true"
          />
          <div class="summary-content">
            <p class="summary-label">收入</p>
            <p class="summary-value">¥{{ summary.income.toFixed(0) }}</p>
          </div>
        </div>
        <div
          class="summary-card expense"
          :class="{ 'has-illustration': hasIllustBg(1) }"
        >
          <img
            v-if="hasIllustBg(1)"
            :src="summaryCardUrls[1]"
            class="summary-card-bg"
            alt=""
            aria-hidden="true"
          />
          <div class="summary-content">
            <p class="summary-label">支出</p>
            <p class="summary-value">¥{{ summary.expense.toFixed(0) }}</p>
          </div>
        </div>
        <div
          class="summary-card balance"
          :class="{ positive: summary.balance > 0, negative: summary.balance < 0, 'has-illustration': hasIllustBg(2) }"
        >
          <img
            v-if="hasIllustBg(2)"
            :src="summaryCardUrls[2]"
            class="summary-card-bg"
            alt=""
            aria-hidden="true"
          />
          <div class="summary-content">
            <p class="summary-label">结余</p>
            <p class="summary-value">¥{{ summary.balance.toFixed(0) }}</p>
          </div>
        </div>
        <div
          class="summary-card count"
          :class="{ 'has-illustration': hasIllustBg(3) }"
        >
          <img
            v-if="hasIllustBg(3)"
            :src="summaryCardUrls[3]"
            class="summary-card-bg"
            alt=""
            aria-hidden="true"
          />
          <div class="summary-content">
            <p class="summary-label">笔数</p>
            <p class="summary-value">{{ summary.count }}</p>
          </div>
        </div>
      </div>

      <!-- 趋势图 Tab -->
      <div class="chart-tab-row">
        <div class="seg-control">
          <button
            v-for="t in chartTypes"
            :key="t.value"
            @click="chartType = t.value"
            class="seg-item"
            :class="{ active: chartType === t.value }"
          >{{ t.label }}</button>
        </div>
      </div>

      <!-- 图表大卡片 -->
      <div class="chart-card-big">
        <div v-if="summary.count > 0" class="chart-host">
          <BarChart
            v-if="chartType === 'bar'"
            :time-range="chartTimeRange"
            :date-offset="chartDateOffset"
            :custom-start="customStart"
            :custom-end="customEnd"
          />
          <LineChart
            v-else-if="chartType === 'line'"
            :time-range="chartTimeRange"
            :date-offset="chartDateOffset"
            :custom-start="customStart"
            :custom-end="customEnd"
          />
          <PieChart
            v-else-if="chartType === 'pie'"
            :time-range="chartTimeRange"
            :date-offset="chartDateOffset"
            :custom-start="customStart"
            :custom-end="customEnd"
          />
        </div>
        <div v-else class="empty-tip">当前筛选条件下暂无数据</div>
      </div>

      <!-- 分类汇总表（支出 Top 10） -->
      <div class="ranking-section">
        <div class="ranking-header">
          <h3 class="section-title">分类支出排行</h3>
          <div class="seg-control ranking-seg">
            <button
              v-for="r in rankingTabs"
              :key="r.value"
              @click="rankingType = r.value"
              class="seg-item"
              :class="{ active: rankingType === r.value }"
            >{{ r.label }}</button>
          </div>
        </div>

        <div v-if="topCategories.length === 0" class="empty-tip empty-tip-block">
          暂无{{ rankingType === 'expense' ? '支出' : '收入' }}分类数据
        </div>
        <div v-else class="ranking-list">
          <div
            v-for="(item, idx) in topCategories"
            :key="item.name"
            class="ranking-row-card"
          >
            <div class="ranking-rank-num">{{ idx + 1 }}</div>
            <div class="ranking-icon-circle" :style="{ background: item.bgColor, color: item.color }">
              <span v-if="item.isImageIcon" class="icon-img-fallback">
                <img v-if="item.isImageIcon" :src="item.icon" class="icon-img" />
              </span>
              <span v-else class="ranking-cat-name-mini">{{ item.name.slice(0, 1) }}</span>
            </div>
            <div class="ranking-info">
              <div class="flex justify-between items-center mb-1">
                <span class="ranking-name">{{ item.name }}</span>
                <span class="ranking-amount">¥{{ item.amount.toFixed(0) }}</span>
              </div>
              <div class="ranking-bar-track">
                <div class="ranking-bar-fill" :style="{ width: item.percent + '%' }"></div>
              </div>
            </div>
            <div class="ranking-percent">{{ item.percent }}%</div>
          </div>
        </div>
      </div>

      <!-- 支付方式汇总 -->
      <div class="payment-section" v-if="paymentSummary.length > 0">
        <h3 class="section-title">支付方式汇总</h3>
        <div class="payment-list">
          <div
            v-for="p in paymentSummary"
            :key="p.name"
            class="payment-row"
          >
            <div class="payment-name">{{ p.name }}</div>
            <div class="payment-stats">
              <div class="payment-stat">
                <span class="payment-stat-label">收入</span>
                <span class="payment-stat-value income-color">¥{{ p.income.toFixed(0) }}</span>
              </div>
              <div class="payment-stat">
                <span class="payment-stat-label">支出</span>
                <span class="payment-stat-value expense-color">¥{{ p.expense.toFixed(0) }}</span>
              </div>
              <div class="payment-stat">
                <span class="payment-stat-label">笔数</span>
                <span class="payment-stat-value">{{ p.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 月份选择弹窗（period=month 时使用） -->
    <div v-if="showMonthPicker" class="modal-mask" @click.self="showMonthPicker = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>选择月份</h3>
          <span class="modal-close" @click="showMonthPicker = false">×</span>
        </div>
        <div class="modal-body">
          <div class="picker-year-nav">
            <span class="picker-year-btn" @click="reportPickerYear--">‹</span>
            <span class="picker-year-label">{{ reportPickerYear }}年</span>
            <span class="picker-year-btn" @click="reportPickerYear++">›</span>
          </div>
          <div class="picker-month-grid">
            <span
              v-for="m in 12"
              :key="m"
              class="picker-month-cell"
              :class="{
                active: reportPickerYear === reportSelectedYear && m === reportSelectedMonthNum,
              }"
              @click="confirmReportMonth(reportPickerYear, m)"
            >{{ m }}月</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 账本筛选弹窗 -->
    <div v-if="showBookFilter" class="modal-mask" @click.self="showBookFilter = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>选择账本</h3>
          <span class="modal-close" @click="showBookFilter = false">×</span>
        </div>
        <div class="modal-body">
          <div
            class="filter-option"
            :class="{ active: bookFilter === 'all' }"
            @click="bookFilter = 'all'; showBookFilter = false"
          >
            <span>全部账本</span>
            <span v-if="bookFilter === 'all'" class="filter-check">✓</span>
          </div>
          <div
            v-for="b in bookStore.books"
            :key="b.id"
            class="filter-option"
            :class="{ active: bookFilter === b.id }"
            @click="bookFilter = b.id; showBookFilter = false"
          >
            <span class="filter-book-icon">
              <img v-if="isImageIcon(b.icon)" :src="b.icon" class="icon-img" />
              <span v-else>{{ b.icon }}</span>
            </span>
            <span class="flex-1">{{ b.name }}</span>
            <span v-if="bookFilter === b.id" class="filter-check">✓</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 支付方式筛选弹窗 -->
    <div v-if="showPayFilter" class="modal-mask" @click.self="showPayFilter = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>选择支付方式</h3>
          <span class="modal-close" @click="showPayFilter = false">×</span>
        </div>
        <div class="modal-body">
          <div
            class="filter-option"
            :class="{ active: payFilter === 'all' }"
            @click="payFilter = 'all'; showPayFilter = false"
          >
            <span>全部支付方式</span>
            <span v-if="payFilter === 'all'" class="filter-check">✓</span>
          </div>
          <div
            v-for="p in paymentMethods"
            :key="p"
            class="filter-option"
            :class="{ active: payFilter === p }"
            @click="payFilter = p; showPayFilter = false"
          >
            <span class="flex-1">{{ p }}</span>
            <span v-if="payFilter === p" class="filter-check">✓</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import dayjs from 'dayjs'
import Icon from '../components/icons/Icon.vue'
import BarChart from '../components/BarChart.vue'
import LineChart from '../components/LineChart.vue'
import PieChart from '../components/PieChart.vue'
import { useTransactionStore } from '../stores/transaction'
import { useBookStore } from '../stores/book'
import { useCategoryStore } from '../stores/category'
import { currentThemeSet } from '../composables/useTheme'
import { usePageIllustrationPool } from '../composables/useIllustrationPicker'

/**
 * 4 张汇总卡：每张走独立 moduleId 的随机池
 * - 主题跟随：标准主题下 pickOne() 返回空，卡片走纯色渐变
 * - 随机：每次进入页面 / 主题切换都重新洗牌
 * - 同一页面不重复：通过全局 pageUsed 跨 4 个 moduleId 去重
 */
const reportIncomePool  = usePageIllustrationPool('report-income')
const reportExpensePool = usePageIllustrationPool('report-expense')
const reportBalancePool = usePageIllustrationPool('report-balance')
const reportCountPool   = usePageIllustrationPool('report-count')

const summaryCardUrls = computed<string[]>(() => {
  if (currentThemeSet.value === 'standard') return ['', '', '', '']
  return [
    reportIncomePool.pickOne(),
    reportExpensePool.pickOne(),
    reportBalancePool.pickOne(),
    reportCountPool.pickOne(),
  ]
})

/** 是否为当前卡设置了主题插画（标准主题时返回 false，卡片用纯色渐变） */
function hasIllustBg(idx: number): boolean {
  return !!summaryCardUrls.value[idx]
}

const transactionStore = useTransactionStore()
const bookStore = useBookStore()
const categoryStore = useCategoryStore()

const dayjsRef = dayjs

/* ============= 周期 ============= */
type Period = 'year' | 'quarter' | 'month' | 'custom'
const period = ref<Period>('month')

const periods: { label: string; value: Period }[] = [
  { label: '年', value: 'year' },
  { label: '季度', value: 'quarter' },
  { label: '月', value: 'month' },
  { label: '自定义', value: 'custom' },
]

/* ============= 各周期内的细节 ============= */
// year / quarter
const yearOffset = ref(0)
const yearOptions = computed(() => {
  const now = dayjs().year()
  const list: number[] = []
  for (let y = now - 5; y <= now + 1; y++) list.push(y)
  return list
})
const quarter = ref<number>(Math.floor(dayjs().month() / 3) + 1) // 1~4

// month
const monthOffset = ref(0)
const monthLabel = computed(() => dayjs().add(monthOffset.value, 'month').format('YYYY-MM'))
const showMonthPicker = ref(false)
const reportPickerYear = ref(dayjs().year())
const reportSelectedYear = computed(() => Number(monthLabel.value.split('-')[0]))
const reportSelectedMonthNum = computed(() => Number(monthLabel.value.split('-')[1]))
function confirmReportMonth(year: number, month: number) {
  const cur = dayjs()
  const tgt = dayjs().year(year).month(month - 1)
  monthOffset.value = (tgt.year() - cur.year()) * 12 + (tgt.month() - cur.month())
  showMonthPicker.value = false
}

// custom
const customStart = ref(dayjs().subtract(2, 'month').format('YYYY-MM-DD'))
const customEnd = ref(dayjs().format('YYYY-MM-DD'))

function setPeriod(p: Period) {
  period.value = p
}

/* ============= 筛选器 ============= */
const bookFilter = ref<string>('all') // 'all' 或具体 bookId
const payFilter = ref<string>('all')  // 'all' 或具体支付方式
const showBookFilter = ref(false)
const showPayFilter = ref(false)

const activeBookName = computed(() => {
  if (bookFilter.value === 'all') return '全部账本'
  return bookStore.books.find(b => b.id === bookFilter.value)?.name || '全部账本'
})
const activePayName = computed(() => {
  if (payFilter.value === 'all') return '全部'
  return payFilter.value
})

/* ============= 图表参数转换 ============= */
// 将 ReportView 的 period 转换为 BarChart/LineChart/PieChart 所需的 timeRange + dateOffset
const chartTimeRange = computed<'day' | 'month' | 'year' | 'all' | 'custom'>(() => {
  if (period.value === 'custom') return 'custom'
  if (period.value === 'year') return 'year'
  if (period.value === 'month') return 'month'
  // quarter：把起止日期转成 custom 范围，季度用日维度展示
  return 'custom'
})
const chartDateOffset = computed(() => {
  if (period.value === 'year') return yearOffset.value
  if (period.value === 'month') return monthOffset.value
  return 0
})

// 季度对应的 [start, end] 日期
const quarterRange = computed(() => {
  const y = dayjs().add(yearOffset.value, 'year').year()
  const startMonth = (quarter.value - 1) * 3
  return {
    start: dayjs().year(y).month(startMonth).startOf('month').format('YYYY-MM-DD'),
    end: dayjs().year(y).month(startMonth + 2).endOf('month').format('YYYY-MM-DD'),
  }
})

// 季度时把 customStart/customEnd 临时覆盖（用于图表）
watch([period, quarterRange], () => {
  if (period.value === 'quarter') {
    customStart.value = quarterRange.value.start
    customEnd.value = quarterRange.value.end
  }
}, { immediate: true })

/* ============= 筛选后的账单 ============= */
const filteredTx = computed(() => {
  let list = transactionStore.transactions

  // 账本筛选
  if (bookFilter.value !== 'all') {
    list = list.filter(t => t.bookId === bookFilter.value)
  }
  // 支付方式筛选
  if (payFilter.value !== 'all') {
    list = list.filter(t => t.paymentMethod === payFilter.value)
  }
  // 时间筛选
  const { start, end } = dateRange.value
  list = list.filter(t => t.date >= start && t.date <= end)
  return list
})

/* ============= 当前周期的时间范围 ============= */
const dateRange = computed<{ start: string; end: string }>(() => {
  if (period.value === 'year') {
    const d = dayjs().add(yearOffset.value, 'year')
    return { start: d.startOf('year').format('YYYY-MM-DD'), end: d.endOf('year').format('YYYY-MM-DD') }
  }
  if (period.value === 'quarter') {
    return quarterRange.value
  }
  if (period.value === 'month') {
    const d = dayjs().add(monthOffset.value, 'month')
    return { start: d.startOf('month').format('YYYY-MM-DD'), end: d.endOf('month').format('YYYY-MM-DD') }
  }
  // custom
  const s = customStart.value || dayjs().format('YYYY-MM-DD')
  const e = customEnd.value || dayjs().format('YYYY-MM-DD')
  return s <= e ? { start: s, end: e } : { start: e, end: s }
})

/* ============= 汇总 ============= */
const summary = computed(() => {
  const income = filteredTx.value.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = filteredTx.value.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  return {
    income,
    expense,
    balance: income - expense,
    count: filteredTx.value.length,
  }
})

/* ============= 图表 Tab ============= */
const chartType = ref<'bar' | 'line' | 'pie'>('bar')
const chartTypes: { label: string; value: 'bar' | 'line' | 'pie' }[] = [
  { label: '柱状图', value: 'bar' },
  { label: '折线图', value: 'line' },
  { label: '饼图', value: 'pie' },
]

/* ============= 分类排行 ============= */
type RankingType = 'expense' | 'income'
const rankingType = ref<RankingType>('expense')
const rankingTabs: { label: string; value: RankingType }[] = [
  { label: '支出', value: 'expense' },
  { label: '收入', value: 'income' },
]

const topCategories = computed(() => {
  const map: Record<string, number> = {}
  for (const t of filteredTx.value) {
    if (t.type !== rankingType.value) continue
    map[t.category] = (map[t.category] || 0) + t.amount
  }
  const total = Object.values(map).reduce((s, v) => s + v, 0) || 1
  return Object.entries(map)
    .map(([name, amount]) => {
      const cat = categoryStore.findCategory(name, rankingType.value)
      const icon = cat?.icon || 'star'
      return {
        name,
        amount,
        percent: Math.round((amount / total) * 100),
        icon,
        isImageIcon: icon.startsWith('data:image'),
        color: cat?.color || 'var(--expense)',
        bgColor: cat?.bgColor || 'var(--expense-light)',
      }
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10)
})

/* ============= 支付方式汇总 ============= */
const paymentMethods = computed(() => {
  const set = new Set<string>()
  for (const t of transactionStore.transactions) {
    if (t.paymentMethod) set.add(t.paymentMethod)
  }
  return Array.from(set).sort()
})

const paymentSummary = computed(() => {
  const map: Record<string, { income: number; expense: number; count: number }> = {}
  for (const t of filteredTx.value) {
    const pm = t.paymentMethod || '其他'
    if (!map[pm]) map[pm] = { income: 0, expense: 0, count: 0 }
    if (t.type === 'income') map[pm].income += t.amount
    else if (t.type === 'expense') map[pm].expense += t.amount
    map[pm].count += 1
  }
  return Object.entries(map)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => (b.income + b.expense) - (a.income + a.expense))
})

/* ============= 工具 ============= */
function isImageIcon(icon: string) {
  return icon && icon.startsWith('data:image')
}
</script>

<style scoped>
.report-page {
  background: var(--page-bg);
  min-height: 100vh;
  padding-bottom: 100px;
}

.page-header {
  padding: 50px 16px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}
.flex-1 { flex: 1; min-width: 0; }
.page-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-h1);
  line-height: 1.2;
  margin: 0;
}
.page-subtitle {
  font-size: 12px;
  color: var(--text-weak);
  margin: 4px 0 0;
}
.back-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  color: var(--text-body);
  cursor: pointer;
  transition: background 0.15s, transform 0.15s;
  flex-shrink: 0;
}
.back-btn:hover { background: var(--primary-light); }
.back-btn:active { transform: scale(0.92); }

.report-content {
  padding: 4px 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ===== 周期切换 seg ===== */
.seg-control {
  display: flex;
  background: var(--card-bg);
  border-radius: var(--radius-md);
  padding: 3px;
  box-shadow: var(--shadow-soft);
  overflow: hidden;
}
.seg-item {
  flex: 1 1 0;
  min-width: 0;
  padding: 8px 4px;
  font-size: 12.5px;
  color: var(--text-body);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
  border: 1px solid transparent;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
  font-family: inherit;
}
.seg-item.active {
  background: var(--primary-light);
  color: var(--primary);
  font-weight: 600;
}
.seg-item:not(.active):hover {
  background: var(--page-bg);
  border-color: var(--divider);
}
.period-seg { width: 100%; }

/* ===== 周期细节 ===== */
.period-detail {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.picker-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.picker-label {
  font-size: 12px;
  color: var(--text-weak);
  flex-shrink: 0;
  width: 36px;
}
.year-quick,
.quarter-quick {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  flex: 1;
}
.year-chip,
.quarter-chip {
  padding: 4px 10px;
  background: var(--page-bg);
  border-radius: 14px;
  font-size: 12px;
  color: var(--text-body);
  cursor: pointer;
  user-select: none;
  transition: all 0.15s;
}
.year-chip:active,
.quarter-chip:active { transform: scale(0.96); }
.year-chip.active,
.quarter-chip.active {
  background: var(--primary);
  color: #fff;
  font-weight: 600;
}
.month-picker-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--primary-light);
  color: var(--primary);
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.date-input {
  flex: 1;
  min-width: 0;
  background: var(--page-bg);
  border: none;
  border-radius: var(--radius-md);
  padding: 8px 10px;
  font-size: 13px;
  color: var(--text-h1);
  outline: none;
  font-family: inherit;
}

/* ===== 筛选 chip 行 ===== */
.filter-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.filter-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-soft);
  font-size: 12px;
  color: var(--text-body);
  cursor: pointer;
  transition: background 0.15s;
  flex: 1 1 auto;
  min-width: 0;
}
.filter-chip:active { background: var(--primary-light); }
.filter-label {
  color: var(--text-weak);
  flex-shrink: 0;
}
.filter-value {
  color: var(--primary);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

/* ===== 汇总卡片 ===== 完全对齐 HomeView .balance-card-light 方案 */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.summary-card {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  min-height: 88px;
  filter: none;
  opacity: 1;
}

/* 标准主题的彩色渐变（仅在没有 has-illustration 时启用，has-illustration 时被图片覆盖） */
.summary-card.income:not(.has-illustration)     { background: linear-gradient(135deg, var(--income-light) 0%, #D6EFE5 100%); }
.summary-card.expense:not(.has-illustration)    { background: linear-gradient(135deg, var(--expense-light) 0%, #FFE4D6 100%); }
.summary-card.count:not(.has-illustration)      { background: var(--card-bg); }
.summary-card.balance:not(.has-illustration)    { background: var(--primary-light); }
.summary-card.balance.positive:not(.has-illustration) { background: linear-gradient(135deg, var(--primary-light) 0%, #D6EFE5 100%); }
.summary-card.balance.negative:not(.has-illustration) { background: linear-gradient(135deg, var(--expense-light) 0%, #FFE4D6 100%); }

/* 主题插画铺满卡片（与 HomeView .ip-card-img 一致） */
.summary-card-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  display: block;
  border-radius: var(--radius-lg);
  z-index: 1;            /* 在卡片背景之上，文字之下 */
  pointer-events: none;
}

/* 文字层：与 StatsView .balance-card-light .card-content 完全一致（大小 + 设置） */
.summary-content {
  position: relative;
  z-index: 9;
  text-align: left;
  max-width: 100%;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.25) 70%, rgba(255, 255, 255, 0) 100%);
  border-radius: var(--radius-md);
  padding: 4px 8px 4px 4px;
  display: inline-block;
}
.summary-label {
  font-size: 12px;
  color: var(--text-h1);           /* 加深：与标题同色 */
  margin-bottom: 2px;
  font-weight: 600;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.6);
}
.summary-value {
  font-size: 20px;
  font-weight: 800;
  color: var(--text-h1);
  line-height: 1.2;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.6);
}
.summary-card.income .summary-value { color: var(--income); }
.summary-card.expense .summary-value { color: var(--expense); }
.summary-card.balance.positive .summary-value { color: var(--income); }
.summary-card.balance.negative .summary-value { color: var(--expense); }

/* 笔数卡：主色 + 加粗 + tnum 等宽数字，避免「7」看着比「363」轻 */
.summary-card.count .summary-value {
  color: var(--primary);
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.5px;
  font-feature-settings: "tnum";
}

/* ===== 图表 ===== */
.chart-tab-row { width: 100%; }
.chart-card-big {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-soft);
  padding: 12px;
  min-height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.chart-host { width: 100%; }
.empty-tip {
  color: var(--text-weak);
  font-size: 13px;
  text-align: center;
  padding: 30px 0;
}
.empty-tip-block {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-soft);
  padding: 30px 0;
  display: block;
}

/* ===== 分类排行 ===== */
.ranking-section { display: flex; flex-direction: column; gap: 12px; }
.ranking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}
.ranking-seg { width: auto; flex: 0 0 auto; }
.ranking-seg .seg-item { padding: 6px 14px; font-size: 12px; }
.section-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-h1);
  margin: 0;
}
.ranking-list { display: flex; flex-direction: column; gap: 8px; }
.ranking-row-card {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-soft);
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.ranking-rank-num {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-weak);
  width: 18px;
  text-align: center;
  flex-shrink: 0;
}
.ranking-icon-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}
.ranking-icon-circle .icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.ranking-cat-name-mini {
  font-size: 13px;
  font-weight: 600;
}
.ranking-info { flex: 1; min-width: 0; }
.ranking-name {
  font-size: 13px;
  color: var(--text-h1);
  font-weight: 500;
}
.ranking-amount {
  font-size: 13px;
  font-weight: 500;
  color: var(--expense);
}
.ranking-bar-track {
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: var(--divider);
  overflow: hidden;
}
.ranking-bar-fill {
  height: 100%;
  border-radius: 2px;
  background: var(--expense);
  transition: width 0.4s ease;
}
.ranking-percent {
  font-size: 12px;
  color: var(--text-weak);
  flex-shrink: 0;
  min-width: 36px;
  text-align: right;
}

/* ===== 支付方式汇总 ===== */
.payment-section { display: flex; flex-direction: column; gap: 10px; }
.payment-list { display: flex; flex-direction: column; gap: 8px; }
.payment-row {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-soft);
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.payment-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-h1);
  flex-shrink: 0;
}
.payment-stats {
  display: flex;
  gap: 14px;
  flex: 1;
  justify-content: flex-end;
}
.payment-stat {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}
.payment-stat-label {
  font-size: 10px;
  color: var(--text-weak);
}
.payment-stat-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-h1);
}
.income-color { color: var(--income); }
.expense-color { color: var(--expense); }

/* ===== 弹窗 ===== */
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fade-in 0.2s;
}
.modal-card {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 360px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slide-up 0.25s ease-out;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--divider);
}
.modal-header h3 {
  font-size: 17px;
  font-weight: 500;
  color: var(--text-h1);
  margin: 0;
}
.modal-close {
  font-size: 24px;
  color: var(--text-weak);
  cursor: pointer;
  line-height: 1;
}
.modal-body {
  padding: 14px 20px 20px;
  overflow-y: auto;
}

.picker-year-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 4px 12px;
}
.picker-year-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: var(--primary);
  cursor: pointer;
  border-radius: 50%;
  user-select: none;
}
.picker-year-btn:active { background: var(--primary-light); }
.picker-year-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-h1);
}
.picker-month-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.picker-month-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  background: var(--page-bg);
  border-radius: var(--radius-md);
  font-size: 14px;
  color: var(--text-h1);
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
}
.picker-month-cell:active { transform: scale(0.96); }
.picker-month-cell.active {
  background: var(--primary);
  color: #fff;
  font-weight: 600;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 8px;
  border-bottom: 1px solid var(--divider);
  cursor: pointer;
  font-size: 14px;
  color: var(--text-h1);
}
.filter-option:last-child { border-bottom: none; }
.filter-option.active { color: var(--primary); font-weight: 500; }
.filter-check { color: var(--primary); font-weight: 700; }
.filter-book-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--page-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
  overflow: hidden;
}
.filter-book-icon .icon-img { width: 100%; height: 100%; object-fit: cover; }

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slide-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
