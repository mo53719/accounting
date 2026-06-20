// utils/idb.ts
// 统一 IndexedDB 抽象层（账单/预算/分类/账本/借条 全部走这里）
// - 轻量配置（主题/登录态）仍走 localStorage（utils/storage.ts）
// - 大数据（>1MB）走这里，绕过 localStorage 5MB 限制
// - 写入失败自动降级到 localStorage 兜底
// ----------------------------------------------------------------

const DB_NAME = 'fab_db'
const DB_VERSION = 1

// 表设计：使用通用 kv 表为主，部分专用表带 keyPath
const STORE_KV = 'kv'
const STORE_TRANSACTIONS = 'transactions'
const STORE_BOOKS = 'books'
const STORE_CATEGORIES = 'categories'
const STORE_LENDBORROW = 'lendborrow'

let _dbPromise: Promise<IDBDatabase> | null = null
let _bootstrapResolvers: Array<() => void> = []
let _bootstrapped = false

/** 启动 IDB（幂等）。返回 Promise，应用入口 await */
export function bootstrapIDB(): Promise<void> {
  if (_bootstrapped) return Promise.resolve()
  if (_dbPromise) return _dbPromise.then(() => undefined)
  _dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_KV)) {
        db.createObjectStore(STORE_KV)
      }
      if (!db.objectStoreNames.contains(STORE_TRANSACTIONS)) {
        const s = db.createObjectStore(STORE_TRANSACTIONS, { keyPath: 'objectId' })
        s.createIndex('bookId', 'bookId', { unique: false })
        s.createIndex('date', 'date', { unique: false })
      }
      if (!db.objectStoreNames.contains(STORE_BOOKS)) {
        db.createObjectStore(STORE_BOOKS, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(STORE_CATEGORIES)) {
        db.createObjectStore(STORE_CATEGORIES, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(STORE_LENDBORROW)) {
        db.createObjectStore(STORE_LENDBORROW, { keyPath: 'objectId' })
      }
    }
    req.onsuccess = () => {
      const db = req.result
      _bootstrapped = true
      resolve(db)
      // 唤醒所有等待者
      _bootstrapResolvers.forEach(r => r())
      _bootstrapResolvers = []
    }
    req.onerror = () => {
      console.error('[IDB] open 失败', req.error)
      _bootstrapped = true // 标记为已启动，避免无限等待；后续调用走兜底
      _bootstrapResolvers.forEach(r => r())
      _bootstrapResolvers = []
      reject(req.error)
    }
    req.onblocked = () => {
      console.warn('[IDB] open blocked（可能其它标签页正在使用旧版数据库）')
    }
  }).catch(e => {
    console.error('[IDB] bootstrap 失败，降级到 localStorage', e)
    return null as unknown as IDBDatabase
  })
  return _dbPromise.then(() => undefined)
}

export function isBootstrapped(): boolean {
  return _bootstrapped
}

export function waitForBootstrap(): Promise<void> {
  if (_bootstrapped) return Promise.resolve()
  return new Promise(resolve => {
    _bootstrapResolvers.push(resolve)
    // 兜底：5 秒超时强制放行
    setTimeout(() => {
      if (!_bootstrapped) {
        console.warn('[IDB] bootstrap 超时，强制放行')
        _bootstrapped = true
        _bootstrapResolvers.forEach(r => r())
        _bootstrapResolvers = []
        resolve()
      }
    }, 5000)
  })
}

/** 内部：获取 IDB 实例（已 bootstrap 前提下） */
function getDB(): Promise<IDBDatabase | null> {
  if (!_dbPromise) return Promise.resolve(null)
  return _dbPromise.then(db => db || null).catch(() => null)
}

// ====== KV 通用表（用于简单标量/对象，如 budgets、monthBudgets、customCategories 数组） ======

export async function idbGet<T = any>(storeName: string, key: string): Promise<T | null> {
  const db = await getDB()
  if (!db) return null
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readonly')
      const store = tx.objectStore(storeName)
      const req = store.get(key)
      req.onsuccess = () => resolve((req.result as T) ?? null)
      req.onerror = () => {
        console.warn(`[IDB] get 失败 ${storeName}/${key}`, req.error)
        resolve(null)
      }
    } catch (e) {
      console.warn(`[IDB] get 异常 ${storeName}/${key}`, e)
      resolve(null)
    }
  })
}

export async function idbSet<T = any>(storeName: string, key: string | number, value: T): Promise<boolean> {
  const db = await getDB()
  if (!db) return false
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)
      // 专用表（带 keyPath）使用 put(value)，通用表使用 put(value, key)
      const hasKeyPath = store.keyPath !== null
      const req = hasKeyPath ? store.put(value) : store.put(value, key as string)
      req.onsuccess = () => resolve(true)
      req.onerror = () => {
        console.error(`[IDB] set 失败 ${storeName}/${key}`, req.error)
        resolve(false)
      }
    } catch (e) {
      console.error(`[IDB] set 异常 ${storeName}/${key}`, e)
      resolve(false)
    }
  })
}

