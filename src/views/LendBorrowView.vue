<template>
  <div class="page">
    <!-- 顶部淡渐变头部 -->
    <div class="header">
      <div class="header-row">
        <span class="back-btn" @click="$router.back()">
          <Icon name="arrowLeft" :size="20" />
        </span>
        <span class="header-title">人情往来</span>
        <button class="header-add-btn" @click="openCreate(null)" aria-label="新增人情记录">
          <Icon name="add" :size="18" />
        </button>
      </div>
      <div class="month-switch">
        <button class="month-arrow" @click="prevMonth" aria-label="上个月">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span class="month-label">{{ monthLabel }}</span>
        <button class="month-arrow" @click="nextMonth" aria-label="下个月">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>

    <div class="body">
      <!-- 余额展示区 -->
      <div class="balance-grid">
        <div class="balance-card">
          <div class="balance-label">我借出 / 支出</div>
          <div class="balance-value income">¥{{ outTotal.toFixed(0) }}</div>
        </div>
        <div class="balance-card">
          <div class="balance-label">我借入 / 收入</div>
          <div class="balance-value expense">¥{{ inTotal.toFixed(0) }}</div>
        </div>
      </div>

      <!-- 筛选 -->
      <div class="seg-wrap">
        <div class="seg-control seg-scroll">
          <div class="seg-item" :class="{ active: filter === 'all' }" @click="filter = 'all'">全部</div>
          <div class="seg-item" :class="{ active: filter === 'lend' }" @click="filter = 'lend'">借出</div>
          <div class="seg-item" :class="{ active: filter === 'borrow' }" @click="filter = 'borrow'">借入</div>
          <div class="seg-item" :class="{ active: filter === 'redpacket-out' }" @click="filter = 'redpacket-out'">发红包</div>
          <div class="seg-item" :class="{ active: filter === 'redpacket-in' }" @click="filter = 'redpacket-in'">收红包</div>
          <div class="seg-item" :class="{ active: filter === 'gift-out' }" @click="filter = 'gift-out'">送礼</div>
          <div class="seg-item" :class="{ active: filter === 'gift-in' }" @click="filter = 'gift-in'">收礼</div>
          <div class="seg-item" :class="{ active: filter === 'settled' }" @click="filter = 'settled'">已结清</div>
        </div>
      </div>

      <!-- 空态 -->
      <div v-if="filteredList.length === 0" class="empty-state">
        <div class="empty-state-comic">
          <IllustrationImage
            v-if="currentThemeSet !== 'standard'" :theme="currentThemeSet" slot="emptyLend"
            module-id="lend-empty"
            css-class="empty-state-img"
          />
          <MangaMascot v-else-if="currentThemeSet === 'standard'" size="large" />
        </div>
        <p class="empty-state-title">暂无人情往来记录</p>
        <p class="empty-state-desc">借钱、发红包、礼金、代付，一处统一管理</p>
        <button class="btn-primary empty-state-cta" @click="openCreate(null)">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          新增第一条记录
        </button>
      </div>

      <!-- 列表（合并手动 + 同步） -->
      <div v-else class="list">
        <div v-for="r in filteredList" :key="r.id" class="tx-card">
          <!-- 类型图标 -->
          <div class="tx-icon" :class="getCardTypeClass(r)">
            <!-- 借钱 -->
            <svg v-if="r.category === 'borrow'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path :d="r.direction === 'out' ? 'M7 11l-4 4 4 4M17 5l4 4-4 4M3 15h18M21 9H3' : 'M17 11l4 4-4 4M7 5l-4 4 4 4M21 9H3M3 15h18'" />
            </svg>
            <!-- 红包 -->
            <svg v-else-if="r.category === 'redpacket'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="8" width="18" height="13" rx="2" />
              <path d="M3 12h18M12 8v13" />
              <circle cx="8" cy="14" r="1" fill="currentColor" />
              <circle cx="16" cy="14" r="1" fill="currentColor" />
            </svg>
            <!-- 礼金 -->
            <svg v-else-if="r.category === 'gift'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 12 20 22 4 22 4 12" />
              <rect x="2" y="7" width="20" height="5" />
              <line x1="12" y1="22" x2="12" y2="7" />
              <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
            </svg>
            <!-- 代付 -->
            <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
          <div class="tx-info">
            <div class="tx-info-top">
              <p class="tx-counterparty">{{ r.counterparty || '匿名' }}</p>
              <span class="tx-type-chip" :class="getCardTypeClass(r)">
                {{ getTypeLabel(r.category, r.direction) }}
              </span>
              <span v-if="r.relationship" class="tx-relationship">· {{ r.relationship }}</span>
            </div>
            <p class="tx-meta">
              {{ r.date }}
              <span class="tx-meta-dot">·</span>
              {{ r.createdBy || '我' }}
              <span v-if="r.source === 'sync'" class="tx-meta-dot">·</span>
              <span v-if="r.source === 'sync'" class="tx-sync-tag">记账同步</span>
            </p>
            <p v-if="r.note" class="tx-note">{{ r.note }}</p>
          </div>
          <div class="tx-right">
            <span class="tx-amount" :class="r.direction">
              {{ r.direction === 'out' ? '-' : '+' }}¥{{ r.amount.toFixed(0) }}
            </span>
            <span class="badge" :class="r.settled ? 'income' : 'expense'">
              {{ r.settled ? '已结清' : (r.category === 'borrow' ? '未结清' : '已完成') }}
            </span>
            <div v-if="r.source === 'manual'" class="tx-actions">
              <button
                v-if="r.category === 'borrow'"
                :class="r.settled ? 'tx-settle' : 'tx-settle'"
                @click="onSettle(r)"
              >{{ r.settled ? '撤销结清' : '标记已还' }}</button>
              <button class="tx-edit" @click="openCreate(r)">编辑</button>
              <button class="tx-delete" @click="onDelete(r)">删除</button>
            </div>
            <div v-else class="tx-actions">
              <button
                v-if="r.category === 'borrow'"
                class="tx-settle"
                @click="onSettleSync(r)"
              >{{ r.settled ? '撤销结清' : '标记已还' }}</button>
              <span class="tx-sync-hint">原记账中修改</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建 / 编辑 弹窗 -->
    <div v-if="creating" class="modal-mask" @click.self="closeCreate">
      <div class="modal-card">
        <div class="modal-header">
          <h3>{{ editingId ? '编辑人情记录' : '新增人情记录' }}</h3>
          <span class="modal-close" @click="closeCreate">×</span>
        </div>
        <div class="modal-body">
          <!-- 对象类型 -->
          <div class="field-row field-row-stack">
            <span class="field-label">对象</span>
            <div class="seg-control seg-4">
              <div
                v-for="opt in categoryOptions"
                :key="opt.value"
                class="seg-item"
                :class="{ active: form.category === opt.value }"
                @click="onCategoryChange(opt.value)"
              >{{ opt.label }}</div>
            </div>
          </div>
          <!-- 方向 -->
          <div class="field-row field-row-stack">
            <span class="field-label">方向</span>
            <div class="seg-control seg-2">
              <div
                class="seg-item"
                :class="{ active: form.direction === 'out' }"
                @click="form.direction = 'out'"
              >{{ directionLabels[form.category].out }}</div>
              <div
                class="seg-item"
                :class="{ active: form.direction === 'in' }"
                @click="form.direction = 'in'"
              >{{ directionLabels[form.category].in }}</div>
            </div>
          </div>
          <!-- 对方 -->
          <div class="field-row">
            <span class="field-label">对方</span>
            <input
              v-model="form.counterparty"
              class="field-input"
              placeholder="如：张三 / 李四"
              maxlength="30"
            />
          </div>
          <!-- 关系 -->
          <div class="field-row">
            <span class="field-label">关系</span>
            <div class="rel-chips">
              <span
                v-for="opt in relationshipOptions"
                :key="opt"
                class="rel-chip"
                :class="{ active: form.relationship === opt }"
                @click="form.relationship = form.relationship === opt ? '' : opt"
              >{{ opt }}</span>
            </div>
          </div>
          <!-- 金额 -->
          <div class="field-row">
            <span class="field-label">金额</span>
            <input
              v-model.number="form.amount"
              type="number"
              step="0.01"
              class="field-input"
              placeholder="0.00"
            />
            <span class="field-suffix">元</span>
          </div>
          <!-- 日期 -->
          <div class="field-row">
            <span class="field-label">日期</span>
            <input v-model="form.date" type="date" class="field-input" />
          </div>
          <!-- 备注 -->
          <div class="field-row">
            <span class="field-label">备注</span>
            <input
              v-model="form.note"
              class="field-input"
              placeholder="选填"
              maxlength="60"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-ghost" @click="closeCreate">取消</button>
          <button class="btn-primary" :disabled="!canSave" @click="onSave">
            {{ editingId ? '保存' : '创建' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 轻提示 -->
    <transition name="toast-fade">
      <div v-if="toastMsg" class="toast">
        <Icon name="check" :size="14" />
        <span>{{ toastMsg }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import dayjs from 'dayjs'
import PetMascot from '../components/PetMascot.vue'
import MangaMascot from '../components/MangaMascot.vue'
import IllustrationImage from '../components/IllustrationImage.vue'
import Icon from '../components/icons/Icon.vue'
import { currentThemeSet } from '../composables/useTheme'
import { useBookStore } from '../stores/book'
import { useTransactionStore } from '../stores/transaction'
import {
  useLendBorrowStore,
  type LendBorrowRecord,
  type LendBorrowCategory,
  type LendDirection,
  getTypeLabel,
} from '../stores/lendBorrow'

const lendStore = useLendBorrowStore()
const txStore = useTransactionStore()
const bookStore = useBookStore()

/* ============= 选项常量 ============= */
const categoryOptions: { value: LendBorrowCategory; label: string }[] = [
  { value: 'borrow', label: '借钱' },
  { value: 'redpacket', label: '红包' },
  { value: 'gift', label: '礼金' },
  { value: 'advance', label: '代付' },
]

const relationshipOptions = ['朋友', '同事', '家人', '亲戚', '其他']

const directionLabels: Record<LendBorrowCategory, { out: string; in: string }> = {
  borrow: { out: '借出', in: '借入' },
  redpacket: { out: '发红包', in: '收红包' },
  gift: { out: '送礼', in: '收礼' },
  advance: { out: '代付', in: '代收' },
}

function getCardTypeClass(r: { category: LendBorrowCategory; direction: LendDirection }) {
  if (r.category === 'borrow') {
    return r.direction === 'out' ? 'lend' : 'borrow'
  }
  if (r.category === 'redpacket') {
    return r.direction === 'out' ? 'lend' : 'borrow'
  }
  if (r.category === 'gift') {
    return r.direction === 'out' ? 'lend' : 'borrow'
  }
  return r.direction === 'out' ? 'lend' : 'borrow'
}

/* ============= 月份筛选 ============= */
const currentMonth = ref(new Date())
const filter = ref<'all' | 'lend' | 'borrow' | 'redpacket-out' | 'redpacket-in' | 'gift-out' | 'gift-in' | 'settled'>('all')

const monthLabel = computed(() => {
  const y = currentMonth.value.getFullYear()
  const m = currentMonth.value.getMonth() + 1
  return `${y}年${m}月`
})

function prevMonth() {
  const d = new Date(currentMonth.value)
  d.setMonth(d.getMonth() - 1)
  currentMonth.value = d
}
function nextMonth() {
  const d = new Date(currentMonth.value)
  d.setMonth(d.getMonth() + 1)
  currentMonth.value = d
}

/* ============= 合并手动 + 同步记录 ============= */
interface DisplayRecord {
  id: string
  category: LendBorrowCategory
  direction: LendDirection
  counterparty: string
  relationship: string
  amount: number
  date: string
  note: string
  settled: boolean
  source: 'manual' | 'sync'
  sourceTransactionId?: string
  createdBy: string
}

/**
 * 将同步的 transaction 转换为 DisplayRecord
 *  - 从 socialType 字段获取 category / direction / counterparty / relationship / settled
 *  - 当主记账中的 transaction 被删除，sync 记录自动消失
 */
function buildSyncRecord(tx: import('../stores/transaction').Transaction): DisplayRecord | null {
  if (!tx.socialType) return null
  return {
    id: `sync_${tx.objectId}`,
    category: tx.socialType.category,
    direction: tx.socialType.direction,
    counterparty: tx.socialType.counterparty || '匿名',
    relationship: tx.socialType.relationship || '',
    amount: tx.amount,
    date: tx.date,
    note: tx.note,
    settled: tx.socialType.settled,
    source: 'sync',
    sourceTransactionId: tx.objectId,
    createdBy: tx.createdBy,
  }
}

/* 当月所有合并记录 */
const monthList = computed<DisplayRecord[]>(() => {
  const prefix = dayjs(currentMonth.value).format('YYYY-MM')
  // 手动记录
  const manual = lendStore.records
    .filter(r => r.date.startsWith(prefix))
    .map<DisplayRecord>(r => ({
      id: r.id,
      category: r.category,
      direction: r.direction,
      counterparty: r.counterparty,
      relationship: r.relationship,
      amount: r.amount,
      date: r.date,
      note: r.note,
      settled: r.settled,
      source: 'manual',
      createdBy: r.createdBy,
    }))
  // 同步记录
  const sync = txStore.socialTransactions
    .filter(t => t.date.startsWith(prefix))
    .map(t => buildSyncRecord(t))
    .filter((r): r is DisplayRecord => !!r)
  return [...manual, ...sync].sort((a, b) => (a.date < b.date ? 1 : -1))
})

const filteredList = computed(() => {
  const list = monthList.value
  if (filter.value === 'all') return list
  if (filter.value === 'settled') return list.filter(r => r.settled)
  if (filter.value === 'lend') return list.filter(r => r.category === 'borrow' && r.direction === 'out')
  if (filter.value === 'borrow') return list.filter(r => r.category === 'borrow' && r.direction === 'in')
  if (filter.value === 'redpacket-out') return list.filter(r => r.category === 'redpacket' && r.direction === 'out')
  if (filter.value === 'redpacket-in') return list.filter(r => r.category === 'redpacket' && r.direction === 'in')
  if (filter.value === 'gift-out') return list.filter(r => r.category === 'gift' && r.direction === 'out')
  if (filter.value === 'gift-in') return list.filter(r => r.category === 'gift' && r.direction === 'in')
  return list
})

/* 余额：所有当月 out / in 总额（含同步） */
const outTotal = computed(() => monthList.value.filter(r => r.direction === 'out').reduce((s, r) => s + r.amount, 0))
const inTotal = computed(() => monthList.value.filter(r => r.direction === 'in').reduce((s, r) => s + r.amount, 0))

/* ============= 弹窗 & 表单 ============= */
const creating = ref(false)
const editingId = ref<string | null>(null)
const form = reactive({
  category: 'borrow' as LendBorrowCategory,
  direction: 'out' as LendDirection,
  counterparty: '',
  relationship: '',
  amount: 0 as number,
  date: dayjs().format('YYYY-MM-DD'),
  note: '',
})

const canSave = computed(() => {
  return form.counterparty.trim().length > 0 && form.amount > 0
})

function onCategoryChange(c: LendBorrowCategory) {
  form.category = c
  // 切换 category 时，方向标签也会跟随更新，无需修改 direction 字段
}

function openCreate(record: DisplayRecord | null) {
  if (record) {
    // 仅手动记录可编辑
    if (record.source !== 'manual') {
      showToast('同步记录请在记账中修改')
      return
    }
    editingId.value = record.id
    form.category = record.category
    form.direction = record.direction
    form.counterparty = record.counterparty
    form.relationship = record.relationship
    form.amount = record.amount
    form.date = record.date
    form.note = record.note
  } else {
    editingId.value = null
    form.category = 'borrow'
    form.direction = 'out'
    form.counterparty = ''
    form.relationship = ''
    form.amount = 0
    form.date = dayjs().format('YYYY-MM-DD')
    form.note = ''
  }
  creating.value = true
}

function closeCreate() {
  creating.value = false
  editingId.value = null
}

function onSave() {
  if (!canSave.value) return
  const payload = {
    category: form.category,
    direction: form.direction,
    counterparty: form.counterparty.trim(),
    relationship: form.relationship,
    amount: Number(form.amount),
    date: form.date,
    note: form.note.trim(),
    createdBy: bookStore.deviceName || '我',
  }
  if (editingId.value) {
    lendStore.updateRecord(editingId.value, payload)
    showToast('已保存')
  } else {
    lendStore.addRecord(payload)
    showToast('已创建')
  }
  closeCreate()
}

function onSettle(record: DisplayRecord) {
  lendStore.markSettled(record.id, !record.settled)
  showToast(record.settled ? '已撤销结清' : '已标记结清')
}

/** 同步来源的结清：直接修改 transaction 的 socialType.settled */
function onSettleSync(record: DisplayRecord) {
  if (!record.sourceTransactionId) return
  const tx = txStore.transactions.find(t => t.objectId === record.sourceTransactionId)
  if (!tx || !tx.socialType) return
  txStore.updateTransaction(tx.objectId, {
    socialType: { ...tx.socialType, settled: !tx.socialType.settled },
  })
  showToast(record.settled ? '已撤销结清' : '已标记结清')
}

function onDelete(record: DisplayRecord) {
  if (record.source !== 'manual') {
    showToast('同步记录请在记账中删除')
    return
  }
  if (!confirm(`删除「${record.counterparty}」的记录？`)) return
  lendStore.removeRecord(record.id)
  showToast('已删除')
}

/* ============= 轻提示 ============= */
const toastMsg = ref('')
let toastTimer: number | null = null
function showToast(msg: string) {
  toastMsg.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => { toastMsg.value = '' }, 1800)
}
</script>

<style scoped>
.page {
  background: var(--page-bg);
  min-height: 100vh;
  padding-bottom: 24px;
}

/* 顶部淡渐变小头部 */
.header {
  padding: 48px 16px 20px;
  background: linear-gradient(180deg, var(--primary-light) 0%, var(--page-bg) 100%);
}
.header-row {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 10px;
}
.header-title {
  font-size: 19px;
  font-weight: 600;
  color: var(--text-h1);
  letter-spacing: 0.02em;
}
.back-btn {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
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
.back-btn:active { transform: translateY(-50%) scale(0.92); }
.header-add-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  color: var(--primary);
  background: var(--card-bg);
  border: none;
  cursor: pointer;
  box-shadow: var(--shadow-soft);
  transition: transform 0.15s, background 0.15s;
}
.header-add-btn:hover { background: var(--primary-light); }
.header-add-btn:active { transform: translateY(-50%) scale(0.92); }

.month-switch {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
}
.month-arrow {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--card-bg);
  color: var(--primary);
  border: none;
  cursor: pointer;
  box-shadow: var(--shadow-soft);
  transition: transform 0.15s;
}
.month-arrow:active { transform: scale(0.94); }
.month-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-h2);
  min-width: 80px;
  text-align: center;
}

