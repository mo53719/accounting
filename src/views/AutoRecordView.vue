<template>
  <div class="page">
    <div class="page-header">
      <span class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </span>
      <div class="flex-1">
        <h1 class="page-title">自动记账</h1>
        <p class="page-subtitle">监听支付通知，自动生成账单</p>
      </div>
    </div>

    <div class="content">
      <!-- 开关卡 -->
      <div class="card card-enable">
        <div>
          <p class="title">启用自动记账</p>
          <p class="status" :class="enabled ? 'status-on' : 'status-off'">
            {{ enabled ? '已开启，后台持续运行' : '已关闭' }}
          </p>
        </div>
        <div class="toggle" :class="{ on: enabled }" @click="toggleEnabled">
          <div class="toggle-dot" :class="{ on: enabled }"></div>
        </div>
        <IllustrationImage
          v-if="currentThemeSet !== 'standard'"
          :theme="currentThemeSet" slot="stickerCorner"
          module-id="auto-record-card-enable"
          css-class="card-sticker"
          :style-obj="{ position: 'absolute', top: '8px', right: '8px' }"
        />
      </div>

      <!-- 监听状态 -->
      <div class="card card-status" :class="statusClass">
        <div class="status-dot-wrap">
          <span class="status-dot" :class="statusDotClass"></span>
        </div>
        <div class="status-info">
          <p class="status-main">{{ statusText }}</p>
          <p class="status-sub">{{ statusSubText }}</p>
        </div>
      </div>

      <!-- 最近一条自动记录 -->
      <div v-if="lastRecord" class="card card-last-record">
        <div class="last-record-header">
          <span class="last-record-label">最近自动记录</span>
          <span class="last-record-time">{{ formatTime(lastRecord.timestamp) }}</span>
        </div>
        <div class="last-record-body">
          <span class="last-record-type" :class="lastRecord.type === 'income' ? 'type-income' : 'type-expense'">
            {{ lastRecord.type === 'income' ? '收入' : '支出' }}
          </span>
          <span class="last-record-merchant">{{ lastRecord.merchant }}</span>
          <span class="last-record-amount">
            {{ lastRecord.type === 'income' ? '+' : '-' }}¥{{ lastRecord.amount.toFixed(2) }}
          </span>
        </div>
        <IllustrationImage
          v-if="currentThemeSet !== 'standard'"
          :theme="currentThemeSet" slot="stickerCorner"
          module-id="auto-record-card-last"
          css-class="card-sticker"
          :style-obj="{ position: 'absolute', bottom: '8px', right: '8px' }"
        />
      </div>

      <!-- 权限状态 -->
      <div class="card card-permission">
        <p class="title-permission">通知读取权限</p>
        <p class="permission-tip">授权后可自动识别微信、支付宝、银行短信中的支付消息，一键记账更高效</p>
        <p class="desc-permission" :class="granted ? 'perm-granted' : 'perm-denied'">
          {{ isNative ? (granted ? '已授权 ✓' : '需要授权') : '仅在 Android APP 中可用' }}
        </p>
        <button
          v-if="isNative && !granted"
          @click="requestPermission"
          class="btn-primary w-full"
        >去授权</button>
        <IllustrationImage
          v-if="currentThemeSet !== 'standard'"
          :theme="currentThemeSet" slot="stickerCorner"
          module-id="auto-record-card-perm"
          css-class="card-sticker"
          :style-obj="{ position: 'absolute', top: '8px', right: '8px' }"
        />
      </div>

      <!-- 监听来源 -->
      <div class="sources">
        <h3 class="sources-title">监听来源</h3>
        <div
          v-for="s in sources"
          :key="s.key"
          class="source-row"
        >
          <div class="source-icon">
            <svg v-if="s.key === 'wechat'" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            <svg v-else-if="s.key === 'alipay'" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>
          </div>
          <div class="source-text">
            <p class="source-label">{{ s.label }}</p>
            <p class="source-desc">{{ s.desc }}</p>
          </div>
          <div class="toggle" :class="{ on: s.enabled }" @click="toggleSource(s.key)">
            <div class="toggle-dot" :class="{ on: s.enabled }"></div>
          </div>
          <IllustrationImage
            v-if="currentThemeSet !== 'standard'"
            :theme="currentThemeSet" slot="stickerCorner"
            :module-id="`auto-record-src-${s.key}`"
            css-class="source-row-sticker"
            :style-obj="{ position: 'absolute', right: '60px', bottom: '6px' }"
          />
        </div>
      </div>

      <!-- 已自动记录数 -->
      <div class="card card-summary">
        <div class="summary-left">
          <p class="summary-count">{{ autoCount }}<span class="summary-unit"> 笔</span></p>
          <p class="summary-caption">本月已自动记录</p>
        </div>
        <div class="summary-right">
          <p class="summary-amount">¥{{ autoAmount.toFixed(0) }}</p>
        </div>
        <IllustrationImage
          v-if="currentThemeSet !== 'standard'"
          :theme="currentThemeSet" slot="stickerCorner"
          module-id="auto-record-card-summary"
          css-class="card-sticker"
          :style-obj="{ position: 'absolute', bottom: '8px', right: '8px' }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTransaction } from '../composables/useTransaction'
