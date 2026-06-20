﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿<template>
  <div class="entry-page">
    <div class="entry-card">
      <!-- 顶部标题区域：固定大标题 + 副标题 + 状态提示 -->
      <div class="entry-header">
        <h1 class="entry-title">
          <BrandLogo class="entry-logo" />
        </h1>
        <p class="entry-subtitle">轻松记录收支、支持家人共享账本</p>
        <p class="entry-state-hint">
          {{ isFirstInit ? '请设置你的账号与登录密码' : '输入密码解锁私人账本' }}
        </p>
        <!-- 主题装饰插画（由 body class 控制显隐，一套主题只显示一个形象） -->
        <div class="entry-decor">
          <div class="decor-standard">
            <svg viewBox="0 0 48 48" width="56" height="56" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M24 6 L42 14 L42 28 C42 36 34 42 24 44 C14 42 6 36 6 28 L6 14 Z"/>
              <path d="M24 6 L24 44"/>
              <path d="M6 14 L24 22 L42 14"/>
            </svg>
          </div>
          <div class="decor-pet">
            <!-- 用户图片（海贼王），fallback 到 PetMascot -->
            <IllustrationImage
              v-if="currentThemeSet !== 'standard'" :theme="currentThemeSet" slot="emptyBills"
              css-class="entry-illust-img"
            />
            <PetMascot v-else pet="cat" size="large" />
          </div>
          <div class="decor-comic">
            <IllustrationImage
              v-if="currentThemeSet !== 'standard'" :theme="currentThemeSet" slot="emptySavings"
              css-class="entry-illust-img"
            />
            <MangaMascot v-else size="large" />
          </div>
        </div>
      </div>

      <!-- 状态 A：首次初始化（设置账号密码） -->
      <div v-if="isFirstInit" class="entry-form">
        <!-- 账号输入框 -->
        <div class="input-group">
          <span class="input-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </span>
          <input
            v-model="account"
            type="text"
            class="input-field"
            placeholder="自定义登录账号"
            :disabled="loading"
            autocomplete="username"
          />
        </div>

        <!-- 密码输入框 -->
        <div class="input-group">
          <span class="input-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </span>
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            class="input-field"
            placeholder="设置 6 位及以上登录密码"
            :disabled="loading"
            autocomplete="new-password"
          />
          <button
            type="button"
            class="input-action"
            @click="showPassword = !showPassword"
            tabindex="-1"
          >
            <svg v-if="showPassword" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          </button>
        </div>

        <!-- 确认密码输入框 -->
        <div class="input-group" :class="{ 'input-error': passwordMismatch }">
          <span class="input-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </span>
          <input
            v-model="confirmPassword"
            :type="showPassword ? 'text' : 'password'"
            class="input-field"
            placeholder="再次输入登录密码"
            :disabled="loading"
            autocomplete="new-password"
          />
        </div>

        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

        <!-- 完成设置按钮 -->
        <button class="primary-btn" :disabled="loading" @click="handleRegister">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span>完成设置</span>
        </button>
      </div>

      <!-- 状态 B：已注册・快速登录 -->
      <div v-else class="entry-form">
        <!-- 显示已注册账号（只读） -->
        <div class="account-display">
          <span class="account-label">当前账号</span>
          <span class="account-name">{{ savedAccount }}</span>
        </div>

        <!-- 密码输入框 -->
        <div class="input-group">
          <span class="input-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </span>
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            class="input-field"
            placeholder="请输入登录密码"
            :disabled="loading"
            autocomplete="current-password"
            @keyup.enter="handleLogin"
          />
          <button
            type="button"
            class="input-action"
            @click="showPassword = !showPassword"
            tabindex="-1"
          >
            <svg v-if="showPassword" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          </button>
        </div>

        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

        <!-- 解锁进入按钮 -->
        <button class="primary-btn" :disabled="loading" @click="handleLogin">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span>解锁进入</span>
        </button>

        <!-- 忘记密码入口 -->
        <p class="reset-link" @click="handleReset">忘记密码？重置账号密码</p>
      </div>
    </div>

    <!-- 底部提示（在卡片外） -->
    <p class="entry-footer-hint">
      {{ isFirstInit ? '设置完成后下次打开仅输入密码即可快速登录' : '密码存储在本机，不会上传任何服务器' }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { hashPassword } from '../utils/crypto'
import { useBookStore } from '../stores/book'
import { getLocal, setLocal } from '../utils/storage'
import PetMascot from '../components/PetMascot.vue'
import MangaMascot from '../components/MangaMascot.vue'
import IllustrationImage from '../components/IllustrationImage.vue'
import BrandLogo from '../components/BrandLogo.vue'
import { currentThemeSet } from '../composables/useTheme'

const router = useRouter()
const bookStore = useBookStore()

// ===== 本地存储键（账号密码注册/登录，独立于账本 bookId） =====
const STORAGE_KEY_ACCOUNT = 'userAccount'
const STORAGE_KEY_PASSWORD = 'userPassword'
const STORAGE_KEY_IS_FIRST = 'isFirstInit'

// ===== 状态判断：首次 vs 已注册 =====
const isFirstInit = ref<boolean>(true)
const savedAccount = ref<string>('')

const account = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')

// 密码两次不一致提示
const passwordMismatch = computed(() => {
  return confirmPassword.value.length > 0 && password.value !== confirmPassword.value
})

// 页面挂载时，读取 localStorage 判断状态
onMounted(() => {
  const isFirst = getLocal<boolean>(STORAGE_KEY_IS_FIRST)
  const storedAccount = getLocal<string>(STORAGE_KEY_ACCOUNT)
  // 默认 true（首次），只有当 isFirstInit === false 时才视为已注册
  if (isFirst === false && storedAccount) {
    isFirstInit.value = false
    savedAccount.value = storedAccount
  } else {
    isFirstInit.value = true
  }
})

// ===== 状态 A：完成设置（首次） =====
async function handleRegister() {
  if (loading.value) return
  errorMsg.value = ''

  const acc = account.value.trim()
  const pwd = password.value
  const pwd2 = confirmPassword.value

  if (!acc) {
    errorMsg.value = '请输入登录账号'
    return
  }
  if (pwd.length < 6) {
    errorMsg.value = '密码至少 6 位'
    return
  }
  if (pwd !== pwd2) {
    errorMsg.value = '两次输入的密码不一致'
    return
  }

  loading.value = true
  try {
    // 1. 存账号密码到 localStorage
    setLocal(STORAGE_KEY_ACCOUNT, acc)
    setLocal(STORAGE_KEY_PASSWORD, pwd)
    setLocal(STORAGE_KEY_IS_FIRST, false)
    // 2. 用密码哈希作为账本 ID（保持原有业务逻辑不动）
    const bookId = await hashPassword(pwd)
    bookStore.setBookId(bookId)
    // 3. 进入首页
    setTimeout(() => {
      router.push('/home')
    }, 200)
  } catch (e) {
    errorMsg.value = '设置失败，请重试'
    loading.value = false
  }
}

// ===== 状态 B：解锁进入（已注册） =====
async function handleLogin() {
  if (loading.value) return
  errorMsg.value = ''

  const pwd = password.value
  if (!pwd) {
    errorMsg.value = '请输入登录密码'
    return
  }

  loading.value = true
  try {
    // 对比本地存储的密码
    const storedPassword = getLocal<string>(STORAGE_KEY_PASSWORD)
    if (import.meta.env.DEV) {
      console.debug('[EntryView] 密码对比', {
        inputLen: pwd.length,
        storedLen: storedPassword?.length,
        match: pwd === storedPassword,
      })
    }
    if (pwd === storedPassword) {
      // 密码正确 → 进入首页
      const bookId = await hashPassword(pwd)
      bookStore.setBookId(bookId)
      if (import.meta.env.DEV) {
        console.debug('[EntryView] 密码正确，准备跳转 /home, bookId =', bookId)
      }
      setTimeout(() => {
        router.push('/home')
      }, 200)
    } else {
      errorMsg.value = '密码错误，请重新输入'
      loading.value = false
    }
  } catch (e) {
    console.error('[EntryView] 登录异常', e)
    errorMsg.value = '登录失败，请重试'
    loading.value = false
  }
}

// ===== 重置账号密码 =====
function handleReset() {
  if (confirm('确认重置账号密码？\n当前账本数据不会丢失，但需要重新设置账号密码。')) {
    setLocal(STORAGE_KEY_IS_FIRST, true)
    setLocal(STORAGE_KEY_ACCOUNT, '')
    setLocal(STORAGE_KEY_PASSWORD, '')
    isFirstInit.value = true
    savedAccount.value = ''
    account.value = ''
    password.value = ''
    confirmPassword.value = ''
    errorMsg.value = ''
  }
}
</script>

<style scoped>
.entry-page {
  min-height: 100vh;
  background: var(--page-bg);
  padding: 48px 16px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  box-sizing: border-box;
}

.entry-card {
  width: 100%;
  max-width: 380px;
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-soft);
  padding: 28px 24px;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

/* ===== 标题区域 ===== */
.entry-header {
  text-align: center;
  margin-bottom: 24px;
}

.entry-title {
  margin: 0 0 8px;
  line-height: 1;
  display: block;
  text-align: center;
}
.entry-logo {
  display: block;
  margin: 0 auto;
  width: 100%;
  max-width: 280px;
  height: auto;
}

.entry-subtitle {
  font-size: var(--font-caption, 12px);
  color: var(--text-weak);
  margin: 0;
}

.entry-state-hint {
  font-size: var(--font-caption, 12px);
  color: var(--primary);
  margin: 6px 0 0;
  opacity: 0.85;
  font-weight: 500;
}

/* ===== 主题装饰插画容器（一套主题只显示一个形象） ===== */
.entry-decor {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80px;
  margin-top: 18px;
}

.entry-decor > div {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 标准 / 萌宠 / 漫画 三选一显隐 */
.set-standard .decor-pet,
.set-standard .decor-comic { display: none !important; }
.set-onepiece .decor-standard,
.set-onepiece .decor-pet { display: none !important; }

/* 用户插画图片（替换 PetMascot / MangaMascot） */
.entry-illust-img {
  width: 120px;
  height: 120px;
  object-fit: contain;
  display: block;
  margin: 0 auto;
  user-select: none;
  -webkit-user-drag: none;
}

/* ===== 表单容器 ===== */
.entry-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ===== 账号展示（已注册时） ===== */
.account-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--page-bg);
  border: 1px solid var(--divider);
  border-radius: var(--radius-md);
  padding: 12px 14px;
}

