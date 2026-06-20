﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿<template>
  <div class="home-page">
    <!-- 极淡全屏 IP 暗纹（铺满整个页面底层 z-index:0，仅 pet/comic 主题显示） -->
    <PaintedScene :ip="ipForPainted" :full-bg="true" />

    <!-- 顶部标题区：原 titleText 已删除（按要求移除左上角"本月"等字符） -->
    <div class="home-header">
      <!-- 账本卡片 + 日历卡片 -->
      <div class="quick-cards">
        <div class="quick-card quick-card-book" @click="showBookPicker = true">
          <div class="quick-card-info">
            <p class="quick-card-label">当前账本</p>
            <p class="quick-card-value">{{ currentBookName }}</p>
          </div>
          <span class="quick-card-arrow">›</span>
        </div>

        <div class="quick-card quick-card-date" @click="openDatePicker">
          <div class="quick-card-info">
            <p class="quick-card-label">选择日期</p>
            <p class="quick-card-value">{{ currentDateLabel || '今日' }}</p>
          </div>
          <span class="quick-card-arrow">›</span>
        </div>
      </div>

      <!-- 时间维度胶囊 -->
      <div class="seg-control">
        <button
          v-for="item in timeRanges"
          :key="item.value"
          @click="setTimeRange(item.value)"
          class="seg-item"
          :class="{ active: timeRange === item.value }"
        >{{ item.label }}</button>
      </div>
    </div>

    <!-- 预算卡 -->
    <div class="card-budget">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4 flex-1">
          <div class="budget-ring">
            <svg viewBox="0 0 36 36" class="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="var(--divider)" stroke-width="4" />
              <circle cx="18" cy="18" r="15" fill="none"
                :stroke="isOverBudget ? 'var(--expense)' : 'var(--primary)'"
                stroke-width="4" stroke-linecap="round"
                :stroke-dasharray="`${Math.min(100, budgetPercent) * 0.942} 94.2`" />
            </svg>
            <span class="budget-ring-text" :class="{ over: isOverBudget }">
              {{ Math.round(budgetPercent) }}%
            </span>
          </div>
          <div class="flex-1">
            <p class="budget-title">{{ budgetRangeLabel }}</p>
            <div class="flex items-center gap-2">
              <p class="budget-amount">¥{{ budget }}</p>
              <button @click="openBudgetEdit" class="btn-secondary-sm">修改</button>
            </div>
            <p class="budget-remaining-label">
              <span v-if="isOverBudget" class="over-tag">已超额</span>
              <span v-else>剩余 <span class="budget-remaining" :class="budget - currentStats.expense < 0 ? 'over' : ''">¥{{ Math.max(0, budget - currentStats.expense) }}</span></span>
            </p>
          </div>
        </div>
        <span class="budget-date">{{ currentDateLabel }}</span>
      </div>
    </div>

    <!-- 支出 / 收入 两张卡片：参考图风格，右侧大幅 IP 角色插画 -->
    <div class="balance-row">
      <div class="balance-card-light expense-card">
        <!-- 右侧大插画：随机抽取（独立模块池） -->
        <PaintedScene
          v-if="ipForPainted !== 'none'"
          :ip="ipForPainted"
          card-scene="expense"
          page-id="home-balance-expense"
        />
        <div class="card-content">
          <p class="card-label">支出</p>
          <p class="balance-value expense-value">¥{{ currentStats.expense.toFixed(0) }}</p>
        </div>
      </div>
      <div class="balance-card-light income-card">
        <!-- 右侧大插画：随机抽取（独立模块池） -->
        <PaintedScene
          v-if="ipForPainted !== 'none'"
          :ip="ipForPainted"
          card-scene="income"
          page-id="home-balance-income"
        />
        <div class="card-content">
          <p class="card-label">收入</p>
          <p class="balance-value income-value">¥{{ currentStats.income.toFixed(0) }}</p>
        </div>
      </div>
    </div>

    <!-- 交易记录（已删除「图表分析」Tab 入口：与底部统计/报表入口重复） -->
    <div>
      <div v-if="filteredTransactions.length === 0" class="empty-state">
        <!-- 已删除 PaintedScene 中央插画（不再遮挡） -->
        <p class="empty-state-title">暂无今日收支记录</p>
        <p class="empty-state-desc">点击底部中间绿色加号，快速记第一笔账单</p>
      </div>

      <div v-else class="tx-list">
        <TransactionItem
          v-for="(t, index) in filteredTransactions.slice(0, 20)"
          :key="t.objectId"
          :transaction="t"
          page-id="home-tx-item"
          class="animate-slide-up"
          :style="{ animationDelay: index * 0.03 + 's' }"
          @delete="handleDelete"
        />
      </div>
    </div>

    <!-- 年度预算大卡片 -->
    <div class="yearly-budget-card">
      <div class="yearly-budget-header">
        <div class="yearly-budget-title">
          <h3>年度预算</h3>
          <span class="yearly-budget-sub">按日历年度统计</span>
        </div>
        <div class="year-select" @click="openYearEdit">
          <span class="year-select-label">{{ budgetCalendarYear }}年</span>
          <Icon name="arrowRight" :size="14" style="transform: rotate(90deg);" />
        </div>
      </div>

      <div class="yearly-budget-stats">
        <div class="yearly-stat-item">
          <span class="yearly-stat-label">年度预算</span>
          <span class="yearly-stat-value">¥{{ yearlyBudget.toFixed(0) }}</span>
        </div>
        <div class="yearly-stat-divider"></div>
        <div class="yearly-stat-item">
          <span class="yearly-stat-label">已支出</span>
          <span class="yearly-stat-value expense">¥{{ yearlyExpense.toFixed(0) }}</span>
        </div>
        <div class="yearly-stat-divider"></div>
        <div class="yearly-stat-item">
          <span class="yearly-stat-label">剩余可用</span>
          <span class="yearly-stat-value primary">¥{{ yearlyRemaining.toFixed(0) }}</span>
        </div>
      </div>

      <div class="yearly-progress">
        <div class="yearly-progress-bar">
          <div
            class="yearly-progress-fill"
            :class="{ over: yearlyPercent >= 100 }"
            :style="{ width: yearlyPercent + '%' }"
          ></div>
        </div>
        <span class="yearly-progress-label">{{ yearlyPercent }}%</span>
      </div>

      <div class="yearly-budget-hint">
        当前默认月度预算 ¥{{ defaultMonthBudget.toFixed(0) }} · 可点击下方月份单独调整
      </div>
    </div>

    <!-- ⚠️ 「月度预算日历」组件已删除（按用户要求，模板 DOM 整段移除）
         业务逻辑（months / budgetCalendarYear / openMonthBudgetEdit 等）完整保留，
         仅不影响首页展示。后续需要可一键恢复。 -->

    <!-- 月度预算编辑弹窗 -->
    <div v-if="showMonthBudgetEdit" class="modal-mask" @click.self="showMonthBudgetEdit = false">
      <div class="modal-card">
        <IllustrationImage
          v-if="currentThemeSet !== 'standard'"
          :theme="currentThemeSet" slot="emptySavings"
          module-id="home-modal-month"
          css-class="modal-sticker"
          :style-obj="{ top: '6px', right: '6px', width: '28px', height: '28px', borderRadius: '6px' }"
        />
        <div class="modal-header">
          <h3>设置 {{ editingMonthLabel }} 预算</h3>
          <span class="modal-close" @click="showMonthBudgetEdit = false">×</span>
        </div>
        <div class="modal-body">
          <label class="caption block mb-2">月度预算金额（元）</label>
          <input v-model.number="editingMonthValue" type="number" min="0" class="input" placeholder="例如 3000" />
          <p class="caption mt-2">
            设为 0 或留空 → 使用默认月度预算（¥{{ defaultMonthBudget.toFixed(0) }}）
          </p>
        </div>
        <div class="modal-footer">
          <button @click="showMonthBudgetEdit = false" class="btn-ghost">取消</button>
          <button @click="saveMonthBudget" class="btn-primary">保存</button>
        </div>
      </div>
    </div>

    <BottomNav />

    <!-- 自定义日期弹窗 -->
    <div v-if="showCustomDate" class="modal-mask" @click.self="showCustomDate = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>选择日期</h3>
          <span class="modal-close" @click="showCustomDate = false">×</span>
        </div>
        <div class="modal-body space-y-3">
          <div>
            <label class="form-label">开始日期</label>
            <input v-model="customStart" type="date" class="input mt-1" />
          </div>
          <div>
            <label class="form-label">结束日期</label>
            <input v-model="customEnd" type="date" class="input mt-1" />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showCustomDate = false" class="btn-ghost">取消</button>
          <button @click="applyCustomDate" class="btn-primary">确定</button>
        </div>
      </div>
    </div>

    <!-- 年份选择弹窗 -->
    <div v-if="showYearEdit" class="modal-mask" @click.self="showYearEdit = false">
      <div class="modal-card modal-card-sm">
        <div class="modal-header">
          <h3>选择年份</h3>
          <span class="modal-close" @click="showYearEdit = false">×</span>
        </div>
        <div class="modal-body">
          <label class="form-label">年份（{{ dayjs().year() - 10 }} - {{ dayjs().year() + 10 }}）</label>
          <input v-model.number="editYear" type="number" :min="dayjs().year() - 10" :max="dayjs().year() + 10" class="input mt-1" />
        </div>
        <div class="modal-footer">
          <button @click="showYearEdit = false" class="btn-ghost">取消</button>
          <button @click="applyYearEdit" class="btn-primary">确定</button>
        </div>
      </div>
    </div>

    <!-- 预算编辑弹窗 -->
    <div v-if="showBudgetEdit" class="modal-mask" @click.self="showBudgetEdit = false">
      <div class="modal-card">
        <IllustrationImage
          v-if="currentThemeSet !== 'standard'"
          :theme="currentThemeSet" slot="emptySavings"
          module-id="home-modal-budget"
          css-class="modal-sticker"
          :style-obj="{ top: '6px', right: '6px', width: '26px', height: '26px', borderRadius: '6px' }"
        />
        <div class="modal-header">
          <h3>设置预算</h3>
          <span class="modal-close" @click="showBudgetEdit = false">×</span>
        </div>
        <div class="modal-body">
          <p class="caption mb-3">当前维度：{{ budgetRangeLabel }}</p>
          <label class="form-label">预算金额（元）</label>
          <input v-model.number="newBudget" type="number" min="0" placeholder="3000" class="input mt-1" />
        </div>
        <div class="modal-footer">
          <button @click="showBudgetEdit = false" class="btn-ghost">取消</button>
          <button @click="saveBudget" class="btn-primary">保存</button>
        </div>
      </div>
    </div>

    <!-- 弹窗：选择账本 -->
    <div v-if="showBookPicker" class="modal-mask" @click.self="showBookPicker = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>切换账本</h3>
          <span class="modal-close" @click="showBookPicker = false">×</span>
        </div>
        <div class="modal-body">
          <div
            v-for="b in bookStore.books"
            :key="b.id"
            class="book-item"
            :class="{ active: b.id === bookStore.bookId }"
            @click="handleSwitchBook(b.id)"
          >
            <div class="book-name">{{ b.name }}</div>
            <div v-if="b.id === bookStore.bookId" class="book-check">✓</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 弹窗：选择日期 -->
    <div v-if="showDatePicker" class="modal-mask" @click.self="showDatePicker = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>选择日期</h3>
          <span class="modal-close" @click="showDatePicker = false">×</span>
        </div>
        <div class="modal-body">
          <div class="date-range-info">
            当前维度：<strong>{{ currentTimeRangeLabel }}</strong>
          </div>
          <div class="date-quick-row">
            <button class="date-quick-btn" @click="quickDate(0)">今天</button>
            <button class="date-quick-btn" @click="quickDate(-1)">昨天</button>
            <button class="date-quick-btn" @click="quickDate(-7)">一周前</button>
            <button class="date-quick-btn" @click="quickDate('reset')">重置</button>
          </div>
          <div class="date-calendar">
            <div class="calendar-nav">
              <span class="calendar-nav-btn" @click="shiftCalendarMonth(-1)">‹</span>
              <span class="calendar-month">{{ calendarMonthLabel }}</span>
              <span class="calendar-nav-btn" @click="shiftCalendarMonth(1)">›</span>
            </div>
            <div class="calendar-grid">
              <div v-for="w in weekLabels" :key="w" class="calendar-head">{{ w }}</div>
              <div
                v-for="(day, idx) in calendarDays"
                :key="idx"
                class="calendar-cell"
                :class="{
                  'other-month': !day.inMonth,
                  'selected': day.isSelected,
                  'today': day.isToday,
                }"
                @click="pickDate(day.dateStr)"
              >{{ day.day }}</div>
            </div>
          </div>
          <div class="date-custom-range" v-if="timeRange === 'custom'">
            <div class="date-field">
              <label class="form-label">开始日期</label>
              <input v-model="customStart" type="date" class="input" />
            </div>
            <div class="date-field">
              <label class="form-label">结束日期</label>
              <input v-model="customEnd" type="date" class="input" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showDatePicker = false" class="btn-ghost">取消</button>
          <button @click="showDatePicker = false" class="btn-primary">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import { useTransaction } from '../composables/useTransaction'