import IllustrationImage from '../components/IllustrationImage.vue'
import { currentThemeSet } from '../composables/useTheme'
import { autoRecordService } from '../services/autoRecord'
import dayjs from 'dayjs'

const { transactions } = useTransaction()

// 状态
const enabled = ref(false)
const granted = ref(false)
const isNative = ref(false)
const lastRecord = ref<{
  type: string
  amount: number
  merchant: string
  source: string
  timestamp: number
} | null>(null)

const sources = ref([
  { key: 'wechat', label: '微信支付', desc: '监听微信收款/付款通知', enabled: true },
  { key: 'alipay', label: '支付宝', desc: '监听支付宝收款/付款通知', enabled: true },
  { key: 'icbc', label: '工商银行', desc: '监听刷卡/转账通知', enabled: false },
  { key: 'ccb', label: '建设银行', desc: '监听刷卡/转账通知', enabled: false },
  { key: 'cmb', label: '招商银行', desc: '监听刷卡/转账通知', enabled: false },
  { key: 'abc', label: '农业银行', desc: '监听刷卡/转账通知', enabled: false },
])

let unsubscribe: (() => void) | null = null

function toggleSource(key: string) {
  const s = sources.value.find(s => s.key === key)
  if (s) s.enabled = !s.enabled
}

async function toggleEnabled() {
  if (enabled.value) {
    await autoRecordService.stop()
  } else {
    const ok = await autoRecordService.start()
    if (!ok) {
      // 未授权时跳授权
      await autoRecordService.requestPermission()
    }
  }
}

async function requestPermission() {
  await autoRecordService.requestPermission()
  // 等待用户开启后再次检查
  setTimeout(async () => {
    granted.value = await autoRecordService.checkPermission()
  }, 2000)
}

const autoCount = computed(() =>
  transactions.value.filter(t =>
    t.autoParsed && t.date.startsWith(dayjs().format('YYYY-MM'))
  ).length
)

const autoAmount = computed(() =>
  transactions.value
    .filter(t => t.autoParsed && t.date.startsWith(dayjs().format('YYYY-MM')))
    .reduce((s, t) => s + t.amount, 0)
)

// 状态文字
const statusText = computed(() => {
  if (!isNative.value) return '仅在 Android 中可用'
  if (!granted.value) return '未获得通知权限'
  if (!enabled.value) return '已关闭'
  return '正在监听...'
})

const statusSubText = computed(() => {
  if (!isNative.value) return '请在手机 APP 中使用此功能'
  if (!granted.value) return '点击上方「去授权」开启权限'
  if (!enabled.value) return '打开开关即可开始自动记账'
  return '后台持续运行，关闭 APP 仍生效'
})

const statusClass = computed(() => {
  if (!isNative.value || !granted.value) return 'card-status-inactive'
  if (enabled.value) return 'card-status-active'
  return 'card-status-off'
})

const statusDotClass = computed(() => {
  if (!isNative.value || !granted.value) return 'dot-inactive'
  if (enabled.value) return 'dot-active'
  return 'dot-off'
})

function formatTime(ts: number) {
  return dayjs(ts).format('MM-DD HH:mm')
}

onMounted(async () => {
  isNative.value = typeof (window as any).Capacitor !== 'undefined'

  // 首次进入页面检查权限
  granted.value = await autoRecordService.checkPermission()

  // 订阅全局状态变化
  unsubscribe = autoRecordService.subscribe((state) => {
    enabled.value = state.enabled
    granted.value = state.permissionGranted
    lastRecord.value = state.lastRecord
  })

  // 未授权时弹窗提示
  if (isNative.value && !granted.value) {
    setTimeout(() => {
      autoRecordService.requestPermission()
    }, 800)
  }
})

onUnmounted(() => {
  unsubscribe?.()
})
</script>

<style scoped>
.page {
  background: var(--page-bg);
  min-height: 100vh;
  padding-bottom: 24px;
}

