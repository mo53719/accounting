﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿<template>
  <div class="add-page">
    <!-- 柔和提示（替代 alert） -->
    <transition name="toast-fade">
      <div v-if="toastMsg" class="toast" :class="toastType">
        <Icon :name="toastType === 'warning' ? 'bell' : 'check'" :size="16" />
        <span>{{ toastMsg }}</span>
      </div>
    </transition>

    <!-- 顶部浅色渐变头 -->
    <div class="header">
      <div class="header-row">
        <span class="back-btn" @click="$router.back()">
          <Icon name="arrowLeft" :size="20" />
        </span>
        <span class="header-title">记一笔</span>
        <span class="header-spacer"></span>
      </div>
      <!-- 支出 / 收入 Tab -->
      <div class="type-tabs">
        <button
          @click="formType = 'expense'"
          class="type-tab"
          :class="{ active: formType === 'expense' }"
        >支出</button>
        <button
          @click="formType = 'income'"
          class="type-tab"
          :class="{ active: formType === 'income' }"
        >收入</button>
      </div>
    </div>

    <!-- 主体白色卡片 -->
    <div class="add-body">
      <!-- 金额显示 -->
      <div class="amount-display">
        <div class="amount-text">
          <span v-if="form.amount">¥{{ form.amount }}</span>
          <span v-else class="amount-placeholder">0.00</span>
        </div>
      </div>

      <!-- 分类：横向卡片 -->
      <div class="section">
        <div class="section-header">
          <h3 class="section-title">选择分类</h3>
          <button @click="$router.push('/category-manage')" class="link-btn">
            管理
            <Icon name="arrowRight" :size="12" />
          </button>
        </div>
        <div class="cat-grid">
          <button
            v-for="cat in currentCategories"
            :key="cat.name"
            class="cat-chip"
            :class="{ active: form.category === cat.name, 'is-expense': formType === 'expense', 'is-income': formType === 'income' }"
            @click="form.category = cat.name"
          >
            <div class="cat-icon">
              <img v-if="isImageIcon(cat.icon)" :src="cat.icon" class="icon-img" />
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
                v-html="svgPaths[cat.icon] || svgPaths['star']"
              />
            </div>
            <span class="cat-label">{{ cat.name }}</span>
          </button>
          <button @click="$router.push('/category-manage')" class="cat-chip add-chip">
            <div class="cat-icon">
              <Icon name="add" :size="18" />
            </div>
            <span class="cat-label">添加</span>
          </button>
        </div>
      </div>

      <!-- 分组字段：记账人、支付方式、备注 -->
      <div class="field-group">
        <div class="field-row">
          <span class="field-label">记账人</span>
          <div class="chip-wrap">
            <button
              v-for="m in bookStore.members"
              :key="m.name"
              @click="form.createdBy = m.name"
              class="mini-chip"
              :class="{ active: form.createdBy === m.name }"
            >{{ m.name }}</button>
          </div>
        </div>

        <div class="field-row">
          <span class="field-label">支付方式</span>
          <div class="chip-wrap">
            <button
              v-for="m in paymentMethods"
              :key="m"
              @click="form.paymentMethod = m"
              class="mini-chip"
              :class="{ active: form.paymentMethod === m }"
            >{{ m }}</button>
          </div>
        </div>

        <div class="field-row">
          <span class="field-label">备注</span>
          <input v-model="form.note" type="text" placeholder="添加备注..." class="field-input" />
        </div>

        <div class="field-row">
          <span class="field-label">时间</span>
          <div class="field-time">
            <Icon name="refresh" :size="14" />
            <span>{{ nowLabel }}</span>
          </div>
        </div>

        <!-- 人情往来标记（可折叠） -->
        <div class="social-toggle-row">
          <button
            type="button"
            class="social-toggle"
            :class="{ active: socialEnabled }"
            @click="socialEnabled = !socialEnabled"
          >
            <Icon name="user" :size="14" />
            <span>{{ socialEnabled ? '已加入人情往来' : '加入人情往来' }}</span>
            <span class="social-arrow" :class="{ open: socialEnabled }">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </button>
        </div>
        <div v-if="socialEnabled" class="social-panel">
          <div class="field-row field-row-stack">
            <span class="field-label">对象</span>
            <div class="seg-control seg-4">
              <div
                v-for="opt in socialCategoryOptions"
                :key="opt.value"
                class="seg-item"
                :class="{ active: social.category === opt.value }"
                @click="social.category = opt.value"
              >{{ opt.label }}</div>
            </div>
          </div>
          <div class="field-row field-row-stack">
            <span class="field-label">方向</span>
            <div class="seg-control seg-2">
              <div
                class="seg-item"
                :class="{ active: social.direction === 'out' }"
                @click="social.direction = 'out'"
              >{{ socialDirectionLabels[social.category].out }}</div>
              <div
                class="seg-item"
                :class="{ active: social.direction === 'in' }"
                @click="social.direction = 'in'"
              >{{ socialDirectionLabels[social.category].in }}</div>
            </div>
          </div>
          <div class="field-row">
            <span class="field-label">对方</span>
            <input
              v-model="social.counterparty"
              class="field-input"
              placeholder="如：张三 / 李四"
              maxlength="30"
            />
          </div>
          <div class="field-row">
            <span class="field-label">关系</span>
            <div class="rel-chips">
              <span
                v-for="opt in socialRelationshipOptions"
                :key="opt"
                class="rel-chip"
                :class="{ active: social.relationship === opt }"
                @click="social.relationship = social.relationship === opt ? '' : opt"
              >{{ opt }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 数字键盘 -->
      <div class="num-pad">
        <button
          v-for="key in numKeys"
          :key="key.label"
          class="num-key"
          :class="{ primary: key.value === 'save', ghost: key.value === 'clear' || key.value === 'del' || key.value === 'plus' || key.value === 'minus' }"
          @click="onKey(key.value)"
        >{{ key.label }}</button>
        <!-- 角落小萌宠装饰（不遮挡数字键盘与输入框）：同时渲染 pet + comic，body class 控制 -->
        <div class="pet-corner">
          <PetMascot pet="dog" size="corner" />
        </div>
        <div class="comic-corner">
          <MangaMascot size="corner" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useBookStore } from '../stores/book'