.account-label {
  font-size: 12px;
  color: var(--text-weak);
}

.account-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-h1);
}

/* ===== 输入框组 ===== */
.input-group {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--page-bg);
  border: 1px solid var(--divider);
  border-radius: var(--radius-md);
  padding: 0 12px;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.input-group:focus-within {
  border-color: var(--primary);
  background: var(--card-bg);
}

.input-group.input-error {
  border-color: #f4a8a8;
  background: #fff5f5;
}

.input-icon {
  display: flex;
  align-items: center;
  color: var(--text-weak);
  flex-shrink: 0;
  margin-right: 10px;
}

.input-field {
  flex: 1;
  border: none;
  background: transparent;
  padding: 12px 0;
  font-size: 14px;
  color: var(--text-h1);
  outline: none;
  font-family: inherit;
}

.input-field::placeholder {
  color: var(--text-weak);
}

.input-field:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.input-action {
  background: transparent;
  border: none;
  color: var(--text-weak);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.2s ease;
}

.input-action:hover {
  color: var(--primary);
}

/* ===== 错误提示 ===== */
.error-msg {
  color: #e07070;
  font-size: 13px;
  text-align: center;
  margin: 4px 0 0;
  min-height: 18px;
}

/* ===== 主按钮 ===== */
.primary-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  padding: 14px 0;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 6px;
  transition: all 0.15s ease;
  font-family: inherit;
  box-shadow: var(--shadow-soft);
}

