﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿<template>
  <div class="tx-card" @click="showDetail = !showDetail">
    <!-- 左侧图标：根据分类查找对应的图标（统一 SVG 风格渲染） -->
    <div class="tx-icon" :class="transaction.type" :style="iconStyle">
      <img v-if="isImageIcon" :src="categoryIcon" class="icon-img" />
      <Icon v-else-if="iconName" :name="iconName" :size="18" :stroke="iconColor" />
      <Icon v-else :name="'star'" :size="18" :stroke="iconColor" />
    </div>

    <!-- 中间信息 -->
    <div class="tx-info">
      <p class="tx-category">{{ transaction.category }}</p>
      <p class="tx-meta">
        {{ transaction.date }}
        <span v-if="transaction.paymentMethod" class="tx-meta-dot">·</span>
        <span v-if="transaction.paymentMethod">{{ transaction.paymentMethod }}</span>
        <span v-if="transaction.createdBy" class="tx-meta-dot">·</span>
        <span v-if="transaction.createdBy" style="color: var(--primary)">{{ transaction.createdBy }}</span>
        <span v-if="transaction.autoParsed" class="tx-meta-badge">自动</span>
      </p>
      <p v-if="transaction.note && showDetail" class="tx-note">{{ transaction.note }}</p>
    </div>

    <!-- 右侧金额 -->
    <span class="tx-amount" :class="transaction.type">
      {{ transaction.type === 'income' ? '+' : '-' }}¥{{ transaction.amount.toFixed(0) }}
    </span>

    <!-- 删除按钮 -->
    <button v-if="showDetail" class="tx-delete" @click.stop="confirmDelete" aria-label="删除">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        <path d="M10 11v6M14 11v6"/>
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCategoryStore } from '../stores/category'
import { SVG_ICON_PATHS } from '../utils/format'
import Icon from './icons/Icon.vue'

const props = defineProps<{
  transaction: {
    objectId: string
    type: string
    amount: number
    date: string
    category: string
    paymentMethod?: string
    note?: string
    createdBy?: string
    autoParsed?: boolean
  }
  /** 独立插画模块 ID（账单条目不再展示插画，仅保留传参兼容旧代码） */
  pageId: string
}>()

const emit = defineEmits(['delete'])

const showDetail = ref(false)
const categoryStore = useCategoryStore()

// 查找当前交易对应的分类对象
const category = computed(() => {
  return categoryStore.findCategory(props.transaction.category, props.transaction.type as 'expense' | 'income')
})

// 分类图标：可能是 SVG key（如 'utensils'）或 data:image URL
const categoryIcon = computed(() => category.value?.icon || 'star')
const isImageIcon = computed(() => categoryIcon.value && categoryIcon.value.startsWith('data:image'))
// 兜底：预设 60 + 自定义 → 在 SVG_ICON_PATHS 中能找到才使用
const iconName = computed(() => {
  if (isImageIcon.value) return ''
  return SVG_ICON_PATHS[categoryIcon.value] ? categoryIcon.value : ''
})

// 背景色/前景色映射（与预设分类保持一致）
const iconStyle = computed(() => {
  const cat = category.value
  if (cat?.bgColor && cat?.color) {
    return { background: cat.bgColor, color: cat.color }
  }
  return {}
})

// 当前图标描边色：跟随预设分类的 color，否则走主题色
const iconColor = computed(() => {
  return category.value?.color || 'currentColor'
})

function confirmDelete() {
  emit('delete', props.transaction.objectId)
}
</script>

<style scoped>
.tx-card {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-soft);
  padding: 12px 14px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: transform 0.15s, box-shadow 0.15s;
  position: relative;
}
.tx-card:active { transform: scale(0.99); box-shadow: var(--shadow-hover); }

.tx-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}
.tx-icon.expense {
  background: var(--expense-light);
  color: var(--expense);
}
.tx-icon.income {
  background: var(--income-light);
  color: var(--income);
}
.tx-icon .icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tx-info {
  flex: 1;
  min-width: 0;
}
.tx-category {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-h1);
  line-height: 1.3;
}
.tx-meta {
  font-size: 11px;
  color: var(--text-weak);
  margin-top: 3px;
  line-height: 1.4;
}
.tx-meta-dot {
  margin: 0 3px;
  color: var(--text-weak);
  opacity: 0.6;
}
.tx-meta-badge {
  display: inline-block;
  padding: 1px 5px;
  margin-left: 6px;
  background: var(--primary-light);
  color: var(--primary);
  border-radius: var(--radius-sm);
  font-size: 9px;
  font-weight: 500;
  vertical-align: middle;
}
.tx-note {
  font-size: 12px;
  color: var(--text-body);
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px dashed var(--divider);
  line-height: 1.4;
}

.tx-amount {
  font-size: 15px;
  font-weight: 600;
  flex-shrink: 0;
}
.tx-amount.expense { color: var(--expense); }
.tx-amount.income { color: var(--income); }

.tx-delete {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 26px;
  height: 26px;
  border: 1px solid var(--divider);
  background: var(--card-bg);
  color: var(--text-weak);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s;
}
.tx-delete:active {
  background: var(--expense-light);
  color: var(--expense);
  border-color: var(--expense-light);
  transform: translateY(-50%) scale(0.96);
}
</style>