/* 主体内容 */
.body {
  padding: 0 16px;
}

/* 余额展示区 */
.balance-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}
.balance-card {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  padding: 16px;
  box-shadow: var(--shadow-soft);
}
.balance-label {
  font-size: 12px;
  color: var(--text-weak);
  margin-bottom: 6px;
}
.balance-value {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
}
.balance-value.income { color: var(--income); }
.balance-value.expense { color: var(--expense); }

/* 筛选 */
.seg-wrap {
  margin-bottom: 12px;
}
.seg-control {
  display: flex;
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  padding: 3px;
  box-shadow: var(--shadow-soft);
}
.seg-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  flex-wrap: nowrap;
}
.seg-scroll .seg-item {
  flex: 0 0 auto;
  white-space: nowrap;
  padding: 7px 12px;
}
.seg-item {
  flex: 1;
  text-align: center;
  padding: 7px 0;
  font-size: 12px;
  color: var(--text-body);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s;
}
.seg-item.active {
  background: var(--primary-light);
  color: var(--primary);
  font-weight: 500;
}

/* 列表卡片 */
.list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.tx-card {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-soft);
  padding: 12px 14px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  transition: transform 0.15s, box-shadow 0.15s;
}
.tx-card:active { transform: scale(0.99); }

.tx-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.tx-icon.lend { background: var(--expense-light); color: var(--expense); }
.tx-icon.borrow { background: var(--income-light); color: var(--income); }

