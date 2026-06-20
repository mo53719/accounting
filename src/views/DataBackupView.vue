﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿<template>
  <div class="backup-view">
    <div class="page-header">
      <span class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </span>
      <div class="flex-1">
        <h1 class="page-title">数据备份</h1>
        <p class="page-subtitle">将数据保存到本地 / 从备份恢复</p>
      </div>
    </div>

    <div class="backup-content">
      <!-- 上次备份信息卡 -->
      <div class="backup-info-card">
        <div class="backup-info-label">最近备份</div>
        <div class="backup-info-time">{{ lastBackup || '尚未备份' }}</div>
        <div class="backup-info-meta">共 {{ totalCount }} 条记录 · {{ totalSize }}</div>
        <!-- 卡片右上角 -->
        <IllustrationImage
          v-if="currentThemeSet !== 'standard'"
          :theme="currentThemeSet" slot="stickerCorner"
          module-id="backup-info"
          css-class="card-sticker"
        />
      </div>

      <!-- 备份操作区 -->
      <div class="backup-action-card">
        <div class="backup-action-title">备份数据</div>
        <div class="backup-action-desc">选择一种方式，将你的全部数据备份起来</div>

        <div class="backup-list">
          <div class="backup-row" @click="backupLocal">
            <div class="backup-row-icon primary">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </div>
            <div class="backup-row-content">
              <div class="backup-row-title">导出完整备份文件</div>
              <div class="backup-row-meta">导出账单/账本/分类/借条/预算为 v2 JSON</div>
            </div>
            <span class="backup-row-arrow">›</span>
            <!-- 行右侧 mini 贴纸 -->
            <IllustrationImage
              v-if="currentThemeSet !== 'standard'"
              :theme="currentThemeSet" slot="stickerCorner"
              module-id="backup-row"
              css-class="backup-row-sticker"
            />
          </div>
        </div>
      </div>

      <!-- 恢复数据 -->
      <div class="backup-restore-card">
        <div class="backup-restore-title">恢复数据</div>
        <div class="backup-restore-desc">从 v2 JSON 备份文件恢复（将覆盖当前所有数据）</div>
        <button @click="restore" class="btn-primary backup-restore-btn">选择文件恢复</button>
      </div>
    </div>

    <input ref="fileInput" type="file" accept="application/json,.json" class="hidden" @change="handleFile" />

    <!-- 恢复确认弹窗 -->
    <div v-if="showRestoreConfirm" class="modal-mask" @click.self="showRestoreConfirm = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>确认恢复？</h3>
          <span class="modal-close" @click="showRestoreConfirm = false">×</span>
        </div>
        <div class="modal-body">
          <p>即将从备份恢复 <strong>{{ pendingRestoreData?.data?.transactions?.length || 0 }}</strong> 条账单等数据，<strong style="color:var(--expense)">会覆盖当前所有数据</strong>。</p>
          <p style="margin-top:8px;color:var(--text-weak);font-size:12px;">建议先导出当前数据再恢复，避免误操作。</p>
        </div>
        <div class="modal-footer">
          <button class="btn-ghost" @click="showRestoreConfirm = false">取消</button>
          <button class="btn-primary" @click="confirmRestore">确认恢复</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTransaction } from '../composables/useTransaction'
import { getLocal, setLocal } from '../utils/storage'
import { useBookStore } from '../stores/book'
import { useCategoryStore } from '../stores/category'
import { useLendBorrowStore } from '../stores/lendBorrow'
import IllustrationImage from '../components/IllustrationImage.vue'
import { currentThemeSet } from '../composables/useTheme'
import dayjs from 'dayjs'

const { transactions, setTransactions } = useTransaction()
const bookStore = useBookStore()
const categoryStore = useCategoryStore()
const lendBorrowStore = useLendBorrowStore()

const lastBackup = ref<string>(getLocal('lastBackup') || '')
const fileInput = ref<HTMLInputElement | null>(null)
const showRestoreConfirm = ref(false)
const pendingRestoreData = ref<any>(null)

const totalCount = computed(() => transactions.value.length)
const totalSize = computed(() => {
  // 估算整体大小（含所有表）
  const all = {
    transactions: transactions.value,
    books: bookStore.books,
    members: bookStore.members,
    budgets: bookStore.budgets,
    monthBudgets: bookStore.monthBudgets,
    customCategories: categoryStore.customCategories,
    lendBorrow: lendBorrowStore.records,
  }
  const size = JSON.stringify(all).length
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB'
  return (size / 1024 / 1024).toFixed(2) + ' MB'
})

