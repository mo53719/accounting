﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿<template>
  <div class="savings-view">
    <div class="page-header">
      <span class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </span>
      <div class="flex-1">
        <h1 class="page-title">存钱计划</h1>
        <p class="page-subtitle">为梦想设置目标，稳步存钱</p>
      </div>
    </div>

    <div class="savings-content">
      <!-- 空状态 -->
      <div v-if="plans.length === 0" class="empty-state">
        <div class="empty-state-illust">
          <IllustrationImage
            v-if="currentThemeSet !== 'standard'"
            :theme="currentThemeSet" slot="emptySavings"
            module-id="savings-empty"
            css-class="empty-state-img"
          />
          <svg v-else viewBox="0 0 120 100" width="280" height="280" preserveAspectRatio="xMidYMid meet" fill="none">
            <ellipse cx="60" cy="60" rx="42" ry="30" fill="var(--primary-light)" stroke="var(--primary)" stroke-width="2"/>
            <path d="M30 40 L36 30 L42 40 Z" fill="var(--primary)" stroke="var(--primary)" stroke-width="1.5" stroke-linejoin="round"/>
            <circle cx="48" cy="58" r="1.5" fill="var(--primary-dark)"/>
            <circle cx="48" cy="64" r="1.5" fill="var(--primary-dark)"/>
            <circle cx="58" cy="52" r="1.8" fill="var(--text-h1)"/>
            <rect x="62" y="40" width="14" height="3" rx="1.5" fill="var(--vip-gold)"/>
            <rect x="36" y="86" width="6" height="8" rx="2" fill="var(--primary)"/>
            <rect x="78" y="86" width="6" height="8" rx="2" fill="var(--primary)"/>
            <path d="M100 60 Q108 56 106 50" stroke="var(--primary)" stroke-width="2" fill="none" stroke-linecap="round"/>
            <circle cx="92" cy="32" r="6" fill="var(--vip-gold)" opacity="0.85"/>
            <text x="92" y="36" text-anchor="middle" font-size="8" fill="#FFFFFF" font-weight="700">¥</text>
          </svg>
        </div>
        <p class="empty-state-title">还没有存钱计划</p>
        <p class="empty-state-desc">为心愿立一个小目标，积少成多</p>
        <button class="btn-primary empty-state-cta" @click="openCreate">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          新建存钱计划
        </button>
      </div>

      <template v-else>
        <!-- 头部汇总卡片 -->
        <div class="savings-hero-card">
          <div class="savings-hero-title">累计目标</div>
          <div class="savings-hero-row">
            <div class="savings-hero-current">
              <span class="hero-label">已存</span>
              <span class="hero-value">¥{{ totalCurrent.toFixed(2) }}</span>
            </div>
            <div class="savings-hero-arrow">→</div>
            <div class="savings-hero-target">
              <span class="hero-label">目标</span>
              <span class="hero-value">¥{{ totalTarget.toFixed(2) }}</span>
            </div>
          </div>
          <div class="savings-hero-progress">
            <div class="savings-hero-progress-bar" :style="{ width: totalPercent + '%' }"></div>
          </div>
          <div class="savings-hero-percent">{{ totalPercent }}%</div>
        </div>

        <!-- 新建按钮 -->
        <button @click="openCreate" class="btn-primary savings-add-btn">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          新建存钱计划
        </button>

        <!-- 计划列表 -->
        <div class="savings-list">
          <div v-for="p in plans" :key="p.id" class="savings-item-card">
            <div class="savings-item-head">
              <div class="savings-item-left">
                <div class="savings-item-icon">
                  <img v-if="isImageIcon(p.icon)" :src="p.icon" class="icon-img" />
                  <span v-else>{{ p.icon }}</span>
                </div>
                <div class="savings-item-info">
                  <div class="savings-item-name">{{ p.name }}</div>
                  <div class="savings-item-meta">{{ p.deadline }} 前存够</div>
                </div>
              </div>
              <div class="savings-item-right">
                <div class="savings-item-amount">¥{{ p.current.toFixed(2) }}</div>
                <div class="savings-item-target">/ ¥{{ p.target.toFixed(2) }}</div>
              </div>
            </div>
            <div class="savings-item-progress">
              <div class="savings-item-progress-bar" :style="{ width: progress(p) + '%' }"></div>
            </div>
            <div class="savings-item-progress-meta">
              <span>已完成 {{ progress(p) }}%</span>
              <span>还差 ¥{{ Math.max(0, p.target - p.current).toFixed(2) }}</span>
            </div>
            <div class="savings-item-actions">
              <button @click="deposit(p)" class="btn-primary action-btn">+ 存入</button>
              <button @click="withdraw(p)" class="btn-ghost action-btn">- 取出</button>
              <button @click="remove(p)" class="btn-danger action-btn">删除</button>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- 创建弹窗 -->
    <div v-if="creating" class="modal-mask" @click.self="creating = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>新建存钱计划</h3>
          <span class="modal-close" @click="creating = false">×</span>
        </div>
        <div class="modal-body space-y-3">
          <div>
            <label class="caption block mb-1">计划名称</label>
            <input v-model="form.name" placeholder="如：换新手机" class="input" />
          </div>
          <div>
            <label class="caption block mb-1">目标金额（元）</label>
            <input v-model.number="form.target" type="number" placeholder="0.00" class="input" />
          </div>
          <div>
            <label class="caption block mb-1">截止日期</label>
            <input v-model="form.deadline" type="date" class="input" />
          </div>
          <div>
            <div class="icon-label-row">
              <label class="caption block mb-1">选择图标</label>
              <label class="caption block mb-1 icon-upload-hint">或上传自定义图片</label>
            </div>

            <!-- 已上传的自定义图标 -->
            <div v-if="uploadedIcon" class="uploaded-icon-row">
              <div
                :class="['icon-cell', 'icon-cell-image', { 'icon-cell-active': form.icon === uploadedIcon }]"
                @click="form.icon = uploadedIcon"
              >
                <img :src="uploadedIcon" class="icon-img" />
              </div>
              <button class="icon-clear-btn" @click="clearUploadedIcon">删除图片</button>
            </div>

            <!-- 图标网格 -->
            <div class="icon-grid">
              <button
                v-for="icon in iconList"
                :key="icon"
                @click="form.icon = icon"
                :class="['icon-item', { 'icon-active': form.icon === icon }]"
              >{{ icon }}</button>

              <!-- 上传按钮 -->
              <label :class="['icon-item', 'icon-upload', { 'icon-active': form.icon === uploadedIcon && uploadedIcon !== '' }]">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                <span class="upload-text">上传</span>
                <input ref="iconFileInput" type="file" accept="image/*" class="file-input-hidden" @change="onIconFileSelected" />
              </label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="creating = false" class="btn-ghost">取消</button>
          <button @click="save" class="btn-primary">创建</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { getLocal, setLocal } from '../utils/storage'