.tx-info {
  flex: 1;
  min-width: 0;
}
.tx-info-top {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}
.tx-counterparty {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-h1);
  line-height: 1.3;
}
.tx-type-chip {
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  border-radius: var(--radius-sm);
  font-size: 10px;
  font-weight: 500;
}
.tx-type-chip.lend { background: var(--expense-light); color: var(--expense); }
.tx-type-chip.borrow { background: var(--income-light); color: var(--income); }
.tx-relationship {
  font-size: 11px;
  color: var(--text-weak);
}
.tx-meta {
  font-size: 11px;
  color: var(--text-weak);
  margin-top: 3px;
}
.tx-meta-dot {
  margin: 0 4px;
  color: var(--text-weak);
  opacity: 0.6;
}
.tx-sync-tag {
  color: var(--primary);
  font-weight: 500;
}
.tx-note {
  font-size: 12px;
  color: var(--text-body);
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px dashed var(--divider);
  line-height: 1.4;
}

.tx-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}
.tx-amount {
  font-size: 15px;
  font-weight: 600;
}
.tx-amount.out { color: var(--expense); }
.tx-amount.in { color: var(--income); }

.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 500;
}
.badge.income { background: var(--income-light); color: var(--income); }
.badge.expense { background: var(--expense-light); color: var(--expense); }

