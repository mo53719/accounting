﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿<template>
  <div class="page min-h-screen pb-24">
    <div class="page-header">
      <span class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </span>
      <h1 class="page-title">报销管理</h1>
    </div>
    <p class="page-subtitle">跟踪报销进度</p>

    <div class="px-5 space-y-3">
      <!-- 状态统计 -->
      <div class="grid grid-cols-3 gap-2">
        <div class="card-page p-3 text-center stat-cell stat-pending">
          <p class="text-xl font-bold text-vip">{{ pendingCount }}</p>
          <p class="text-xs text-light">待审批</p>
        </div>
        <div class="card-page p-3 text-center stat-cell stat-approved">
          <p class="text-xl font-bold text-income-dark">{{ approvedCount }}</p>
          <p class="text-xs text-light">已通过</p>
        </div>
        <div class="card-page p-3 text-center stat-cell stat-rejected">
          <p class="text-xl font-bold text-expense-dark">{{ rejectedCount }}</p>
          <p class="text-xs text-light">已驳回</p>
        </div>
      </div>

      <button @click="openCreate" class="btn-primary w-full py-3 text-sm">+ 新建报销</button>

      <div v-if="list.length === 0" class="empty-state">
        <div class="empty-state-illust">
          <IllustrationImage
            v-if="currentThemeSet !== 'standard'" :theme="currentThemeSet" slot="emptySavings"
            module-id="coupons-empty"
            css-class="empty-state-img"
          />
          <svg v-else viewBox="0 0 120 100" width="120" height="100" fill="none">
            <rect x="25" y="30" width="70" height="50" rx="6" fill="none" stroke="var(--divider)" stroke-width="2"/>
            <line x1="40" y1="44" x2="80" y2="44" stroke="var(--divider)" stroke-width="2" stroke-dasharray="3 3"/>
            <line x1="40" y1="56" x2="68" y2="56" stroke="var(--divider)" stroke-width="2" stroke-dasharray="3 3"/>
            <line x1="40" y1="68" x2="74" y2="68" stroke="var(--divider)" stroke-width="2" stroke-dasharray="3 3"/>
            <circle cx="60" cy="55" r="20" fill="var(--bg-card)" stroke="var(--primary)" stroke-width="1.5"/>
            <polyline points="50,55 58,63 72,49" stroke="var(--primary)" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h2 class="empty-state-title">暂无报销记录</h2>
        <p class="empty-state-desc">点击上方按钮快速创建一条报销</p>
      </div>

      <div v-else class="space-y-2">
        <div v-for="t in list" :key="t.objectId" class="card-md p-4">
          <div class="flex justify-between items-start mb-2">
            <div>
              <p class="text-sm font-semibold text-dark">{{ t.category }}</p>
              <p class="text-xs text-light">{{ t.date }} · 申请人：{{ t.reimbursement!.applicant }}</p>
            </div>
            <p class="text-base font-bold text-expense-dark">-¥{{ t.amount.toFixed(0) }}</p>
          </div>
          <div class="flex items-center justify-between">
            <span
              class="badge"
              :class="statusBadgeClass(t.reimbursement!.status)"
            >{{ statusLabel(t.reimbursement!.status) }}</span>
            <div class="flex gap-1.5">
              <button v-if="t.reimbursement!.status === 'pending'" @click="setStatus(t.objectId, 'approved')" class="btn-light text-xs px-3 py-1">通过</button>
              <button v-if="t.reimbursement!.status === 'pending'" @click="setStatus(t.objectId, 'rejected')" class="btn-secondary text-xs px-3 py-1">驳回</button>
            </div>
          </div>
          <p v-if="t.note" class="text-xs mt-2 text-light">备注：{{ t.note }}</p>
          <!-- 卡片右下角：海贼王 mini 贴纸 -->
          <IllustrationImage
            v-if="currentThemeSet !== 'standard'"
            :theme="currentThemeSet" slot="stickerCorner"
            :module-id="`coupons-row-${t.objectId}`"
            css-class="coupon-sticker"
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
          module-id="coupons-modal"
          css-class="modal-sticker"
          :style-obj="{ top: '6px', right: '6px', width: '26px', height: '26px', borderRadius: '6px' }"
        />
        <div class="modal-header">
          <h3>新建报销</h3>
          <span class="modal-close" @click="creating = false">×</span>
        </div>
        <div class="modal-body space-y-3">
          <div>
            <label class="form-label">项目名称</label>
            <input v-model="form.category" placeholder="如：出差打车" class="input mt-1" />
          </div>
          <div>
            <label class="form-label">金额（元）</label>
            <input v-model.number="form.amount" type="number" placeholder="0.00" class="input mt-1" />
          </div>
          <div>
            <label class="form-label">申请人</label>
            <input v-model="form.applicant" placeholder="如：员工A" class="input mt-1" />
          </div>
          <div>
            <label class="form-label">备注</label>
            <input v-model="form.note" placeholder="说明用途" class="input mt-1" />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="creating = false" class="btn-ghost">取消</button>
          <button @click="save" class="btn-primary">提交</button>
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

const { transactions, addTransaction } = useTransaction()

const list = computed(() => transactions.value.filter(t => t.reimbursement))
const pendingCount = computed(() => list.value.filter(t => t.reimbursement!.status === 'pending').length)
const approvedCount = computed(() => list.value.filter(t => t.reimbursement!.status === 'approved').length)
const rejectedCount = computed(() => list.value.filter(t => t.reimbursement!.status === 'rejected').length)

const creating = ref(false)
const form = ref({ category: '', amount: 0, applicant: '我', note: '' })

function openCreate() {
  form.value = { category: '', amount: 0, applicant: '我', note: '' }
  creating.value = true
}

function statusLabel(s: string) {
  return s === 'pending' ? '待审批' : s === 'approved' ? '已通过' : '已驳回'
}
function statusBadgeClass(s: string) {
  if (s === 'pending') return 'vip'
  if (s === 'approved') return 'income'
  return 'expense'
}

async function save() {
  if (!form.value.category || form.value.amount <= 0) return
  await addTransaction({
    type: 'expense',
    amount: form.value.amount,
    date: dayjs().format('YYYY-MM-DD'),
    category: form.value.category,
    paymentMethod: '',
    note: form.value.note,
    createdBy: '我',
  })
  const newOne = transactions.value[0]
  if (newOne) {
    newOne.reimbursement = {
      status: 'pending',
      applicant: form.value.applicant,
    }
  }
  creating.value = false
}

function setStatus(objectId: string, status: 'pending' | 'approved' | 'rejected') {
  const t = transactions.value.find(t => t.objectId === objectId)
  if (t && t.reimbursement) t.reimbursement.status = status
}
</script>

<style scoped>
.page { background: var(--bg-page); }
.form-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-light);
  margin-bottom: 6px;
}

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
.coupon-sticker {
  position: absolute;
  right: 12px;
  bottom: 8px;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  opacity: 0.75;
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

.card-md { position: relative; }

.stat-pending { background: var(--vip-gold-soft); }
.stat-approved { background: var(--income-soft); }
.stat-rejected { background: var(--expense-soft); }
</style>