import { useBookStore } from '../stores/book'
import TransactionItem from '../components/TransactionItem.vue'
import BottomNav from '../components/BottomNav.vue'
import PetMascot from '../components/PetMascot.vue'
import MangaMascot from '../components/MangaMascot.vue'
import PaintedScene from '../components/PaintedScene.vue'
import Icon from '../components/icons/Icon.vue'
import IllustrationImage from '../components/IllustrationImage.vue'
import { currentThemeSet } from '../composables/useTheme'
import { useFilteredStats, type TimeRange } from '../composables/useFilteredStats'

// 主题 → IP 映射
const ipForPainted = computed<'onepiece' | 'family' | 'none'>(() => {
  if (currentThemeSet.value === 'onepiece') return 'onepiece'
  if (currentThemeSet.value === 'family') return 'family'
  return 'none'
})

const bookStore = useBookStore()
const { transactions, removeTransaction } = useTransaction()

const timeRange = ref<TimeRange>('month')
const dateOffset = ref(0)
const showCustomDate = ref(false)
const customStart = ref(dayjs().format('YYYY-MM-DD'))
const customEnd = ref(dayjs().format('YYYY-MM-DD'))

// 统一筛选统计（与 StatsView 共用同一计算 → 保证数字一致）
const stats = useFilteredStats({
  timeRange,
  dateOffset,
  customStart,
  customEnd,
  scopeToCurrentBook: true, // 修 bug 0-3：自动限定当前账本
})
const filteredTransactions = stats.filteredTransactions
const currentStats = computed(() => ({
  income: stats.totalIncome.value,
  expense: stats.totalExpense.value,
  balance: stats.balance.value,
}))

