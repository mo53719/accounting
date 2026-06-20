<template>
  <div class="page">
    <div class="page-header">
      <div class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </div>
      <h1 class="page-title">坚持天数</h1>
      <div style="width:32px"></div>
    </div>

    <div class="content">
      <div class="balance-card-light income-card">
        <PaintedScene
          v-if="ipForPainted !== 'none'"
          :ip="ipForPainted"
          card-scene="income"
          stats-unique
          page-id="persistent-hero"
        />
        <div class="card-content">
          <p class="card-label">累计记账天数</p>
          <p class="balance-value income-value">
            <span class="value-num">{{ totalDays }}</span>
            <span class="value-unit">天</span>
          </p>
        </div>
      </div>

      <div class="stat-row">
        <div class="mini-card">
          <IllustrationImage
            v-if="currentThemeSet !== 'standard'" :theme="currentThemeSet" slot="emptySavings"
            module-id="persistent-mini-1"
            css-class="mini-corner"
          />
          <div class="mini-num">{{ longestStreak }}</div>
          <div class="mini-caption">最长连续</div>
        </div>
        <div class="mini-card">
          <IllustrationImage
            v-if="currentThemeSet !== 'standard'" :theme="currentThemeSet" slot="emptySavings"
            module-id="persistent-mini-2"
            css-class="mini-corner"
          />
          <div class="mini-num">{{ currentStreak }}</div>
          <div class="mini-caption">当前连续</div>
        </div>
        <div class="mini-card">
          <IllustrationImage
            v-if="currentThemeSet !== 'standard'" :theme="currentThemeSet" slot="emptySavings"
            module-id="persistent-mini-3"
            css-class="mini-corner"
          />
          <div class="mini-num">{{ totalCount }}</div>
          <div class="mini-caption">记账笔数</div>
        </div>
      </div>

      <!-- 时间范围筛选 -->
      <div class="range-card">
        <div class="range-header">
          <span class="range-label">查询范围</span>
          <span class="range-current">最近 <b>{{ rangeDays }}</b> 天</span>
        </div>
        <div class="range-presets">
          <button
            v-for="p in presets"
            :key="p"
            class="range-preset"
            :class="{ active: rangeDays === p }"
            @click="setRange(p)"
          >
            {{ p === 'all' ? '全部' : `${p}天` }}
          </button>
        </div>
        <div class="range-slider-wrap">
          <input
            type="range"
            class="range-slider"
            :min="minRange"
            :max="maxRange"
            :value="rangeDays === 'all' ? maxRange : rangeDays"
            @input="onSliderInput"
          />
          <div class="range-bounds">
            <span>{{ minRange }}天</span>
            <span>{{ maxRange }}天</span>
          </div>
        </div>
      </div>

      <div class="section-title">记账日历（最近 {{ calendarWeeks }} 周）</div>

      <div class="calendar-card">
        <div class="cal-weekdays">
          <span v-for="w in weekdays" :key="w">{{ w }}</span>
        </div>
        <div class="cal-grid">
          <div
            v-for="(day, idx) in calendarDays"
            :key="idx"
            class="cal-cell"
            :class="{ active: day.hasRecords, today: day.isToday, empty: !day.date }"
          >
            <span v-if="day.date" class="cal-day">{{ dayjs(day.date).date() }}</span>
            <!-- 有记账记录的日期格角落随机分配小角色 -->
            <IllustrationImage
              v-if="day.hasRecords && currentThemeSet !== 'standard'"
              :theme="currentThemeSet" slot="emptySavings"
              :custom-url="calendarStickers[idx]"
              css-class="cal-cell-sticker"
            />
          </div>
        </div>
        <div class="cal-legend">
          <div class="legend-item">
            <span class="legend-dot"></span>
            <span>未记录</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot active"></span>
            <span>已记账</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot today"></span>
            <span>今天</span>
          </div>
        </div>
      </div>

      <div class="section-title">连续记录详情</div>
      <div v-if="streakList.length === 0" class="empty-state">
        <h2 class="empty-state-title">还没有连续记录</h2>
        <p class="empty-state-desc">坚持每天记账，养成好习惯</p>
      </div>
      <div v-for="(s, i) in streakList" :key="i" class="streak-card">
        <div class="streak-header">
          <div class="streak-days">{{ s.days }} 天</div>
          <div class="streak-count">{{ s.count }} 笔</div>
        </div>
        <div class="streak-range">{{ s.range }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTransaction } from '../composables/useTransaction'
import { currentThemeSet } from '../composables/useTheme'
import PaintedScene from '../components/PaintedScene.vue'
import { usePageIllustrationPool } from '../composables/useIllustrationPicker'
import dayjs from 'dayjs'

const { transactions } = useTransaction()

/* PaintedScene 主题跟随 */
const ipForPainted = computed<'onepiece' | 'family' | 'none'>(() => {
  if (currentThemeSet.value === 'onepiece') return 'onepiece'
  if (currentThemeSet.value === 'family') return 'family'
  return 'none'
})

/* ========== 时间范围筛选 ========== */
const presets = [7, 30, 90, 180, 365, 'all'] as const
const minRange = 7
const maxRange = 365
const rangeDays = ref<number | 'all'>(30)

