﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿<template>
  <div class="settings-page">
    <!-- 极淡全屏 IP 暗纹（铺满整个页面底层 z-index:0） -->
    <PaintedScene :ip="ipForPainted" />

    <!-- Hero 区：淡渐变小头部 -->
    <div class="hero">
      <div class="hero-inner">
        <label class="avatar" title="点击更换头像">
          <img v-if="bookStore.userPhoto" :src="bookStore.userPhoto" class="avatar-img" />
          <svg v-else viewBox="0 0 64 64" width="46" height="46" fill="none" stroke="var(--primary)" stroke-width="1.8" stroke-linejoin="round">
            <path d="M44 12 A22 22 0 1 0 54 38 A16 16 0 0 1 44 12 Z" fill="var(--primary-light)" stroke="none"/>
            <path d="M44 12 A22 22 0 1 0 54 38 A16 16 0 0 1 44 12 Z" fill="none"/>
          </svg>
          <span class="avatar-badge">
            <Icon name="camera" :size="10" />
          </span>
          <input type="file" accept="image/*" class="hidden-file" @change="onUserPhotoChange" />
        </label>
        <div class="hero-text">
          <div class="name-row" @click="openNameEditor" title="点击修改昵称">
            <span class="name">{{ bookStore.userName || '记账达人' }}</span>
            <Icon name="pencil" :size="12" class="edit-pencil" />
          </div>
          <div class="hero-sub">与你的账本一起成长 · 已坚持 {{ persistentDays }} 天</div>
        </div>
      </div>
    </div>

    <!-- 内容区：16px 左右边距 -->
    <div class="content">

      <!-- 三张数据卡：与首页支出/收入卡完全一致的全卡背景插画（cardExpense / cardIncome slot）+ 文字磨砂层 -->
      <div class="stats-grid">
        <div
          class="balance-card-light expense-card stat-card-illust"
          @click="$router.push('/transaction-count')"
        >
          <div class="card-content">
            <p class="card-label">记账总数</p>
            <p class="balance-value">{{ transactionCount }}</p>
          </div>
          <PaintedScene
            v-if="ipForPainted !== 'none'"
            :ip="ipForPainted"
            card-scene="expense"
            page-id="settings-stat-count"
          />
        </div>
        <div
          class="balance-card-light income-card stat-card-illust"
          @click="$router.push('/persistent-days')"
        >
          <div class="card-content">
            <p class="card-label">坚持天数</p>
            <p class="balance-value">{{ persistentDays }}</p>
          </div>
          <PaintedScene
            v-if="ipForPainted !== 'none'"
            :ip="ipForPainted"
            card-scene="income"
            page-id="settings-stat-days"
          />
        </div>
        <div
          class="balance-card-light expense-card stat-card-illust"
          @click="$router.push('/category-usage')"
        >
          <div class="card-content">
            <p class="card-label">使用分类</p>
            <p class="balance-value">{{ categoryCount }}</p>
          </div>
          <PaintedScene
            v-if="ipForPainted !== 'none'"
            :ip="ipForPainted"
            card-scene="expense"
            page-id="settings-stat-categories"
          />
        </div>
      </div>

      <!-- 高频功能 -->
      <div class="section-title">常用功能</div>
      <div class="grid-hot">
        <div
          v-for="item in hotItems"
          :key="item.path"
          class="hot-item-card"
          @click="$router.push(item.path)"
        >
          <div class="hot-icon-circle" :style="{ background: item.bg }">
            <Icon :name="item.iconName" :size="22" />
          </div>
          <div class="hot-info">
            <div class="hot-label">{{ item.label }}</div>
            <div class="hot-desc">{{ item.desc }}</div>
          </div>
          <span class="hot-arrow">›</span>
        </div>
      </div>

      <!-- 全部功能 -->
      <div class="section-title">全部功能</div>
      <div class="grid-all">
        <div
          v-for="item in allItems"
          :key="item.path"
          class="all-item"
          @click="$router.push(item.path)"
        >
          <div class="all-icon">
            <Icon :name="item.iconName" :size="20" />
          </div>
          <div class="all-label">{{ item.label }}</div>
        </div>
      </div>

      <!-- 底部列表 -->
      <div class="list-section">
        <div class="list-row" @click="showBookPicker = true">
          <div class="list-icon-wrap">
            <Icon name="book" :size="18" />
          </div>
          <div class="list-text">我的账本</div>
          <div class="list-extra">日常账本</div>
          <span class="list-arrow">›</span>
        </div>
        <div class="list-row" @click="showRecommend = true">
          <div class="list-icon-wrap">
            <Icon name="star" :size="18" />
          </div>
          <div class="list-text">推荐好友</div>
          <span class="list-arrow">›</span>
        </div>
        <div class="list-row" @click="showMySettings = true">
          <div class="list-icon-wrap">
            <Icon name="settings" :size="18" />
          </div>
          <div class="list-text">我的设置</div>
          <span class="list-arrow">›</span>
        </div>
      </div>
    </div>

    <!-- 弹窗：我的账本 -->
    <div v-if="showBookPicker" class="modal-mask" @click.self="showBookPicker = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>切换账本</h3>
          <span class="modal-close" @click="showBookPicker = false">×</span>
        </div>
        <div class="modal-body">
          <div
            v-for="b in bookStore.books"
            :key="b.id"
            class="book-item"
            :class="{ active: b.id === bookStore.bookId }"
            @click="handleSwitchBook(b.id)"
          >
            <div class="book-icon">
              <img v-if="isImageIcon(b.icon)" :src="b.icon" class="icon-img" />
              <span v-else>{{ b.icon }}</span>
            </div>
            <div class="book-name">{{ b.name }}</div>
            <div v-if="b.id === bookStore.bookId" class="book-check">✓</div>
          </div>
          <div class="book-item add" @click="openAddBook">
            <div class="book-icon">+</div>
            <div class="book-name">新建账本</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 弹窗：新建账本 -->
    <div v-if="showAddBook" class="modal-mask" @click.self="showAddBook = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>新建账本</h3>
          <span class="modal-close" @click="showAddBook = false">×</span>
        </div>
        <div class="modal-body">
          <div class="settings-field">
            <label class="caption">账本名称</label>
            <input v-model="newBookName" type="text" class="input" placeholder="例如：家庭账本" maxlength="20" />
          </div>
          <div class="settings-field">
            <label class="caption">选择图标</label>
            <div class="icon-grid">
              <div
                v-for="ic in bookIcons"
                :key="ic"
                class="icon-cell"
                :class="{ active: newBookIcon === ic && !isImageIcon(ic) }"
                @click="newBookIcon = ic"
              >{{ ic }}</div>
              <!-- 上传的图标 -->
              <div
                v-if="uploadedBookIcon"
                class="icon-cell icon-cell-image"
                :class="{ active: newBookIcon === uploadedBookIcon }"
                @click="newBookIcon = uploadedBookIcon"
              >
                <img :src="uploadedBookIcon" class="icon-img" />
              </div>
              <!-- 上传按钮 -->
              <label class="icon-cell icon-cell-upload">
                <Icon name="add" :size="18" />
                <input type="file" accept="image/*" class="hidden-file" @change="onBookIconFileChange" />
              </label>
            </div>
            <button
              v-if="uploadedBookIcon"
              class="link-btn"
              @click="uploadedBookIcon = ''; if (newBookIcon === uploadedBookIcon || isImageIcon(newBookIcon)) newBookIcon = '📒'"
              type="button"
            >移除上传的图片</button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showAddBook = false">取消</button>
          <button class="btn-primary" @click="handleAddBook">创建</button>
        </div>
      </div>
    </div>

    <!-- 弹窗：推荐好友 -->
    <div v-if="showRecommend" class="modal-mask" @click.self="showRecommend = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>推荐好友</h3>
          <span class="modal-close" @click="showRecommend = false">×</span>
        </div>
        <div class="modal-body">
          <p class="recommend-text">分享记账APP给好友</p>
          <div class="share-icons">
            <div class="share-item" @click="shareTo('wechat')">
              <div class="share-icon">
                <Icon name="share" :size="20" stroke="var(--primary)" />
              </div>
              <span>微信</span>
            </div>
            <div class="share-item" @click="shareTo('moments')">
              <div class="share-icon">
                <Icon name="user" :size="20" stroke="var(--primary)" />
              </div>
              <span>朋友圈</span>
            </div>
            <div class="share-item" @click="shareTo('copy')">
              <div class="share-icon">
                <Icon name="copy" :size="20" stroke="var(--primary)" />
              </div>
              <span>复制链接</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 弹窗：我的设置（Teleport 到 body 根级，避免 stacking context 拦截） -->
    <Teleport to="body">
      <div v-if="showMySettings" class="modal-mask" @click.self="showMySettings = false">
        <div class="modal-card">
          <div class="modal-header">
            <h3>我的设置</h3>
            <span class="modal-close" @click="showMySettings = false">×</span>
          </div>
          <div class="modal-body">
            <div class="settings-field">
              <label class="caption">用户名</label>
              <input v-model="newName" type="text" class="input" placeholder="记账达人" />
            </div>
            <div class="settings-field">
              <label class="caption">设备名</label>
              <input v-model="newDevice" type="text" class="input" placeholder="默认设备" />
            </div>
            <div class="settings-field">
              <label class="caption">主题包</label>
              <div class="theme-bundle-select">
                <button
                  v-for="b in themeSetList"
                  :key="b.value"
                  class="theme-bundle-btn"
                  :class="{ active: currentThemeSet === b.value }"
                  @click="setThemeSet(b.value)"
                >
                  <span class="bundle-swatch" :style="{ background: b.swatch, boxShadow: '0 3px 10px ' + b.swatch + '40' }"></span>
                  <span class="bundle-emoji">{{ b.emoji }}</span>
                  <span class="bundle-label">{{ b.label }}</span>
                  <!-- 主题弹窗卡片预览 IP 贴纸（走 settings-modal 独立模块池） -->
                  <span v-if="b.value === 'onepiece'" class="bundle-ip">
                    <IllustrationImage theme="onepiece" slot="themePreview"
                      module-id="settings-modal"
                      css-class="bundle-sticker"
                      :style-obj="{ width: '20px', height: '20px', borderRadius: '4px' }"
                    />
                  </span>
                  <span v-else class="bundle-ip bundle-ip-clean">·</span>
                  <span v-if="currentThemeSet === b.value" class="theme-check">✓</span>
                </button>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="handleLogout">退出账本</button>
            <button class="btn-primary" @click="saveSettings">保存</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 弹窗：修改昵称（Teleport 到 body 根级） -->
    <Teleport to="body">
      <div v-if="showNameEditor" class="modal-mask" @click.self="showNameEditor = false">
        <div class="modal-card modal-card-small">
          <div class="modal-header">
            <h3>修改昵称</h3>
            <span class="modal-close" @click="showNameEditor = false">×</span>
          </div>
          <div class="modal-body">
            <input v-model="editingName" type="text" class="input" placeholder="请输入昵称" maxlength="20" autofocus />
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="showNameEditor = false">取消</button>
            <button class="btn-primary" @click="confirmName">保存</button>
          </div>
        </div>
      </div>
    </Teleport>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBookStore } from '../stores/book'