.page-header {
  padding: 50px 16px 12px;
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
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 5px;
  opacity: 0.85;
  pointer-events: none;
}

.flex-1 { flex: 1; }
.w-full { width: 100%; }

.content {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  padding: 14px;
  position: relative;
}

/* 开关卡 */
.card-enable {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-h1);
  line-height: 1.4;
}
.status {
  font-size: 12px;
  margin-top: 4px;
  line-height: 1.4;
}
.status-on { color: var(--primary); }
.status-off { color: var(--text-weak); }

/* 开关 */
.toggle {
  width: 48px;
  height: 28px;
  border-radius: 14px;
  background: var(--divider);
  position: relative;
  transition: background 0.3s;
  cursor: pointer;
  flex-shrink: 0;
}
.toggle:active { transform: scale(0.96); }
.toggle.on { background: var(--primary); }
.toggle-dot {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--card-bg);
  box-shadow: var(--shadow-soft);
  transition: all 0.3s;
}
.toggle-dot.on { left: 23px; }

/* ===== 监听状态卡 ===== */
.card-status {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
}
.card-status-active { border-left: 3px solid var(--primary); }
.card-status-off { border-left: 3px solid var(--divider); }
.card-status-inactive { border-left: 3px solid var(--text-weak); }

.status-dot-wrap {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.dot-active {
  background: rgba(82, 168, 140, 0.15);
}
.dot-active::after {
  content: '';
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--primary);
  display: block;
  animation: pulse 1.8s ease-in-out infinite;
}
.dot-off {
  background: rgba(0, 0, 0, 0.06);
}
.dot-off::after {
  content: '';
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--divider);
  display: block;
}
.dot-inactive {
  background: rgba(0, 0, 0, 0.04);
}
.dot-inactive::after {
  content: '';
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--text-weak);
  display: block;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.8); }
}

.status-info { flex: 1; }
.status-main {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-h1);
  line-height: 1.4;
}
.status-sub {
  font-size: 12px;
  color: var(--text-weak);
  margin-top: 2px;
  line-height: 1.4;
}

/* ===== 最近一条记录 ===== */
.card-last-record {
  padding: 12px 14px;
}
.last-record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.last-record-label {
  font-size: 12px;
  color: var(--text-weak);
  font-weight: 500;
}
.last-record-time {
  font-size: 11px;
  color: var(--text-weak);
}
.last-record-body {
  display: flex;
  align-items: center;
  gap: 8px;
}
.last-record-type {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 4px;
}
.type-expense { background: rgba(232, 114, 92, 0.12); color: #E8725C; }
.type-income { background: rgba(82, 168, 140, 0.12); color: #52a88c; }
.last-record-merchant {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-h1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.last-record-amount {
  font-size: 15px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--text-h1);
}

/* 权限卡 */
.card-permission {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  padding: 14px;
}
.permission-tip {
  background: var(--primary-light);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  margin-bottom: 12px;
  font-size: 12px;
  color: var(--text-body);
  line-height: 1.5;
}
.title-permission {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-h1);
  margin-bottom: 4px;
}
.desc-permission {
  font-size: 12px;
  margin-bottom: 12px;
}
.perm-granted { color: var(--primary); }
.perm-denied { color: #E8725C; }

/* 监听来源 */
.sources-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-h1);
  margin-bottom: 12px;
  padding: 0 2px;
}
.source-row {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-soft);
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  position: relative;
}
.source-row:last-child { margin-bottom: 0; }
.source-row-sticker {
  position: absolute;
  right: 60px;
  bottom: 6px;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  opacity: 0.75;
  pointer-events: none;
}
.source-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-light);
  color: var(--primary);
  flex-shrink: 0;
}
.source-text { flex: 1; min-width: 0; }
.source-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-h1);
  line-height: 1.4;
}
.source-desc {
  font-size: 12px;
  color: var(--text-weak);
  margin-top: 2px;
  line-height: 1.4;
}

/* 已自动记录卡 */
.card-summary {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-soft);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 16px;
}
.summary-left { display: flex; flex-direction: column; }
.summary-count {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-h1);
  line-height: 1.2;
}
.summary-unit {
  font-size: 14px;
  font-weight: 400;
  color: var(--text-weak);
  margin-left: 2px;
}
.summary-caption {
  font-size: 12px;
  color: var(--text-weak);
  margin-top: 4px;
}
.summary-right { display: flex; align-items: center; }
.summary-amount {
  font-size: 22px;
  font-weight: 600;
  color: var(--primary);
  line-height: 1.3;
}
</style>