const showBudgetEdit = ref(false)
const newBudget = ref(0)
const budget = computed(() => bookStore.getBudget(timeRange.value))
// 修 0-2 联动：使用真实百分比，不限 100；UI 单独显示「已超额」标签
const budgetPercent = computed(() =>
  budget.value > 0 ? (currentStats.value.expense / budget.value) * 100 : 0
)
const isOverBudget = computed(() => budgetPercent.value > 100)

// 弹窗：账本 / 日期
const showBookPicker = ref(false)
const showDatePicker = ref(false)
const calendarMonth = ref(dayjs().startOf('month'))
const weekLabels = ['日', '一', '二', '三', '四', '五', '六']

const currentBook = computed(() => bookStore.books.find(b => b.id === bookStore.bookId) || bookStore.books[0])
const currentBookName = computed(() => currentBook.value?.name || '默认账本')

const currentTimeRangeLabel = computed(() => {
  const map: Record<string, string> = { day: '日维度', month: '月维度', year: '年维度', all: '全部时间', custom: '自定义范围' }
  return map[timeRange.value] || '日维度'
})

function handleSwitchBook(id: string) {
  bookStore.switchBook(id)
  showBookPicker.value = false
}

function openDatePicker() {
  calendarMonth.value = getCurrentAnchorDate().startOf('month')
  showDatePicker.value = true
}