import { useTransaction } from '../composables/useTransaction'
import { useCategoryStore } from '../stores/category'
import BottomNav from '../components/BottomNav.vue'
import PaintedScene from '../components/PaintedScene.vue'
import IllustrationImage from '../components/IllustrationImage.vue'
import Icon from '../components/icons/Icon.vue'
import { currentThemeSet, setThemeSet, themeSetList } from '../composables/useTheme'

/**
 * 三张数据卡：插图设置完全对齐首页的「支出 / 收入」卡
 * - 直接复用首页同款 PaintedScene 组件（card-scene="expense" / "income"）
 * - 三张卡走 cardExpense / cardIncome 同一个语义 slot（与首页一致）
 * - 各自独立的 page-id (settings-stat-count / settings-stat-days / settings-stat-categories)
 *   → 三张卡插画互不重复（同页内自动跨模块去重）
 * - 标准主题：PaintedScene 自动不显示插画，卡片走纯色渐变
 */

// 主题 → IP 映射
const ipForPainted = computed<'onepiece' | 'family' | 'none'>(() => {
  if (currentThemeSet.value === 'onepiece') return 'onepiece'
  if (currentThemeSet.value === 'family') return 'family'
  return 'none'
})

const bookStore = useBookStore()
const categoryStore = useCategoryStore()
const { transactions } = useTransaction()