function setRange(p: number | 'all') {
  rangeDays.value = p
}
function onSliderInput(e: Event) {
  const v = Number((e.target as HTMLInputElement).value)
  rangeDays.value = v
}

/* 范围内的截止日期（含今天） */
const rangeEnd = computed(() => dayjs())
/* 范围内的起始日期（rangeEnd 减去 N-1 天） */
const rangeStart = computed(() => {
  if (rangeDays.value === 'all') return dayjs(0)  // 1970 起
  return rangeEnd.value.subtract(rangeDays.value - 1, 'day')
})

/* 在范围内的交易 */
const inRangeTransactions = computed(() => {
  const start = rangeStart.value.format('YYYY-MM-DD')
  const end = rangeEnd.value.format('YYYY-MM-DD')
  return transactions.value.filter(t => t.date >= start && t.date <= end)
})

/* 范围内有记账的日期集合 */
const recordDates = computed(() => new Set(inRangeTransactions.value.map(t => t.date)))

const totalDays = computed(() => recordDates.value.size)
const totalCount = computed(() => inRangeTransactions.value.length)

/* 日历显示周数：1-12 周，根据 rangeDays 动态计算（至少 1 周，最多 12 周） */
const calendarWeeks = computed(() => {
  if (rangeDays.value === 'all') return 12
  return Math.min(12, Math.max(1, Math.ceil(rangeDays.value / 7)))
})

// 最长连续天数
const longestStreak = computed(() => {
  const dates = Array.from(recordDates.value).sort()
  if (dates.length === 0) return 0
  let longest = 1
  let curr = 1
  for (let i = 1; i < dates.length; i++) {
    const diff = dayjs(dates[i]).diff(dayjs(dates[i - 1]), 'day')
    if (diff === 1) {
      curr++
      longest = Math.max(longest, curr)
    } else {
      curr = 1
    }
  }
  return longest
})

// 当前连续天数（从今天往前）
const currentStreak = computed(() => {
  let d = dayjs()
  let count = 0
  while (recordDates.value.has(d.format('YYYY-MM-DD'))) {
    count++
    d = d.subtract(1, 'day')
  }
  return count
})

// 最近 N 周日历（N = calendarWeeks）
const weekdays = ['一', '二', '三', '四', '五', '六', '日']
const calendarDays = computed(() => {
  const result: { date: string | null; hasRecords: boolean; isToday: boolean }[] = []
  const today = dayjs().format('YYYY-MM-DD')
  const end = dayjs()
  const totalDays = calendarWeeks.value * 7
  const start = end.subtract(totalDays - 1, 'day')
  // 前置空补齐到周一
  const startWd = start.day() === 0 ? 7 : start.day()
  for (let i = 1; i < startWd; i++) result.push({ date: null, hasRecords: false, isToday: false })
  let d = start
  while (d.isBefore(end) || d.isSame(end, 'day')) {
    const dStr = d.format('YYYY-MM-DD')
    result.push({ date: dStr, hasRecords: recordDates.value.has(dStr), isToday: dStr === today })
    d = d.add(1, 'day')
  }
  return result
})

// 连续周期列表（范围内）
const streakList = computed(() => {
  const dates = Array.from(recordDates.value).sort()
  if (dates.length === 0) return []
  const streaks: { start: string; end: string; days: number; count: number }[] = []
  let s = 0
  for (let i = 1; i <= dates.length; i++) {
    if (i === dates.length || dayjs(dates[i]).diff(dayjs(dates[i - 1]), 'day') > 1) {
      const startDate = dates[s]
      const endDate = dates[i - 1]
      const days = dayjs(endDate).diff(dayjs(startDate), 'day') + 1
      const count = inRangeTransactions.value.filter(t => t.date >= startDate && t.date <= endDate).length
      streaks.push({ start: startDate, end: endDate, days, count })
      s = i
    }
  }
  return streaks
    .sort((a, b) => b.days - a.days)
    .slice(0, 10)
    .map(s => ({
      days: s.days,
      count: s.count,
      range: `${dayjs(s.start).format('YYYY/MM/DD')} — ${dayjs(s.end).format('YYYY/MM/DD')}`,
    }))
})

/* 日历格子有记账的日期格 - 随机分配小角色（走 persistent-sticker 模块独立池） */
const persistentStickerPool = usePageIllustrationPool('persistent-sticker')
const calendarStickers = computed<string[]>(() => {
  return calendarDays.value.map(day => {
    if (!day.hasRecords) return ''
    if (persistentStickerPool.isStandard) return ''
    if (!persistentStickerPool.isEnabled) return ''
    return persistentStickerPool.pickOne()
  })
})
</script>

