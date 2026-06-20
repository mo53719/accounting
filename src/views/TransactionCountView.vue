<template>
  <div class="page">
    <div class="page-header">
      <div class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </div>
      <h1 class="page-title">记账总数</h1>
      <div style="width:32px"></div>
    </div>

    <div class="content">
      <div class="balance-card-light expense-card">
        <!-- 右侧大插画：与首页支出/StatsView 支出卡同款（card-scene=expense，独立模块池 txcount-hero） -->
        <PaintedScene
          v-if="ipForPainted !== 'none'"
          :ip="ipForPainted"
          card-scene="expense"
          stats-unique
          page-id="txcount-hero"
        />
        <div class="card-content">
          <p class="card-label">累计记账笔数</p>
          <p class="balance-value expense-value">{{ totalCount }}</p>
        </div>
      </div>

      <div class="stat-row">
        <div class="mini-card">
          <IllustrationImage
            v-if="currentThemeSet !== 'standard'" :theme="currentThemeSet" slot="emptySavings"
            module-id="txcount-mini-1"
            css-class="mini-corner"
          />
          <div class="mini-num expense-value">{{ expenseCount }}</div>
          <div class="mini-caption">支出笔数</div>
        </div>
        <div class="mini-card">
          <IllustrationImage
            v-if="currentThemeSet !== 'standard'" :theme="currentThemeSet" slot="emptySavings"
            module-id="txcount-mini-2"
            css-class="mini-corner"
          />
          <div class="mini-num income-value">{{ incomeCount }}</div>
          <div class="mini-caption">收入笔数</div>
        </div>
        <div class="mini-card">
          <IllustrationImage
            v-if="currentThemeSet !== 'standard'" :theme="currentThemeSet" slot="emptySavings"
            module-id="txcount-mini-3"
            css-class="mini-corner"
          />
          <div class="mini-num">{{ activeDays }}</div>
          <div class="mini-caption">活跃天数</div>
        </div>
      </div>

      <div class="section-title">每日记录</div>

      <div v-if="dailyGroups.length === 0" class="empty-state">
        <!-- 已删除 PaintedScene 中央插画（不再遮挡） -->
        <h2 class="empty-state-title">还没有记账记录</h2>
        <p class="empty-state-desc">去首页添加第一笔账单吧</p>
      </div>

      <div v-for="group in dailyGroups" :key="group.date" class="day-group">
        <div class="day-header">
          <span class="day-date">{{ formatDate(group.date) }}</span>
          <span class="day-count">{{ group.count }} 笔</span>
        </div>
        <div v-for="t in group.items" :key="t.objectId" class="tx-card">
          <IllustrationImage
            v-if="currentThemeSet !== 'standard' && txStickers[t.objectId]"
            :theme="currentThemeSet" slot="emptySavings"
            :custom-url="txStickers[t.objectId]"
            css-class="tx-corner"
          />
          <div class="tx-left">
            <div class="tx-icon" :class="t.type" :style="getIconStyle(t)">
              <img v-if="isImageIcon(t)" :src="getCategoryIcon(t)" class="icon-img" />
              <Icon v-else-if="getCategoryIcon(t)" :name="getCategoryIcon(t)" :size="18" :stroke="getIconColor(t)" />
              <Icon v-else :name="'star'" :size="18" :stroke="getIconColor(t)" />
            </div>
            <div class="tx-meta">
              <div class="tx-cat">{{ t.category }}</div>
              <div class="tx-note">{{ t.note || '无备注' }}</div>
            </div>
          </div>
          <div class="tx-right">
            <span class="tx-amount" :class="t.type">{{ formatAmount(t.amount, t.type) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTransaction } from '../composables/useTransaction'
import { useCategoryStore } from '../stores/category'
import { SVG_ICON_PATHS } from '../utils/format'
import { currentThemeSet } from '../composables/useTheme'
import IllustrationImage from '../components/IllustrationImage.vue'
import PaintedScene from '../components/PaintedScene.vue'
import Icon from '../components/icons/Icon.vue'
import { usePageIllustrationPool } from '../composables/useIllustrationPicker'
import dayjs from 'dayjs'

const { transactions } = useTransaction()
const categoryStore = useCategoryStore()

const totalCount = computed(() => transactions.value.length)
const expenseCount = computed(() => transactions.value.filter(t => t.type === 'expense').length)
const incomeCount = computed(() => transactions.value.filter(t => t.type === 'income').length)
const activeDays = computed(() => new Set(transactions.value.map(t => t.date)).size)

const dailyGroups = computed(() => {
  const map = new Map<string, any[]>()
  transactions.value.forEach(t => {
    if (!map.has(t.date)) map.set(t.date, [])
    map.get(t.date)!.push(t)
  })
  return Array.from(map.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([date, items]) => ({ date, items, count: items.length }))
})

/* 每日账单条目 - 随机分配小角色（走 txcount-tx-item 独立池） */
const txStickerPool = usePageIllustrationPool('txcount-tx-item')
const txStickers = computed<Record<string, string>>(() => {
  const out: Record<string, string> = {}
  if (txStickerPool.isStandard || !txStickerPool.isEnabled) {
    dailyGroups.value.forEach(g => g.items.forEach(t => { out[t.objectId] = '' }))
    return out
  }
  dailyGroups.value.forEach(g => {
    g.items.forEach(t => {
      out[t.objectId] = txStickerPool.pickOne()
    })
  })
  return out
})

/* PaintedScene 主题跟随 */
const ipForPainted = computed<'onepiece' | 'family' | 'none'>(() => {
  if (currentThemeSet.value === 'onepiece') return 'onepiece'
  if (currentThemeSet.value === 'family') return 'family'
  return 'none'
})

function formatDate(date: string) {
  const d = dayjs(date)
  const wd = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.day()]
  return `${d.format('YYYY年MM月DD日')} ${wd}`
}

