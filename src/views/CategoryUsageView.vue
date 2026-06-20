<template>
  <div class="page">
    <div class="page-header">
      <div class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </div>
      <h1 class="page-title">使用分类</h1>
      <div style="width:32px"></div>
    </div>

    <div class="content">
      <div class="balance-card-light expense-card">
        <PaintedScene
          v-if="ipForPainted !== 'none'"
          :ip="ipForPainted"
          card-scene="expense"
          stats-unique
          page-id="category-usage-summary"
        />
        <div class="card-content">
          <p class="card-label">使用的分类数</p>
          <p class="balance-value expense-value">{{ uniqueCategories }}</p>
        </div>
      </div>

      <div class="section-title">分类使用排行</div>

      <div v-if="sortedCategories.length === 0" class="empty-state">
        <div class="empty-state-illust">
          <svg viewBox="0 0 120 100" width="120" height="100" fill="none">
            <rect x="20" y="22" width="80" height="60" rx="8" fill="none" stroke="var(--divider)" stroke-width="2"/>
            <line x1="20" y1="36" x2="100" y2="36" stroke="var(--divider)" stroke-width="2"/>
            <circle cx="60" cy="55" r="20" fill="var(--card-bg)" stroke="var(--primary)" stroke-width="1.5"/>
            <line x1="52" y1="55" x2="68" y2="55" stroke="var(--primary)" stroke-width="2" stroke-linecap="round"/>
            <line x1="60" y1="47" x2="60" y2="63" stroke="var(--primary)" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <h2 class="empty-state-title">暂无分类使用数据</h2>
        <p class="empty-state-desc">开始记账后这里会显示分类统计</p>
      </div>

      <div v-for="(cat, idx) in sortedCategories" :key="cat.name" class="rank-card">
        <IllustrationImage
          v-if="currentThemeSet !== 'standard'" :theme="currentThemeSet" slot="emptySavings"
          module-id="category-usage-rank"
          css-class="rank-item-illustration"
        />
        <div class="rank-left">
          <div class="rank-num" :class="{ top: idx < 3 }">{{ idx + 1 }}</div>
          <div class="rank-info">
            <div class="rank-name">{{ cat.name }}</div>
            <div class="rank-bar-bg">
              <div class="rank-bar" :class="cat.type" :style="{ width: cat.percent + '%' }"></div>
            </div>
          </div>
        </div>
        <div class="rank-right">
          <div class="rank-count">{{ cat.count }} 笔</div>
          <div class="rank-amount" :class="cat.type">{{ formatAmount(cat.total, cat.type) }}</div>
        </div>
      </div>

      <div class="section-title" style="margin-top:20px">支出 vs 收入</div>
      <div class="type-row">
        <div class="type-card type-expense">
          <IllustrationImage
            v-if="currentThemeSet !== 'standard'" :theme="currentThemeSet" slot="emptySavings"
            module-id="category-usage-type-expense"
            css-class="type-card-mini"
          />
          <div class="type-label">支出分类</div>
          <div class="type-num expense-value">{{ expenseCategoryCount }}</div>
          <div class="type-amount expense-value">¥{{ expenseTotal.toFixed(0) }}</div>
        </div>
        <div class="type-card type-income">
          <IllustrationImage
            v-if="currentThemeSet !== 'standard'" :theme="currentThemeSet" slot="emptySavings"
            module-id="category-usage-type-income"
            css-class="type-card-mini"
          />
          <div class="type-label">收入分类</div>
          <div class="type-num income-value">{{ incomeCategoryCount }}</div>
          <div class="type-amount income-value">¥{{ incomeTotal.toFixed(0) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTransaction } from '../composables/useTransaction'
import { currentThemeSet } from '../composables/useTheme'
import PaintedScene from '../components/PaintedScene.vue'

const { transactions } = useTransaction()

/* PaintedScene 主题跟随 */
const ipForPainted = computed<'onepiece' | 'family' | 'none'>(() => {
  if (currentThemeSet.value === 'onepiece') return 'onepiece'
  if (currentThemeSet.value === 'family') return 'family'
  return 'none'
})

interface CatStat {
  name: string
  type: string
  count: number
  total: number
  percent: number
}

const categoryStats = computed(() => {
  const map = new Map<string, CatStat>()
  transactions.value.forEach(t => {
    const key = `${t.type}|${t.category}`
    if (!map.has(key)) {
      map.set(key, { name: t.category, type: t.type, count: 0, total: 0, percent: 0 })
    }
    const stat = map.get(key)!
    stat.count++
    stat.total += t.amount
  })
  const list = Array.from(map.values())
  const maxCount = Math.max(...list.map(s => s.count), 1)
  list.forEach(s => { s.percent = (s.count / maxCount) * 100 })
  return list
})

const sortedCategories = computed(() =>
  [...categoryStats.value].sort((a, b) => b.count - a.count || b.total - a.total)
)

const uniqueCategories = computed(() =>
  new Set(categoryStats.value.map(c => c.name)).size
)

const expenseStats = computed(() => categoryStats.value.filter(c => c.type === 'expense'))
const incomeStats = computed(() => categoryStats.value.filter(c => c.type === 'income'))
const expenseCategoryCount = computed(() => expenseStats.value.length)
const incomeCategoryCount = computed(() => incomeStats.value.length)
const expenseTotal = computed(() => expenseStats.value.reduce((s, c) => s + c.total, 0))
const incomeTotal = computed(() => incomeStats.value.reduce((s, c) => s + c.total, 0))

function formatAmount(amount: number, type: string) {
  return `${type === 'expense' ? '-' : '+'}¥${amount.toFixed(2)}`
}
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
.summary-card,
.balance-card-light.expense-card {
  border-radius: var(--radius-xl);
  padding: 14px 16px;
  margin-bottom: 16px;
  box-shadow: var(--shadow-soft);
  position: relative;
  overflow: hidden;
  min-height: 92px;
  background: linear-gradient(135deg, var(--expense-light) 0%, #FFE4D6 100%);
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
}
.balance-card-light .expense-value { color: #C8281C; }
.section-title {
  font-size: 13px;
  color: var(--text-weak);
  margin: 4px 4px 10px;
  font-weight: 500;
}
.rank-card {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  padding: 14px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--shadow-soft);
  position: relative;
  overflow: hidden;
}
.rank-item-illustration {
  position: absolute;
  top: 50%;
  right: 84px;
  transform: translateY(-50%);
  width: 38px;
  height: 38px;
  object-fit: cover;
  border-radius: 6px;
  pointer-events: none;
  z-index: 0;
  user-select: none;
}
.rank-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 2;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.55) 80%, rgba(255, 255, 255, 0) 100%);
  border-radius: var(--radius-sm);
  padding: 2px 4px;
}
.rank-num {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: var(--page-bg);
  color: var(--text-body);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}
