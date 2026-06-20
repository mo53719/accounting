<template>
  <div class="page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()" aria-label="返回" type="button">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <div class="flex-1">
        <h1 class="page-title">税费记账</h1>
        <p class="page-subtitle">自动计算税后金额</p>
      </div>
    </div>

    <div class="page-body">
      <!-- 汇总卡 -->
      <div class="summary-card">
        <p class="summary-label">本月税额</p>
        <p class="summary-amount">¥{{ totalTax.toFixed(2) }}</p>
        <div class="summary-detail">
          <span class="summary-detail-item">税前总额 <b>¥{{ totalGross.toFixed(2) }}</b></span>
          <span class="summary-dot">·</span>
          <span class="summary-detail-item">税后净额 <b>¥{{ totalNet.toFixed(2) }}</b></span>
        </div>
        <!-- 汇总卡右上角 -->
        <IllustrationImage
          v-if="currentThemeSet !== 'standard'"
          :theme="currentThemeSet" slot="stickerCorner"
          module-id="tax-summary"
          css-class="card-sticker"
          :style-obj="{ position: 'absolute', top: '8px', right: '8px' }"
        />
      </div>

      <!-- 新建按钮 -->
      <button @click="openCreate" class="btn-secondary-expense create-btn" type="button">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        新建税费记录
      </button>

      <!-- 空态：海贼王一套，standard 主题用 MangaMascot -->
      <div v-if="taxList.length === 0" class="empty-state">
        <div class="empty-state-comic">
          <IllustrationImage
            v-if="currentThemeSet !== 'standard'" :theme="currentThemeSet" slot="emptySavings"
            module-id="tax-empty"
            css-class="empty-state-img"
          />
          <MangaMascot v-else-if="currentThemeSet === 'standard'" size="large" />
        </div>
        <p class="empty-state-title">暂无税费记录</p>
        <p class="empty-state-desc">工资、劳务等收入自动算税，账目清晰</p>
        <button @click="openCreate" class="btn-expense empty-state-cta" type="button">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          创建第一条税费记录
        </button>
      </div>

      <!-- 列表 -->
      <div v-else class="records-list">
        <div
          v-for="t in taxList"
          :key="t.objectId"
          class="record-card"
        >
          <div class="record-icon expense">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="9" y1="13" x2="15" y2="13"/>
              <line x1="9" y1="17" x2="15" y2="17"/>
            </svg>
          </div>
          <div class="record-info">
            <p class="record-title">{{ t.category }}</p>
            <p class="record-meta">{{ t.date }} · 税率 {{ t.taxRate }}%</p>
            <p class="record-detail">税前 ¥{{ t.amount.toFixed(2) }} · 税后 ¥{{ (t.netAmount || 0).toFixed(2) }}</p>
          </div>
          <p class="record-amount">-¥{{ (t.taxAmount || 0).toFixed(2) }}</p>
          <!-- 行右侧 mini 贴纸 -->
          <IllustrationImage
            v-if="currentThemeSet !== 'standard'"
            :theme="currentThemeSet" slot="stickerCorner"
            :module-id="`tax-record-${t.objectId}`"
            css-class="record-sticker"
            :style-obj="{ position: 'absolute', right: '14px', bottom: '8px' }"
          />
        </div>
      </div>
    </div>

    <!-- 创建弹窗 -->
    <div v-if="creating" class="modal-mask" @click.self="creating = false">
      <div class="modal-card">
        <!-- 弹窗右上角 -->
        <IllustrationImage
          v-if="currentThemeSet !== 'standard'" :theme="currentThemeSet" slot="stickerCorner"
          module-id="tax-modal"
          css-class="modal-sticker"
          :style-obj="{ position: 'absolute', top: '6px', right: '6px' }"
        />
        <div class="modal-header">
          <h3>新建税费记录</h3>
          <span class="modal-close" @click="creating = false" aria-label="关闭">×</span>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <label class="form-label">分类</label>
            <input v-model="form.category" placeholder="如：工资" class="form-input" />
          </div>
          <div class="form-row">
            <label class="form-label">税前金额（元）</label>
            <input v-model.number="form.amount" type="number" placeholder="0.00" class="form-input" />
          </div>
          <div class="form-row">
            <label class="form-label">税率 (%)</label>
            <input v-model.number="form.taxRate" type="number" placeholder="如：10" class="form-input" />
          </div>
          <div class="calc-hint">
            税额：<b>¥{{ calc.tax.toFixed(2) }}</b> · 税后：<b>¥{{ calc.net.toFixed(2) }}</b>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="creating = false" class="btn-ghost" type="button">取消</button>
          <button @click="saveTax" class="btn-expense" type="button">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTransaction } from '../composables/useTransaction'
