﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿<template>
  <div class="stats-page">
    <!-- 顶部页头（已删除左右箭头：仅保留返回按钮） -->
    <div class="page-header">
      <span class="back-btn" @click="$router.back()">
        <Icon name="arrowLeft" :size="20" />
      </span>
      <div class="flex-1">
        <h1 class="page-title">数据统计</h1>
      </div>
    </div>

    <div class="stats-content">
      <!-- 月份选择器（点击弹出自定义年月选择弹窗，替代原箭头） -->
      <div class="current-month">
        <span class="caption">当前：</span>
        <span
          class="current-month-text"
          @click="openMonthPicker"
          role="button"
          tabindex="0"
        >
          {{ selectedMonth }}
          <svg class="month-picker-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
        </span>
      </div>

      <!-- 收支汇总（2 列横版卡片：与原版一致） -->
      <div class="grid grid-cols-2 gap-3 balance-row">
        <div class="balance-card-light expense-card">
          <PaintedScene card-scene="expense" stats-unique page-id="stats-balance-expense" />
          <div class="card-content">
            <p class="caption mb-1">支出</p>
            <p class="balance-value expense-value">¥{{ monthStats.expense.toFixed(0) }}</p>
          </div>
        </div>
        <div class="balance-card-light income-card">
          <PaintedScene card-scene="income" stats-unique page-id="stats-balance-income" />
          <div class="card-content">
            <p class="caption mb-1">收入</p>
            <p class="balance-value income-value">¥{{ monthStats.income.toFixed(0) }}</p>
          </div>
        </div>
      </div>

      <!-- 图表类型 Tab（复用全局 seg-control） -->
      <div class="chart-tab-row">
        <div class="seg-control">
          <button
            v-for="item in chartTypes"
            :key="item.value"
            @click="chartType = item.value"
            class="seg-item"
            :class="{ active: chartType === item.value }"
          >{{ item.label }}</button>
        </div>
      </div>

      <!-- 图表大卡片（radius-xl 白色卡片） -->
      <div class="chart-card-big">
        <BarChart v-if="chartType === 'bar' && monthStats.expense + monthStats.income > 0" />
        <LineChart v-else-if="chartType === 'line' && monthStats.expense + monthStats.income > 0" />
        <PieChart v-else-if="chartType === 'pie' && monthStats.expense + monthStats.income > 0" />
        <div v-else class="text-center py-12 text-light caption">暂无数据</div>
      </div>

      <!-- 分类支出排行（每行独立小卡片） -->
      <div class="ranking-section">
        <h3 class="section-title">分类支出排行</h3>

        <div v-if="categoryRanking.length === 0" class="empty-state">
          <!-- 已删除 PaintedScene 中央插画（不再遮挡） -->
          <p class="empty-state-title">暂无支出统计</p>
          <p class="empty-state-desc">记录第一笔支出，查看分类排行</p>
        </div>

        <div v-else class="ranking-list">
          <div
            v-for="(item, idx) in categoryRanking"
            :key="item.name"
            class="ranking-row-card"
          >
            <!-- 左侧线性图标 -->
            <div
              class="ranking-icon-circle"
              :style="{ background: item.bgColor, color: item.color }"
            >
              <img
                v-if="item.isImageIcon"
                :src="item.icon"
                class="icon-img"
              />
              <svg
                v-else
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                v-html="svgPaths[item.icon] || svgPaths['star']"
              ></svg>
            </div>

            <!-- 中间分类 + 进度条 -->
            <div class="ranking-info">
              <div class="flex justify-between items-center mb-1">
                <span class="ranking-name">{{ item.name }}</span>
                <span class="ranking-amount">¥{{ item.amount.toFixed(0) }}</span>
              </div>
              <div class="ranking-bar-track">
                <div class="ranking-bar-fill" :style="{ width: item.percent + '%' }"></div>
              </div>
            </div>

            <!-- 右侧空白区域：低透海贼王迷你角色（走随机池） -->
            <IllustrationImage
              v-if="currentThemeSet !== 'standard'"
              :theme="currentThemeSet" slot="emptySavings"
              :custom-url="rankingStickerUrls[idx]"
              css-class="ranking-sticker"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 月份选择弹窗：自定义实现，替代原 <input type=month> -->
    <div v-if="showMonthPicker" class="modal-mask" @click.self="showMonthPicker = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>选择月份</h3>
          <span class="modal-close" @click="showMonthPicker = false">×</span>
        </div>
        <div class="modal-body">
          <div class="picker-year-nav">
            <span class="picker-year-btn" @click="shiftPickerYear(-1)">‹</span>
            <span class="picker-year-label">{{ pickerYear }}年</span>
            <span class="picker-year-btn" @click="shiftPickerYear(1)">›</span>
          </div>
          <div class="picker-month-grid">
            <span
              v-for="m in 12"
              :key="m"
              class="picker-month-cell"
              :class="{
                active: pickerYear === selectedYear && m === selectedMonthNum,
                isCurrent: pickerYear === currentYear && m === currentMonthNum,
              }"
              @click="confirmMonth(pickerYear, m)"
            >{{ m }}月</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="resetToCurrentMonth">回到当月</button>
          <button class="btn-primary" @click="showMonthPicker = false">关闭</button>
        </div>
      </div>
    </div>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import dayjs from 'dayjs'