<style scoped>
.page {
  background: var(--page-bg);
  min-height: 100vh;
}
.page-header {
  display: flex;
  align-items: center;
  padding: 48px 16px 12px;
}
.back-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-h1);
  cursor: pointer;
}
.page-title {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-h1);
  margin: 0;
}
.content {
  padding: 0 16px 24px;
}
.hero-card,
.balance-card-light.income-card {
  background: linear-gradient(135deg, var(--income-light) 0%, #D6EFE5 100%);
  border-radius: var(--radius-xl);
  padding: 14px 16px;
  box-shadow: var(--shadow-soft);
  margin-bottom: 12px;
  position: relative;
  overflow: hidden;
  min-height: 92px;
}

/* 文字层浮在插画之上（与首页 .balance-card-light .card-content 一致） */
.balance-card-light .card-content {
  position: relative;
  z-index: 9;
  display: block;
  padding: 4px 8px 4px 4px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.55) 70%, rgba(255, 255, 255, 0) 100%);
  border-radius: var(--radius-md);
  text-align: left;
  max-width: 100%;
}
.balance-card-light .card-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-h1);
  margin: 0 0 2px;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.6);
}
.balance-card-light .balance-value {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.1;
  margin: 0;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.balance-card-light .income-value { color: #1E8A5A; }
.balance-card-light .balance-value .value-num { font-size: 32px; font-weight: 800; }
.balance-card-light .balance-value .value-unit { font-size: 14px; font-weight: 600; }
.stat-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 20px;
}

/* 时间范围筛选卡 */
.range-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  box-shadow: var(--shadow-soft);
  margin-bottom: 20px;
}
.range-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.range-label {
  font-size: 13px;
  color: var(--text-weak);
  font-weight: 500;
}
.range-current {
  font-size: 13px;
  color: var(--text-body);
}
.range-current b {
  color: var(--income);
  font-size: 18px;
  font-weight: 700;
  margin: 0 2px;
}
.range-presets {
  display: flex;
  gap: 6px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}
.range-preset {
  flex: 1 1 0;
  min-width: 0;
  padding: 6px 0;
  font-size: 12px;
  border: 1px solid var(--border-soft, #e5e7eb);
  background: var(--page-bg);
  color: var(--text-body);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.range-preset:active {
  transform: scale(0.96);
}
.range-preset.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
  font-weight: 600;
}
.range-slider-wrap {
  padding: 0 2px;
}
.range-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  background: var(--page-bg);
  border-radius: 2px;
  outline: none;
  margin: 6px 0 4px;
}
.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--primary);
  cursor: pointer;
  border: 3px solid #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.15);
  transition: transform 0.1s;
}
.range-slider::-webkit-slider-thumb:active {
  transform: scale(1.15);
}
.range-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--primary);
  cursor: pointer;
  border: 3px solid #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.15);
}
.range-bounds {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-weak);
  margin-top: 2px;
}
.mini-card {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  padding: 14px 8px;
  text-align: center;
  box-shadow: var(--shadow-soft);
  position: relative;
  overflow: hidden;
  min-height: 60px;
}
.mini-corner {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  object-fit: cover;
  border-radius: 4px;
  z-index: 0;
  pointer-events: none;
}
.mini-num {
  position: relative;
  z-index: 2;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-h1);
}
.mini-caption {
  position: relative;
  z-index: 2;
  font-size: 11px;
  color: var(--text-weak);
  margin-top: 4px;
}
.section-title {
  font-size: 13px;
  color: var(--text-weak);
  margin: 4px 4px 10px;
  font-weight: 500;
}
.calendar-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: 16px 12px;
  box-shadow: var(--shadow-soft);
  margin-bottom: 20px;
}
.cal-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 11px;
  color: var(--text-weak);
  margin-bottom: 8px;
}
.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}
.cal-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: var(--page-bg);
  position: relative;
  overflow: hidden;
}
.cal-cell-sticker {
  position: absolute;
  top: 1px;
  right: 1px;
  width: 14px;
  height: 14px;
  object-fit: cover;
  border-radius: 2px;
  pointer-events: none;
  z-index: 1;
}
.cal-cell.empty { background: transparent; }
.cal-cell.active { background: var(--income-light); color: var(--income); font-weight: 600; }
.cal-cell.today { outline: 2px solid var(--primary); }
.cal-cell.active.today { background: var(--income); color: #fff; }
.cal-day {
  font-size: 11px;
  color: var(--text-body);
}
.cal-cell.active .cal-day { color: var(--income); }
.cal-cell.active.today .cal-day { color: #fff; }
.cal-legend {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 14px;
  font-size: 11px;
  color: var(--text-weak);
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background: var(--page-bg);
}
.legend-dot.active { background: var(--income-light); }
.legend-dot.today { outline: 2px solid var(--primary); background: var(--income); }
.streak-card {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  padding: 14px;
  margin-bottom: 8px;
  box-shadow: var(--shadow-soft);
}
.streak-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.streak-days {
  font-size: 16px;
  font-weight: 600;
  color: var(--income);
}
.streak-count {
  font-size: 12px;
  color: var(--text-weak);
}
.streak-range {
  font-size: 12px;
  color: var(--text-body);
}
.empty-state {
  padding: 40px 20px;
  text-align: center;
}
.empty-state-title {
  font-size: 15px;
  color: var(--text-h1);
  margin: 0 0 6px;
  font-weight: 500;
}
.empty-state-desc {
  font-size: 12px;
  color: var(--text-weak);
  margin: 0;
}
</style>
