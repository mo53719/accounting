<template>
  <div class="search-page">
    <header class="page-header">
      <button class="back-btn" @click="$router.back()" aria-label="返回" type="button">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <div class="page-title-wrap">
        <h1 class="page-title">搜索账单</h1>
      </div>
    </header>

    <div class="page-body">
      <!-- 搜索框 -->
      <div class="search-bar">
        <svg class="search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--text-weak)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="keyword"
          @keyup.enter="doSearch"
          placeholder="输入备注、分类、金额..."
          class="search-input"
        />
        <button v-if="keyword" @click="keyword = ''" class="search-clear" type="button">清空</button>
      </div>

      <!-- 筛选行 -->
      <div class="filter-row">
        <div class="seg-control tab-primary">
          <button
            v-for="t in types"
            :key="t.value"
            @click="type = t.value"
            class="seg-item"
            :class="{ active: type === t.value }"
            type="button"
          >{{ t.label }}</button>
        </div>
        <button @click="showDatePicker = !showDatePicker" class="date-btn" type="button">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span class="date-btn-label">{{ dateLabel || '日期' }}</span>
        </button>
      </div>

      <!-- 日期选择器 -->
      <div v-if="showDatePicker" class="date-picker-card">
        <div class="date-inputs">
          <input v-model="dateStart" type="date" class="date-input" />
          <input v-model="dateEnd" type="date" class="date-input" />
        </div>
        <div class="date-actions">
          <button @click="clearDate" class="btn-ghost date-action" type="button">清除</button>
          <button @click="applyDate" class="btn-primary date-action" type="button">应用</button>
        </div>
      </div>

      <!-- 结果区 -->
      <p class="results-count">共 {{ results.length }} 条结果</p>
      <div v-if="results.length === 0" class="empty-state">
        <div class="empty-state-illust">
          <IllustrationImage
            v-if="currentThemeSet !== 'standard'" :theme="currentThemeSet" slot="emptyBills"
            module-id="search-empty"
            css-class="empty-state-img"
          />
          <svg v-else viewBox="0 0 100 100" width="100" height="100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="22" y="18" rx="6" ry="6" width="56" height="70" fill="var(--card-bg)" stroke="var(--divider)" stroke-width="2"/>
            <line x1="32" y1="32" x2="68" y2="32" stroke="var(--primary-light)" stroke-width="2" stroke-linecap="round"/>
            <line x1="32" y1="44" x2="60" y2="44" stroke="var(--primary-light)" stroke-width="2" stroke-linecap="round"/>
            <line x1="32" y1="56" x2="64" y2="56" stroke="var(--primary-light)" stroke-width="2" stroke-linecap="round"/>
            <line x1="32" y1="68" x2="52" y2="68" stroke="var(--primary-light)" stroke-width="2" stroke-linecap="round"/>
            <circle cx="72" cy="70" r="8" fill="var(--primary-light)" stroke="var(--primary)" stroke-width="2"/>
            <line x1="69" y1="70" x2="75" y2="70" stroke="var(--primary)" stroke-width="2" stroke-linecap="round"/>
            <line x1="72" y1="67" x2="72" y2="73" stroke="var(--primary)" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <p class="empty-state-title">没有匹配的账单</p>
        <p class="empty-state-desc">尝试换个关键词或调整筛选条件</p>
      </div>
      <div v-else class="results-card">
        <div
          v-for="(t, idx) in results"
          :key="t.objectId"
          class="result-row"
          :class="{ 'has-divider': idx !== 0 }"
        >
          <div class="result-icon" :class="t.type">
            <img v-if="isImageIcon(categoryIconKey(t.category, (t.type as 'expense' | 'income')))" :src="categoryIconKey(t.category, (t.type as 'expense' | 'income'))" class="icon-img" />
            <svg
              v-else
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              v-html="svgPaths[categoryIconKey(t.category, (t.type as 'expense' | 'income'))] || svgPaths['star']"
            />
          </div>
          <div class="result-content">
            <p class="result-title">
              {{ t.category }}
              <span v-if="t.note" class="result-note">{{ t.note }}</span>
            </p>
            <p class="result-meta">{{ t.date }} · {{ t.paymentMethod || '现金' }} · {{ t.createdBy }}</p>
          </div>
          <p class="result-amount" :class="t.type">
            {{ t.type === 'income' ? '+' : '-' }}¥{{ t.amount.toFixed(2) }}
          </p>
          <!-- 行右下角 mini 贴纸 -->
          <IllustrationImage
            v-if="currentThemeSet !== 'standard'"
            :theme="currentThemeSet" slot="stickerCorner"
            :module-id="`search-result-${t.objectId}`"
            css-class="result-sticker"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTransaction } from '../composables/useTransaction'
import { useCategoryStore } from '../stores/category'
import { SVG_ICON_PATHS } from '../utils/format'
import IllustrationImage from '../components/IllustrationImage.vue'
import { currentThemeSet } from '../composables/useTheme'

const { transactions } = useTransaction()
const categoryStore = useCategoryStore()

const keyword = ref('')
const type = ref<'all' | 'expense' | 'income'>('all')
const dateStart = ref('')
const dateEnd = ref('')
const showDatePicker = ref(false)
const svgPaths = SVG_ICON_PATHS

const types = [
  { value: 'all', label: '全部' },
  { value: 'expense', label: '支出' },
  { value: 'income', label: '收入' },
] as const

const dateLabel = computed(() => {
  if (dateStart.value && dateEnd.value) return `${dateStart.value} ~ ${dateEnd.value}`
  if (dateStart.value) return dateStart.value
  if (dateEnd.value) return `至${dateEnd.value}`
  return ''
})

