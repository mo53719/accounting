﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿<template>
  <div class="export-view">
    <div class="page-header">
      <span class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </span>
      <div class="flex-1">
        <h1 class="page-title">导入导出</h1>
        <p class="page-subtitle">多种格式导入与导出</p>
      </div>
    </div>

    <div class="export-content">
      <!-- 两张并排卡片 -->
      <div class="export-grid">
        <!-- 导出卡 -->
        <div class="export-card export-card-primary">
          <div class="export-card-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </div>
          <div class="export-card-title">导出数据</div>
          <div class="export-card-desc">{{ transactions.length }} 条记录可选格式下载</div>
          <!-- 卡片右上角 -->
          <IllustrationImage
            v-if="currentThemeSet !== 'standard'"
            :theme="currentThemeSet" slot="stickerCorner"
            module-id="export-card-export"
            css-class="card-sticker"
          />

          <div class="export-options">
            <div class="export-option" @click="exportAs('json')">
              <span class="export-option-label">JSON</span>
              <span class="export-option-arrow">›</span>
            </div>
            <div class="export-option" @click="exportAs('csv')">
              <span class="export-option-label">CSV</span>
              <span class="export-option-arrow">›</span>
            </div>
            <div class="export-option" @click="exportAs('excel')">
              <span class="export-option-label">Excel</span>
              <span class="export-option-arrow">›</span>
            </div>
          </div>
        </div>

        <!-- 导入卡 -->
        <div class="export-card export-card-expense">
          <div class="export-card-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <div class="export-card-title">导入数据</div>
          <div class="export-card-desc">从其它 APP 导入账单</div>
          <!-- 卡片右上角 -->
          <IllustrationImage
            v-if="currentThemeSet !== 'standard'"
            :theme="currentThemeSet" slot="stickerCorner"
            module-id="export-card-import"
            css-class="card-sticker"
          />

          <div class="export-options">
            <div class="export-option" @click="importFrom('json')">
              <span class="export-option-label">从 JSON</span>
              <span class="export-option-arrow">›</span>
            </div>
            <div class="export-option" @click="importFrom('csv')">
              <span class="export-option-label">从 CSV</span>
              <span class="export-option-arrow">›</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <input ref="fileInput" type="file" accept=".json,.csv" class="hidden" @change="handleFile" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTransaction } from '../composables/useTransaction'
import IllustrationImage from '../components/IllustrationImage.vue'
import { currentThemeSet } from '../composables/useTheme'
import dayjs from 'dayjs'

const { transactions, setTransactions } = useTransaction()
const fileInput = ref<HTMLInputElement | null>(null)

function downloadBlob(content: string, type: string, filename: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function exportAs(format: string) {
  const ts = dayjs().format('YYYY-MM-DD_HHmm')
  if (format === 'json') {
    downloadBlob(
      JSON.stringify({ version: 1, exportedAt: dayjs().toISOString(), transactions: transactions.value }, null, 2),
      'application/json',
      `记账_${ts}.json`
    )
  } else if (format === 'csv' || format === 'excel') {
    const header = '\uFEFF日期,类型,分类,金额,支付方式,备注,记账人\n'
    const rows = transactions.value.map(t =>
      [t.date, t.type === 'expense' ? '支出' : '收入', t.category, t.amount.toFixed(2), t.paymentMethod || '', (t.note || '').replace(/,/g, '，'), t.createdBy].join(',')
    ).join('\n')
    downloadBlob(header + rows, 'text/csv;charset=utf-8', `记账_${ts}.${format === 'csv' ? 'csv' : 'xls'}`)
  }
}

function importFrom(format: string) {
  fileInput.value?.click()
}

function handleFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!confirm('导入将追加到当前数据，是否继续？')) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    try {
      const text = ev.target!.result as string
      if (file.name.endsWith('.json')) {
        const data = JSON.parse(text)
        if (data.transactions && Array.isArray(data.transactions)) {
          setTransactions([...data.transactions, ...transactions.value])
          alert('导入成功 ' + data.transactions.length + ' 条')
        }
      } else {
        const lines = text.replace(/^\uFEFF/, '').split('\n').slice(1).filter(l => l.trim())
        const imported = lines.map((line, idx) => {
          const cols = line.split(',')
          return {
            objectId: 'import_' + Date.now() + '_' + idx,
            bookId: '',
            type: cols[1] === '支出' ? 'expense' : 'income',
            amount: parseFloat(cols[3]) || 0,
            date: cols[0] || dayjs().format('YYYY-MM-DD'),
            category: cols[2] || '其他',
            paymentMethod: cols[4] || '',
            note: cols[5] || '',
            createdBy: cols[6] || '我',
            createdAt: dayjs().toISOString(),
            updatedAt: dayjs().toISOString(),
          }
        })
        setTransactions([...imported, ...transactions.value])
        alert('导入成功 ' + imported.length + ' 条')
      }
    } catch (err) {
      alert('导入失败：' + (err as Error).message)
    }
  }
  if (file.name.endsWith('.json')) reader.readAsText(file)
  else reader.readAsText(file, 'GBK')
}
</script>

<style scoped>
.export-view {
  background: var(--page-bg);
  min-height: 100vh;
  padding-bottom: 100px;
}

.export-content {
  padding: 0 16px;
  margin-top: 8px;
}

/* 两张并排卡片 */
.export-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.export-card {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-soft);
  padding: 20px;
  position: relative;
  overflow: hidden;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.export-card:hover {
  transform: scale(0.98);
  box-shadow: var(--shadow-hover);
}

.export-card:active {
  transform: scale(0.96);
}

.export-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.export-card-primary::before {
  background: linear-gradient(90deg, var(--primary) 0%, var(--primary-light) 100%);
}

.export-card-expense::before {
  background: linear-gradient(90deg, var(--expense) 0%, var(--expense-light) 100%);
}

.export-card-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.export-card-primary .export-card-icon {
  background: var(--primary-light);
  color: var(--primary);
}

.export-card-expense .export-card-icon {
  background: var(--expense-light);
  color: var(--expense);
}

.export-card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-h1);
}

.export-card-desc {
  font-size: 12px;
  color: var(--text-weak);
  margin-top: 4px;
  margin-bottom: 16px;
}

.export-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.export-option {
  background: var(--page-bg);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease;
}

.export-card-primary .export-option:hover {
  background: var(--primary-light);
  transform: scale(0.98);
}

.export-card-expense .export-option:hover {
  background: var(--expense-light);
  transform: scale(0.98);
}

.export-option:active {
  transform: scale(0.96);
}

.export-option-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-h1);
}

.export-card-primary .export-option-arrow {
  font-size: 18px;
  color: var(--primary);
}

.export-card-expense .export-option-arrow {
  font-size: 18px;
  color: var(--expense);
}

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
.card-sticker {
  position: absolute;
  top: 16px;
  right: 12px;
  width: 24px;
  height: 24px;
  border-radius: 5px;
  opacity: 0.85;
  pointer-events: none;
  z-index: 1;
}

/* 在较宽屏幕时让两张卡片并排 */
@media (min-width: 640px) {
  .export-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
