import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getLocal, setLocal } from '../utils/storage'
import { idbGet, idbSet, IDB_STORES, bootstrapIDB } from '../utils/idb'
import { CATEGORIES } from '../utils/format'

export interface CustomCategory {
  id: string
  name: string
  icon: string
  type: 'expense' | 'income'
  color?: string
  bgColor?: string
  isPreset?: boolean
}

let _idbLoaded = false

async function persistCustom(list: CustomCategory[]) {
  try {
    setLocal('customCategories', list)
  } catch (e) {
    console.warn('[category] localStorage 写入失败（IDB 兜底）', e)
  }
  await bootstrapIDB()
  await idbSet(IDB_STORES.KV, 'customCategories', list)
}

export const useCategoryStore = defineStore('category', () => {
  const customCategories = ref<CustomCategory[]>(getLocal<CustomCategory[]>('customCategories') || [])

  // 启动时从 IDB 覆盖
  if (!_idbLoaded) {
    _idbLoaded = true
    ;(async () => {
      await bootstrapIDB()
      const list = await idbGet<CustomCategory[]>(IDB_STORES.KV, 'customCategories')
      if (list && Array.isArray(list) && list.length >= customCategories.value.length) {
        customCategories.value = list
      }
    })().catch(e => console.warn('[category] IDB 加载失败', e))
  }

  // 支出分类（预设 + 自定义）
  const expenseCategories = computed(() => getAllCategories('expense'))
  // 收入分类（预设 + 自定义）
  const incomeCategories = computed(() => getAllCategories('income'))

  // 获取所有分类（预设 + 自定义）
  function getAllCategories(type: 'expense' | 'income') {
    const presets: CustomCategory[] = CATEGORIES[type].map(c => ({
      ...c,
      id: `preset_${c.name}`,
      isPreset: true,
    }))
    const customs = customCategories.value.filter(c => c.type === type)
    return [...presets, ...customs]
  }

  function addCustomCategory(data: Omit<CustomCategory, 'id'>) {
    const category: CustomCategory = {
      ...data,
      id: `custom_${Date.now()}`,
    }
    customCategories.value.push(category)
    persistCustom(customCategories.value)
  }

  function removeCustomCategory(id: string) {
    customCategories.value = customCategories.value.filter(c => c.id !== id)
    persistCustom(customCategories.value)
  }

  function updateCustomCategory(id: string, data: Partial<CustomCategory>) {
    const idx = customCategories.value.findIndex(c => c.id === id)
    if (idx !== -1) {
      customCategories.value[idx] = { ...customCategories.value[idx], ...data }
      persistCustom(customCategories.value)
    }
  }

  // 重排分类（拖拽）
  function reorderCategory(type: 'expense' | 'income', fromId: string, toId: string) {
    const isPreset = (id: string) => id.startsWith('preset_')
    if (isPreset(fromId) || isPreset(toId)) return
    const fromIdx = customCategories.value.findIndex(c => c.id === fromId)
    const toIdx = customCategories.value.findIndex(c => c.id === toId)
    if (fromIdx === -1 || toIdx === -1) return
    const item = customCategories.value.splice(fromIdx, 1)[0]
    customCategories.value.splice(toIdx, 0, item)
    persistCustom(customCategories.value)
  }

  // 根据名称和类型查找分类（含预设）
  function findCategory(name: string, type: 'expense' | 'income') {
    const all = getAllCategories(type)
    return all.find(c => c.name === name)
  }

  return {
    customCategories,
    expenseCategories,
    incomeCategories,
    getAllCategories,
    addCustomCategory,
    removeCustomCategory,
    updateCustomCategory,
    reorderCategory,
    findCategory
  }
})