const results = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return transactions.value
    .filter(t => {
      if (type.value !== 'all' && t.type !== type.value) return false
      if (dateStart.value && t.date < dateStart.value) return false
      if (dateEnd.value && t.date > dateEnd.value) return false
      if (!kw) return true
      return (
        t.category.toLowerCase().includes(kw) ||
        (t.note || '').toLowerCase().includes(kw) ||
        t.amount.toString().includes(kw) ||
        (t.paymentMethod || '').toLowerCase().includes(kw)
      )
    })
    .sort((a, b) => b.date.localeCompare(a.date))
})

function categoryIconKey(name: string, t: 'expense' | 'income') {
  return categoryStore.findCategory(name, t)?.icon || 'star'
}

function isImageIcon(icon: string) {
  return icon && icon.startsWith('data:image')
}

function clearDate() {
  dateStart.value = ''
  dateEnd.value = ''
  showDatePicker.value = false
}

function applyDate() {
  showDatePicker.value = false
}

function doSearch() { /* 触发 computed */ }
</script>

<style scoped>
.search-page {
  background: var(--page-bg);
  min-height: 100vh;
  padding-bottom: 24px;
}

.page-header {
  padding: 50px 16px 12px;
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
.result-sticker {
  position: absolute;
  right: 12px;
  bottom: 4px;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  opacity: 0.7;
  pointer-events: none;
}
.empty-state-img {
  width: 240px;
  height: 150px;
  object-fit: cover;
  border-radius: var(--radius-md);
  margin-bottom: 16px;
  animation: float 3s ease-in-out infinite;
  user-select: none;
  -webkit-user-drag: none;
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
.page-header .back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  cursor: pointer;
  color: var(--text-h1);
  background: none;
  border: none;
  padding: 0;
  border-radius: 50%;
  transition: background 0.15s;
}
.page-header .back-btn:active {
  background: var(--primary-light);
}
.page-title-wrap {
  flex: 1;
  min-width: 0;
}
.page-title {
  font-size: 22px;
  font-weight: 600;
  color: var(--text-h1);
  line-height: 1.3;
  margin: 0;
}

.section {
  padding: 0 16px;
  margin-bottom: 12px;
}

.search-bar {
  background: var(--card-bg);
  border: 1px solid var(--divider);
  border-radius: var(--radius-lg);
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: var(--shadow-soft);
}
.search-icon {
  flex-shrink: 0;
  display: flex;
}
.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 14px;
  color: var(--text-h1);
  font-family: inherit;
  padding: 0;
}
.search-input::placeholder {
  color: var(--text-weak);
}
.search-clear {
  background: none;
  border: none;
  font-size: 12px;
  color: var(--text-weak);
  cursor: pointer;
  padding: 4px 6px;
  border-radius: var(--radius-sm);
  white-space: nowrap;
  transition: all 0.15s;
}
.search-clear:active {
  transform: scale(0.96);
  color: var(--primary);
  background: var(--primary-light);
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.filter-row .seg-control {
  flex: 1;
}
.date-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  color: var(--primary);
  border: 1px solid var(--divider);
  border-radius: var(--radius-sm);
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
  font-family: inherit;
}
.date-btn:active {
  transform: scale(0.96);
  background: var(--primary-light);
  border-color: var(--primary-light);
}
.date-btn-icon {
  display: inline-block;
}
.date-btn-label {
  line-height: 1;
}

.date-picker-card {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  padding: 14px;
  box-shadow: var(--shadow-soft);
}
.date-inputs {
  display: flex;
  gap: 10px;
}
.date-input {
  flex: 1;
  background: var(--page-bg);
  border: none;
  border-radius: var(--radius-md);
  padding: 10px 12px;
  font-size: 14px;
  color: var(--text-h1);
  outline: none;
  font-family: inherit;
}
.date-input:focus {
  background: var(--primary-light);
  box-shadow: 0 0 0 1px var(--primary);
}
.date-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}
.date-action {
  flex: 1;
  font-size: 13px;
}

.results-count {
  font-size: 12px;
  color: var(--text-weak);
  margin-bottom: 10px;
  padding: 0 2px;
}

.empty-state {
  text-align: center;
  padding: 36px 20px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.empty-state-illust {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  animation: float 3s ease-in-out infinite;
}
.empty-state-illust svg {
  width: 100px;
  height: 100px;
}
.empty-state-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-h1);
  margin-bottom: 6px;
}
.empty-state-desc {
  font-size: 13px;
  color: var(--text-weak);
  line-height: 1.6;
  max-width: 260px;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.results-card {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-soft);
  padding: 4px 0;
}

.result-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  transition: background 0.15s;
  position: relative;
}
.result-row:active {
  background: var(--page-bg);
}
.result-row.has-divider {
  border-top: 1px solid var(--divider);
}

.result-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}
.result-icon .icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius-sm);
}
.result-icon.expense {
  background: var(--expense-light);
  color: var(--expense);
}
.result-icon.income {
  background: var(--income-light);
  color: var(--income);
}

.result-content {
  flex: 1;
  min-width: 0;
}
.result-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-h1);
  line-height: 1.3;
}
.result-note {
  display: inline;
  margin-left: 8px;
  font-size: 12px;
  font-weight: 400;
  color: var(--text-weak);
}
.result-meta {
  font-size: 12px;
  color: var(--text-weak);
  margin-top: 3px;
  line-height: 1.4;
}

.result-amount {
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}
.result-amount.expense {
  color: var(--expense);
}
.result-amount.income {
  color: var(--income);
}
</style>