import Icon from '../components/icons/Icon.vue'
import { useCategoryStore } from '../stores/category'
import { SVG_ICON_PATHS } from '../utils/format'
import { currentThemeSet } from '../composables/useTheme'
import IllustrationImage from '../components/IllustrationImage.vue'
import { usePageIllustrationPool } from '../composables/useIllustrationPicker'
const svgPaths = SVG_ICON_PATHS
import BarChart from '../components/BarChart.vue'
import LineChart from '../components/LineChart.vue'
import PieChart from '../components/PieChart.vue'
import BottomNav from '../components/BottomNav.vue'
import PaintedScene from '../components/PaintedScene.vue'
import PetMascot from '../components/PetMascot.vue'
import MangaMascot from '../components/MangaMascot.vue'
import { useFilteredStats } from '../composables/useFilteredStats'

const categoryStore = useCategoryStore()

const chartType = ref<'bar' | 'line' | 'pie'>('bar')
const selectedMonth = ref(dayjs().format('YYYY-MM'))

// 自定义月份选择弹窗状态
const showMonthPicker = ref(false)
const pickerYear = ref(dayjs().year())
const currentYear = dayjs().year()
const currentMonthNum = dayjs().month() + 1
const selectedYear = computed(() => Number(selectedMonth.value.split('-')[0]))
const selectedMonthNum = computed(() => Number(selectedMonth.value.split('-')[1]))

const chartTypes = [
  { label: '柱状图', value: 'bar' as const },
  { label: '折线图', value: 'line' as const },
  { label: '饼图', value: 'pie' as const },
]

/* 打开弹窗：picker 年份跟随当前选中月份（不在当月时方便回顾） */
function openMonthPicker() {
  pickerYear.value = selectedYear.value
  showMonthPicker.value = true
}
function shiftPickerYear(delta: number) {
  pickerYear.value = pickerYear.value + delta
}
function confirmMonth(year: number, month: number) {
  const mm = month < 10 ? '0' + month : String(month)
  selectedMonth.value = `${year}-${mm}`
  showMonthPicker.value = false
}
function resetToCurrentMonth() {
  selectedMonth.value = dayjs().format('YYYY-MM')
  showMonthPicker.value = false
}

// 把 selectedMonth 转为 (timeRange, dateOffset, customStart, customEnd) 给共享 composable
// StatsView 只支持月切换，简化处理：dateOffset = 当前月与 selectedMonth 差值
const timeRangeForStats = computed<'month' | 'custom'>(() => 'month')
const dateOffsetForStats = ref(0)
const customStartForStats = ref('')
const customEndForStats = ref('')
watch(selectedMonth, (m) => {
  // 计算从当月到 m 相差几个月（含跨年）
  const cur = dayjs()
  const tgt = dayjs(m + '-01')
  dateOffsetForStats.value = (tgt.year() - cur.year()) * 12 + (tgt.month() - cur.month())
}, { immediate: true })

const stats = useFilteredStats({
  timeRange: timeRangeForStats,
  dateOffset: dateOffsetForStats,
  customStart: customStartForStats,
  customEnd: customEndForStats,
  scopeToCurrentBook: true,
})

const monthStats = computed(() => ({
  income: stats.totalIncome.value,
  expense: stats.totalExpense.value,
  balance: stats.balance.value,
  filtered: stats.filteredTransactions.value,
}))

const categoryRanking = computed(() => {
  const map: Record<string, number> = {}
  for (const t of monthStats.value.filtered) {
    if (t.type === 'expense') {
      map[t.category] = (map[t.category] || 0) + t.amount
    }
  }
  const total = Object.values(map).reduce((s, v) => s + v, 0) || 1
  return Object.entries(map)
    .map(([name, amount]) => {
      const cat = categoryStore.findCategory(name, 'expense')
      const icon = cat?.icon || 'star'
      return {
        name,
        amount,
        // 修 0-9 联动：排行 percent = 占总支出的比例，与饼图 sum = 100% 一致
        percent: Math.round((amount / total) * 100),
        icon,
        isImageIcon: icon.startsWith('data:image'),
        color: cat?.color || 'var(--expense)',
        bgColor: cat?.bgColor || 'var(--expense-light)',
      }
    })
    .sort((a, b) => b.amount - a.amount)
})

/* 分类排行右侧迷你插画：走 stats-rank 模块独立池（不与其他模块共享） */
const statsRankPool = usePageIllustrationPool('stats-rank')
const rankingStickerUrls = computed<string[]>(() => {
  if (statsRankPool.isStandard) return []
  if (!statsRankPool.isEnabled) return []
  return categoryRanking.value.map(() => statsRankPool.pickOne())
})

