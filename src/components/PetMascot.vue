<template>
  <div :class="containerClass">
    <!-- ========== 猫咪 ========== -->
    <svg
      v-if="pet === 'cat'"
      viewBox="0 0 160 160"
      xmlns="http://www.w3.org/2000/svg"
      class="pet-svg"
    >
      <!-- 身下阴影 -->
      <ellipse cx="80" cy="138" rx="42" ry="6" class="pet-fill-light" opacity="0.6"/>

      <!-- 尾巴 -->
      <path d="M120 110 Q150 90 138 60 Q130 42 115 58" fill="none" stroke="var(--primary)" stroke-width="5" stroke-linecap="round" class="pet-stroke-main"/>

      <!-- 身体（圆胖造型） -->
      <ellipse cx="78" cy="108" rx="44" ry="32" class="pet-fill-main"/>

      <!-- 肚子亮色 -->
      <ellipse cx="78" cy="116" rx="28" ry="18" class="pet-fill-light" opacity="0.7"/>

      <!-- 头部 -->
      <circle cx="78" cy="62" r="34" class="pet-fill-main"/>

      <!-- 左耳 -->
      <path d="M50 36 L56 14 L72 30 Z" class="pet-fill-main" stroke="var(--primary)" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M56 32 L60 22 L66 28 Z" class="pet-fill-dark" opacity="0.6"/>

      <!-- 右耳 -->
      <path d="M106 36 L100 14 L84 30 Z" class="pet-fill-main" stroke="var(--primary)" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M100 32 L96 22 L90 28 Z" class="pet-fill-dark" opacity="0.6"/>

      <!-- 脸部亮色 -->
      <ellipse cx="78" cy="72" rx="24" ry="18" class="pet-fill-light" opacity="0.55"/>

      <!-- 眼睛（圆圆的黑眼睛 + 高光） -->
      <circle cx="66" cy="58" r="5" class="pet-fill-dark"/>
      <circle cx="90" cy="58" r="5" class="pet-fill-dark"/>
      <circle cx="68" cy="56" r="1.5" fill="#fff"/>
      <circle cx="92" cy="56" r="1.5" fill="#fff"/>

      <!-- 腮红 -->
      <ellipse cx="58" cy="72" rx="5" ry="3" class="pet-fill-light" opacity="0.8"/>
      <ellipse cx="98" cy="72" rx="5" ry="3" class="pet-fill-light" opacity="0.8"/>

      <!-- 小嘴（w 形） -->
      <path d="M72 72 Q75 76 78 72 Q81 76 84 72" fill="none" stroke="var(--primary-dark)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- 小胡须 -->
      <line x1="48" y1="72" x2="58" y2="70" stroke="var(--primary-dark)" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
      <line x1="48" y1="76" x2="58" y2="76" stroke="var(--primary-dark)" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
      <line x1="98" y1="70" x2="108" y2="72" stroke="var(--primary-dark)" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
      <line x1="98" y1="76" x2="108" y2="76" stroke="var(--primary-dark)" stroke-width="1" stroke-linecap="round" opacity="0.6"/>

      <!-- 爪子 -->
      <ellipse cx="58" cy="132" rx="10" ry="7" class="pet-fill-dark"/>
      <ellipse cx="98" cy="132" rx="10" ry="7" class="pet-fill-dark"/>
      <ellipse cx="58" cy="130" rx="3" ry="2" class="pet-fill-light" opacity="0.8"/>
      <ellipse cx="98" cy="130" rx="3" ry="2" class="pet-fill-light" opacity="0.8"/>
    </svg>

    <!-- ========== 狗狗 ========== -->
    <svg
      v-else
      viewBox="0 0 160 160"
      xmlns="http://www.w3.org/2000/svg"
      class="pet-svg"
    >
      <!-- 身下阴影 -->
      <ellipse cx="82" cy="138" rx="44" ry="6" class="pet-fill-light" opacity="0.6"/>

      <!-- 尾巴（上翘） -->
      <path d="M128 90 Q148 70 140 48 Q132 36 120 50" fill="none" stroke="var(--primary)" stroke-width="5" stroke-linecap="round"/>

      <!-- 身体 -->
      <ellipse cx="82" cy="108" rx="44" ry="32" class="pet-fill-main"/>

      <!-- 肚子亮色 -->
      <ellipse cx="82" cy="116" rx="28" ry="18" class="pet-fill-light" opacity="0.7"/>

      <!-- 头部 -->
      <ellipse cx="80" cy="62" rx="34" ry="32" class="pet-fill-main"/>

      <!-- 左耳（下垂的圆耳朵） -->
      <ellipse cx="52" cy="48" rx="12" ry="18" class="pet-fill-main" transform="rotate(-20 52 48)"/>
      <ellipse cx="52" cy="50" rx="6" ry="11" class="pet-fill-dark" opacity="0.55" transform="rotate(-20 52 50)"/>

      <!-- 右耳（下垂的圆耳朵） -->
      <ellipse cx="108" cy="48" rx="12" ry="18" class="pet-fill-main" transform="rotate(20 108 48)"/>
      <ellipse cx="108" cy="50" rx="6" ry="11" class="pet-fill-dark" opacity="0.55" transform="rotate(20 108 48)"/>

      <!-- 脸部亮色（口鼻区域） -->
      <ellipse cx="80" cy="76" rx="20" ry="16" class="pet-fill-light" opacity="0.6"/>

      <!-- 眼睛（圆 + 高光） -->
      <circle cx="68" cy="56" r="5" class="pet-fill-dark"/>
      <circle cx="92" cy="56" r="5" class="pet-fill-dark"/>
      <circle cx="70" cy="54" r="1.5" fill="#fff"/>
      <circle cx="94" cy="54" r="1.5" fill="#fff"/>

      <!-- 鼻子（小三角/椭圆） -->
      <ellipse cx="80" cy="72" rx="5" ry="4" class="pet-fill-dark"/>
      <path d="M80 76 L80 82" stroke="var(--primary-dark)" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M80 82 Q74 88 70 85" fill="none" stroke="var(--primary-dark)" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M80 82 Q86 88 90 85" fill="none" stroke="var(--primary-dark)" stroke-width="1.6" stroke-linecap="round"/>

      <!-- 腮红 -->
      <ellipse cx="56" cy="70" rx="5" ry="3" class="pet-fill-light" opacity="0.85"/>
      <ellipse cx="104" cy="70" rx="5" ry="3" class="pet-fill-light" opacity="0.85"/>

      <!-- 爪子 -->
      <ellipse cx="62" cy="132" rx="10" ry="7" class="pet-fill-dark"/>
      <ellipse cx="102" cy="132" rx="10" ry="7" class="pet-fill-dark"/>
      <ellipse cx="62" cy="130" rx="3" ry="2" class="pet-fill-light" opacity="0.8"/>
      <ellipse cx="102" cy="130" rx="3" ry="2" class="pet-fill-light" opacity="0.8"/>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  pet?: 'cat' | 'dog'
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
/* 组件内样式继承全局 main.css 中的 .pet-mascot* 规则 */
</style>