.primary-btn:active {
  transform: scale(0.96);
  background: var(--primary-dark, var(--primary));
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ===== 重置入口 ===== */
.reset-link {
  text-align: center;
  font-size: 12px;
  color: var(--text-weak);
  margin: 10px 0 0;
  cursor: pointer;
  transition: color 0.2s ease;
  user-select: none;
}

.reset-link:hover {
  color: var(--primary);
}

/* ===== 底部提示（卡片外） ===== */
.entry-footer-hint {
  text-align: center;
  font-size: var(--font-caption, 12px);
  color: var(--text-weak);
  margin-top: 20px;
  opacity: 0.8;
}

/* ===== 主题适配装饰 ===== */

/* 海贼王主题：卡片左下角加简笔小人剪影 */
.set-onepiece .entry-card::after {
  content: '';
  position: absolute;
  bottom: 12px;
  left: 12px;
  width: 24px;
  height: 24px;
  background: radial-gradient(circle at 50% 30%, var(--primary-light) 4px, transparent 5px),
              radial-gradient(circle at 50% 70%, var(--primary-light) 6px, transparent 7px);
  opacity: 0.5;
  pointer-events: none;
}

/* 标准主题：清除所有 ::before / ::after 装饰 */
.set-standard .entry-card::before,
.set-standard .entry-card::after { display: none; }
</style>
