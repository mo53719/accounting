// useModuleIllustrationPool - 独立模块插画分配池
// ----------------------------------------------------------------
// 设计要点：
// 1) 每个 moduleId 在全局 Map 中拥有独立的 Pool（独立 shuffled）
// 2) 同页面内不同 moduleId 共享「已使用清单」（保证一页面内不重复）
// 3) 关闭某一模块（enabled=false）后 pickOne() 始终返回空字符串
// 4) 组件 unmount 时只删除当前模块的 shuffled pool（不动 pageKey 的 used 集合）
// 5) 只有「海贼王人物包」主题下 pickOne() 才返回插画 URL；
//    标准 / 家人温馨 主题下都返回空字符串（isStandard=true）
// 6) pickOne() 从全集 31 张图随机抽取，循环使用直到用完再重洗
// ----------------------------------------------------------------

import { onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  ALL_ONEPIECE_URLS,
  ALL_FAMILY_URLS,
} from '../assets/illustrations.config'
import { isModuleEnabled } from '../assets/illustrationModules'
import { currentThemeSet } from './useTheme'

/* Fisher–Yates 洗牌 */
function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface ModulePool {
  used: Set<string>
  shuffled: string[]
  isStandard: boolean
  isEnabled: boolean
}

const globalModulePools = new Map<string, ModulePool>()

/* ------------------------------------------------------------------
 * 【页面级跨模块去重】
 * - 同一页面内所有 moduleId 共用「已使用清单」
 * - key 为当前路由 name（或 path），切换路由后旧 pageKey 自动作废
 * - 用户切回同一路由时该 pageKey 的 used 集合从全局 Map 中被新 route 名称覆盖
 * ---------------------------------------------------------------- */
const globalPageUsed = new Map<string, Set<string>>()

function getPageUsed(pageKey: string): Set<string> {
  let s = globalPageUsed.get(pageKey)
  if (!s) {
    s = new Set()
    globalPageUsed.set(pageKey, s)
  }
  return s
}

/** 对外暴露：供主题切换时清空所有池（模块池 + 页面去重表） */
export function clearAllIllustrationPools() {
  globalModulePools.clear()
  globalPageUsed.clear()
}

function getOrCreateModulePool(moduleId: string): ModulePool {
  let p = globalModulePools.get(moduleId)
  // 检测主题是否变化：若变化则重建 pool，确保使用新主题的图源
  const theme = currentThemeSet.value
  if (p) {
    const expectedIsStandard = theme === 'standard'
    if (p.isStandard !== expectedIsStandard) {
      // 主题从 standard 切到装饰主题，或反之
      p = null as any
      globalModulePools.delete(moduleId)
    } else {
      return p
    }
  }
  // 按当前主题选图源；标准主题视为"无装饰"返回空串
  const isStandard = theme === 'standard'
  const urlPool = theme === 'family' ? ALL_FAMILY_URLS : ALL_ONEPIECE_URLS
  p = {
    used: new Set<string>(),
    shuffled: shuffle(urlPool),
    isStandard,
    isEnabled: isModuleEnabled(moduleId),
  }
  globalModulePools.set(moduleId, p)
  return p
}

/** 对外暴露：供 IllustrationImage 在主题切换时主动重建 pool（修复旧引用问题） */
export function rebuildIllustrationPool(moduleId: string): void {
  if (!moduleId) return
  globalModulePools.delete(moduleId)
  getOrCreateModulePool(moduleId)
}

function drawOne(pool: ModulePool, pageUsed: Set<string>): string {
  if (pool.isStandard || !pool.isEnabled) return ''
  // 1) 先尝试当前 shuffled 序列
  while (pool.shuffled.length > 0) {
    const url = pool.shuffled.shift()!
    if (pool.used.has(url)) continue       // 同一模块内已用
    if (pageUsed.has(url)) continue        // 同一页面内已用（跨模块去重）
    pool.used.add(url)
    pageUsed.add(url)
    return url
  }
  // 2) shuffled 用完 → 重洗当前主题的图源全集
  //    注意：仍要按当前主题选图源（currentThemeSet 不会错）
  const resetPool = currentThemeSet.value === 'family' ? ALL_FAMILY_URLS : ALL_ONEPIECE_URLS
  pool.shuffled = shuffle(resetPool)
  for (const url of pool.shuffled) {
    if (pool.used.has(url)) continue
    if (pageUsed.has(url)) continue
    pool.used.add(url)
    pageUsed.add(url)
    return url
  }
  return ''
}

/**
 * 绑定一个独立插画模块（按 moduleId 隔离 shuffled）
 * - 同一 pageKey 下的多次调用共享「已使用清单」→ 同一页面内不重复
 * - 不同 pageKey 互不干扰（独立 pageUsed 集合）
 * - 组件 unmount → 仅删除当前 moduleId 的 shuffled pool（保留 pageKey 的 used 集合）
 */
export function useModuleIllustrationPool(moduleId: string) {
  // 自动用当前路由名作为 pageKey
  // - 标准/海贼王/家人切换主题时，pageKey 不变（只清 pageUsed 的时机由 theme watch 控制）
  // - 跨路由切换时，pageKey 自动换成新路由的 name，旧的 pageUsed 集合被自然废弃
  let pageKey = 'global'
  try {
    const route = useRoute()
    if (route && (route.name || route.path)) {
      pageKey = String(route.name || route.path)
    }
  } catch {
    // 非 setup 上下文调用时（如 onUnmounted 期间），fallback 到 moduleId
    pageKey = moduleId
  }

  const pool = getOrCreateModulePool(moduleId)
  const pageUsed = getPageUsed(pageKey)

  onUnmounted(() => {
    globalModulePools.delete(moduleId)
  })

  return {
    /** 当前是否标准主题（标准主题下 pickOne 永远返回空） */
    isStandard: pool.isStandard,
    /** 当前模块是否启用 */
    isEnabled: pool.isEnabled,
    /** 抽 1 张未使用过的图（标准主题 / 未启用时返回 ''） */
    pickOne(): string { return drawOne(pool, pageUsed) },
    /** 抽 n 张互不重复的图（同页内不同模块也不会重复） */
    pickN(n: number): string[] {
      return Array.from({ length: n }, () => drawOne(pool, pageUsed))
    },
  }
}

/* ------------------------------------------------------------------
 * 兼容旧 API：usePageIllustrationPool(pageId)
 * 现在只是 moduleId 的别名，行为完全一致
 * ----------------------------------------------------------------*/
export function usePageIllustrationPool(pageId: string) {
  return useModuleIllustrationPool(pageId)
}
