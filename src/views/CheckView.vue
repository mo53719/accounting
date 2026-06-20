<template>
  <div class="page">
    <div class="page-header">
      <span class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </span>
      <div class="flex-1">
        <h1 class="page-title">每日对账</h1>
        <p class="page-subtitle">对比账单与预估支出</p>
      </div>
    </div>

    <div class="page-body">
      <!-- 日期选择器：独立白色卡片 -->
      <div class="card-md flex items-center justify-between">
        <button @click="changeDate(-1)" class="nav-btn">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <p class="text-base font-medium text-dark">{{ dateLabel }}</p>
        <button @click="changeDate(1)" class="nav-btn">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      <!-- 对账状态卡：白色大卡片，上方标题 + 金额 -->
      <div class="card-lg summary-card">
        <p class="caption">对账状态</p>
        <p class="summary-title">{{ statusText }}</p>
        <div class="summary-row">
          <div>
            <span class="caption">预估</span>
            <span class="summary-amount">¥{{ estimate.toFixed(2) }}</span>
          </div>
          <div class="summary-divider"></div>
          <div>
            <span class="caption">实际</span>
            <span class="summary-amount expense">¥{{ actual.toFixed(2) }}</span>
          </div>
        </div>
        <div class="summary-progress">
          <div class="summary-progress-bar" :style="{ width: progressWidth + '%' }"></div>
        </div>
        <!-- 卡片右上角 -->
        <IllustrationImage
          v-if="currentThemeSet !== 'standard'"
          :theme="currentThemeSet" slot="stickerCorner"
          module-id="check-summary"
          css-class="card-sticker"
        />
      </div>

      <!-- 分类对比：独立白色卡片 -->
      <div class="card-lg">
        <h3 class="section-title">分类对比</h3>
        <div v-if="categories.length === 0" class="empty-line">无支出记录</div>
        <div v-else class="cat-list">
          <div v-for="c in categories" :key="c.name" class="cat-row">
            <div class="cat-row-top">
              <span class="body-sm">{{ c.name }}</span>
              <span class="caption">¥{{ c.amount.toFixed(2) }} · {{ c.count }} 笔</span>
            </div>
            <div class="cat-progress">
              <div class="cat-progress-bar" :style="{ width: c.percent + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 当日账单：独立白色卡片 -->
      <div class="card-lg">
        <h3 class="section-title">当日账单 ({{ dayTransactions.length }})</h3>
        <div v-if="dayTransactions.length === 0" class="empty-line">该日无记录</div>
        <div v-else class="bill-list">
          <div v-for="t in dayTransactions" :key="t.objectId" class="bill-row">
            <span class="body-sm">{{ t.category }}</span>
            <span class="bill-amount" :class="t.type">
              {{ t.type === 'income' ? '+' : '-' }}¥{{ t.amount.toFixed(2) }}
            </span>
            <!-- 行右侧 mini 贴纸 -->
            <IllustrationImage
              v-if="currentThemeSet !== 'standard'"
              :theme="currentThemeSet" slot="stickerCorner"
              :module-id="`check-bill-${t.objectId}`"
              css-class="bill-sticker"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTransaction } from '../composables/useTransaction'
import IllustrationImage from '../components/IllustrationImage.vue'
import { currentThemeSet } from '../composables/useTheme'
import dayjs from 'dayjs'

