<template>
  <!--
    通用插画渲染组件
    用法 A: 通过 theme + slot 自动查 illustrationPaths
    用法 B: 通过 customUrl 直接传 URL（推荐给随机抽取场景）
    用法 C: 通过 moduleId 让组件内部自动随机抽（独立模块池，跨模块互不干扰）
  -->
  <img
    v-if="resolvedUrl && !errored"
    :src="resolvedUrl"
    :class="cssClass"
    :style="styleObj"
    :alt="alt || ''"
    aria-hidden="true"
    @error="onError"
    @load="onLoad"
  />
  <!-- 加载失败占位：1x1 透明像素，不影响布局 -->
  <span v-else-if="errored" :class="cssClass" :style="placeholderStyle" aria-hidden="true"></span>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  getIllustrationPath,
  type ThemeName,
  type IllustrationSlot,
} from '../assets/illustrations.config'
import {
  useModuleIllustrationPool,
  rebuildIllustrationPool,
} from '../composables/useIllustrationPicker'
import { currentThemeSet } from '../composables/useTheme'

const props = withDefaults(defineProps<{
  /** 主题（standard/onepiece/family） */
  theme: ThemeName
  /** 语义 slot 名（cardExpense/emptyBills/...） */
  slot: IllustrationSlot
  /** 自定义 CSS class */
  cssClass?: string
  /** 自定义 style 对象 */
  styleObj?: Record<string, string | number>
  /** alt 文本 */
  alt?: string
  /** 是否启用 fallback 插槽（图片加载失败时显示） */
  useFallback?: boolean
  /** 直接传 URL（覆盖自动查表，推荐给 picker 抽图场景） */
  customUrl?: string
  /**
   * 独立插画模块 ID（推荐）
   * - 每个 moduleId 拥有独立的素材池与「已使用清单」
   * - 同一页面内的不同区域使用不同 moduleId → 互不干扰
   * - 同一页面内的同一区域（多次出现）使用相同 moduleId → 共享池
   */
  moduleId?: string
  /** 兼容旧 pageId（行为等同 moduleId） */
  pageId?: string
}>(), {
  cssClass: '',
  styleObj: () => ({}),
  alt: '',
  useFallback: false,
  customUrl: '',
  moduleId: '',
  pageId: '',
})

const errored = ref(false)
const loaded = ref(false)

/* 实际生效的模块 ID（moduleId 优先，pageId 兼容） */
const effectiveModuleId = computed<string>(() => props.moduleId || props.pageId || '')

/* Pool 用 ref 持有：主题切换时重建（修复家人主题切换后插画不刷新问题） */
const poolRef = ref<ReturnType<typeof useModuleIllustrationPool> | null>(null)

function ensurePool() {
  if (!effectiveModuleId.value) {
    poolRef.value = null
    return
  }
  poolRef.value = useModuleIllustrationPool(effectiveModuleId.value)
}
ensurePool()

/* 主题或 moduleId 变化时重建 pool，避免使用旧主题的 urlPool */
watch([currentThemeSet, effectiveModuleId], () => {
  if (effectiveModuleId.value) rebuildIllustrationPool(effectiveModuleId.value)
  ensurePool()
  errored.value = false
  loaded.value = false
})

/* 从独立模块池抽 1 张未使用过的图 */
const moduleUrl = computed<string>(() => {
  const p = poolRef.value
  if (!p) return ''
  if (!p.isEnabled) return ''
  if (p.isStandard) return ''
  return p.pickOne()
})

const resolvedUrl = computed(() => {
  if (props.customUrl) return props.customUrl
  if (moduleUrl.value) return moduleUrl.value
  return getIllustrationPath(props.theme, props.slot)
})

function onError() {
  errored.value = true
  // 加载失败仅记录，不抛错（避免影响页面）
  // eslint-disable-next-line no-console
  console.warn(
    `[IllustrationImage] 加载失败: ${resolvedUrl.value}（moduleId: ${effectiveModuleId.value}, theme: ${props.theme}）`
  )
}

/** 占位元素 style：保持原本 cssClass 给的尺寸，避免布局塌陷 */
const placeholderStyle = computed(() => {
  return {
    ...props.styleObj,
    display: 'inline-block',
    opacity: 0,
  }
})

function onLoad() {
  loaded.value = true
  errored.value = false
}

// theme / slot / customUrl 变化时重置错误状态（moduleId 变化由上面的 watcher 统一处理）
watch(
  () => [props.theme, props.slot, props.customUrl],
  () => {
    errored.value = false
    loaded.value = false
  }
)
</script>

<style scoped>
img {
  display: block;
  user-select: none;
  pointer-events: none;
  -webkit-user-drag: none;
}
</style>