const transactionCount = computed(() => transactions.value.length || 0)
const persistentDays = computed(() => {
  if (!transactions.value.length) return 0
  const dates = new Set(transactions.value.map(t => t.date))
  return dates.size
})
const categoryCount = computed(() => {
  const cats = new Set(transactions.value.map(t => t.category))
  return cats.size
})

// 高频功能：卡片更大、带描述、带图标
const hotItems = [
  {
    label: '账单统计',
    desc: '年度/全局深度报表',
    path: '/report',
    bg: 'var(--primary-light)',
    iconName: 'stats',
  },
  {
    label: '预算中心',
    desc: '每月限额管理',
    path: '/budget',
    bg: 'var(--income-light)',
    iconName: 'wallet',
  },
  {
    label: '存钱计划',
    desc: '目标渐进攒钱',
    path: '/savings-plan',
    bg: 'var(--expense-light)',
    iconName: 'star',
  },
  {
    label: '人情往来',
    desc: '借出借入记录',
    path: '/lend-borrow',
    bg: 'var(--primary-light)',
    iconName: 'share',
  },
]

// 全部功能
const allItems = [
  { label: '自动记账', path: '/auto-record', iconName: 'trend' },
  { label: '周期记账', path: '/period-books', iconName: 'refresh' },
  { label: '税费记账', path: '/tax-records', iconName: 'book' },
  { label: '分类管理', path: '/category-manage', iconName: 'filter' },
  { label: '搜索账单', path: '/search', iconName: 'search' },
  { label: '报销管理', path: '/coupons', iconName: 'wallet' },
  { label: '标签管理', path: '/tags', iconName: 'book' },
  { label: '数据备份', path: '/data-backup', iconName: 'download' },
  { label: '导入导出', path: '/export', iconName: 'upload' },
  { label: '娱乐游戏', path: '/games', iconName: 'tetris' },
  { label: '记账提醒', path: '/reminder', iconName: 'bell' },
  { label: '账单图片', path: '/image-bill', iconName: 'image' },
]