const { transactions } = useTransaction()
const currentDate = ref(dayjs())
const dateLabel = computed(() => currentDate.value.format('YYYY-MM-DD'))
const dayTransactions = computed(() =>
  transactions.value.filter((t) => t.date === dateLabel.value)
)
const actual = computed(() => dayTransactions.value.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0))
const estimate = computed(() => {
  const lastWeek = currentDate.value.subtract(7, 'day').format('YYYY-MM-DD')
  const last = transactions.value.filter((t) => t.date === lastWeek && t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  return last * 1.1
})
const statusText = computed(() => {
  if (actual.value === 0 && estimate.value === 0) return '无数据'
  if (actual.value < estimate.value * 0.9) return '节支'
  if (actual.value > estimate.value * 1.1) return '超支'
  return '正常'
})
const progressWidth = computed(() => {
  const max = Math.max(estimate.value, actual.value, 1)
  return Math.min(100, Math.round((actual.value / max) * 100))
})
const categories = computed(() => {
  const map: Record<string, { name: string; amount: number; count: number }> = {}
  for (const t of dayTransactions.value.filter((t) => t.type === 'expense')) {
    if (!map[t.category]) map[t.category] = { name: t.category, amount: 0, count: 0 }
    map[t.category].amount += t.amount
    map[t.category].count++
  }
  const arr = Object.values(map).sort((a, b) => b.amount - a.amount)
  const max = arr[0]?.amount || 1
  return arr.map((c) => ({ ...c, percent: Math.round((c.amount / max) * 100) }))
})
function changeDate(delta: number) {
  currentDate.value = currentDate.value.add(delta, 'day')
}
</script>

<style scoped>
.page {
  background: var(--page-bg);
  min-height: 100vh;
  padding-bottom: 40px;
}
.flex-1 { flex: 1; min-width: 0; }
.flex { display: flex; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.text-dark { color: var(--text-h1); }
.text-base { font-size: 14px; }
.font-medium { font-weight: 500; }

.page-body {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* 统一卡片样式 */
.card-md {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  padding: 12px 16px;
}
.card-lg {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-soft);
  padding: 16px 18px;
}

.nav-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--page-bg);
  color: var(--text-body);
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
}
.nav-btn:active { transform: scale(0.94); background: var(--primary-light); color: var(--primary); }

/* 对账总结卡 */
.summary-card { padding-top: 18px; padding-bottom: 18px; position: relative; }
.summary-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-h1);
  margin-top: 4px;
  letter-spacing: 0.01em;
}
.summary-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding: 10px 0;
  border-top: 1px solid var(--divider);
  border-bottom: 1px solid var(--divider);
}
.summary-row > div {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}
.summary-divider {
  width: 1px;
  align-self: stretch;
  background: var(--divider);
}
.summary-amount {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-h1);
}
.summary-amount.expense { color: var(--expense); }
.summary-progress {
  margin-top: 12px;
  height: 6px;
  background: var(--page-bg);
  border-radius: 3px;
  overflow: hidden;
}
.summary-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-light), var(--primary));
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* 区块标题 */
.section-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-h1);
  margin-bottom: 12px;
}
.body-sm { font-size: 13px; color: var(--text-h1); }
.caption { font-size: 12px; color: var(--text-weak); }

.empty-line {
  font-size: 13px;
  color: var(--text-weak);
  text-align: center;
  padding: 16px 0;
}

/* 分类行 */
.cat-list { display: flex; flex-direction: column; gap: 10px; }
.cat-row-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.cat-progress {
  height: 6px;
  background: var(--page-bg);
  border-radius: 3px;
  overflow: hidden;
}
.cat-progress-bar {
  height: 100%;
  background: var(--primary-light);
  position: relative;
  border-radius: 3px;
}
.cat-progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: var(--primary);
  border-radius: 3px;
  opacity: 0.85;
}

/* 账单行 */
.bill-list { display: flex; flex-direction: column; }
.bill-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--divider);
}
.bill-row:last-child { border-bottom: none; }
.bill-amount { font-size: 14px; font-weight: 600; }
.bill-amount.expense { color: var(--expense); }
.bill-amount.income { color: var(--income); }

.page-header {
  padding: 50px 16px 4px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}
.page-header-sticker {
  position: absolute;
  top: 50px;
  right: 16px;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  flex-shrink: 0;
}
.card-sticker {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 26px;
  height: 26px;
  border-radius: 5px;
  opacity: 0.85;
  pointer-events: none;
}
.bill-sticker {
  position: absolute;
  right: 110px;
  bottom: 6px;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  opacity: 0.7;
  pointer-events: none;
}
.bill-row { position: relative; }
</style>