import { useCategoryStore } from '../stores/category'
import { useTransaction } from '../composables/useTransaction'
import PetMascot from '../components/PetMascot.vue'
import MangaMascot from '../components/MangaMascot.vue'
import Icon from '../components/icons/Icon.vue'
import dayjs from 'dayjs'

const router = useRouter()
const bookStore = useBookStore()
const categoryStore = useCategoryStore()
const { addTransaction } = useTransaction()

const formType = ref<'expense' | 'income'>('expense')
const form = ref({
  amount: '',
  category: '',
  paymentMethod: '微信',
  note: '',
  createdBy: '我',
})

/* === 人情往来标记（同步到人情模块） === */
const socialEnabled = ref(false)
const socialCategoryOptions: { value: 'borrow' | 'redpacket' | 'gift' | 'advance'; label: string }[] = [
  { value: 'borrow', label: '借钱' },
  { value: 'redpacket', label: '红包' },
  { value: 'gift', label: '礼金' },
  { value: 'advance', label: '代付' },
]
const socialRelationshipOptions = ['朋友', '同事', '家人', '亲戚', '其他']
const socialDirectionLabels: Record<'borrow' | 'redpacket' | 'gift' | 'advance', { out: string; in: string }> = {
  borrow: { out: '借出', in: '借入' },
  redpacket: { out: '发红包', in: '收红包' },
  gift: { out: '送礼', in: '收礼' },
  advance: { out: '代付', in: '代收' },
}
const social = ref({
  category: 'redpacket' as 'borrow' | 'redpacket' | 'gift' | 'advance',
  direction: 'out' as 'out' | 'in',
  counterparty: '',
  relationship: '',
})

/* 监听 formType 自动调整 social.direction 默认值 */
watch(formType, (val) => {
  social.value.direction = val === 'expense' ? 'out' : 'in'
})

// 柔和提示（替代 alert）
const toastMsg = ref('')
const toastType = ref<'warning' | 'success'>('warning')
let toastTimer: number | null = null
function showToast(msg: string, type: 'warning' | 'success' = 'warning') {
  toastMsg.value = msg
  toastType.value = type
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => { toastMsg.value = '' }, 2200)
}

const paymentMethods = ['现金', '微信', '支付宝', '银行卡', '其他']
const nowLabel = dayjs().format('YYYY-MM-DD HH:mm')

