import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { autoRecordService } from './services/autoRecord'
import './assets/styles/main.css'
import { bootstrapIDB, waitForBootstrap, validateAndFixTransactions } from './utils/idb'
import { currentThemeSet } from './composables/useTheme'

// 清理已废弃的云同步相关本地数据（一次性兼容清理）
try {
  localStorage.removeItem('fab_pendingQueue')
  localStorage.removeItem('fab_lastSyncTime')
  localStorage.removeItem('fab_autoBackup')
} catch {}

// 主题初始化（必须在 router 启动前，避免主题切换监听在路由跳转后失效）
// useTheme 模块顶部已自动调用 readInitialThemeSet() 并 applyTheme，
// 这里只需 import 即可触发。

async function bootstrap() {
  // 1) IDB 启动（最多等 5s，超时放行）
  await waitForBootstrap()
  // 2) 老数据 schema 校验 + 自动修复（异步、不阻塞）
  try {
    const fixResult = await validateAndFixTransactions()
    if (fixResult.fixed > 0) {
      console.info(`[启动] 已自动修复 ${fixResult.fixed} 条老账单字段`)
    }
  } catch (e) {
    console.warn('[启动] schema 校验失败（不影响主流程）', e)
  }

  // 3) 创建应用
  const app = createApp(App)
  app.use(createPinia())
  app.use(router)

  // 4) 初始化自动记账（全局单例，不依赖任何 Vue 组件）
  try {
    autoRecordService.init()
  } catch (e) {
    console.warn('[启动] 自动记账初始化失败', e)
  }

  // 5) 挂载
  app.mount('#app')

  // 6) 触发一次主题应用（确保初始主题 class 正确）
  // 显式调用一次 setThemeSet 触发 watch，但避免循环 → 用条件守卫
  if (currentThemeSet.value) {
    // watch 已自动触发，这里只确保 body class 立即生效
    // 不需要重复调用
  }
}

// 启动（不阻塞，让 UI 尽快显示空状态）
bootstrapIDB()
bootstrap()