function downloadJSON(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function backupLocal() {
  try {
    // 修 0-6：v2 格式全表备份
    const payload = {
      version: 2,
      exportedAt: new Date().toISOString(),
      appName: '小余简单记',
      data: {
        transactions: transactions.value,
        books: bookStore.books,
        members: bookStore.members,
        budgets: bookStore.budgets,
        monthBudgets: { ...bookStore.monthBudgets },
        customCategories: categoryStore.customCategories,
        lendBorrow: lendBorrowStore.records,
      },
    }
    downloadJSON(payload, `记账备份_v2_${dayjs().format('YYYY-MM-DD_HHmm')}.json`)
    lastBackup.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
    setLocal('lastBackup', lastBackup.value)
    alert(`备份完成！\n共 ${transactions.value.length} 条账单，${bookStore.books.length} 个账本`)
  } catch (e) {
    console.error('备份失败', e)
    alert('备份失败：' + (e instanceof Error ? e.message : String(e)))
  }
}

function restore() {
  fileInput.value?.click()
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

function handleFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  // 清空 input value 以便下次选同一文件还能触发 change
  if (fileInput.value) fileInput.value.value = ''

  // 修 0-7：大小限制
  if (file.size > MAX_FILE_SIZE) {
    alert(`文件过大（${(file.size / 1024 / 1024).toFixed(1)}MB），超过 50MB 上限。`)
    return
  }

  const reader = new FileReader()
  reader.onload = (ev) => {
    try {
      const text = ev.target!.result as string
      const data = JSON.parse(text)
      // 校验格式
      if (!data || typeof data !== 'object') {
        alert('文件格式不正确：根节点不是对象')
        return
      }
      if (data.version !== 2) {
        alert(`文件版本不匹配（当前仅支持 v2，您的是 v${data.version || '未知'}）。请使用本应用导出的最新备份文件。`)
        return
      }
      if (!data.data || typeof data.data !== 'object') {
        alert('文件格式不正确：缺少 data 节点')
        return
      }
      // 进入二次确认
      pendingRestoreData.value = data
      showRestoreConfirm.value = true
    } catch (err) {
      console.error('文件解析失败', err)
      alert('文件读取失败：' + (err instanceof Error ? err.message : '未知错误'))
    }
  }
  reader.onerror = () => {
    alert('文件读取失败')
  }
  reader.readAsText(file)
}

function confirmRestore() {
  const data = pendingRestoreData.value
  if (!data) return
  try {
    const d = data.data
    // 逐项写回（带 try/catch，单项失败不影响其它）
    if (Array.isArray(d.transactions)) setTransactions(d.transactions)
    if (Array.isArray(d.books) && d.books.length > 0) {
      bookStore.books.splice(0, bookStore.books.length, ...d.books)
      bookStore.saveBooks()
    }
    if (Array.isArray(d.members)) {
      bookStore.members.splice(0, bookStore.members.length, ...d.members)
      // 通过 addMember 单个调用保证 IDB 写入
      bookStore.members.splice(0) // 清空
      d.members.forEach((m: any) => bookStore.addMember(m))
    }
    if (d.budgets && typeof d.budgets === 'object') {
      Object.assign(bookStore.budgets, d.budgets)
      bookStore.setBudget('day', bookStore.budgets.day) // 触发 IDB 写
    }
    if (d.monthBudgets && typeof d.monthBudgets === 'object') {
      // 清空后逐月写
      for (const k of Object.keys(bookStore.monthBudgets)) bookStore.removeMonthBudget(k)
      for (const [k, v] of Object.entries(d.monthBudgets as Record<string, number>)) {
        if (typeof v === 'number' && v > 0) bookStore.setMonthBudget(k, v)
      }
    }
    if (Array.isArray(d.customCategories)) {
      // 清空后逐个写
      const olds = [...categoryStore.customCategories]
      olds.forEach(c => categoryStore.removeCustomCategory(c.id))
      d.customCategories.forEach((c: any) => categoryStore.addCustomCategory(c))
    }
    if (Array.isArray(d.lendBorrow)) {
      lendBorrowStore.setRecords(d.lendBorrow)
    }
    showRestoreConfirm.value = false
    pendingRestoreData.value = null
    alert(`恢复成功！\n账单 ${d.transactions?.length || 0} 条 / 账本 ${d.books?.length || 0} 个 / 借条 ${d.lendBorrow?.length || 0} 条`)
  } catch (e) {
    console.error('恢复失败', e)
    alert('恢复失败：' + (e instanceof Error ? e.message : String(e)))
  }
}
</script>

<style scoped>
.backup-view {
  background: var(--page-bg);
  min-height: 100vh;
  padding-bottom: 100px;
}

.backup-content {
  padding: 0 16px;
}

/* 最近备份信息卡 */
.backup-info-card {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-soft);
  padding: 20px;
  margin-top: 8px;
  position: relative;
  overflow: hidden;
}