import IllustrationImage from '../components/IllustrationImage.vue'
import { currentThemeSet } from '../composables/useTheme'

interface Plan {
  id: string
  name: string
  target: number
  current: number
  deadline: string
  icon: string
}

const plans = ref<Plan[]>(getLocal('savingsPlans') || [])
const creating = ref(false)
const iconFileInput = ref<HTMLInputElement | null>(null)
const uploadedIcon = ref<string>('')

// 扩展的预设图标列表（30+ 个，覆盖不同生活场景）
const iconList = [
  '🐷', '🏠', '🚗', '✈️', '💍', '📱',
  '💰', '🎁', '📚', '💻', '🏖️', '🎮',
  '💎', '👜', '👗', '👟', '🎓', '🎨',
  '🎵', '📷', '🏃', '🚲', '🏍️', '⚽',
  '🏀', '🎂', '🍕', '☕', '🍷', '🌍',
  '💝', '🎯', '🎸', '🏋️', '🧘', '🎪',
  '👶', '🖥️', '⌚', '💄',
]

const form = ref({
  name: '',
  target: 0,
  deadline: '',
  icon: '🐷',
})

const totalCurrent = computed(() => plans.value.reduce((s, p) => s + p.current, 0))
const totalTarget = computed(() => plans.value.reduce((s, p) => s + p.target, 0))
const totalPercent = computed(() =>
  totalTarget.value ? Math.min(100, Math.round((totalCurrent.value / totalTarget.value) * 100)) : 0
)

function isImageIcon(icon: string) {
  return icon && icon.startsWith('data:image')
}

function openCreate() {
  form.value = { name: '', target: 0, deadline: '', icon: '🐷' }
  uploadedIcon.value = ''
  creating.value = true
}

function onIconFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files || !input.files[0]) return
  const file = input.files[0]
  if (file.size > 5 * 1024 * 1024) {
    alert('图片大小不能超过 5MB')
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    const dataUrl = reader.result as string
    uploadedIcon.value = dataUrl
    form.value.icon = dataUrl
  }
  reader.readAsDataURL(file)
  input.value = ''
}

function clearUploadedIcon() {
  uploadedIcon.value = ''
  if (isImageIcon(form.value.icon)) {
    form.value.icon = '🐷'
  }
}

function save() {
  if (!form.value.name || form.value.target <= 0) return
  const newPlan: Plan = {
    id: 'sp_' + Date.now(),
    name: form.value.name,
    target: form.value.target,
    current: 0,
    deadline: form.value.deadline || '不限',
    icon: form.value.icon,
  }
  plans.value.push(newPlan)
  setLocal('savingsPlans', plans.value)
  creating.value = false
}

function progress(p: Plan) {
  return Math.min(100, Math.round((p.current / p.target) * 100))
}

function deposit(p: Plan) {
  const amount = parseFloat(prompt('存入金额：') || '0')
  if (amount > 0) {
    p.current += amount
    setLocal('savingsPlans', plans.value)
  }
}

