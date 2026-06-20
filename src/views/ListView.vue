﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿<template>
  <div class="list-page">
    <!-- 顶部页头（统一风格） -->
    <div class="page-header">
      <div class="flex-1">
        <h1 class="page-title">全部账单</h1>
      </div>
      <div class="nav-arrows">
        <span @click="shiftMonth(-1)" class="cursor-pointer">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </span>
        <span @click="shiftMonth(1)" class="cursor-pointer">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </span>
      </div>
    </div>

    <div class="list-content">
      <!-- 当前月份 + 笔数 -->
      <div class="current-month-row">
        <div class="flex items-center gap-2">
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
          <input
            ref="monthInputRef"
            type="month"
            class="month-picker-hidden"
            :value="selectedMonth"
            @change="onMonthChange"
            @input="onMonthChange"
          />
        </div>
        <span class="caption">共 {{ filteredTransactions.length }} 笔</span>
      </div>

      <!-- 空状态 -->
      <div v-if="groupedTransactions.length === 0" class="empty-state">
        <div class="empty-state-illust">
          <IllustrationImage
            v-if="currentThemeSet !== 'standard'"
            :theme="currentThemeSet" slot="emptyBills"
            css-class="empty-state-img"
          />
          <svg v-else viewBox="0 0 120 100" width="120" height="100" fill="none">
            <rect x="20" y="22" width="80" height="60" rx="8" fill="none" stroke="var(--divider)" stroke-width="2"/>
            <line x1="20" y1="36" x2="100" y2="36" stroke="var(--divider)" stroke-width="2"/>
            <line x1="36" y1="48" x2="84" y2="48" stroke="var(--divider)" stroke-width="2" stroke-dasharray="3 3"/>
            <line x1="36" y1="58" x2="68" y2="58" stroke="var(--divider)" stroke-width="2" stroke-dasharray="3 3"/>
            <line x1="36" y1="68" x2="76" y2="68" stroke="var(--divider)" stroke-width="2" stroke-dasharray="3 3"/>
            <circle cx="60" cy="50" r="22" fill="var(--card-bg)" stroke="var(--primary)" stroke-width="1.5" opacity="0.95"/>
            <line x1="60" y1="40" x2="60" y2="51" stroke="var(--primary)" stroke-width="2" stroke-linecap="round"/>
            <line x1="60" y1="51" x2="68" y2="55" stroke="var(--primary)" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <h2 class="empty-state-title">该月份没有记录</h2>
        <p class="empty-state-desc">点击底部「+」按钮开始记账</p>
      </div>

      <!-- 按日分组列表（每笔独立 radius-md 小卡片） -->
      <div v-for="group in groupedTransactions" :key="group.date" class="day-group">
        <div class="day-group-header">
          <span class="day-date">{{ group.label }}</span>
        </div>

        <div class="day-list">
          <TransactionItem
            v-for="t in group.items"
            :key="t.objectId"
            :transaction="t"
            page-id="list-tx-item"
            @delete="handleDelete"
          />
        </div>
      </div>
    </div>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import { useTransaction } from '../composables/useTransaction'
import TransactionItem from '../components/TransactionItem.vue'
import BottomNav from '../components/BottomNav.vue'
import IllustrationImage from '../components/IllustrationImage.vue'
import { currentThemeSet } from '../composables/useTheme'

const { transactions, removeTransaction } = useTransaction()

const selectedMonth = ref(dayjs().format('YYYY-MM'))
const monthInputRef = ref<HTMLInputElement | null>(null)

function shiftMonth(direction: number) {
  selectedMonth.value = dayjs(selectedMonth.value).add(direction, 'month').format('YYYY-MM')
}

/* 弹出原生月份选择器（点击"2026-06"文字触发） */
function openMonthPicker() {
  monthInputRef.value?.showPicker?.()
  monthInputRef.value?.click()
}

function onMonthChange(e: Event) {
  const v = (e.target as HTMLInputElement).value
  if (v) selectedMonth.value = v
}

const filteredTransactions = computed(() => {
  return transactions.value.filter(t => t.date.startsWith(selectedMonth.value))
})

const groupedTransactions = computed(() => {
  const groups: Record<string, { date: string, label: string, expense: number, income: number, items: any[] }> = {}
  for (const t of filteredTransactions.value) {
    if (!groups[t.date]) {
      const d = dayjs(t.date)
      const today = dayjs().format('YYYY-MM-DD')
      const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
      const weekdayNum = d.day()
      const weekNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      let label = `${d.format('MM月DD日')} ${weekNames[weekdayNum] || ''}`
      if (t.date === today) label = '今天'
      else if (t.date === yesterday) label = '昨天'
      groups[t.date] = { date: t.date, label, expense: 0, income: 0, items: [] }
    }
    if (t.type === 'expense') groups[t.date].expense += t.amount
    else groups[t.date].income += t.amount
    groups[t.date].items.push(t)
  }
  return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date))
})

async function handleDelete(objectId: string) {
  if (confirm('确定删除这条记录吗？')) {
    await removeTransaction(objectId)
  }
}
</script>

<style scoped>
.list-page {
  background: var(--page-bg);
  min-height: 100vh;
  padding-bottom: 100px;
}

.nav-arrows {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--primary);
}

.list-content {
  padding: 4px 16px;
}

/* 月份 + 笔数 行 */
.current-month-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
.month-picker-hidden {
  position: absolute;
  opacity: 0;
  pointer-events: none;
  width: 0;
  height: 0;
  left: -9999px;
  top: -9999px;
}

/* 账单页：不做汇总，删除 .balance-row / .balance-card-light / .balance-value 样式（已迁移至全局）*/

/* 每日分组 */
.day-group {
  margin-bottom: 16px;
}
.day-group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
  margin-bottom: 8px;
}
.day-date {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-h1);
}
.day-summary {
  font-size: 11px;
  color: var(--text-weak);
  display: flex;
  align-items: center;
  gap: 4px;
}
.day-expense { color: var(--expense); }
.day-income { color: var(--income); }
.day-dot { opacity: 0.5; }

/* 每日流水列表 — 每笔独立 radius-md 小卡片 */
.day-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 空状态（样式与其他页面统一 — 复用全局 .empty-state*） */
.empty-state-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-h1);
  margin-top: 8px;
  margin-bottom: 4px;
}
.empty-state-illust {
  display: flex;
  align-items: center;
  justify-content: center;
}
.empty-state-img {
  width: 240px;
  height: 150px;
  object-fit: cover;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
}
</style>
