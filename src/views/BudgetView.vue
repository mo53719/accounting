<template>
  <div class="budget-view">
    <div class="page-header">
      <span class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </span>
      <div class="flex-1">
        <h1 class="page-title">预算中心</h1>
        <p class="page-subtitle">按维度设置预算，实时追踪支出</p>
      </div>
    </div>

    <div class="budget-content">
      <!-- 当前账本 + 当月预算总额大卡片 -->
      <div class="budget-hero-card">
        <div class="budget-hero-label">当前账本 · 当月预算总额</div>
        <div class="budget-hero-amount">¥{{ totalBudget.toFixed(2) }}</div>
        <div class="budget-hero-meta">
          <span>已用 ¥{{ totalUsed.toFixed(2) }}</span>
          <span class="meta-dot"></span>
          <span>剩余 ¥{{ Math.max(0, totalBudget - totalUsed).toFixed(2) }}</span>
        </div>
        <div class="budget-hero-progress">
          <div
            class="budget-hero-progress-bar"
            :class="{ over: usagePercent >= 100 }"
            :style="{ width: usagePercent + '%' }"
          ></div>
        </div>
        <div class="budget-hero-percent">{{ usagePercent }}%</div>
      </div>

      <!-- 空态：海贼王一套，standard 显示 MangaMascot -->
      <div v-if="totalBudget === 0" class="empty-state">
        <div class="empty-state-comic">
          <IllustrationImage
            v-if="currentThemeSet !== 'standard'" :theme="currentThemeSet" slot="emptyBudget"
            css-class="empty-state-img"
          />
          <MangaMascot v-else-if="currentThemeSet === 'standard'" size="large" />
        </div>
        <p class="empty-state-title">暂无预算设置</p>
        <p class="empty-state-desc">设置分类预算，合理控制开支</p>
      </div>

      <!-- 预算项列表 -->
      <div v-else class="budget-list">
        <div
          v-for="item in budgetRanges"
          :key="item.key"
          class="budget-item-card"
        >
          <div class="budget-item-left">
            <div class="budget-item-label">{{ item.label }}预算</div>
            <div class="budget-item-sub">已用 ¥{{ budgets[item.key].used.toFixed(2) }} / ¥{{ budgets[item.key].limit.toFixed(2) }}</div>
            <div class="budget-item-progress">
              <div
                class="budget-item-progress-bar"
                :class="{ over: budgets[item.key].limit && (budgets[item.key].used / budgets[item.key].limit) >= 1 }"
                :style="{ width: percentOf(budgets[item.key]) + '%' }"
              ></div>
            </div>
          </div>
          <div class="budget-item-right">
            <button @click="openEdit(item.key, item.label)" class="btn-primary btn-sm">修改</button>
          </div>
        </div>
      </div>

      <!-- 添加预算按钮 -->
      <button @click="openEdit('custom', '自定义')" class="btn-primary budget-add-btn">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        添加预算
      </button>
    </div>

    <!-- 编辑弹窗 -->
    <div v-if="editing" class="modal-mask" @click.self="editing = null">
      <div class="modal-card">
        <div class="modal-header">
          <h3>设置{{ editing.label }}预算</h3>
          <span class="modal-close" @click="editing = null">×</span>
        </div>
        <div class="modal-body">
          <label class="caption block mb-2">预算金额（元）</label>
          <input v-model.number="editValue" type="number" min="0" class="input" />
        </div>
        <div class="modal-footer">
          <button @click="editing = null" class="btn-ghost">取消</button>
          <button @click="saveBudget" class="btn-primary">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import { useBookStore } from '../stores/book'
import { useTransaction } from '../composables/useTransaction'
import PetMascot from '../components/PetMascot.vue'
import MangaMascot from '../components/MangaMascot.vue'
import IllustrationImage from '../components/IllustrationImage.vue'
import { currentThemeSet } from '../composables/useTheme'

const bookStore = useBookStore()
const { transactions } = useTransaction()

