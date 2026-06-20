<template>
  <div class="page">
    <div class="page-header">
      <span class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </span>
      <div class="flex-1">
        <h1 class="page-title">周期记账</h1>
        <p class="page-subtitle">按周 / 月 / 年自动循环记账</p>
      </div>
    </div>

    <div class="page-body">
      <!-- 统计卡 -->
      <div class="stats-card">
        <p class="caption">本年已执行</p>
        <div class="stats-numbers">
          <div class="stats-col">
            <p class="stats-num">{{ periodRecords.length }}<span class="stats-unit">笔</span></p>
            <p class="caption stats-caption">周期数</p>
          </div>
          <div class="stats-divider"></div>
          <div class="stats-col">
            <p class="stats-num-amount">¥{{ periodTotal.toFixed(0) }}</p>
            <p class="caption stats-caption">总金额</p>
          </div>
        </div>
        <!-- 统计卡右上角 -->
        <IllustrationImage
          v-if="currentThemeSet !== 'standard'"
          :theme="currentThemeSet" slot="stickerCorner"
          module-id="period-stats"
          css-class="card-sticker"
          :style-obj="{ position: 'absolute', top: '8px', right: '8px' }"
        />
      </div>

      <!-- 新建按钮 -->
      <button @click="openCreate" class="btn-primary create-btn">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        新建周期记账
      </button>

      <!-- 空态：海贼王一套，standard 主题用 MangaMascot -->
      <div v-if="periodList.length === 0" class="empty-state">
        <div class="empty-state-comic">
          <IllustrationImage
            v-if="currentThemeSet !== 'standard'" :theme="currentThemeSet" slot="emptySavings"
            module-id="period-empty"
            css-class="empty-state-img"
          />
          <MangaMascot v-else-if="currentThemeSet === 'standard'" size="large" />
        </div>
        <p class="empty-state-title">暂无周期记账</p>
        <p class="empty-state-desc">房租、订阅、会员等按周/月/年自动扣款，账目自动入账</p>
        <button @click="openCreate" class="btn-primary empty-state-cta">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          创建第一条周期记账
        </button>
      </div>

      <!-- 列表态 -->
      <div v-else class="period-list">
        <div
          v-for="p in periodList"
          :key="p.id"
          class="period-item"
        >
          <div class="period-item-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
          </div>
          <div class="period-item-body">
            <p class="period-item-title">{{ p.name }}</p>
            <p class="period-item-meta">{{ p.cycleLabel }} · ¥{{ p.amount }} · 下次 {{ p.nextDate }}</p>
          </div>
          <div
            @click="togglePeriod(p.id)"
            class="period-switch"
            :class="{ on: p.enabled }"
          >
            <div class="period-switch-knob"></div>
          </div>
          <!-- 行右侧 mini 贴纸（开关左侧） -->
          <IllustrationImage
            v-if="currentThemeSet !== 'standard'"
            :theme="currentThemeSet" slot="stickerCorner"
            :module-id="`period-item-${p.id}`"
            css-class="period-item-sticker"
          />
        </div>
      </div>
    </div>

    <!-- 创建弹窗 -->
    <div v-if="creating" class="modal-mask" @click.self="creating = false">
      <div class="modal-card">
        <!-- 弹窗右上角：海贼王 mini 贴纸 -->
        <IllustrationImage
          v-if="currentThemeSet !== 'standard'" :theme="currentThemeSet" slot="stickerCorner"
          module-id="period-modal"
          css-class="modal-sticker"
          :style-obj="{ top: '6px', right: '6px', width: '26px', height: '26px', borderRadius: '6px' }"
        />
        <div class="modal-header">
          <h3>新建周期记账</h3>
          <span class="modal-close" @click="creating = false">×</span>
        </div>
        <div class="modal-body space-y-3">
          <div>
            <label class="caption block mb-1">名称</label>
            <input v-model="form.name" placeholder="如：房租" class="input" />
          </div>
          <div>
            <label class="caption block mb-1">金额（元）</label>
            <input v-model.number="form.amount" type="number" placeholder="0.00" class="input" />
          </div>
          <div>
            <label class="caption block mb-1">周期</label>
            <div class="seg-control">
              <button
                v-for="c in cycles"
                :key="c.value"
                @click="form.cycle = c.value"
                class="seg-item"
                :class="{ active: form.cycle === c.value }"
              >{{ c.label }}</button>
            </div>
          </div>
          <div>
            <label class="caption block mb-1">分类</label>
            <input v-model="form.category" placeholder="如：居家" class="input" />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="creating = false" class="btn-ghost">取消</button>
          <button @click="savePeriod" class="btn-primary">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTransaction } from '../composables/useTransaction'