const showBookPicker = ref(false)
const showAddBook = ref(false)
const newBookName = ref('')
const newBookIcon = ref('📒')
const uploadedBookIcon = ref('')
const bookIcons = ['📖', '📒', '💰', '💳', '🏠', '🍜', '✈️', '🎮', '🛒', '💼', '🎁', '📦']

function isImageIcon(icon: string) {
  return icon && icon.startsWith('data:image')
}
function readImageFile(file: File, onSuccess: (dataUrl: string) => void, onError?: () => void) {
  const reader = new FileReader()
  reader.onload = e => {
    const result = e.target?.result
    if (typeof result === 'string') onSuccess(result)
  }
  if (onError) reader.onerror = onError
  reader.readAsDataURL(file)
}
function onBookIconFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  const file = input.files[0]
  if (file.size > 2 * 1024 * 1024) {
    alert('图片大小不能超过 2MB')
    return
  }
  readImageFile(file, (dataUrl) => {
    uploadedBookIcon.value = dataUrl
    newBookIcon.value = dataUrl
    input.value = ''
  })
}
function handleSwitchBook(id: string) {
  bookStore.switchBook(id)
  showBookPicker.value = false
}
function openAddBook() {
  showBookPicker.value = false
  newBookName.value = ''
  newBookIcon.value = '📒'
  uploadedBookIcon.value = ''
  showAddBook.value = true
}
function handleAddBook() {
  if (!newBookName.value.trim()) {
    newBookName.value = '新账本'
  }
  bookStore.addBook({ name: newBookName.value, icon: newBookIcon.value })
  showAddBook.value = false
}
const showRecommend = ref(false)
const showMySettings = ref(false)
const newName = ref(bookStore.userName || 'Clare')
const newDevice = ref(bookStore.deviceName)
const showNameEditor = ref(false)
const editingName = ref('')

function shareTo(type: string) { showRecommend.value = false }
function saveSettings() {
  bookStore.userName = newName.value
  bookStore.deviceName = newDevice.value
  showMySettings.value = false
}
function handleLogout() {
  bookStore.clearBook()
  location.href = '/#/entry'
}