function withdraw(p: Plan) {
  const amount = parseFloat(prompt('取出金额：') || '0')
  if (amount > 0) {
    p.current = Math.max(0, p.current - amount)
    setLocal('savingsPlans', plans.value)
  }
}

function remove(p: Plan) {
  if (!confirm(`删除计划「${p.name}」？`)) return
  plans.value = plans.value.filter(x => x.id !== p.id)
  setLocal('savingsPlans', plans.value)
}
</script>

<style scoped>
.savings-view {
  background: var(--page-bg);
  min-height: 100vh;
  padding-bottom: 100px;
}

.savings-content {
  padding: 0 16px;
}

/* 头部汇总卡片 */
.savings-hero-card {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-soft);
  padding: 20px;
  margin-top: 8px;
  position: relative;
  overflow: hidden;
}

.savings-hero-title {
  font-size: 12px;
  color: var(--text-weak);
  margin-bottom: 12px;
}

.savings-hero-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.savings-hero-current,
.savings-hero-target {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hero-label {
  font-size: 11px;
  color: var(--text-weak);
}

.savings-hero-current .hero-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--primary);
}

.savings-hero-target .hero-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-h1);
}

.savings-hero-arrow {
  font-size: 16px;
  color: var(--divider);
  margin-top: 16px;
}

.savings-hero-progress {
  height: 4px;
  background: var(--divider);
  border-radius: 2px;
  margin-top: 16px;
  overflow: hidden;
}

.savings-hero-progress-bar {
  height: 100%;
  background: var(--primary);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.savings-hero-percent {
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

.savings-add-btn {
  margin-top: 16px;
  width: 100%;
  padding: 14px;
  font-size: 14px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

/* 计划列表 */
.savings-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 20px;
}

.savings-item-card {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-soft);
  padding: 16px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.savings-item-card:active {
  transform: scale(0.98);
}

.savings-item-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.savings-item-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.savings-item-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  background: var(--primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  line-height: 1;
  flex-shrink: 0;
  overflow: hidden;
}

.savings-item-icon .icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.savings-item-info {
  flex: 1;
  min-width: 0;
}

.savings-item-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-h1);
}

.savings-item-meta {
  font-size: 11px;
  color: var(--text-weak);
  margin-top: 2px;
}

.savings-item-right {
  text-align: right;
  flex-shrink: 0;
}

.savings-item-amount {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary);
}

.savings-item-target {
  font-size: 11px;
  color: var(--text-weak);
  margin-top: 2px;
}

.savings-item-progress {
  height: 4px;
  background: var(--divider);
  border-radius: 2px;
  margin-top: 14px;
  overflow: hidden;
}

.savings-item-progress-bar {
  height: 100%;
  background: var(--primary);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.savings-item-progress-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 11px;
  color: var(--text-weak);
}

.savings-item-actions {
  display: flex;
  gap: 8px;
  margin-top: 14px;
}

.action-btn {
  flex: 1;
  padding: 8px 10px;
  font-size: 12px;
  font-weight: 500;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.action-btn:active { transform: scale(0.96); }

.btn-danger {
  background: var(--expense-light);
  color: var(--expense);
}

/* 图标选择区域 */
.icon-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.icon-upload-hint {
  font-size: 11px;
  color: var(--primary);
  cursor: default;
  margin-bottom: 0 !important;
}

/* 已上传的自定义图标 */
.uploaded-icon-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.icon-cell {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: var(--page-bg);
  border: 1.5px solid var(--divider);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  overflow: hidden;
  transition: all 0.15s ease;
}

.icon-cell-image {
  width: 48px;
  height: 48px;
}

.icon-cell-image .icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.icon-cell-active {
  border-color: var(--primary);
  background: var(--primary-light);
}

.icon-clear-btn {
  padding: 4px 10px;
  font-size: 11px;
  background: var(--expense-light);
  color: var(--expense);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.icon-clear-btn:active { transform: scale(0.96); }

/* 图标网格 */
.icon-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}

.icon-item {
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  border: 1.5px solid transparent;
  background: var(--page-bg);
  font-size: 22px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  transition: all 0.15s ease;
  padding: 0;
}

.icon-item:hover { transform: scale(0.98); }
.icon-item:active { transform: scale(0.96); }

.icon-active {
  border-color: var(--primary);
  background: var(--primary-light);
}

/* 上传按钮（置于网格末尾） */
.icon-upload {
  background: var(--card-bg);
  border: 1.5px dashed var(--divider);
  color: var(--text-weak);
  gap: 2px;
}

.icon-upload:hover {
  color: var(--primary);
  border-color: var(--primary);
}

.icon-upload .upload-text {
  font-size: 10px;
  line-height: 1;
  margin-top: 2px;
}

.file-input-hidden {
  display: none;
}

.space-y-3 > * + * { margin-top: 12px; }
.block { display: block; }
.mb-1 { margin-bottom: 4px; }
/* 用户插画 */
.empty-state-illust {
  width: 240px;
  height: 150px;
  margin: 8px auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.empty-state-img {
  width: 240px;
  height: 150px;
  object-fit: cover;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
}
</style>