const currentCategories = computed(() => {
  return formType.value === 'expense'
    ? categoryStore.expenseCategories
    : categoryStore.incomeCategories
})

// Feather 风格 SVG 路径
const svgPaths: Record<string, string> = {
  utensils: '<path d="M3 2v7c0 1.1.9 2 2 2h0a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>',
  coffee: '<path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/>',
  cup: '<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>',
  'shopping-cart': '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
  'shopping-bag': '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  car: '<path d="M5 17h14M6.5 17l1-4h9l1 4M6 17v2M18 17v2M5 10l1.5-4h11L19 10v4H5z"/><circle cx="7.5" cy="15.5" r="1"/><circle cx="16.5" cy="15.5" r="1"/>',
  bus: '<rect x="5" y="3" width="14" height="14" rx="2"/><path d="M5 10h14M9 17v2M15 17v2"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/>',
  train: '<rect x="4" y="4" width="16" height="12" rx="2"/><path d="M4 10h16"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/><path d="M6 20l2-2M18 20l-2-2"/>',
  plane: '<path d="M2 12l19-7-7 19-2-8-10-4z"/>',
  bike: '<circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 17l4-8h4l4 8M10 9l2-3"/>',
  'gas-pump': '<path d="M4 22V4h10v18M14 8l4 4v6M18 12h2v-2"/><rect x="6" y="6" width="6" height="6"/>',
  home: '<path d="M3 12l9-9 9 9"/><path d="M5 10v10h14V10"/>',
  lamp: '<path d="M9 18h6M12 14v4M8 20h8"/><path d="M8 10a4 4 0 1 1 8 0c0 2-2 3-2 5h-4c0-2-2-3-2-5z"/>',
  bed: '<path d="M2 17v-5a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v5M2 17h20M7 14v-3M17 14v-3"/>',
  key: '<circle cx="7" cy="17" r="3"/><path d="M10 17l11-11M15 7l4 4M18 10l2 2"/>',
  wrench: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-2.5 2.5-2.5z"/>',
  leaf: '<path d="M21 2c0 10-6 19-18 19 12 0 19-6 19-18z"/><path d="M21 2c-10 0-19 8-19 19 8-11 19-18 19-19z"/>',
  'dollar-sign': '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><line x1="2" y1="13" x2="22" y2="13"/>',
  gift: '<rect x="3" y="8" width="18" height="4"/><rect x="3" y="12" width="18" height="8"/><line x1="12" y1="8" x2="12" y2="22"/><path d="M12 8s-4-4-7-1 3 1 7 1zM12 8s4-4 7-1-3 1-7 1z"/>',
  smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
  activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  'heart-pulse': '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/><path d="M3 12h4l2-4 4 8 2-4h6"/>',
  droplet: '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>',
  flame: '<path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-3-3 2-5 6-3 11a6 6 0 0 0 12 0c0-6-6-10-6-16z"/>',
  'map-pin': '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  compass: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 22v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"/>',
}

function isImageIcon(icon: string) {
  return icon && icon.startsWith('data:image')
}

const numKeys = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '⌫', value: 'del' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
  { label: '6', value: '6' },
  { label: '+', value: 'plus' },
  { label: '7', value: '7' },
  { label: '8', value: '8' },
  { label: '9', value: '9' },
  { label: '-', value: 'minus' },
  { label: '.', value: 'dot' },
  { label: '0', value: '0' },
  { label: '完成', value: 'save' },
  { label: '清空', value: 'clear' },
]

function onKey(key: string) {
  if (key === 'del') {
    form.value.amount = form.value.amount.slice(0, -1)
    return
  }
  if (key === 'clear') {
    form.value.amount = ''
    return
  }
  if (key === 'save') {
    handleSave()
    return
  }
  if (key === 'plus' || key === 'minus') return
  if (form.value.amount.length < 10) {
    if (key === 'dot' && form.value.amount.includes('.')) return
    form.value.amount += key
  }
}

