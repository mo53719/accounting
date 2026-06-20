<template>
  <div class="page min-h-screen pb-24">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()" aria-label="返回">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <div class="title-wrap">
        <h1 class="page-title">标签管理</h1>
        <p class="page-subtitle">为账单打上标签便于归类</p>
      </div>
    </div>

    <div class="content">
      <!-- 添加区 -->
      <div class="input-row">
        <span class="input-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
            <line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
        </span>
        <input
          v-model="newTag"
          placeholder="输入新标签..."
          class="tag-input"
          @keydown.enter="addNew"
        />
        <button @click="addNew" class="btn-primary add-btn" aria-label="添加标签">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      <!-- 空状态：海贼王一套 + standard 主题 MangaMascot -->
      <div v-if="tags.length === 0" class="empty-state">
        <div class="empty-state-comic">
          <IllustrationImage
            v-if="currentThemeSet !== 'standard'" :theme="currentThemeSet" slot="emptySavings"
            module-id="tags-empty"
            css-class="empty-state-img"
          />
          <MangaMascot v-else-if="currentThemeSet === 'standard'" size="large" />
        </div>
        <p class="empty-state-title">暂无自定义标签</p>
        <p class="empty-state-desc">添加标签，给账单精细化归类</p>
        <button class="btn-primary empty-state-cta" @click="addNew">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>添加第一个标签</span>
        </button>
      </div>

      <!-- 已有标签：每行独立卡片 -->
      <div v-else class="tags-list">
        <div
          v-for="t in tags"
          :key="t"
          class="tag-card"
        >
          <span class="tag-icon">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
            <circle cx="7" cy="7" r="1.5" fill="currentColor"/>
          </svg>
          </span>
          <span class="tag-hash">#</span>
          <span class="tag-text">{{ t }}</span>
          <span class="tag-count">{{ countByTag(t) }}</span>
          <button class="tag-close" @click.stop="removeTag(t)" aria-label="删除标签">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <!-- 卡片右下角：海贼王 mini 贴纸 -->
          <IllustrationImage
            v-if="currentThemeSet !== 'standard'"
            :theme="currentThemeSet" slot="emptySavings"
            :module-id="`tags-card-${t}`"
            css-class="tag-card-sticker"
          />
        </div>
      </div>

      <!-- 提示卡 -->
      <div v-if="tags.length" class="tip-card">
        <span class="tip-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        </span>
        <p class="tip-text">在记账页备注中输入 <span class="tip-mono">#标签</span> 即可为账单打标签</p>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="confirmVisible" class="modal-mask" @click.self="cancelRemove">
      <div class="modal-card">
        <!-- 弹窗右上角：海贼王 mini 贴纸 -->
        <IllustrationImage
          v-if="currentThemeSet !== 'standard'" :theme="currentThemeSet" slot="stickerCorner"
          :module-id="`tags-modal-${pendingTag || 'default'}`"
          css-class="modal-sticker"
          :style-obj="{ top: '6px', right: '6px', width: '26px', height: '26px', borderRadius: '6px' }"
        />
        <div class="modal-header">
          <h3>删除标签</h3>
          <button class="modal-close" @click="cancelRemove" aria-label="关闭">&times;</button>
        </div>
        <div class="modal-body">
          <p>确定删除标签 <span class="confirm-tag">#{{ pendingTag }}</span>？</p>
        </div>
        <div class="modal-footer">
          <button class="btn-ghost" @click="cancelRemove">取消</button>
          <button class="btn-primary" @click="confirmRemove">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTransaction } from '../composables/useTransaction'
import { getLocal, setLocal } from '../utils/storage'
import MangaMascot from '../components/MangaMascot.vue'
import IllustrationImage from '../components/IllustrationImage.vue'
import { currentThemeSet } from '../composables/useTheme'

const { transactions } = useTransaction()

const customTags = ref<string[]>(getLocal('customTags') || [])
const newTag = ref('')
const confirmVisible = ref(false)
const pendingTag = ref('')

