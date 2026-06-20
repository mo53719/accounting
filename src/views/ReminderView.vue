﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿<template>
  <div class="page">
    <div class="page-header">
      <span class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </span>
      <div class="flex-1">
        <h1 class="page-title">记账提醒</h1>
        <p class="page-subtitle">设置每日提醒时间</p>
      </div>
    </div>

    <div class="page-body">
      <!-- 启用提醒开关：独立白色卡片 -->
      <div class="reminder-card">
        <div class="reminder-icon-wrap">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </div>
        <div class="reminder-info">
          <p class="title">启用提醒</p>
          <p class="meta">{{ enabled ? '已开启' : '已关闭' }}</p>
        </div>
        <div class="toggle" :class="{ on: enabled }" @click="enabled = !enabled">
          <div class="toggle-dot"></div>
        </div>
        <!-- 卡片右上角：海贼王 mini 贴纸 -->
        <IllustrationImage
          v-if="currentThemeSet !== 'standard'"
          :theme="currentThemeSet" slot="stickerCorner"
          module-id="reminder-enable"
          css-class="card-sticker"
        />
      </div>

      <!-- 提醒列表：每条独立白色卡片 -->
      <div v-for="r in reminders" :key="r.id" class="reminder-card">
        <div class="reminder-icon-wrap">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 7v5l3 2"/>
          </svg>
        </div>
        <div class="reminder-info">
          <p class="title">{{ r.label }}</p>
          <p class="meta">{{ r.time }} · {{ r.repeat }}</p>
        </div>
        <div class="toggle small" :class="{ on: r.enabled }" @click="r.enabled = !r.enabled">
          <div class="toggle-dot"></div>
        </div>
        <!-- 行右侧 mini 贴纸 -->
        <IllustrationImage
          v-if="currentThemeSet !== 'standard'"
          :theme="currentThemeSet" slot="stickerCorner"
          :module-id="`reminder-row-${r.id}`"
          css-class="reminder-sticker"
        />
      </div>

      <!-- 添加提醒按钮 -->
      <button @click="openAdd" class="btn-primary add-btn">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        添加提醒
      </button>

      <!-- 底部提示：浅米色 -->
      <div class="tip-card">
        <div class="tip-icon">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        </div>
        <div class="tip-text">
          <p class="tip-title">提示</p>
          <p class="tip-desc">在 Android APP 中，记账提醒将通过本地通知送达；在浏览器中仅作占位。</p>
        </div>
      </div>
    </div>

    <!-- 添加弹窗 -->
    <div v-if="adding" class="modal-mask" @click.self="adding = false">
      <div class="modal-card">
        <!-- 弹窗右上角 -->
        <IllustrationImage
          v-if="currentThemeSet !== 'standard'" :theme="currentThemeSet" slot="stickerCorner"
          module-id="reminder-modal"
          css-class="modal-sticker"
          :style-obj="{ top: '6px', right: '6px', width: '26px', height: '26px', borderRadius: '6px' }"
        />
        <div class="modal-header">
          <h3>添加提醒</h3>
          <span class="modal-close" @click="adding = false">×</span>
        </div>
        <div class="modal-body">
          <div class="field">
            <label class="caption">提醒名称</label>
            <input v-model="form.label" placeholder="如：睡前记账" class="input" />
          </div>
          <div class="field">
            <label class="caption">时间</label>
            <input v-model="form.time" type="time" class="input" />
          </div>
          <div class="field">
            <label class="caption">重复</label>
            <select v-model="form.repeat" class="input">
              <option>每天</option>
              <option>周一至周五</option>
              <option>周末</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="adding = false" class="btn-secondary">取消</button>
          <button @click="save" class="btn-primary">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getLocal, setLocal } from '../utils/storage'
import IllustrationImage from '../components/IllustrationImage.vue'
import { currentThemeSet } from '../composables/useTheme'

interface Reminder {
  id: string
  label: string
  time: string
  repeat: string
  enabled: boolean
}

const enabled = ref(getLocal('reminderEnabled') === 'true')
const reminders = ref<Reminder[]>(getLocal('reminders') || [
  { id: 'r1', label: '晚上记账', time: '21:00', repeat: '每天', enabled: true },
  { id: 'r2', label: '中午记账', time: '12:30', repeat: '周一至周五', enabled: false },
])
const adding = ref(false)
const form = ref({ label: '', time: '21:00', repeat: '每天' })

