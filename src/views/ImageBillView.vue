﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿<template>
  <div class="page min-h-screen pb-24">
    <div class="page-header">
      <span class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </span>
      <div class="flex-1">
        <h1 class="page-title">账单图片</h1>
        <p class="page-subtitle">上传小票、发票等凭证图片</p>
      </div>
    </div>

    <div class="px-5 space-y-3">
      <button @click="triggerUpload" class="btn-primary w-full">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        上传图片
      </button>

      <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="handleFile" />

      <div v-if="images.length === 0" class="empty-state">
        <div class="empty-state-illust">
          <IllustrationImage
            v-if="currentThemeSet !== 'standard'" :theme="currentThemeSet" slot="emptySavings"
            module-id="image-bill-empty"
            css-class="empty-state-img"
          />
          <svg v-else viewBox="0 0 120 100" width="120" height="100" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="20" y="24" width="80" height="60" rx="6" fill="var(--primary-soft)"/>
            <circle cx="42" cy="46" r="6" fill="var(--bg-card)" stroke="var(--primary-light)"/>
            <path d="M20 76 L48 56 L70 70 L88 50 L100 60 L100 84 L20 84 Z" fill="var(--primary-lighter)" stroke="none"/>
          </svg>
        </div>
        <p class="empty-state-title">还没有图片</p>
        <p class="empty-state-desc">上传小票、发票、合同等图片凭证</p>
        <button @click="triggerUpload" class="btn-primary empty-state-cta">上传第一张图片</button>
      </div>

      <div v-else class="grid grid-cols-3 gap-2">
        <div
          v-for="img in images"
          :key="img.id"
          class="relative aspect-square card-md overflow-hidden cursor-pointer"
          style="border-radius: var(--radius-card);"
          @click="preview = img"
        >
          <img :src="img.data" class="w-full h-full object-cover" />
          <button
            @click.stop="remove(img.id)"
            class="absolute top-1 right-1 w-6 h-6 rounded-full text-xs flex items-center justify-center"
            style="background: rgba(0,0,0,0.6); color: #FFFFFF; border: none; cursor: pointer;"
          >×</button>
        </div>
      </div>
    </div>

    <!-- 预览 -->
    <div v-if="preview" class="modal-mask" @click.self="preview = null">
      <div class="text-center">
        <img :src="preview.data" class="max-w-full max-h-[80vh] rounded-2xl" />
        <p class="text-white text-sm mt-3">{{ preview.name }} · {{ preview.size }}</p>
        <p class="text-xs mt-1" style="color: rgba(255,255,255,0.7);">{{ preview.date }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getLocal, setLocal } from '../utils/storage'
import IllustrationImage from '../components/IllustrationImage.vue'
import { currentThemeSet } from '../composables/useTheme'
import dayjs from 'dayjs'

interface ImageItem {
  id: string
  name: string
  data: string
  size: string
  date: string
}

const fileInput = ref<HTMLInputElement | null>(null)
const images = ref<ImageItem[]>(getLocal('billImages') || [])
const preview = ref<ImageItem | null>(null)

function triggerUpload() {
  fileInput.value?.click()
}

function handleFile(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  for (const file of Array.from(files)) {
    const reader = new FileReader()
    reader.onload = (ev) => {
      const data = ev.target!.result as string
      const sizeKb = file.size / 1024
      const sizeText = sizeKb < 1024 ? sizeKb.toFixed(1) + ' KB' : (sizeKb / 1024).toFixed(2) + ' MB'
      images.value.unshift({
        id: 'img_' + Date.now() + Math.random(),
        name: file.name,
        data,
        size: sizeText,
        date: dayjs().format('YYYY-MM-DD HH:mm'),
      })
      save()
    }
    reader.readAsDataURL(file)
  }
  (e.target as HTMLInputElement).value = ''
}

function remove(id: string) {
  if (!confirm('删除这张图片？')) return
  images.value = images.value.filter(i => i.id !== id)
  save()
}

function save() {
  try {
    setLocal('billImages', images.value)
  } catch (e) {
    alert('图片存储已满，请删除一些旧图片')
  }
}
</script>

<style scoped>
.hidden { display: none; }

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
.empty-state-img {
  width: 240px;
  height: 150px;
  object-fit: cover;
  border-radius: var(--radius-md);
  animation: float 3s ease-in-out infinite;
  user-select: none;
  -webkit-user-drag: none;
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
</style>
