import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getLocal, setLocal, setLocalSafe } from '../utils/storage'
import { idbGet, idbSet, IDB_STORES, bootstrapIDB } from '../utils/idb'
import { DEFAULT_MEMBERS } from '../utils/format'

export interface Member {
  name: string
  icon: string
}

export interface Book {
  id: string
  name: string
  icon: string
}

const DEFAULT_BOOKS: Book[] = [
  { id: 'default', name: '日常账本', icon: '📖' },
]

/* 异步写 IDB + 同步写 localStorage（轻量配置用 localStorage） */
async function persistKV<T>(storeName: string, key: string, value: T, localKey?: string) {
  await bootstrapIDB()
  await idbSet(storeName, key, value)
  if (localKey) setLocalSafe(localKey, value)
}

let _idbLoaded = false

async function loadKV<T>(storeName: string, key: string): Promise<T | null> {
  await bootstrapIDB()
  return await idbGet<T>(storeName, key)
}

export const useBookStore = defineStore('book', () => {
  // 轻量配置：localStorage（启动即得，无延迟）
  const bookId = ref<string>(getLocal('bookId') || 'default')
  const deviceName = ref<string>(getLocal('deviceName') || generateDeviceName())
  const userName = ref<string>(getLocal('userName') || '')
  const userPhoto = ref<string>(getLocal('userPhoto') || '')

  // 大数据：先从 localStorage 取（首屏），后台 IDB 覆盖
  const savedBooks = getLocal<Book[]>('books')
  const books = ref<Book[]>(
    Array.isArray(savedBooks) && savedBooks.length > 0 ? savedBooks : [...DEFAULT_BOOKS]
  )
  const savedMembers = getLocal<Member[]>('members')
  const members = ref<Member[]>(Array.isArray(savedMembers) ? savedMembers : [...DEFAULT_MEMBERS])

  // 预算（按维度分别存：日/月/年/全部/自定义）
  const defaultBudgets: Record<string, number> = { day: 100, month: 3000, year: 36000, all: 36000, custom: 3000 }
  const savedBudgets = getLocal<Record<string, number>>('budgets') || defaultBudgets
  const budgets = ref<Record<string, number>>({ ...defaultBudgets, ...savedBudgets })

  // 月度预算（key: YYYY-MM, value: number）
  const savedMonthBudgets = getLocal<Record<string, number>>('monthBudgets') || {}
  const monthBudgets = ref<Record<string, number>>({ ...savedMonthBudgets })

  // 后台从 IDB 覆盖（仅一次）
  if (!_idbLoaded) {
    _idbLoaded = true
    ;(async () => {
      const [b, m, bgt, mbgt] = await Promise.all([
        loadKV<Book[]>(IDB_STORES.KV, 'books'),
        loadKV<Member[]>(IDB_STORES.KV, 'members'),
        loadKV<Record<string, number>>(IDB_STORES.KV, 'budgets'),
        loadKV<Record<string, number>>(IDB_STORES.KV, 'monthBudgets'),
      ])
      if (b && Array.isArray(b) && b.length > 0) books.value = b
      if (m && Array.isArray(m)) members.value = m
      if (bgt && typeof bgt === 'object') budgets.value = { ...defaultBudgets, ...bgt }
      if (mbgt && typeof mbgt === 'object') monthBudgets.value = { ...mbgt }
    })().catch(e => console.warn('[book] IDB 加载失败', e))
  }

  const isEntered = computed(() => bookId.value !== '')

  function saveBooks() {
    setLocal('books', books.value)
    persistKV(IDB_STORES.KV, 'books', books.value, 'books')
  }

  function setBookId(id: string) {
    bookId.value = id
    setLocal('bookId', id)
  }

  function addBook(book: { name: string; icon: string }) {
    const newBook: Book = {
      id: 'book_' + Date.now(),
      name: book.name.trim() || '新账本',
      icon: book.icon || '📒',
    }
    books.value.push(newBook)
    saveBooks()
    setBookId(newBook.id)
    return newBook
  }

  function removeBook(id: string) {
    if (books.value.length <= 1) return
    books.value = books.value.filter(b => b.id !== id)
    saveBooks()
    if (bookId.value === id) {
      setBookId(books.value[0].id)
    }
  }

  function switchBook(id: string) {
    const exists = books.value.some(b => b.id === id)
    if (exists) setBookId(id)
  }

  function setDeviceName(name: string) {
    deviceName.value = name
    setLocal('deviceName', name)
  }

  function setUserName(name: string) {
    userName.value = name
    setLocal('userName', name)
  }

  function setUserPhoto(photo: string) {
    userPhoto.value = photo
    setLocal('userPhoto', photo)
  }

  function clearBook() {
    bookId.value = ''
    setLocal('bookId', '')
  }

  function addMember(member: Member) {
    members.value.push(member)
    setLocal('members', members.value)
    persistKV(IDB_STORES.KV, 'members', members.value, 'members')
  }

  function removeMember(name: string) {
    if (name === '我') return
    try {
      members.value = members.value.filter(m => m.name !== name)
      setLocal('members', members.value)
      persistKV(IDB_STORES.KV, 'members', members.value, 'members')
    } catch (e) {
      console.error('删除记账人失败:', e)
      members.value = [...DEFAULT_MEMBERS]
      setLocal('members', members.value)
      persistKV(IDB_STORES.KV, 'members', members.value, 'members')
    }
  }

  function setMonthlyBudget(amount: number) {
    budgets.value.month = amount
    setLocal('budgets', budgets.value)
    persistKV(IDB_STORES.KV, 'budgets', budgets.value, 'budgets')
  }

  function setBudget(range: string, amount: number) {
    budgets.value[range] = amount
    setLocal('budgets', budgets.value)
    persistKV(IDB_STORES.KV, 'budgets', budgets.value, 'budgets')
  }

  function getBudget(range: string): number {
    return budgets.value[range] || 0
  }

  function setMonthBudget(monthKey: string, amount: number) {
    monthBudgets.value[monthKey] = amount
    // 修复 bug 0-2：统一走 setLocal（而非直接 localStorage.setItem）+ 同步写 IDB
    setLocal('monthBudgets', { ...monthBudgets.value })
    persistKV(IDB_STORES.KV, 'monthBudgets', { ...monthBudgets.value }, 'monthBudgets')
  }

  /** 删除某月定制预算（回落到默认） */
  function removeMonthBudget(monthKey: string) {
    if (monthKey in monthBudgets.value) {
      delete monthBudgets.value[monthKey]
      setLocal('monthBudgets', { ...monthBudgets.value })
      persistKV(IDB_STORES.KV, 'monthBudgets', { ...monthBudgets.value }, 'monthBudgets')
    }
  }

  function getMonthBudget(monthKey: string): number {
    if (monthBudgets.value[monthKey] !== undefined && monthBudgets.value[monthKey] > 0) {
      return monthBudgets.value[monthKey]
    }
    return budgets.value.month || 0
  }

  function generateDeviceName(): string {
    const names = ['设备A', '设备B', '设备C', '设备D']
    const name = names[Math.floor(Math.random() * names.length)]
    setLocal('deviceName', name)
    return name
  }

  return {
    bookId,
    deviceName,
    userName,
    userPhoto,
    isEntered,
    books,
    members,
    budgets,
    monthBudgets,
    setBookId,
    addBook,
    removeBook,
    switchBook,
    saveBooks,
    setDeviceName,
    setUserName,
    setUserPhoto,
    clearBook,
    addMember,
    removeMember,
    setMonthlyBudget,
    setBudget,
    getBudget,
    setMonthBudget,
    removeMonthBudget,
    getMonthBudget,
  }
})