function getCurrentAnchorDate() {
  if (timeRange.value === 'day') return dayjs().add(dateOffset.value, 'day')
  if (timeRange.value === 'month') return dayjs().add(dateOffset.value, 'month').startOf('month')
  if (timeRange.value === 'year') return dayjs().add(dateOffset.value, 'year').startOf('year')
  return dayjs()
}

function quickDate(value: number | string) {
  dateOffset.value = 0
  if (value === 'reset') return
  if (timeRange.value === 'day') dateOffset.value = Number(value)
  else if (timeRange.value === 'month') dateOffset.value = Number(value)
  else if (timeRange.value === 'year') dateOffset.value = Number(value)
}

function shiftCalendarMonth(direction: number) {
  calendarMonth.value = calendarMonth.value.add(direction, 'month')
}

const calendarMonthLabel = computed(() => calendarMonth.value.format('YYYY年 M月'))

const calendarDays = computed(() => {
  const start = calendarMonth.value.startOf('month')
  const firstWeekday = start.day()
  const daysInMonth = calendarMonth.value.daysInMonth()
  const days: { day: number; inMonth: boolean; dateStr: string; isSelected: boolean; isToday: boolean }[] = []

  // 前置填充
  for (let i = firstWeekday - 1; i >= 0; i--) {
    const d = start.subtract(i + 1, 'day')
    days.push({
      day: d.date(),
      inMonth: false,
      dateStr: d.format('YYYY-MM-DD'),
      isSelected: isDateSelected(d),
      isToday: d.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD'),
    })
  }
  // 本月
  for (let i = 1; i <= daysInMonth; i++) {
    const d = start.date(i)
    days.push({
      day: i,
      inMonth: true,
      dateStr: d.format('YYYY-MM-DD'),
      isSelected: isDateSelected(d),
      isToday: d.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD'),
    })
  }
  // 后置填充（补齐 6 行 = 42 格，或填到 35 格）
  const total = 35
  while (days.length < total) {
    const lastDate = days.length > 0 ? dayjs(days[days.length - 1].dateStr) : start
    const next = lastDate.add(1, 'day')
    days.push({
      day: next.date(),
      inMonth: false,
      dateStr: next.format('YYYY-MM-DD'),
      isSelected: isDateSelected(next),
      isToday: next.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD'),
    })
  }
  return days
})

function isDateSelected(d: dayjs.Dayjs) {
  const anchor = getCurrentAnchorDate()
  if (timeRange.value === 'day') {
    return d.format('YYYY-MM-DD') === anchor.format('YYYY-MM-DD')
  }
  if (timeRange.value === 'month') {
    return d.format('YYYY-MM') === anchor.format('YYYY-MM')
  }
  if (timeRange.value === 'year') {
    return d.format('YYYY') === anchor.format('YYYY')
  }
  if (timeRange.value === 'custom') {
    return d.format('YYYY-MM-DD') >= customStart.value && d.format('YYYY-MM-DD') <= customEnd.value
  }
  return false
}

