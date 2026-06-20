// utils/storage.ts
// 轻量配置专用 localStorage（主题/登录态/全局设置/最近备份时间 等 < 1MB 数据）
// 大数据（账单/预算/分类/账本/借条）请走 utils/idb.ts
// ----------------------------------------------------------------

const PREFIX = 'fab_'

export function getLocal<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) as T : null
  } catch {
    return null
  }
}

export function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch (e) {
    console.error(`[storage] setLocal 失败 ${key}（可能 QuotaExceeded）`, e)
    throw e // 抛出以便上层弹窗提示
  }
}

export function removeLocal(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch (e) {
    console.warn(`[storage] removeLocal 失败 ${key}`, e)
  }
}

/** 带 try 的安全 setLocal（失败仅警告，不抛） */
export function setLocalSafe<T>(key: string, value: T): boolean {
  try {
    setLocal(key, value)
    return true
  } catch {
    return false
  }
}