async function handleSave() {
  if (!form.value.amount) {
    showToast('请输入金额')
    return
  }
  if (!form.value.category) {
    showToast('请选择一个分类')
    return
  }
  // 校验：开启人情标记时，对方必填
  if (socialEnabled.value && !social.value.counterparty.trim()) {
    showToast('人情往来需要填写对方')
    return
  }
  // 构造 socialType（开启时才附加）
  const socialType = socialEnabled.value
    ? {
        category: social.value.category,
        direction: social.value.direction,
        counterparty: social.value.counterparty.trim(),
        relationship: social.value.relationship,
        settled: false,
      }
    : undefined
  await addTransaction({
    type: formType.value,
    amount: parseFloat(form.value.amount),
    date: dayjs().format('YYYY-MM-DD'),
    category: form.value.category,
    paymentMethod: form.value.paymentMethod,
    note: form.value.note,
    createdBy: form.value.createdBy,
    socialType,
  })
  showToast(socialEnabled.value ? '记账成功，已加入人情往来' : '记账成功', 'success')
  setTimeout(() => router.push('/home'), 400)
}

onMounted(() => {
  if (bookStore.members.length > 0) {
    form.value.createdBy = bookStore.members[0].name
  }
})
</script>

<style scoped>
/* ===== 柔和 Toast 提示 ===== */
.toast {
  position: fixed;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  font-size: 14px;
  font-weight: 500;
  z-index: 9999;
  max-width: 320px;
  pointer-events: none;
}

.toast.warning {
  background: #fff8e6;
  color: #b87800;
  border: 1px solid #f4d77a;
}

.toast.success {
  background: var(--primary-light, #e6f3ee);
  color: var(--primary, #52a88c);
  border: 1px solid var(--primary, #52a88c);
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.25s ease;
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-12px);
}

.add-page {
  background: var(--page-bg);
  min-height: 100vh;
  padding-bottom: 24px;
}

/* 顶部浅色渐变头 */
.header {
  background: linear-gradient(180deg, var(--primary-light) 0%, var(--page-bg) 100%);
  padding: 48px 20px 16px;
}
.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.back-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--card-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-h1);
  cursor: pointer;
  box-shadow: var(--shadow-soft);
}
.back-btn:active { transform: scale(0.95); }
.header-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-h1);
}
.header-spacer { width: 34px; }

/* 类型 Tab */
.type-tabs {
  display: flex;
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: 4px;
  gap: 4px;
  box-shadow: var(--shadow-soft);
}
.type-tab {
  flex: 1;
  padding: 9px 0;
  border: none;
  background: transparent;
  color: var(--text-body);
  font-size: 14px;
  font-weight: 500;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s;
}
.type-tab.active {
  background: var(--card-bg);
  box-shadow: var(--shadow-soft);
  color: var(--text-h1);
}
.type-tab.active.is-expense { color: var(--expense); }
.type-tab.active.is-income { color: var(--income); }

/* 主体卡片 */
.add-body {
  background: var(--card-bg);
  margin: 14px 16px 0;
  border-radius: var(--radius-xl);
  padding: 18px 16px 20px;
  box-shadow: var(--shadow-soft);
}

/* 金额显示 */
.amount-display {
  text-align: center;
  padding: 16px 0 20px;
  border-bottom: 1px solid var(--divider);
  margin-bottom: 16px;
}
.amount-text {
  font-size: 40px;
  font-weight: 300;
  letter-spacing: 0.02em;
  color: var(--text-h1);
}
.amount-placeholder { color: var(--text-weak); }

/* 区块标题 */
.section { margin-bottom: 18px; }
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-h1);
}
.link-btn {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  background: transparent;
  border: none;
  font-size: 12px;
  color: var(--primary);
  cursor: pointer;
}

/* 分类卡片 */
.cat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.cat-chip {
  background: var(--page-bg);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  padding: 10px 4px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.15s;
}
.cat-chip:active { transform: scale(0.96); }
.cat-icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--card-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-body);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
  flex-shrink: 0;
}
.cat-icon .icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
.cat-chip.active {
  border-color: var(--primary);
  background: var(--card-bg);
  box-shadow: var(--shadow-soft);
}
.cat-chip.active.is-expense { border-color: var(--expense); }
.cat-chip.active.is-income { border-color: var(--income); }
.cat-chip.active .cat-icon { background: var(--primary-light); color: var(--primary); }
.cat-chip.active.is-expense .cat-icon { background: var(--expense-light); color: var(--expense); }
.cat-chip.active.is-income .cat-icon { background: var(--income-light); color: var(--income); }
.cat-label {
  font-size: 12px;
  color: var(--text-body);
}
.cat-chip.active .cat-label { color: var(--text-h1); font-weight: 500; }

