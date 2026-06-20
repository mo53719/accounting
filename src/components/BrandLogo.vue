<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 480 320"
    xmlns="http://www.w3.org/2000/svg"
    class="brand-logo-svg"
    role="img"
    aria-label="小余简单记"
  >
    <defs>
      <!-- 文字路径：轻微向上弧形（中间高两端低） -->
      <path
        id="brandArc"
        d="M 90 180 Q 240 130 390 180"
        fill="none"
        stroke="none"
      />
    </defs>

    <!-- 纯白底 -->
    <rect x="0" y="0" width="480" height="320" fill="#FFFFFF" />

    <!-- ============== 顶部装饰：左侧小金币 ============== -->
    <g transform="translate(75, 95)">
      <circle cx="0" cy="0" r="18" fill="#FFE5B4" stroke="#E8B85C" stroke-width="2" />
      <circle cx="0" cy="0" r="12" fill="none" stroke="#E8B85C" stroke-width="1" stroke-dasharray="2 2" />
      <text x="0" y="5" text-anchor="middle" font-size="14" font-weight="700" fill="#C89540" font-family="'Hannotate SC', 'PingFang SC', sans-serif">¥</text>
      <ellipse cx="-6" cy="-8" rx="4" ry="2.5" fill="#FFFFFF" opacity="0.7" />
    </g>

    <!-- ============== 顶部装饰：右侧小钱袋 ============== -->
    <g transform="translate(405, 100) rotate(12)">
      <rect x="-16" y="-22" width="32" height="6" rx="2" fill="#C89540" />
      <path
        d="M -22 -16 Q -25 0 -17 18 Q -6 25 0 25 Q 6 25 17 18 Q 25 0 22 -16 Q 16 -19 0 -19 Q -16 -19 -22 -16 Z"
        fill="#FFB6B9"
        stroke="#D88A8E"
        stroke-width="2"
        stroke-linejoin="round"
      />
      <text x="0" y="7" text-anchor="middle" font-size="14" font-weight="700" fill="#C45657" font-family="'Hannotate SC', 'PingFang SC', sans-serif">¥</text>
      <ellipse cx="-8" cy="-6" rx="5" ry="2.5" fill="#FFFFFF" opacity="0.6" />
    </g>

    <!-- ============== 顶部中央：小星星 ============== -->
    <g transform="translate(240, 75)">
      <path
        d="M 0 -8 L 2 -2 L 8 -2 L 3 2 L 5 8 L 0 4 L -5 8 L -3 2 L -8 -2 L -2 -2 Z"
        fill="#FFD27A"
        stroke="#E8B85C"
        stroke-width="1.2"
        stroke-linejoin="round"
      />
    </g>

    <!-- ============== 主标题：弧形排列 ============== -->
    <text
      font-family="'Hannotate SC', 'STHupo', '华文琥珀', 'Comic Sans MS', 'Hiragino Maru Gothic Pro', 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif"
      font-size="56"
      font-weight="900"
      fill="#D88A8E"
      stroke="#B85F65"
      stroke-width="2.5"
      stroke-linejoin="round"
      stroke-linecap="round"
      paint-order="stroke fill"
      letter-spacing="4"
    >
      <textPath href="#brandArc" startOffset="50%" text-anchor="middle">
        小余简单记
      </textPath>
    </text>

    <!-- ============== 底部装饰：左侧小账本 ============== -->
    <g transform="translate(95, 245) rotate(-8)">
      <rect x="-20" y="-15" width="40" height="30" rx="3" fill="#B5EAD7" stroke="#7AC9A8" stroke-width="2" />
      <line x1="0" y1="-15" x2="0" y2="15" stroke="#7AC9A8" stroke-width="1.5" />
      <rect x="2" y="-12" width="16" height="24" rx="1" fill="#FFFFFF" stroke="#7AC9A8" stroke-width="1" />
      <line x1="6" y1="-6" x2="14" y2="-6" stroke="#B5EAD7" stroke-width="1" />
      <line x1="6" y1="-1" x2="14" y2="-1" stroke="#B5EAD7" stroke-width="1" />
      <line x1="6" y1="4" x2="14" y2="4" stroke="#B5EAD7" stroke-width="1" />
      <line x1="6" y1="9" x2="11" y2="9" stroke="#B5EAD7" stroke-width="1" />
      <path d="M 13 -15 L 13 -7 L 16 -10 L 19 -7 L 19 -15 Z" fill="#FFB6B9" stroke="#D88A8E" stroke-width="1" stroke-linejoin="round" />
    </g>

    <!-- ============== 底部装饰：右侧小金币 ============== -->
    <g transform="translate(385, 250)">
      <circle cx="0" cy="0" r="16" fill="#C7CEEA" stroke="#9099C0" stroke-width="2" />
      <text x="0" y="5" text-anchor="middle" font-size="12" font-weight="700" fill="#5C6494" font-family="'Hannotate SC', 'PingFang SC', sans-serif">¥</text>
      <ellipse cx="-5" cy="-7" rx="4" ry="2.5" fill="#FFFFFF" opacity="0.7" />
    </g>

    <!-- ============== 底部装饰：中央小心 ============== -->
    <g transform="translate(240, 270)">
      <path
        d="M 0 -3 C -2 -6 -7 -6 -7 -2 C -7 1 0 5 0 5 C 0 5 7 1 7 -2 C 7 -6 2 -6 0 -3 Z"
        fill="#FFB6B9"
        stroke="#D88A8E"
        stroke-width="1.2"
        stroke-linejoin="round"
      />
    </g>
  </svg>
</template>

<script setup lang="ts">
interface Props {
  width?: number | string
  height?: number | string
}
withDefaults(defineProps<Props>(), {
  width: 300,
  height: 200,
})
</script>

<style scoped>
.brand-logo-svg {
  display: block;
  user-select: none;
  -webkit-user-drag: none;
  background: #FFFFFF;
}
</style>