// 头像上传
function onUserPhotoChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  const file = input.files[0]
  if (file.size > 2 * 1024 * 1024) {
    alert('图片大小不能超过 2MB')
    return
  }
  const reader = new FileReader()
  reader.onload = (ev) => {
    const result = ev.target?.result
    if (typeof result === 'string') {
      bookStore.setUserPhoto(result)
    }
  }
  reader.readAsDataURL(file)
  input.value = ''
}

// 昵称编辑
function openNameEditor() {
  editingName.value = bookStore.userName || ''
  showNameEditor.value = true
}
function confirmName() {
  const name = editingName.value.trim()
  bookStore.setUserName(name)
  showNameEditor.value = false
}
</script>

<style scoped>
.settings-page {
  background: var(--page-bg);
  min-height: 100vh;
  padding-bottom: 100px;
  position: relative;
  /* 不设 z-index：避免形成 stacking context，
     让 .modal-mask（z-index 1000）能在 root stacking context 中真正置顶，
     防止家人主题下切换主题时 modal 被页内元素遮挡导致保存/关闭按钮无响应。 */
}

/* 淡渐变小头部 */
.hero {
  background: linear-gradient(135deg, var(--primary-light) 0%, var(--page-bg) 80%);
  padding: 48px 16px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-inner {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  max-width: 520px;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--card-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-soft);
  flex-shrink: 0;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: transform 0.15s;
}
.avatar:active { transform: scale(0.96); }
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
.avatar-badge {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 22px;
  height: 22px;
  background: var(--primary);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-soft);
  border: 2px solid var(--card-bg);
}

.hero-text {
  flex: 1;
  min-width: 0;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 6px;
  margin-left: -6px;
  transition: background 0.15s;
}
.name-row:active {
  background: var(--primary-light);
}

.name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-h1);
}

.edit-pencil {
  color: var(--text-weak);
  flex-shrink: 0;
}
.name-row:active .edit-pencil { color: var(--primary); }

.hero-sub {
  font-size: 12px;
  color: var(--text-body);
  line-height: 1.4;
}

/* 内容区：16px 左右边距 */
.content {
  padding: 0 16px 12px;
}

/* 三张数据卡：3 列网格（与首页同款 balance-card-light，但纵向排） */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
  margin-top: -4px;
}

/* 3 张卡共用首页同款 .balance-card-light 基础样式（border-radius / shadow / transition / position）
   复写 min-height / padding 适配 3 列窄卡 */
.stat-card-illust {
  border-radius: var(--radius-xl);
  padding: 14px 14px;
  box-shadow: var(--shadow-soft);
  transition: transform 0.2s, background 0.2s;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  min-height: 110px;
  display: block;
}

/* 3 列窄卡：插画固定到右上角，不铺满整卡，避免过大遮挡文字 */
.stat-card-illust :deep(.ip-card-scene) {
  position: absolute;
  top: 0;
  right: 0;
  width: 70px;
  height: 70px;
  inset: auto 0 0 auto;
  overflow: hidden;
  border-bottom-right-radius: var(--radius-xl);
}
.stat-card-illust :deep(.ip-card-img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  border-radius: 0;
}

/* 3 张卡的支出/收入背景渐变（与首页 .expense-card / .income-card 完全一致） */
.stat-card-illust.expense-card {
  background: linear-gradient(135deg, var(--expense-light) 0%, #FFE4D6 100%);
}
.stat-card-illust.income-card {
  background: linear-gradient(135deg, var(--income-light) 0%, #D6EFE5 100%);
}

/* 标准主题 / 关闭插画时：保持浅色渐变作为底色（首页同款 .expense-card 默认就有） */

/* 点击效果：与首页 .balance-card-light:active 一致 */
.stat-card-illust:active {
  transform: scale(0.97);
}

/* 文字层：与首页 .card-content 完全一致（z-index:9 + 横向白渐变） */
.stat-card-illust .card-content {
  position: relative;
  z-index: 9;
  display: block;
  padding: 10px 12px 8px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.55) 70%, rgba(255, 255, 255, 0) 100%);
  border-radius: var(--radius-md);
  text-align: left;
  max-width: 100%;
}

