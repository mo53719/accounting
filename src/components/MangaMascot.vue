<template>
  <div :class="containerClass">
    <!-- ========== 漫画人物：拿着小账本的卡通角色 ========== -->
    <svg
      viewBox="0 0 160 170"
      xmlns="http://www.w3.org/2000/svg"
      class="pet-svg"
    >
      <!-- 身下阴影 -->
      <ellipse cx="80" cy="158" rx="38" ry="5" class="pet-fill-light" opacity="0.5"/>

      <!-- 腿部（两条小短腿） -->
      <rect x="62" y="120" width="14" height="28" rx="6" class="pet-fill-main" transform="rotate(-5 69 134)"/>
      <rect x="84" y="120" width="14" height="28" rx="6" class="pet-fill-main" transform="rotate(5 91 134)"/>

      <!-- 身体（椭圆形，像穿着小衣服） -->
      <ellipse cx="80" cy="105" rx="32" ry="24" class="pet-fill-main"/>
      <!-- 身体亮色高光 -->
      <ellipse cx="72" cy="100" rx="14" ry="10" class="pet-fill-light" opacity="0.7"/>

      <!-- 左手（举起的手势） -->
      <ellipse cx="48" cy="95" rx="8" ry="10" class="pet-fill-main"/>
      <!-- 右手（拿着账本） -->
      <ellipse cx="112" cy="100" rx="8" ry="10" class="pet-fill-main"/>

      <!-- 右手拿的小账本 -->
      <g transform="translate(105, 86) rotate(12)">
        <rect x="0" y="0" width="22" height="18" rx="2" class="pet-fill-main" stroke="var(--primary-dark)" stroke-width="1"/>
        <line x1="4" y1="5" x2="18" y2="5" stroke="var(--primary-light)" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="4" y1="9" x2="18" y2="9" stroke="var(--primary-light)" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="4" y1="13" x2="14" y2="13" stroke="var(--primary-light)" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="19" cy="4" r="2" class="pet-fill-dark"/>
      </g>

      <!-- 头部（大圆脸） -->
      <circle cx="80" cy="58" r="34" class="pet-fill-main"/>
      <!-- 脸部高光 -->
      <ellipse cx="68" cy="50" rx="12" ry="8" class="pet-fill-light" opacity="0.7"/>

      <!-- 头发造型（头顶的尖尖发束） -->
      <path d="M60 30 Q65 18 75 28 Q80 18 85 28 Q95 18 100 30 Q95 22 90 32 Q85 24 80 34 Q75 24 70 32 Q65 22 60 30 Z" class="pet-fill-dark"/>
      <!-- 额前小刘海 -->
      <path d="M58 42 Q64 34 70 44 Q76 34 82 44 Q88 34 94 44 Q100 36 104 42" fill="none" stroke="var(--primary-dark)" stroke-width="2" stroke-linecap="round"/>

      <!-- 左眼（大眼睛+高光） -->
      <ellipse cx="66" cy="62" rx="6" ry="8" class="pet-fill-dark"/>
      <circle cx="68" cy="60" r="2" fill="#fff"/>
      <circle cx="64" cy="65" r="1" fill="#fff" opacity="0.8"/>

      <!-- 右眼 -->
      <ellipse cx="94" cy="62" rx="6" ry="8" class="pet-fill-dark"/>
      <circle cx="96" cy="60" r="2" fill="#fff"/>
      <circle cx="92" cy="65" r="1" fill="#fff" opacity="0.8"/>

      <!-- 腮红 -->
      <ellipse cx="56" cy="74" rx="6" ry="3" class="pet-fill-light" opacity="0.8"/>
      <ellipse cx="104" cy="74" rx="6" ry="3" class="pet-fill-light" opacity="0.8"/>

      <!-- 嘴巴（小微笑） -->
      <path d="M74 80 Q80 86 86 80" fill="none" stroke="var(--primary-dark)" stroke-width="2" stroke-linecap="round"/>

      <!-- 胸前的小星星装饰 -->
      <g transform="translate(74, 102)">
        <path d="M0 -5 L1.5 -1.5 L5 -1 L2 1 L3 5 L0 2.5 L-3 5 L-2 1 L-5 -1 L-1.5 -1.5 Z" class="pet-fill-dark" opacity="0.7"/>
      </g>

      <!-- 漫画效果：脸颊线条（手绘感） -->
      <path d="M54 70 Q52 72 50 70" fill="none" stroke="var(--primary-dark)" stroke-width="1" opacity="0.5"/>
      <path d="M110 70 Q108 72 106 70" fill="none" stroke="var(--primary-dark)" stroke-width="1" opacity="0.5"/>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  size?: 'large' | 'mini' | 'corner'
}>()

const containerClass = computed(() => {
  switch (props.size) {
    case 'mini':   return 'pet-mascot-mini'
    case 'corner': return 'pet-mascot-corner'
    default:       return 'pet-mascot'
  }
})
</script>

<style scoped>
/* 样式继承 main.css 中的 .pet-mascot* 全局规则 */
</style>