import dayjs from 'dayjs'
import MangaMascot from '../components/MangaMascot.vue'
import IllustrationImage from '../components/IllustrationImage.vue'
import { currentThemeSet } from '../composables/useTheme'

const { addTransaction, transactions } = useTransaction()

const taxList = computed(() => transactions.value.filter(t => t.taxAmount !== undefined))
const totalTax = computed(() => taxList.value.reduce((s, t) => s + (t.taxAmount || 0), 0))
const totalGross = computed(() => taxList.value.reduce((s, t) => s + t.amount, 0))
const totalNet = computed(() => taxList.value.reduce((s, t) => s + (t.netAmount || 0), 0))

const creating = ref(false)
const form = ref({
  category: '工资',
  amount: 0,
  taxRate: 10,
})

const calc = computed(() => ({
  tax: (form.value.amount * form.value.taxRate) / 100,
  net: form.value.amount - (form.value.amount * form.value.taxRate) / 100,
}))

function openCreate() {
  form.value = { category: '工资', amount: 0, taxRate: 10 }
  creating.value = true
}

function saveTax() {
  if (form.value.amount <= 0) return
  const taxAmount = (form.value.amount * form.value.taxRate) / 100
  const netAmount = form.value.amount - taxAmount
  addTransaction({
    type: 'expense',
    amount: form.value.amount,
    date: dayjs().format('YYYY-MM-DD'),
    category: form.value.category,
    paymentMethod: '',
    note: `税率 ${form.value.taxRate}% · 税额 ¥${taxAmount.toFixed(2)} · 税后 ¥${netAmount.toFixed(2)}`,
    createdBy: '我',
  })
  const newOne = transactions.value[0]
  if (newOne) {
    newOne.taxRate = form.value.taxRate
    newOne.taxAmount = taxAmount
    newOne.netAmount = netAmount
  }
  creating.value = false
}
</script>

<style scoped>
.page {
  background: var(--page-bg);
  min-height: 100vh;
  padding-bottom: 40px;
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
.record-sticker {
  position: absolute;
  right: 14px;
  bottom: 8px;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  opacity: 0.75;
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

.flex-1 {
  flex: 1;
}

.page-body {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 汇总卡 */
.summary-card {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-soft);
  padding: 16px 18px;
  position: relative;
}
.summary-label {
  font-size: 12px;
  color: var(--text-weak);
  margin: 0 0 8px 0;
}
.summary-amount {
  font-size: 28px;
  font-weight: 600;
  color: var(--expense);
  margin: 0 0 12px 0;
  line-height: 1.2;
}
.summary-detail {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--text-weak);
  gap: 6px;
}
.summary-detail-item b {
  color: var(--text-h2);
  font-weight: 500;
}
.summary-dot { opacity: 0.5; }

/* 新建按钮 */
.create-btn {
  width: 100%;
}

/* 记录卡片列表 */
.records-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.record-card {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-soft);
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}
.record-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.record-icon.expense { background: var(--expense-light); color: var(--expense); }
.record-info {
  flex: 1;
  min-width: 0;
}
.record-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-h1);
  margin: 0 0 2px 0;
}
.record-meta {
  font-size: 11px;
  color: var(--text-weak);
  margin: 0 0 4px 0;
}
.record-detail {
  font-size: 12px;
  color: var(--text-body);
  margin: 0;
}
.record-amount {
  font-size: 15px;
  font-weight: 600;
  color: var(--expense);
  flex-shrink: 0;
}

/* 表单 */
.form-row {
  margin-bottom: 12px;
}
.form-label {
  display: block;
  font-size: 12px;
  color: var(--text-weak);
  margin-bottom: 6px;
  font-weight: 500;
}
.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--divider);
  border-radius: var(--radius-md);
  background: var(--card-bg);
  color: var(--text-h1);
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
  font-family: inherit;
}
.form-input:focus { border-color: var(--primary); }

.calc-hint {
  padding: 10px 12px;
  background: var(--expense-light);
  color: var(--expense-dark);
  border-radius: var(--radius-sm);
  font-size: 12px;
}
</style>