.tx-actions {
  display: flex;
  gap: 4px;
  margin-top: 4px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.tx-settle,
.tx-edit,
.tx-delete {
  background: var(--primary-light);
  color: var(--primary);
  border-radius: var(--radius-sm);
  font-weight: 500;
  font-size: 11px;
  padding: 4px 8px;
  border: none;
  cursor: pointer;
  transition: transform 0.15s, background 0.15s;
}
.tx-edit { background: var(--page-bg); color: var(--text-body); }
.tx-delete { background: var(--expense-light); color: var(--expense); }
.tx-settle:active,
.tx-edit:active,
.tx-delete:active { transform: scale(0.94); }
.tx-sync-hint {
  font-size: 10px;
  color: var(--text-weak);
  align-self: center;
}

/* 空态 */
.empty-state {
  text-align: center;
}
.empty-state-mascot,
.empty-state-comic {
  width: 240px;
  height: 150px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.empty-state-mascot .pet-mascot,
.empty-state-comic .pet-mascot {
  width: 240px;
  height: 150px;
  margin: 0;
}
.empty-state-mascot .pet-mascot .pet-svg,
.empty-state-comic .pet-mascot .pet-svg {
  width: 240px;
  height: 150px;
  animation: none;
}
.empty-state-img {
  width: 240px;
  height: 150px;
  object-fit: cover;
  display: block;
  margin: 0 auto;
  user-select: none;
  -webkit-user-drag: none;
}
.empty-state-title {
  font-size: 17px;
  font-weight: 500;
  color: var(--text-h1);
  margin-bottom: 6px;
}
.empty-state-desc {
  font-size: 13px;
  color: var(--text-weak);
  line-height: 1.6;
  margin-bottom: 20px;
  max-width: 280px;
}
.empty-state-cta {
  margin-top: 4px;
  padding: 10px 22px;
}

/* 弹窗 */
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}
.modal-card {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.2);
  animation: modal-pop 0.2s ease;
}
@keyframes modal-pop {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid var(--divider);
  position: sticky;
  top: 0;
  background: var(--card-bg);
  z-index: 1;
}
.modal-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-h1);
}
.modal-close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: var(--text-weak);
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.15s;
}
.modal-close:hover { background: var(--page-bg); }
.modal-body {
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.modal-footer {
  display: flex;
  gap: 10px;
  padding: 12px 18px 18px;
  justify-content: flex-end;
  position: sticky;
  bottom: 0;
  background: var(--card-bg);
}
.modal-footer .btn-ghost,
.modal-footer .btn-primary {
  padding: 9px 18px;
  font-size: 13px;
  font-weight: 500;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: transform 0.15s, background 0.15s;
}
.modal-footer .btn-ghost { background: var(--page-bg); color: var(--text-body); }
.modal-footer .btn-primary { background: var(--primary); color: #fff; }
.modal-footer .btn-primary:disabled { background: var(--divider); color: var(--text-weak); cursor: not-allowed; }
.modal-footer .btn-ghost:active,
.modal-footer .btn-primary:not(:disabled):active { transform: scale(0.96); }

/* 表单行 */
.field-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.field-row-stack {
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
}
.field-label {
  font-size: 13px;
  color: var(--text-body);
  width: 50px;
  flex-shrink: 0;
}
.field-row-stack .field-label {
  width: auto;
}
.field-input {
  flex: 1;
  background: var(--page-bg);
  border: 1px solid var(--divider);
  border-radius: var(--radius-md);
  padding: 8px 10px;
  font-size: 14px;
  color: var(--text-h1);
  outline: none;
  min-width: 0;
}
.field-input:focus { border-color: var(--primary); }
.field-suffix {
  font-size: 12px;
  color: var(--text-weak);
  flex-shrink: 0;
}
.seg-2 {
  display: flex;
}
.seg-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
}
.seg-4 .seg-item {
  font-size: 12px;
  padding: 7px 4px;
}

/* 关系 chips */
.rel-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
}
.rel-chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  font-size: 12px;
  background: var(--page-bg);
  color: var(--text-body);
  border-radius: var(--radius-sm);
  border: 1px solid var(--divider);
  cursor: pointer;
  transition: all 0.15s;
}
.rel-chip.active {
  background: var(--primary-light);
  color: var(--primary);
  border-color: var(--primary);
}

/* 轻提示 */
.toast {
  position: fixed;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  font-size: 13px;
  font-weight: 500;
  z-index: 9999;
  pointer-events: none;
  background: var(--primary-light, #e6f3ee);
  color: var(--primary, #52a88c);
  border: 1px solid var(--primary, #52a88c);
}
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.2s ease;
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}
</style>