.rank-num.top {
  background: var(--expense-light);
  color: var(--expense);
}
.rank-info {
  flex: 1;
  min-width: 0;
}
.rank-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-h1);
  margin-bottom: 6px;
}
.rank-bar-bg {
  height: 4px;
  background: var(--page-bg);
  border-radius: 4px;
  overflow: hidden;
}
.rank-bar {
  height: 100%;
  border-radius: 4px;
  background: var(--primary);
  transition: width 0.3s;
}
.rank-bar.expense { background: var(--expense); }
.rank-bar.income { background: var(--income); }
.rank-right {
  text-align: right;
  flex-shrink: 0;
  margin-left: 12px;
  position: relative;
  z-index: 2;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.55) 20%, rgba(255, 255, 255, 0.85) 100%);
  border-radius: var(--radius-sm);
  padding: 2px 4px;
}
.rank-count {
  font-size: 12px;
  color: var(--text-weak);
}
.rank-amount {
  font-size: 14px;
  font-weight: 600;
  margin-top: 2px;
}
.rank-amount.expense { color: var(--expense); }
.rank-amount.income { color: var(--income); }
.type-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.type-card {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  padding: 16px;
  text-align: center;
  box-shadow: var(--shadow-soft);
  position: relative;
  overflow: hidden;
  min-height: 96px;
}
.type-card-mini {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 32px;
  height: 32px;
  object-fit: cover;
  border-radius: 6px;
  pointer-events: none;
  z-index: 0;
  user-select: none;
}
.type-label {
  font-size: 12px;
  color: var(--text-weak);
  margin-bottom: 8px;
  position: relative;
  z-index: 2;
}
.type-num {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.1;
  position: relative;
  z-index: 2;
}
.expense-value { color: var(--expense); }
.income-value { color: var(--income); }
.type-amount {
  font-size: 13px;
  margin-top: 4px;
  font-weight: 500;
  position: relative;
  z-index: 2;
}
.empty-state {
  padding: 60px 20px 40px;
  text-align: center;
}
.empty-state-illust {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 240px;
  height: 150px;
  margin: 0 auto 16px;
}
.empty-state-title {
  font-size: 16px;
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