function pickDate(dateStr: string) {
  if (timeRange.value === 'custom') {
    // 自定义范围：点击日期 -> 以该日期为中心点，不特殊处理
    return
  }
  const target = dayjs(dateStr)
  if (timeRange.value === 'day') {
    dateOffset.value = target.diff(dayjs(), 'day')
  } else if (timeRange.value === 'month') {
    dateOffset.value = target.month() - dayjs().month() + (target.year() - dayjs().year()) * 12
  } else if (timeRange.value === 'year') {
    dateOffset.value = target.year() - dayjs().year()
  }
}

const budgetRangeLabel = computed(() => {
  const map: Record<string, string> = { day: '日预算', month: '月预算', year: '年预算', all: '总预算', custom: '自定义范围预算' }
  return map[timeRange.value] || '预算'
})

function openBudgetEdit() {
  newBudget.value = budget.value
  showBudgetEdit.value = true
}

function saveBudget() {
  if (newBudget.value > 0) {
    bookStore.setBudget(timeRange.value, newBudget.value)
  }
  showBudgetEdit.value = false
}

const timeRanges = [
  { label: '日', value: 'day' as TimeRange },
  { label: '月', value: 'month' as TimeRange },
  { label: '年', value: 'year' as TimeRange },
  { label: '全部', value: 'all' as TimeRange },
  { label: '自定义', value: 'custom' as TimeRange },
]

const titleText = computed(() => {
  if (timeRange.value === 'day') return '今日'
  if (timeRange.value === 'month') return '本月'
  if (timeRange.value === 'year') return '今年'
  if (timeRange.value === 'all') return '全部'
  return '自定义'
})

// 活跃天数来自 useFilteredStats
const currentDateLabel = computed(() => {
  if (timeRange.value === 'day') return dayjs().add(dateOffset.value, 'day').format('YYYY-MM-DD')
  if (timeRange.value === 'month') return dayjs().add(dateOffset.value, 'month').format('YYYY-MM')
  if (timeRange.value === 'year') return dayjs().add(dateOffset.value, 'year').format('YYYY')
  return ''
})

// 已删除 viewMode：图表分析 Tab 已移除（按用户要求精简入口）

// ====== 年度/月度预算 + 预算日历 ======
// 预算日历当前年份（默认当前年）
const budgetCalendarYear = ref(dayjs().year())

// 年度预算 — 按当前选中年份计算 12 个月的预算总和
// 规则：当前年用默认月预算（有定制则覆盖）；往年/未来年仅统计已明确设置的定制预算
const yearlyBudget = computed(() => {
  const year = budgetCalendarYear.value
  const isCurrentYear = year === dayjs().year()
  let total = 0
  for (let m = 1; m <= 12; m++) {
    const mm = m < 10 ? '0' + m : String(m)
    const key = `${year}-${mm}`
    const customBudget = bookStore.monthBudgets[key]
    if (customBudget !== undefined && customBudget > 0) {
      total += customBudget
    } else if (isCurrentYear) {
      total += bookStore.getBudget('month') || 0
    }
  }
  return total
})
const yearlyExpense = computed(() => {
  const prefix = String(budgetCalendarYear.value)
  return transactions.value
    .filter(t => t.type === 'expense' && t.date.startsWith(prefix) && t.bookId === bookStore.bookId)
    .reduce((s, t) => s + t.amount, 0)
})
const yearlyRemaining = computed(() => Math.max(0, yearlyBudget.value - yearlyExpense.value))
const yearlyPercent = computed(() => yearlyBudget.value > 0 ? Math.min(100, Math.round((yearlyExpense.value / yearlyBudget.value) * 100)) : 0)

// 年份选择范围：当前年 ± 10 年
const availableBudgetYears = computed(() => {
  const currentYear = dayjs().year()
  const years: number[] = []
  for (let y = currentYear - 10; y <= currentYear + 10; y++) {
    years.push(y)
  }
  return years
})

// 默认月度预算
const defaultMonthBudget = computed(() => bookStore.getBudget('month'))

