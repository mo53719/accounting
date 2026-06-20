import { ref, watch } from 'vue'
import { clearAllIllustrationPools } from './useIllustrationPicker'

// ============ 存储 key（统一为一个 key：themeSet） ============
const THEME_SET_STORAGE_KEY = 'themeSet'

// 旧 key 列表，用于迁移逻辑
const OLD_THEME_STORAGE_KEY = 'themeColor'
const OLD_STYLE_STORAGE_KEY = 'styleType'

// ============ 3 套主题集合（class 命名规范：set-standard / set-onepiece / set-family） ============
// 已删除：萌宠猫狗主题（'pet'）—— 旧数据自动迁移到 'onepiece'
// 已重命名：'comic' → 'onepiece'（保留 One Piece 全部资源）
const VALID_THEME_SETS = ['standard', 'onepiece', 'family'] as const
export type ThemeSet = typeof VALID_THEME_SETS[number]

// 导出给 SettingsView 渲染的主题大卡片列表
export const themeSetList: { value: ThemeSet; label: string; desc: string; swatch: string; emoji: string }[] = [
  { value: 'standard', label: '标准纯净简约', desc: '',     swatch: '#52a88c', emoji: '⚪' },
  { value: 'onepiece', label: '海贼王人物包', desc: '',     swatch: '#1E5A8A', emoji: '🏴‍☠️' },
  { value: 'family',   label: '家人温馨主题', desc: '',     swatch: '#F4B183', emoji: '🏠' },
]

// ============ 从 localStorage 读取配置（含旧 key 迁移逻辑） ============
function readInitialThemeSet(): ThemeSet {
  try {
    if (typeof localStorage === 'undefined') return 'standard'

    // 1. 优先读取新的 key
    const stored = localStorage.getItem(THEME_SET_STORAGE_KEY)
    if (stored) {
      // 兼容旧值：'pet' / 'comic' → 'onepiece'
      if (stored === 'pet' || stored === 'comic') return 'onepiece'
      if (VALID_THEME_SETS.includes(stored as ThemeSet)) return stored as ThemeSet
    }

    // 2. 如果新 key 不存在，尝试从旧的 styleType 迁移
    const oldStyle = localStorage.getItem(OLD_STYLE_STORAGE_KEY)
    if (oldStyle === 'style-pet' || oldStyle === 'style-comic') {
      return 'onepiece'
    }

    // 3. 兜底：尝试旧 themeColor（早期版本）
    const oldTheme = localStorage.getItem(OLD_THEME_STORAGE_KEY)
    if (oldTheme === 'pet' || oldTheme === 'comic') {
      return 'onepiece'
    }

    // 4. 默认值
    return 'standard'
  } catch {
    return 'standard'
  }
}

// ============ 响应式状态 ============
export const currentThemeSet = ref<ThemeSet>(readInitialThemeSet())

// ============ 应用主题到 <body>（只挂一个 class：set-*） ============
function applyTheme(themeSet: ThemeSet) {
  if (typeof document === 'undefined') return
  const body = document.body

  // 清除所有旧的 theme-* / style-* / set-* class（以防旧缓存残留）
  Array.from(body.classList)
    .filter(cls => cls.startsWith('theme-') || cls.startsWith('style-') || cls.startsWith('set-'))
    .forEach(cls => body.classList.remove(cls))

  // 应用新 class
  body.classList.add(`set-${themeSet}`)

  // 同步到 <html> 的 data 属性，便于 CSS 变量查询
  document.documentElement.dataset.themeSet = themeSet
}

// 首次初始化
applyTheme(currentThemeSet.value)

// ============ 保存函数（通过 watch 自动触发） ============
function saveThemeSet() {
  try {
    localStorage.setItem(THEME_SET_STORAGE_KEY, currentThemeSet.value)
    // 顺手清理旧 key，避免后续版本升级又触到
    localStorage.removeItem(OLD_STYLE_STORAGE_KEY)
  } catch {}
}

watch(currentThemeSet, (newVal) => {
  applyTheme(newVal)
  saveThemeSet()
  // 主题切换后清空所有插画池（不同主题的图源不同，旧池会导致风格串台）
  clearAllIllustrationPools()
})

// ============ 对外 API ============
export function setThemeSet(themeSet: ThemeSet) {
  currentThemeSet.value = themeSet
}

// 便捷方法
export function hasDecor() {
  return currentThemeSet.value !== 'standard'
}

export function isOnepiece() {
  return currentThemeSet.value === 'onepiece'
}
