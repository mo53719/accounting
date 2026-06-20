<template>
  <!-- 标准纯净简约风格：什么都不渲染 -->
  <template v-if="currentThemeSet === 'standard'"></template>

  <!-- 海贼王风格：手绘海贼王人物（路飞+索隆 等） -->
  <!-- 注意：家人主题无装饰，所以只渲染 MangaMascot 给 onepiece -->
  <template v-else-if="(currentThemeSet as string) === 'onepiece'">
    <MangaMascot :size="size" />
  </template>
</template>

<script setup lang="ts">
import { currentThemeSet } from '../composables/useTheme'
import MangaMascot from './MangaMascot.vue'

defineProps<{
  size?: 'large' | 'mini' | 'corner'
  variant?: 'cat' | 'dog'  // 兼容旧字段（已无实际效果）
}>()
</script>

<style scoped>
/* 样式继承 main.css 的全局规则 */
</style>