// 计算某一年 12 个月的预算使用情况
// 规则同年度预算：当前年用默认月预算（有定制则覆盖）；往年/未来年仅统计已明确设置的定制预算
const months = computed(() => {
  const list: { month: string; label: string; budget: number; expense: number; percent: number }[] = []
  const year = budgetCalendarYear.value
  const isCurrentYear = year === dayjs().year()
  for (let m = 1; m <= 12; m++) {
    const mm = m < 10 ? '0' + m : String(m)
    const key = `${year}-${mm}`
    const expense = transactions.value
      .filter(t => t.type === 'expense' && t.date.startsWith(key) && t.bookId === bookStore.bookId)
      .reduce((s, t) => s + t.amount, 0)
    const customBudget = bookStore.monthBudgets[key]
    let budget = 0
    if (customBudget !== undefined && customBudget > 0) {
      budget = customBudget
    } else if (isCurrentYear) {
      budget = bookStore.getBudget('month') || 0
    }
    const percent = budget > 0 ? Math.min(100, Math.round((expense / budget) * 100)) : 0
    list.push({ month: key, label: `${m}月`, budget, expense, percent })
  }
  return list
})

// 编辑某个月的预算弹窗
const showMonthBudgetEdit = ref(false)
const editingMonth = ref('')
const editingMonthLabel = ref('')
const editingMonthValue = ref(0)

function openMonthBudgetEdit(monthKey: string, label: string) {
  const existing = bookStore.getMonthBudget(monthKey)
  editingMonth.value = monthKey
  editingMonthLabel.value = `${budgetCalendarYear.value}年${label}`
  // 若该月无定制预算，则让输入框为空，便于用户选择"用默认值"
  editingMonthValue.value = bookStore.monthBudgets[monthKey] !== undefined ? bookStore.monthBudgets[monthKey] : 0
  showMonthBudgetEdit.value = true
}

function saveMonthBudget() {
  if (editingMonth.value) {
    if (editingMonthValue.value > 0) {
      bookStore.setMonthBudget(editingMonth.value, editingMonthValue.value)
    } else {
      // 0 或空值 → 删除该月定制预算（回落到默认月预算）
      bookStore.removeMonthBudget(editingMonth.value)
    }
  }
  showMonthBudgetEdit.value = false
}

// 年份选择弹窗
const showYearEdit = ref(false)
const editYear = ref<number>(dayjs().year())

function openYearEdit() {
  editYear.value = budgetCalendarYear.value
  showYearEdit.value = true
}

function applyYearEdit() {
  const min = dayjs().year() - 10
  const max = dayjs().year() + 10
  const y = Number(editYear.value)
  if (!isNaN(y) && y >= min && y <= max) {
    budgetCalendarYear.value = y
  }
  showYearEdit.value = false
}

function setTimeRange(range: TimeRange) {
  dateOffset.value = 0
  timeRange.value = range
  if (range === 'custom') {
    showCustomDate.value = true
  }
}

function openCustom() {
  timeRange.value = 'custom'
  showCustomDate.value = true
}

function applyCustomDate() {
  showCustomDate.value = false
}

async function handleDelete(objectId: string) {
  if (confirm('确定删除这条记录吗？')) {
    await removeTransaction(objectId)
  }
}

</script>

<style scoped>
/* ===== 根容器 ===== */
.home-page {
  background: var(--page-bg);
  min-height: 100vh;
  padding: 16px 16px 100px;
  position: relative;
  z-index: 1;  /* 内容容器始终在 PaintedScene 暗纹 (0) 之上 */
}

/* ===== 顶部标题区 ===== */
.home-header {
  padding: 48px 16px 12px;
}

.page-title {
  font: var(--font-h1);
  color: var(--text-h1);
}

/* ===== 时间维度胶囊按钮 ===== */
.seg-control {
  display: flex;
  background: var(--card-bg);
  border-radius: var(--radius-md);
  padding: 3px;
  gap: 0;
  box-shadow: var(--shadow-soft);
  overflow: hidden;
}

.seg-control .seg-item {
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
}

.seg-control .seg-item.active {
  background: var(--primary-light);
  color: var(--primary);
  font-weight: 600;
}

.seg-control .seg-item:not(.active):hover {
  background: var(--page-bg);
  border-color: var(--divider);
}

/* ===== 预算卡 ===== */
.card-budget {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-soft);
  margin: 12px 16px;
  padding: 18px 20px;
}

.budget-ring {
  width: 72px;
  height: 72px;
  position: relative;
  flex-shrink: 0;
}

.budget-ring-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-h1);
}

.budget-title {
  font: var(--font-h2);
  color: var(--text-body);
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 500;
}

.budget-amount {
  font: var(--font-h1);
  color: var(--text-h1);
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
}

.budget-remaining-label {
  font-size: 12px;
  color: var(--text-weak);
  margin-top: 4px;
}

.budget-remaining {
  font: var(--font-h1);
  color: var(--primary);
  font-size: 16px;
  font-weight: 700;
}

.budget-remaining.over {
  color: var(--expense-dark);
}

.btn-secondary-sm {
  border: 1px solid var(--primary);
  color: var(--primary);
  background: transparent;
  border-radius: var(--radius-md);
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary-sm:active {
  background: var(--primary-light);
  transform: scale(0.96);
}

.budget-date {
  font-size: 11px;
  color: var(--text-weak);
  align-self: flex-start;
  white-space: nowrap;
}

/* ===== 支出 / 收入 卡片 ===== */
.balance-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 12px 16px;
}