const allTags = computed(() => {
  const set = new Set<string>(customTags.value)
  for (const t of transactions.value) {
    if (t.note) {
      const matches = t.note.match(/#([^\s#]+)/g)
      if (matches) {
        matches.forEach(m => set.add(m.slice(1)))
      }
    }
    if (t.tags) t.tags.forEach(tg => set.add(tg))
  }
  return Array.from(set).sort()
})

const tags = allTags

function countByTag(tag: string) {
  return transactions.value.filter(t => {
    if (t.tags && t.tags.includes(tag)) return true
    if (t.note && t.note.includes('#' + tag)) return true
    return false
  }).length
}

function addNew() {
  const t = newTag.value.trim().replace(/^#/, '')
  if (!t) return
  if (!customTags.value.includes(t)) {
    customTags.value.push(t)
    setLocal('customTags', customTags.value)
  }
  newTag.value = ''
}

function removeTag(t: string) {
  pendingTag.value = t
  confirmVisible.value = true
}

function cancelRemove() {
  confirmVisible.value = false
  pendingTag.value = ''
}

function confirmRemove() {
  const t = pendingTag.value
  customTags.value = customTags.value.filter(x => x !== t)
  setLocal('customTags', customTags.value)
  confirmVisible.value = false
  pendingTag.value = ''
}
</script>

<style scoped>
.page {
  background: var(--page-bg);
}

.page-header {
  padding: 50px 16px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

/* 头部右上角 mini 贴纸 */
.page-header-sticker {
  position: absolute;
  top: 50px;
  right: 16px;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  flex-shrink: 0;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  cursor: pointer;
  color: var(--text-h1);
  background: none;
  border: none;
  padding: 0;
  border-radius: 50%;
  transition: background 0.15s;
  flex-shrink: 0;
}
.back-btn:active { background: var(--primary-light); }

.title-wrap { flex: 1; min-width: 0; }
.page-title {
  font-size: 22px;
  font-weight: 600;
  color: var(--text-h1);
  line-height: 1.3;
}
.page-subtitle {
  font-size: 12px;
  color: var(--text-weak);
  margin-top: 2px;
}

.content {
  padding: 8px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 添加区 */
.input-row {
  display: flex;
  align-items: center;
  padding: 8px 10px 8px 14px;
  gap: 8px;
  background: var(--primary-light);
  border: 1px solid var(--divider);
  border-radius: var(--radius-lg);
  transition: all 0.2s;
}
.input-row:focus-within {
  background: var(--primary-light);
  border-color: var(--primary);
}

.input-icon {
  display: flex;
  align-items: center;
  color: var(--primary);
  flex-shrink: 0;
}

.tag-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  outline: none;
  color: var(--text-h1);
  padding: 10px 0;
  font-family: inherit;
}
.tag-input::placeholder { color: var(--text-weak); }

.add-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}
.add-btn:active { transform: scale(0.92); }

/* 标签列表：每行独立卡片 */
.tags-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tag-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: var(--card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-soft);
  transition: transform 0.15s, box-shadow 0.15s;
  position: relative;
}
.tag-card:active {
  transform: scale(0.99);
  box-shadow: var(--shadow-hover);
}

/* 卡片右下角 mini 贴纸 */
.tag-card-sticker {
  position: absolute;
  right: 38px;
  bottom: 6px;
  width: 22px;
  height: 22px;
  border-radius: 5px;
  opacity: 0.85;
  pointer-events: none;
}

.tag-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--primary-light);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tag-hash {
  color: var(--primary);
  font-weight: 600;
  font-size: 14px;
}
.tag-text {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-h1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.tag-count {
  font-size: 12px;
  color: var(--text-weak);
  background: var(--primary-light);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.tag-close {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--page-bg);
  color: var(--text-weak);
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}
.tag-close:hover,
.tag-close:active {
  background: var(--expense-light);
  color: var(--expense);
}

/* 提示卡 */
.tip-card {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 14px;
  background: var(--vip-light);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--vip-gold);
}
.tip-icon {
  color: var(--vip-gold);
  flex-shrink: 0;
  margin-top: 1px;
}
.tip-text {
  font-size: 12px;
  color: var(--text-body);
  line-height: 1.5;
}
.tip-mono {
  font-family: 'SF Mono', Menlo, Monaco, Consolas, monospace;
  background: var(--vip-light);
  padding: 1px 6px;
  border-radius: var(--radius-sm);
  color: var(--vip-gold);
  font-weight: 500;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px 20px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
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
.empty-state-cta { margin-top: 8px; }

/* 弹窗贴纸（占位定位，由 :style-obj 覆盖） */
.modal-sticker {
  position: absolute;
  z-index: 2;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

/* 删除确认弹窗 */
.confirm-tag {
  color: var(--primary);
  font-weight: 600;
}
</style>