type Range = 'day' | 'month' | 'year' | 'all' | 'custom'
const budgetRanges: { key: Range, label: string }[] = [
  { key: 'day', label: '日' },
  { key: 'month', label: '月' },
  { key: 'year', label: '年' },
  { key: 'all', label: '全部' },
]

const budgets = computed(() => {
  const map: Record<Range, { limit: number, used: number }> = {} as any
  for (const r of budgetRanges) {
    const limit = bookStore.getBudget(r.key)
    const used = transactions.value
      .filter(t => t.type === 'expense' && matchRange(t.date, r.key))
      .reduce((s, t) => s + t.amount, 0)
    map[r.key] = { limit, used }
  }
  return map
})

function matchRange(date: string, range: Range) {
  const d = dayjs(date)
  if (range === 'day') return d.isSame(dayjs(), 'day')
  if (range === 'month') return d.isSame(dayjs(), 'month')
  if (range === 'year') return d.isSame(dayjs(), 'year')
  return true
}

const totalBudget = computed(() => budgets.value.month.limit)
const totalUsed = computed(() => budgets.value.month.used)
const usagePercent = computed(() => totalBudget.value ? Math.min(100, Math.round((totalUsed.value / totalBudget.value) * 100)) : 0)

function percentOf(b: { limit: number, used: number }) {
  if (!b.limit) return 0
  return Math.min(100, Math.round((b.used / b.limit) * 100))
}

const editing = ref<{ key: Range, label: string } | null>(null)
const editValue = ref(0)

function openEdit(key: Range, label: string) {
  editing.value = { key, label }
  editValue.value = bookStore.getBudget(key)
}

function saveBudget() {
  if (editing.value && editValue.value > 0) {
    bookStore.setBudget(editing.value.key, editValue.value)
  }
  editing.value = null
}
</script>

<style scoped>
.budget-view {
  background: var(--page-bg);
  min-height: 100vh;
  padding-bottom: 100px;
}

.budget-content {
  padding: 0 16px;
}

/* 头部大额预算卡片 */
.budget-hero-card {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-soft);
  padding: 20px;
  margin-top: 8px;
  position: relative;
  overflow: hidden;
}

.budget-hero-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary) 0%, var(--primary-light) 100%);
}

.budget-hero-label {
  font-size: 12px;
  color: var(--text-weak);
  margin-bottom: 8px;
}

.budget-hero-amount {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-h1);
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.budget-hero-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-body);
}

.meta-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--divider);
}

.budget-hero-progress {
  margin-top: 16px;
  height: 4px;
  background: var(--divider);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.budget-hero-progress-bar {
  height: 100%;
  background: var(--primary);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.budget-hero-progress-bar.over {
  background: var(--expense);
}

.budget-hero-percent {
  position: absolute;
  right: 20px;
  top: 20px;
  font-size: 12px;
  font-weight: 500;
  color: var(--primary);
  background: var(--primary-light);
  padding: 4px 10px;
  border-radius: var(--radius-sm);
}

/* 预算项列表 */
.budget-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 20px;
}

.budget-item-card {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-soft);
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.budget-item-card:hover {
  transform: scale(0.98);
  box-shadow: var(--shadow-hover);
}

.budget-item-card:active {
  transform: scale(0.96);
}

.budget-item-left {
  flex: 1;
  min-width: 0;
}

.budget-item-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-h1);
}

.budget-item-sub {
  font-size: 12px;
  color: var(--text-weak);
  margin-top: 4px;
}

.budget-item-progress {
  height: 4px;
  background: var(--divider);
  border-radius: 2px;
  margin-top: 10px;
  overflow: hidden;
}

.budget-item-progress-bar {
  height: 100%;
  background: var(--primary);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.budget-item-progress-bar.over {
  background: var(--expense);
}

.budget-item-right {
  flex-shrink: 0;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.budget-add-btn {
  margin-top: 20px;
  width: 100%;
  padding: 14px;
  font-size: 14px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

/* 用户插画图片（替换 PetMascot / MangaMascot） */
.empty-state-img {
  width: 240px;
  height: 150px;
  object-fit: cover;
  border-radius: var(--radius-md);
  display: block;
  user-select: none;
  -webkit-user-drag: none;
}
</style>