.balance-card-light {
  border-radius: var(--radius-xl);
  padding: 16px 20px;
  box-shadow: var(--shadow-soft);
  transition: transform 0.2s, background 0.2s;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  min-height: 110px;
}

.balance-card-light:active {
  transform: scale(0.98);
}

.expense-card {
  background: linear-gradient(135deg, var(--expense-light) 0%, #FFE4D6 100%);
}

.income-card {
  background: linear-gradient(135deg, var(--income-light) 0%, #D6EFE5 100%);
}

/* 卡片内容浮在插画之上 */
.card-content {
  position: relative;
  z-index: 9;  /* 文字金额置顶，不被插画覆盖 */
  text-align: left;
  padding-left: 16px;
  padding-right: 16px;
  max-width: 100%;
  /* 文字增加玻璃磨砂底，让字始终清晰 */
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.55) 70%, rgba(255, 255, 255, 0) 100%);
  border-radius: var(--radius-md);
  padding-top: 8px;
  padding-bottom: 8px;
}

.card-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-h1);
  margin-bottom: 4px;
  letter-spacing: 0.02em;
}

.balance-value {
  font: var(--font-h1);
  font-size: 26px;
  font-weight: 800;
  line-height: 1.2;
}

/* 金额颜色调为更高对比：支出深红 / 收入深绿，
   并加阴影进一步保证铺满图后仍清晰可读 */
.expense-value {
  color: #C8281C;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.6);
}
.income-value {
  color: #1E8A5A;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.6);
}

/* ===== Tab 栏（记录 / 图表） ===== */
.view-tab-row {
  padding: 16px 16px 8px;
}

.tab-primary {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  padding: 4px 8px;
}

.tab-primary .seg-item {
  color: var(--text-weak);
  padding: 10px 12px;
  font-weight: 500;
  border-bottom: 2px solid transparent;
}

.tab-primary .seg-item.active {
  background: transparent;
  color: var(--text-h1);
  font-weight: 600;
  border-bottom: 2px solid var(--primary);
}

.tab-primary .seg-item:not(.active):hover {
  background: transparent;
  border-color: transparent;
  color: var(--text-body);
}

.modal-sticker {
  position: absolute;
  opacity: 0.85;
  pointer-events: none;
  z-index: 1;
  object-fit: cover;
  user-select: none;
}

/* ===== 交易列表 ===== */
.tx-list {
  padding: 4px 16px;
}

/* ===== 图表卡片 ===== */
.chart-card {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-soft);
  margin: 8px 16px;
  padding: 16px;
}

/* ===== 空状态（高级空白模块） ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 80px 40px 60px;
}

.empty-state-title {
  font: var(--font-h2);
  color: var(--text-h1);
  margin-bottom: 6px;
  font-size: 16px;
  font-weight: 600;
}

.empty-state-desc {
  font-size: 12px;
  color: var(--text-weak);
  line-height: 1.6;
}

.empty-state-mascot {
  margin-bottom: 12px;
}

.form-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-weak);
  margin-bottom: 6px;
}

/* ===== 账本 / 日期 快捷卡片 ===== */
.quick-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 6px 0 6px;
}

.quick-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: var(--shadow-soft);
  cursor: pointer;
  transition: transform 0.15s, background 0.15s;
}

.quick-card:active {
  transform: scale(0.97);
  background: var(--primary-light);
}

.quick-card-info {
  flex: 1;
  min-width: 0;
}

.quick-card-label {
  font-size: 11px;
  color: var(--text-weak);
  margin-bottom: 3px;
  line-height: 1;
}

.quick-card-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-h1);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.quick-card-arrow {
  color: var(--text-weak);
  font-size: 18px;
  line-height: 1;
  flex-shrink: 0;
}

/* ===== 账本选择弹窗 ===== */
.book-item {
  display: flex;
  align-items: center;
  padding: 10px 8px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 0.15s;
}

.book-item:active,
.book-item.active {
  background: var(--primary-light);
}

.book-name {
  flex: 1;
  font-size: 14px;
  color: var(--text-h1);
  font-weight: 500;
}

.book-check {
  color: var(--primary);
  font-weight: 600;
  margin-left: 8px;
}

/* ===== 日期选择弹窗 ===== */
.date-range-info {
  background: var(--primary-light);
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: var(--primary);
  margin-bottom: 12px;
}

.date-quick-row {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}

.date-quick-btn {
  flex: 1;
  padding: 8px 4px;
  background: var(--page-bg);
  border: none;
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: var(--text-body);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.date-quick-btn:active {
  background: var(--primary-light);
  color: var(--primary);
}

.date-calendar {
  background: var(--page-bg);
  border-radius: var(--radius-md);
  padding: 12px;
  margin-bottom: 12px;
}

.calendar-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.calendar-nav-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  color: var(--text-body);
  transition: background 0.2s ease;
}

