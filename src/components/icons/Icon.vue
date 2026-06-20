<template>
  <svg
    :viewBox="iconDef.viewBox"
    :width="size"
    :height="size"
    fill="none"
    :stroke="stroke"
    :stroke-width="iconDef.strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    :class="['theme-icon', `theme-icon-${themeName}`]"
    v-html="iconDef.paths"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getIcon } from './index'
import { currentThemeSet } from '../../composables/useTheme'

const props = withDefaults(
  defineProps<{
    name: string
    size?: number | string
    stroke?: string
  }>(),
  {
    size: 22,
    stroke: 'currentColor',
  }
)

const themeName = computed(() => currentThemeSet.value)
const iconDef = computed(() => getIcon(props.name, themeName.value))
</script>

<style scoped>
.theme-icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
  transition: stroke-width 0.2s ease, opacity 0.2s ease;
}

/* 漫画画风额外增加手绘抖动质感 */
.theme-icon-comic {
  filter: url(#comic-wobble);
}
</style>