.backup-info-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary) 0%, var(--primary-light) 100%);
}

.backup-info-label {
  font-size: 12px;
  color: var(--text-weak);
}

.backup-info-time {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-h1);
  margin-top: 6px;
}

.backup-info-meta {
  font-size: 12px;
  color: var(--text-body);
  margin-top: 6px;
}

/* 备份操作区大卡 */
.backup-action-card {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-soft);
  padding: 20px;
  margin-top: 16px;
  position: relative;
}

.backup-action-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-h1);
}

.backup-action-desc {
  font-size: 12px;
  color: var(--text-weak);
  margin-top: 4px;
  margin-bottom: 16px;
}

.backup-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.backup-row {
  background: var(--page-bg);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
  position: relative;
}

.backup-row:hover {
  transform: scale(0.98);
  background: var(--primary-light);
}

.backup-row:active {
  transform: scale(0.96);
}

.backup-row-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.backup-row-icon.primary {
  background: var(--primary-light);
  color: var(--primary);
}

.backup-row-content {
  flex: 1;
  min-width: 0;
}

.backup-row-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-h1);
}

.backup-row-meta {
  font-size: 11px;
  color: var(--text-weak);
  margin-top: 2px;
}

.backup-row-arrow {
  font-size: 18px;
  color: var(--text-weak);
  flex-shrink: 0;
}

/* 恢复数据卡 */
.backup-restore-card {
  background: var(--vip-light);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-soft);
  padding: 20px;
  margin-top: 16px;
  text-align: center;
}

.backup-restore-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--vip-gold);
}

.backup-restore-desc {
  font-size: 12px;
  color: var(--text-body);
  margin-top: 4px;
  margin-bottom: 14px;
}

.backup-restore-btn {
  background: var(--vip-gold);
  color: #FFFFFF;
  width: 100%;
  padding: 12px;
  font-size: 14px;
  font-weight: 500;
}

.backup-restore-btn:hover {
  transform: scale(0.98);
  opacity: 0.95;
}

.backup-restore-btn:active {
  transform: scale(0.96);
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
  z-index: var(--z-illustration-corner, 2);
}
.card-sticker {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 26px;
  height: 26px;
  border-radius: 5px;
  opacity: 0.85;
  pointer-events: none;
  z-index: var(--z-illustration-corner, 2);
}
.backup-row-sticker {
  position: absolute;
  right: 30px;
  bottom: 8px;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  opacity: 0.75;
  pointer-events: none;
  z-index: var(--z-illustration-corner, 2);
}

.hidden { display: none; }

/* 恢复确认弹窗 */
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: var(--z-modal-mask, 90);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-card {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  padding: 20px;
  width: 320px;
  max-width: 92vw;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  z-index: var(--z-modal-content, 95);
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.modal-header h3 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-h1);
}
.modal-close {
  font-size: 24px;
  line-height: 1;
  color: var(--text-weak);
  cursor: pointer;
}
.modal-body {
  font-size: 13px;
  color: var(--text-body);
  line-height: 1.6;
  margin-bottom: 16px;
}
.modal-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
.btn-ghost {
  padding: 8px 14px;
  background: var(--page-bg);
  color: var(--text-body);
  border: none;
  border-radius: var(--radius-md);
  font-size: 13px;
  cursor: pointer;
}
.btn-primary {
  padding: 8px 14px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-size: 13px;
  cursor: pointer;
}
</style>