function openAdd() {
  form.value = { label: '', time: '21:00', repeat: '每天' }
  adding.value = true
}

function save() {
  if (!form.value.label) return
  reminders.value.push({
    id: 'r_' + Date.now(),
    label: form.value.label,
    time: form.value.time,
    repeat: form.value.repeat,
    enabled: true,
  })
  setLocal('reminders', reminders.value)
  setLocal('reminderEnabled', String(enabled.value))
  adding.value = false
}
</script>

<style scoped>
.page {
  background: var(--page-bg);
  min-height: 100vh;
  padding-bottom: 40px;
}
.flex-1 { flex: 1; min-width: 0; }

.page-body {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 开关行 */
.reminder-switch-card {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-soft);
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.reminder-card {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-soft);
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.reminder-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--primary-light);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.reminder-icon-wrap:nth-child(1) { /* 图标容器自己 */ }
.reminder-switch-text,
.reminder-info {
  flex: 1;
  min-width: 0;
}
.reminder-switch-text .title,
.reminder-info .title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-h1);
}
.reminder-switch-text .meta,
.reminder-info .meta {
  font-size: 12px;
  color: var(--text-weak);
  margin-top: 2px;
}

/* 开关组件 */
.toggle {
  width: 44px;
  height: 26px;
  border-radius: 14px;
  background: var(--divider);
  position: relative;
  transition: background 0.2s;
  cursor: pointer;
  flex-shrink: 0;
}
.toggle.on { background: var(--primary); }
.toggle-dot {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--card-bg);
  box-shadow: var(--shadow-soft);
  transition: left 0.2s;
}
.toggle.on .toggle-dot { left: 21px; }

/* 添加按钮 */
.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 20px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  border: none;
  background: var(--primary);
  color: #fff;
  cursor: pointer;
  transition: transform 0.15s;
  box-shadow: var(--shadow-soft);
}
.add-btn:active { transform: scale(0.96); opacity: 0.95; }

/* 提示卡 */
.tip-card {
  background: var(--vip-light);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.tip-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--vip-light);
  color: var(--vip-gold);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.tip-text { flex: 1; min-width: 0; }
.tip-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-h1);
  margin-bottom: 2px;
}
.tip-desc {
  font-size: 12px;
  color: var(--text-weak);
  line-height: 1.5;
}

/* 弹窗 */
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 200;
}
.modal-card {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 360px;
  overflow: hidden;
  box-shadow: var(--shadow-float, 0 8px 28px rgba(0,0,0,0.12));
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid var(--divider);
}
.modal-header h3 { font-size: 16px; font-weight: 600; color: var(--text-h1); }
.modal-close {
  font-size: 24px;
  color: var(--text-weak);
  line-height: 1;
  cursor: pointer;
}
.modal-body { padding: 16px 18px 8px; }
.field { margin-bottom: 12px; }
.caption { font-size: 12px; color: var(--text-weak); display: block; margin-bottom: 6px; }

.input {
  width: 100%;
  background: var(--page-bg);
  border: none;
  border-radius: var(--radius-md);
  padding: 10px 14px;
  font-size: 14px;
  color: var(--text-h1);
  outline: none;
  transition: background 0.15s;
}
.input:focus { background: var(--primary-light); box-shadow: 0 0 0 1px var(--primary); }
.input::placeholder { color: var(--text-weak); }

.modal-footer {
  display: flex;
  gap: 8px;
  padding: 12px 18px 18px;
}
.btn-secondary {
  flex: 1;
  background: transparent;
  color: var(--primary);
  border: 1px solid var(--primary);
  border-radius: var(--radius-md);
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.15s;
}
.btn-secondary:active { transform: scale(0.96); background: var(--primary-light); }
.btn-primary {
  flex: 1;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.15s;
}
.btn-primary:active { transform: scale(0.96); opacity: 0.95; }

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
.card-sticker {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 22px;
  height: 22px;
  border-radius: 5px;
  opacity: 0.8;
  pointer-events: none;
}
.reminder-sticker {
  position: absolute;
  right: 60px;
  bottom: 6px;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  opacity: 0.7;
  pointer-events: none;
}
.modal-sticker {
  position: absolute;
  z-index: 2;
}
</style>