.stat-card-illust .card-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-h1);
  margin-bottom: 4px;
  letter-spacing: 0.02em;
  line-height: 1.2;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.6);
}

.stat-card-illust .balance-value {
  font-size: 20px;
  font-weight: 800;
  line-height: 1.2;
  color: var(--text-h1);
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.6);
}

/* 支出 / 收入分别用不同强调色（与首页 .expense-value / .income-value 一致） */
.stat-card-illust.expense-card .balance-value { color: #C8281C; }
.stat-card-illust.income-card .balance-value { color: #1E8A5A; }

/* 分节标题 */
.section-title {
  font-size: 13px;
  color: var(--text-weak);
  margin: 4px 4px 12px;
  font-weight: 500;
}

/* 高频功能：横向卡片带描述 */
.grid-hot {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.hot-item-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.15s;
}

.hot-item-card:active {
  transform: scale(0.98);
  background: var(--primary-light);
}

.hot-icon-circle {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  flex-shrink: 0;
}

.hot-item-card:nth-child(1) .hot-icon-circle { color: var(--primary); }
.hot-item-card:nth-child(2) .hot-icon-circle { color: var(--income); }
.hot-item-card:nth-child(3) .hot-icon-circle { color: var(--expense); }
.hot-item-card:nth-child(4) .hot-icon-circle { color: var(--primary); }

.hot-info {
  flex: 1;
  min-width: 0;
}

.hot-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-h1);
}

.hot-desc {
  font-size: 11px;
  color: var(--text-weak);
  margin-top: 2px;
}

.hot-arrow {
  font-size: 18px;
  color: var(--text-weak);
  line-height: 1;
}

/* 全部功能网格 4 列，小卡片 */
.grid-all {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin-bottom: 24px;
}

.all-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 4px;
  cursor: pointer;
  border-radius: var(--radius-md);
  background: var(--card-bg);
  box-shadow: var(--shadow-soft);
  transition: all 0.15s;
}

.all-item:active {
  transform: scale(0.96);
  background: var(--primary-light);
}

.all-icon {
  width: 30px;
  height: 30px;
  color: var(--text-body);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.all-item:active .all-icon {
  color: var(--primary);
}

.all-label {
  font-size: 11px;
  color: var(--text-body);
  text-align: center;
  line-height: 1.2;
}

/* 底部列表（3 行，卡片化） */
.list-section {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-soft);
}

.list-row {
  display: flex;
  align-items: center;
  padding: 14px;
  border-bottom: 1px solid var(--divider);
  cursor: pointer;
  transition: background 0.15s;
}

.list-row:last-child { border-bottom: none; }
.list-row:active { background: var(--primary-light); }

.list-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--primary-light);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.list-text {
  flex: 1;
  font-size: 14px;
  color: var(--text-h1);
}

.list-extra {
  font-size: 12px;
  color: var(--text-weak);
  margin-right: 8px;
}

.list-arrow {
  font-size: 18px;
  color: var(--text-weak);
  line-height: 1;
}

/* 弹窗（沿用全局 .modal-* 风格，本页仅补细节） */
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;  /* 提高到 1000，确保永远在 page 内其他元素之上 */
  padding: 20px;
  animation: fade-in 0.2s;
}

.modal-card {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 360px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slide-up 0.25s ease-out;
}
.modal-card-small {
  max-width: 300px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--divider);
}

.modal-header h3 {
  font-size: 17px;
  font-weight: 500;
  color: var(--text-h1);
  margin: 0;
}

.modal-close {
  font-size: 24px;
  color: var(--text-weak);
  cursor: pointer;
  line-height: 1;
}

.modal-body {
  padding: 14px 20px 20px;
  overflow-y: auto;
}

/* 账本选择列表 */
.book-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--divider);
  cursor: pointer;
}

.book-item:last-child { border-bottom: none; }
.book-item.active { color: var(--primary); font-weight: 500; }
.book-item.add { color: var(--primary); }

.book-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--page-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-right: 12px;
  overflow: hidden;
  flex-shrink: 0;
}
.book-icon .icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.book-name { flex: 1; font-size: 14px; color: var(--text-h1); }
.book-check { color: var(--primary); font-size: 18px; font-weight: 700; }