function formatAmount(amount: number, type: string) {
  return `${type === 'expense' ? '-' : '+'}¥${amount.toFixed(2)}`
}

/* 分类图标查找（走全局 useCategoryStore + SVG_ICON_PATHS，60+ 预设全支持） */
function findCategory(t: any) {
  return categoryStore.findCategory(t.category, t.type as 'expense' | 'income')
}
function getCategoryIcon(t: any) {
  const cat = findCategory(t)
  const icon = cat?.icon || 'star'
  if (icon.startsWith('data:image')) return icon
  return SVG_ICON_PATHS[icon] ? icon : 'star'
}
function isImageIcon(t: any) {
  const cat = findCategory(t)
  return !!(cat?.icon && cat.icon.startsWith('data:image'))
}
function getIconColor(t: any) {
  return findCategory(t)?.color || 'currentColor'
}
function getIconStyle(t: any) {
  const cat = findCategory(t)
  if (cat?.bgColor && cat?.color) {
    return { background: cat.bgColor, color: cat.color }
  }
  return {}
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
/* === 顶部大卡：与首页/StatsView 的 balance-card-light expense-card 同款 === */
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
.card-content {
  position: relative;
  z-index: 9; /* 文字金额置顶 */
  text-align: left;
  padding-left: 16px;
  padding-right: 16px;
  max-width: 100%;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.25) 70%, rgba(255, 255, 255, 0) 100%);
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
  font-size: 26px;
  font-weight: 800;
  line-height: 1.2;
}
.expense-value {
  color: #C8281C;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.6);
}
.income-value {
  color: #1E8A5A;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.6);
}
.stat-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 20px;
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
  opacity: 0.7;
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
.mini-num.expense-value { color: var(--expense); }
.mini-num.income-value { color: var(--income); }
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
.day-group {
  margin-bottom: 12px;
}
.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 6px 8px;
}
.day-date {
  font-size: 13px;
  color: var(--text-h1);
  font-weight: 500;
}
.day-count {
  font-size: 11px;
  color: var(--text-weak);
}
.tx-card {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--shadow-soft);
  position: relative;
  overflow: hidden;
}
.tx-corner {
  position: absolute;
  top: 3px;
  right: 3px;
  width: 18px;
  height: 18px;
  object-fit: cover;
  border-radius: 3px;
  opacity: 0.75;
  pointer-events: none;
  z-index: 0;
}
.tx-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
}
.tx-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  background: var(--primary-light);
  flex-shrink: 0;
}
.tx-icon.expense { color: var(--expense); background: var(--expense-light); }
.tx-icon.income { color: var(--income); background: var(--income-light); }
.tx-icon .icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.tx-meta { flex: 1; min-width: 0; }
.tx-cat {
  font-size: 14px;
  color: var(--text-h1);
  font-weight: 500;
}
.tx-note {
  font-size: 11px;
  color: var(--text-weak);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tx-amount {
  font-size: 15px;
  font-weight: 600;
  position: relative;
  z-index: 1;
}
.tx-amount.expense { color: var(--expense); }
.tx-amount.income { color: var(--income); }
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