/* PaintedScene 主题跟随 */
const ipForPainted = computed<'onepiece' | 'family' | 'none'>(() => {
  if (currentThemeSet.value === 'onepiece') return 'onepiece'
  if (currentThemeSet.value === 'family') return 'family'
  return 'none'
})
</script>

<style scoped>
.stats-page {
  background: var(--page-bg);
  min-height: 100vh;
  padding-bottom: 100px;
}

.nav-arrows {
  display: none; /* 已删除左右箭头（按要求改用点击月份选择器） */
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
}
.back-btn:hover { background: var(--primary-light); }
.back-btn:active { transform: scale(0.92); }

.stats-content {
  padding: 4px 16px;
}

.current-month {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}
.current-month-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--primary);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 4px;
  border-radius: 4px;
  transition: background 0.15s, transform 0.15s;
  user-select: none;
}
.current-month-text:hover { background: var(--primary-light); }
.current-month-text:active { transform: scale(0.96); }
.month-picker-icon {
  margin-left: 2px;
  opacity: 0.65;
  transition: transform 0.2s;
}
.current-month-text:hover .month-picker-icon { transform: translateY(1px); }

/* 已删除：原 <input type=month> 隐藏样式，改用下方自定义弹窗实现 */

/* ===== 月份选择弹窗（picker）===== */
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
.modal-footer {
  display: flex;
  gap: 10px;
  padding: 12px 20px 16px;
  border-top: 1px solid var(--divider);
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
  transition: background 0.15s;
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
  position: relative;
}
.picker-month-cell:active { transform: scale(0.96); }
.picker-month-cell.isCurrent {
  border: 1.5px solid var(--primary);
}
.picker-month-cell.active {
  background: var(--primary);
  color: #fff;
  font-weight: 600;
}
.picker-month-cell.active.isCurrent {
  /* 当月+已选叠加：纯色优先 */
  border-color: var(--primary);
}

.btn-secondary {
  flex: 1;
  background: transparent;
  color: var(--primary);
  border: 1px solid var(--primary);
  border-radius: var(--radius-md);
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.15s;
  font-family: inherit;
}
.btn-secondary:active { transform: scale(0.96); background: var(--primary-light); }
.btn-primary {
  flex: 1;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.15s;
  font-family: inherit;
}
.btn-primary:active { transform: scale(0.96); opacity: 0.95; }

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slide-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 收支卡片（与首页一致） */
.balance-row {
  margin-bottom: 16px;
}
.balance-card-light {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-xl);
  padding: 14px 16px;
  box-shadow: var(--shadow-soft);
  min-height: 90px;
}
.expense-card { background: var(--expense-light); }
.income-card { background: var(--income-light); }

/* 卡片内容浮在插画之上（参考图风格） */
.balance-card-light .card-content {
  position: relative;
  z-index: 9;
  text-align: left;
  max-width: 100%;
  background: linear-gradient(90deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.55) 70%, rgba(255,255,255,0) 100%);
  border-radius: var(--radius-md);
  padding: 4px 8px 4px 4px;
  display: inline-block;
}
.balance-card-light .balance-value {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.2;
}
.balance-card-light .expense-value { color: #C8281C; text-shadow: 0 1px 0 rgba(255,255,255,0.5); }
.balance-card-light .income-value { color: #1E8A5A; text-shadow: 0 1px 0 rgba(255,255,255,0.5); }

/* 图表 Tab 行 */
.chart-tab-row {
  margin-bottom: 12px;
}

/* 图表大卡片（radius-xl 白色卡片） */
.chart-card-big {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-soft);
  padding: 12px;
  margin-bottom: 20px;
  overflow: hidden;     /* 圆角遮罩 */
}
/* ECharts 容器浮在底层之上（保留以防以后加底纹） */
.chart-card-big > :deep(.chart-container),
.chart-card-big > :deep(.pie-chart) {
  position: relative;
  z-index: 1;
}

/* 分类支出排行 */
.ranking-section {
  margin-top: 4px;
}
.section-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-h1);
  margin-bottom: 12px;
}
.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ranking-row-card {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-soft);
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.ranking-icon-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--expense-light);
  color: var(--expense);
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
.ranking-info {
  flex: 1;
  min-width: 0;
}
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

/* 纤细进度条 */
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

/* 排行右侧海贼王迷你角色：与首页保持一致色彩亮度 */
.ranking-sticker {
  width: 26px;
  height: 26px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
  pointer-events: none;
  margin-left: 8px;
  user-select: none;
  -webkit-user-drag: none;
}

/* 排行卡片：保证插画不挡字，文字浮在上面 */
.ranking-row-card {
  position: relative;
  overflow: hidden;
}
.ranking-row-card > .ranking-icon-circle,
.ranking-row-card > .ranking-info {
  position: relative;
  z-index: 1;
}
</style>