.calendar-nav-btn:active {
  background: var(--primary-light);
  color: var(--primary);
}

.calendar-month {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-h1);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.calendar-head {
  font-size: 11px;
  color: var(--text-weak);
  text-align: center;
  padding: 6px 0;
  font-weight: 500;
}

.calendar-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--text-body);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.calendar-cell.other-month {
  color: var(--text-weak);
  opacity: 0.6;
}

.calendar-cell.today {
  font-weight: 600;
  color: var(--primary);
}

.calendar-cell.selected {
  background: var(--primary);
  color: #fff !important;
  font-weight: 600;
}

.calendar-cell:active:not(.selected) {
  background: var(--primary-light);
}

.date-custom-range {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 6px;
}

.date-field {
  background: var(--page-bg);
  padding: 10px;
  border-radius: var(--radius-sm);
}

.date-field .input {
  width: 100%;
}

/* ====== 年度预算大卡片 ====== */
.yearly-budget-card {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-soft);
  margin: 12px 16px 4px;
  padding: 20px;
}

.yearly-budget-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.yearly-budget-title h3 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-h1);
  margin-bottom: 4px;
}

.yearly-budget-sub {
  font-size: 12px;
  color: var(--text-weak);
}

.year-select {
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
  transition: background 0.15s, transform 0.1s;
  user-select: none;
}

.year-select:active {
  transform: scale(0.97);
}

.year-select-label {
  color: var(--primary);
}

.modal-card-sm {
  width: 280px;
  max-width: 90vw;
}

/* 弹窗内 IP 角标定位 */
.modal-card {
  position: relative;
}

.yearly-budget-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-top: 1px solid var(--divider);
  border-bottom: 1px solid var(--divider);
  margin-bottom: 14px;
}

.yearly-stat-item {
  flex: 1;
  text-align: center;
}

.yearly-stat-label {
  display: block;
  font-size: 12px;
  color: var(--text-weak);
  margin-bottom: 6px;
}

.yearly-stat-value {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-h1);
}

.yearly-stat-value.primary {
  color: var(--primary);
}

.yearly-stat-value.expense {
  color: var(--expense);
}

.yearly-stat-divider {
  width: 1px;
  height: 28px;
  background: var(--divider);
}

.yearly-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.yearly-progress-bar {
  flex: 1;
  height: 6px;
  background: var(--divider);
  border-radius: 3px;
  overflow: hidden;
}

.yearly-progress-fill {
  height: 100%;
  background: var(--primary);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.yearly-progress-fill.over {
  background: var(--expense);
}

.yearly-progress-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-h1);
  min-width: 44px;
  text-align: right;
}

.yearly-budget-hint {
  margin-top: 12px;
  font-size: 12px;
  color: var(--text-weak);
  text-align: center;
}

/* ====== 预算日历 ====== */
.budget-calendar-card {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-soft);
  margin: 12px 16px 4px;
  padding: 20px;
}

.budget-calendar-title {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 14px;
}

.budget-calendar-title h3 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-h1);
}

.budget-calendar-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.budget-month-cell {
  background: var(--page-bg);
  border-radius: var(--radius-md);
  padding: 12px 8px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.15s, background 0.15s;
  border: 1px solid transparent;
}

.budget-month-cell:active {
  transform: scale(0.96);
}

.budget-month-cell.has-budget {
  background: var(--primary-light);
  border-color: var(--primary);
}

.budget-month-cell.over {
  background: var(--expense-light);
  border-color: var(--expense);
}

.budget-month-cell.over .budget-month-value {
  color: var(--expense-dark);
}

.budget-month-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-h1);
  margin-bottom: 6px;
}

.budget-month-progress {
  height: 4px;
  background: var(--divider);
  border-radius: 2px;
  overflow: hidden;
  margin: 4px 0;
}

.budget-month-progress.hidden-bar {
  background: transparent;
}

.budget-month-progress-fill {
  height: 100%;
  background: var(--primary);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.budget-month-progress-fill.over {
  background: var(--expense);
}

.budget-month-value {
  font-size: 13px;
  font-weight: 700;
  color: var(--primary);
  margin-top: 4px;
}

.budget-month-cell.empty-month .budget-month-value {
  color: var(--text-weak);
}

.budget-month-meta {
  font-size: 10px;
  color: var(--text-weak);
  margin-top: 2px;
}

/* 复用全局 caption 样式 */
.block {
  display: block;
}
.mb-2 {
  margin-bottom: 6px;
}
.mt-2 {
  margin-top: 6px;
}
.mt-1 {
  margin-top: 4px;
}
</style>