export async function idbDel(storeName: string, key: string | number): Promise<boolean> {
  const db = await getDB()
  if (!db) return false
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)
      const req = store.delete(key as string)
      req.onsuccess = () => resolve(true)
      req.onerror = () => {
        console.warn(`[IDB] del 失败 ${storeName}/${key}`, req.error)
        resolve(false)
      }
    } catch (e) {
      console.warn(`[IDB] del 异常 ${storeName}/${key}`, e)
      resolve(false)
    }
  })
}

export async function idbClear(storeName: string): Promise<boolean> {
  const db = await getDB()
  if (!db) return false
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)
      const req = store.clear()
      req.onsuccess = () => resolve(true)
      req.onerror = () => {
        console.warn(`[IDB] clear 失败 ${storeName}`, req.error)
        resolve(false)
      }
    } catch (e) {
      console.warn(`[IDB] clear 异常 ${storeName}`, e)
      resolve(false)
    }
  })
}

export async function idbKeys(storeName: string): Promise<string[]> {
  const db = await getDB()
  if (!db) return []
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readonly')
      const store = tx.objectStore(storeName)
      const req = store.getAllKeys()
      req.onsuccess = () => resolve((req.result as IDBValidKey[]).map(String))
      req.onerror = () => resolve([])
    } catch {
      resolve([])
    }
  })
}

export async function idbGetAll<T = any>(storeName: string): Promise<T[]> {
  const db = await getDB()
  if (!db) return []
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readonly')
      const store = tx.objectStore(storeName)
      const req = store.getAll()
      req.onsuccess = () => resolve((req.result as T[]) || [])
      req.onerror = () => resolve([])
    } catch {
      resolve([])
    }
  })
}

/** 通用 setter：写入失败时降级到 localStorage（仅适用于轻量数据） */
export async function idbSetWithFallback(storeName: string, key: string, value: any, localKey?: string): Promise<boolean> {
  const ok = await idbSet(storeName, key, value)
  if (!ok && localKey) {
    try {
      localStorage.setItem(localKey, JSON.stringify(value))
      return true
    } catch (e) {
      console.error(`[IDB+LS] 双写均失败 ${localKey}`, e)
      return false
    }
  }
  return ok
}

// ====== 预定义 store 名（避免字符串散落） ======
export const IDB_STORES = {
  KV: STORE_KV,
  TRANSACTIONS: STORE_TRANSACTIONS,
  BOOKS: STORE_BOOKS,
  CATEGORIES: STORE_CATEGORIES,
  LENDBORROW: STORE_LENDBORROW,
} as const

// ====== 数据表结构校验（启动时调用，缺字段自动补默认） ======
const REQUIRED_TX_FIELDS: Array<[string, any]> = [
  ['objectId', () => `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`],
  ['bookId', () => 'default'],
  ['type', () => 'expense'],
  ['amount', () => 0],
  ['date', () => new Date().toISOString().slice(0, 10)],
  ['category', () => '其他'],
  ['paymentMethod', () => '现金'],
  ['note', () => ''],
  ['createdBy', () => ''],
  ['createdAt', () => new Date().toISOString()],
  ['updatedAt', () => new Date().toISOString()],
]

export interface SchemaCheckResult {
  total: number
  fixed: number
  details: string[]
}

export async function validateAndFixTransactions(): Promise<SchemaCheckResult> {
  const result: SchemaCheckResult = { total: 0, fixed: 0, details: [] }
  const list = await idbGetAll<any>(IDB_STORES.TRANSACTIONS)
  result.total = list.length
  for (const tx of list) {
    let patched = false
    for (const [field, defaultFn] of REQUIRED_TX_FIELDS) {
      if (tx[field] === undefined || tx[field] === null) {
        tx[field] = defaultFn()
        patched = true
      }
    }
    if (patched) {
      result.fixed++
      result.details.push(`自动补字段: ${tx.objectId}`)
    }
  }
  if (result.fixed > 0) {
    // 批量回写
    const db = await getDB()
    if (!db) return result
    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(IDB_STORES.TRANSACTIONS, 'readwrite')
        const store = tx.objectStore(IDB_STORES.TRANSACTIONS)
        for (const item of list) store.put(item)
        tx.oncomplete = () => resolve()
        tx.onerror = () => resolve()
      } catch {
        resolve()
      }
    })
    result.details.unshift(`已自动修复 ${result.fixed} 条老数据`)
  }
  return result
}