/* 推荐 */
.recommend-text { text-align: center; color: var(--text-body); font-size: 14px; margin-bottom: 20px; }
.share-icons { display: flex; justify-content: space-around; }
.share-item { display: flex; flex-direction: column; align-items: center; cursor: pointer; }
.share-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
}
.share-item span { font-size: 12px; color: var(--text-body); }

/* 设置项 */
.settings-field {
  margin-bottom: 14px;
}
.settings-field .caption {
  display: block;
  margin-bottom: 6px;
}

.input {
  width: 100%;
  background: var(--page-bg);
  border: none;
  border-radius: var(--radius-md);
  padding: 10px 14px;
  font-size: 14px;
  color: var(--text-h1);
  outline: none;
}
.input:focus { background: var(--primary-light); box-shadow: 0 0 0 1px var(--primary); }
.input::placeholder { color: var(--text-weak); }

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

/* 图标网格 */
.icon-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}
.icon-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: var(--bg-card);
  border: 1.5px solid var(--border-light);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s;
}
.icon-cell:hover { border-color: var(--primary); }
.icon-cell.active {
  background: var(--primary-light);
  border-color: var(--primary);
  transform: scale(1.05);
}
.icon-cell:active { transform: scale(0.92); }
.icon-cell-image .icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: calc(var(--radius-md) - 2px);
}
.icon-cell-upload {
  color: var(--text-weak);
  background: var(--page-bg);
  border-style: dashed;
  position: relative;
}
.icon-cell-upload:hover { color: var(--primary); border-color: var(--primary); }
.icon-cell-upload .icon-img { width: 100%; height: 100%; object-fit: cover; border-radius: calc(var(--radius-md) - 2px); }
.hidden-file {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
  width: 100%;
  height: 100%;
}
.link-btn {
  display: block;
  margin-top: 10px;
  background: none;
  border: none;
  color: var(--text-weak);
  font-size: 12px;
  cursor: pointer;
  padding: 4px 0;
  font-family: inherit;
}
.link-btn:hover { color: var(--primary); }

/* 工具类 */
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 12px; }

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 主题配色卡片 */
.theme-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  padding: 16px;
  margin-bottom: 20px;
}

.theme-card-hint {
  font-size: 12px;
  color: var(--text-weak);
  margin-bottom: 14px;
  text-align: center;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.theme-swatch {
  background: var(--page-bg);
  border-radius: var(--radius-md);
  padding: 12px 6px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.15s;
  position: relative;
  font-family: inherit;
}

.theme-swatch:active {
  transform: scale(0.96);
}

.theme-swatch.active {
  border-color: var(--primary);
  background: var(--primary-light);
}

.theme-swatch-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  transition: transform 0.2s;
}

.theme-swatch-label {
  font-size: 12px;
  color: var(--text-h1);
  font-weight: 500;
}

.theme-check {
  position: absolute;
  top: 6px;
  right: 8px;
  font-size: 14px;
  color: var(--primary);
  font-weight: 700;
}

/* 弹窗内的主题包选择器（3 张大卡片并排） */
.theme-bundle-select {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.theme-bundle-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 10px 12px;
  background: var(--page-bg);
  position: relative;
  border: 2px solid transparent;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  font-family: inherit;
  text-align: center;
}

.theme-bundle-btn:active {
  transform: scale(0.96);
}

.theme-bundle-btn.active {
  border-color: var(--primary);
  background: var(--primary-light);
}

.theme-bundle-btn .theme-check {
  position: absolute;
  top: 6px;
  right: 8px;
  font-size: 14px;
  color: var(--primary);
  font-weight: 700;
  transition: color 0.2s ease;
}

.bundle-swatch {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  transition: transform 0.2s;
}

.bundle-emoji {
  font-size: 20px;
  line-height: 1;
  margin-top: -2px;
}

.bundle-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-h1);
  line-height: 1.3;
}

.bundle-desc {
  font-size: 10px;
  color: var(--text-body);
  line-height: 1.3;
}

.bundle-ip {
  position: absolute;
  top: 8px;
  left: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}
.bundle-ip-clean {
  font-size: 18px;
  color: var(--text-weak);
  opacity: 0.5;
}

/* 设置页顶部迷你装饰 */
</style>