import { getLocal, setLocal } from '../utils/storage'
import dayjs from 'dayjs'
import MangaMascot from '../components/MangaMascot.vue'
import IllustrationImage from '../components/IllustrationImage.vue'
import { currentThemeSet } from '../composables/useTheme'

interface Period {
  id: string
  name: string
  amount: number
  cycle: 'weekly' | 'monthly' | 'yearly'
  cycleLabel: string
  category: string
  enabled: boolean
  nextDate: string
}

const { transactions } = useTransaction()
const periodList = ref<Period[]>(getLocal('periodList') || [])

const cycleMap: Record<Period['cycle'], string> = {
  weekly: '每周',
  monthly: '每月',
  yearly: '每年',
}

const cycles = [
  { value: 'weekly' as const, label: '每周' },
  { value: 'monthly' as const, label: '每月' },
  { value: 'yearly' as const, label: '每年' },
]

const periodRecords = computed(() =>
  transactions.value.filter(t => t.periodId)
)

const periodTotal = computed(() =>
  periodRecords.value.reduce((s, t) => s + t.amount, 0)
)

const creating = ref(false)
const form = ref({
  name: '',
  amount: 0,
  cycle: 'monthly' as Period['cycle'],
  category: '居家',
})

function openCreate() {
  form.value = { name: '', amount: 0, cycle: 'monthly', category: '居家' }
  creating.value = true
}

function savePeriod() {
  if (!form.value.name || form.value.amount <= 0) return
  const cycle = form.value.cycle
  const newPeriod: Period = {
    id: 'p_' + Date.now(),
    name: form.value.name,
    amount: form.value.amount,
    cycle,
    cycleLabel: cycleMap[cycle],
    category: form.value.category,
    enabled: true,
    nextDate: dayjs().add(1, cycle === 'weekly' ? 'week' : cycle === 'monthly' ? 'month' : 'year').format('YYYY-MM-DD'),
  }
  periodList.value.push(newPeriod)
  setLocal('periodList', periodList.value)
  creating.value = false
}

function togglePeriod(id: string) {
  const p = periodList.value.find(p => p.id === id)
  if (p) {
    p.enabled = !p.enabled
    setLocal('periodList', periodList.value)
  }
}
</script>

<style scoped>
.page {
  background: var(--page-bg);
  min-height: 100vh;
}

.page-body {
  padding: 0 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
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
.card-sticker {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 5px;
  opacity: 0.85;
  pointer-events: none;
}
.modal-sticker {
  position: absolute;
  z-index: 2;
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

.flex-1 { flex: 1; }
.space-y-3 > * + * { margin-top: 8px; }
.block { display: block; }
.mb-1 { margin-bottom: 4px; }

/* 统计卡 */
.stats-card {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-soft);
  padding: 14px 16px;
  position: relative;
}

.stats-numbers {
  display: flex;
  align-items: center;
  margin-top: 6px;
  gap: 12px;
}

.stats-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.stats-num {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-dark);
  line-height: 1.2;
}

.stats-unit {
  font-size: 13px;
  font-weight: 500;
  margin-left: 2px;
}

.stats-num-amount {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary);
  line-height: 1.2;
}

.stats-caption {
  margin-top: 2px;
}

.stats-divider {
  width: 1px;
  height: 28px;
  background: var(--divider);
  flex-shrink: 0;
}

/* 新建按钮 */
.create-btn {
  width: 100%;
}

/* 空态 */
.empty-state {
  padding: 24px 8px;
}

/* 列表 */
.period-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.period-item {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-soft);
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: transform 0.15s, box-shadow 0.15s;
  position: relative;
}
.period-item-sticker {
  position: absolute;
  right: 50px;
  bottom: 8px;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  opacity: 0.75;
  pointer-events: none;
}

.period-item:active {
  transform: scale(0.99);
  box-shadow: var(--shadow-hover);
}

.period-item-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-light);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.period-item-body {
  flex: 1;
  min-width: 0;
}

.period-item-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-dark);
}

.period-item-meta {
  font-size: 12px;
  color: var(--text-weak);
  margin-top: 2px;
}

/* 开关 */
.period-switch {
  width: 40px;
  height: 24px;
  border-radius: 12px;
  background: var(--divider);
  position: relative;
  transition: background 0.3s;
  cursor: pointer;
  flex-shrink: 0;
}
.period-switch.on { background: var(--primary); }
.period-switch-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--card-bg);
  transition: left 0.3s;
  box-shadow: var(--shadow-soft);
}
.period-switch.on .period-switch-knob { left: 18px; }
</style>