.add-chip .cat-icon { background: var(--card-bg); color: var(--text-weak); border: 1px dashed var(--divider); box-shadow: none; }

/* 字段分组 */
.field-group {
  background: var(--page-bg);
  border-radius: var(--radius-lg);
  padding: 4px 14px;
  margin-bottom: 16px;
}
.field-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--divider);
}
.field-row:last-child { border-bottom: none; }
.field-label {
  font-size: 13px;
  color: var(--text-body);
  width: 62px;
  flex-shrink: 0;
}
.chip-wrap { display: flex; gap: 6px; flex-wrap: wrap; }
.mini-chip {
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  background: var(--card-bg);
  color: var(--text-body);
  border: 1px solid var(--divider);
}
.mini-chip.active { background: var(--primary-light); color: var(--primary); border-color: var(--primary-light); }
.field-input {
  width: 100%;
  padding: 0;
  background: transparent;
  border: none;
  font-size: 14px;
  color: var(--text-h1);
  outline: none;
}
.field-input::placeholder { color: var(--text-weak); }

.field-time {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--text-body);
  font-size: 14px;
}

/* ===== 人情往来标记 ===== */
.social-toggle-row {
  margin-top: 4px;
}
.social-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  font-size: 13px;
  color: var(--text-body);
  background: var(--card-bg);
  border: 1px dashed var(--divider);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.15s;
}
.social-toggle.active {
  background: var(--primary-light, #e6f3ee);
  color: var(--primary, #52a88c);
  border-color: var(--primary, #52a88c);
  border-style: solid;
  font-weight: 500;
}
.social-arrow {
  display: inline-flex;
  align-items: center;
  transition: transform 0.2s;
}
.social-arrow.open {
  transform: rotate(180deg);
}
.social-panel {
  margin-top: 10px;
  padding: 12px;
  background: var(--card-bg);
  border: 1px solid var(--divider);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* social 用的 seg / chip */
.social-panel .seg-control {
  display: flex;
  background: var(--page-bg);
  border-radius: var(--radius-md);
  padding: 2px;
  border: 1px solid var(--divider);
}
.social-panel .seg-item {
  flex: 1;
  text-align: center;
  padding: 6px 0;
  font-size: 12px;
  color: var(--text-body);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.15s;
}
.social-panel .seg-item.active {
  background: var(--primary);
  color: #fff;
  font-weight: 500;
}
.social-panel .seg-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
}
.social-panel .seg-4 .seg-item {
  font-size: 12px;
  padding: 6px 2px;
}
.field-row-stack {
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
}
.field-row-stack .field-label {
  width: auto;
}
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
  background: var(--primary-light, #e6f3ee);
  color: var(--primary, #52a88c);
  border-color: var(--primary, #52a88c);
}

/* 数字键盘 */
.num-pad {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.num-key {
  height: 48px;
  border-radius: var(--radius-md);
  font-size: 17px;
  font-weight: 500;
  background: var(--page-bg);
  color: var(--text-h1);
  border: none;
  cursor: pointer;
  transition: transform 0.1s, background 0.15s;
}
.num-key:active { transform: scale(0.96); background: var(--primary-light); }
.num-key.primary {
  background: var(--primary);
  color: #FFFFFF;
}
.num-key.primary:active { background: var(--primary-dark); }
.num-key.ghost {
  background: var(--card-bg);
  border: 1px solid var(--divider);
  color: var(--text-body);
  font-size: 14px;
}
.num-key.ghost:active { background: var(--primary-light); border-color: var(--primary-light); color: var(--primary); }

/* 记账人 mini-chip 默认样式 */
.mini-chip {
  background: var(--card-bg);
  color: var(--text-body);
}
.mini-chip.active {
  background: var(--primary-light);
  color: var(--primary);
  border-color: var(--primary-light);
}

/* 数字键盘需要相对定位作为宠物装饰的上下文 */
.num-pad {
  position: relative;
}

/* 角落宠物装饰：固定在右下角外一点，不遮挡数字键盘按键 */
.pet-corner {
  position: absolute;
  right: -6px;
  bottom: -22px;
  pointer-events: none;
  opacity: 0.85;
}
</style>
