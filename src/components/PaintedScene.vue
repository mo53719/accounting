<template>
  <!-- 1) 极淡全屏底纹（铺满整个 .home-page 底层，绝对最低 z-index:0）
       仅当 fullBg=true 时渲染，避免在每张卡片内重复占位 -->
  <div v-if="fullBg && ip !== 'none'" class="ip-bg" :class="`ip-bg-${ip}`" aria-hidden="true"></div>

  <!-- 2) 空白页面中央插画（仅当 useScene = true 时显示） -->
  <div v-if="useScene && scene !== 'none'" class="ip-scene" aria-hidden="true">
    <svg
      v-if="sceneSvg"
      class="ip-scene-svg"
      viewBox="0 0 400 280"
      preserveAspectRatio="xMidYMid meet"
      v-html="sceneSvg"
    />
    <IllustrationImage
      v-else-if="ip !== 'none'"
      :theme="ipTheme"
      slot="emptyBills"
      :page-id="pageId"
      :module-id="pageId || undefined"
      css-class="ip-scene-img"
    />
  </div>

  <!-- 3) 卡片右侧大插画（带场景，position absolute 铺满整个卡片）
       优先用外部图片（用户素材），图片缺失或加载失败时 fallback 到 SVG -->
  <div v-if="cardScene" class="ip-card-scene" :class="`ip-card-${ip}`" aria-hidden="true">
    <IllustrationImage
      v-if="cardImageUrl"
      :theme="ipTheme"
      :slot="cardScene === 'expense' ? 'cardExpense' : 'cardIncome'"
      :module-id="pageId || undefined"
      css-class="ip-card-img"
    />
    <svg
      v-else
      class="ip-card-svg"
      viewBox="0 0 400 240"
      preserveAspectRatio="xMidYMid slice"
      v-html="cardSceneSvg"
    />
  </div>
  <!-- 4) 图表容器内背景（统计页 BarChart/LineChart/PieChart 区域） -->
  <div v-if="chartBg" class="ip-chart-bg" :class="`ip-chart-bg-${ip}`" aria-hidden="true"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { currentThemeSet } from '../composables/useTheme'
import { getIllustrationPath, type ThemeName } from '../assets/illustrations.config'
import IllustrationImage from './IllustrationImage.vue'

const props = withDefaults(defineProps<{
  /** 是否启用空白页大插画 */
  useScene?: boolean
  /** 强制 IP（默认随主题） */
  ip?: 'onepiece' | 'family' | 'none'
  /** 是否渲染极淡全屏底纹（仅在 .home-page 顶层调用时设为 true，卡片内调用保持 false 避免重复占位） */
  fullBg?: boolean
  /** 空白页插画场景 */
  scene?: 'empty-bills' | 'empty-savings' | 'empty-lend' | 'empty-budget' | 'none'
  /** 卡片右侧大插画（参考图风格：右侧大角色占位） */
  cardScene?: 'expense' | 'income' | 'none'
  /** 图表容器内低透暗纹背景（统计页 BarChart/LineChart/PieChart 区域） */
  chartBg?: boolean
  /** 统计页专用：使用「娜美支出 / 罗宾收入」独特插画（与首页区分） */
  statsUnique?: boolean
  /** 页面 ID：传值时 PaintedScene 内插画走随机抽图（hero kind），同页不重复 */
  pageId?: string
}>(), {
  useScene: false,
  ip: undefined,
  fullBg: false,
  scene: 'empty-bills',
  cardScene: 'none',
  chartBg: false,
  statsUnique: false,
  pageId: '',
})

// 跟随主题
const ip = computed(() => {
  if (props.ip) return props.ip
  if (currentThemeSet.value === 'onepiece') return 'onepiece'
  if (currentThemeSet.value === 'family') return 'family'
  return 'none'
})

// 主题语义名（用于查 illustrationPaths）
const ipTheme = computed<ThemeName>(() => {
  if (ip.value === 'onepiece') return 'onepiece'
  if (ip.value === 'family') return 'family'
  return 'standard'
})

// 卡片右侧大插画：图片 URL（用户放入即自动启用，缺失则用 SVG）
const cardImageUrl = computed(() => {
  if (props.cardScene === 'none' || !props.cardScene) return ''
  const slot = props.cardScene === 'expense' ? 'cardExpense' : 'cardIncome'
  return getIllustrationPath(ipTheme.value, slot)
})

/* ============================================================
 * 海贼王 - 路飞 + 乔巴 翻账本
 * ============================================================ */
const SCENE_ONEPIECE = `
<g>
  <!-- 地面阴影 -->
  <ellipse cx="200" cy="252" rx="160" ry="12" fill="#000000" opacity="0.08"/>
  <!-- 背景纸面 -->
  <rect x="60" y="50" width="280" height="200" rx="8" fill="#F4E4C0" stroke="#7A4A28" stroke-width="2" opacity="0.4"/>
  <!-- 路飞（左侧） -->
  <g transform="translate(80, 100)">
    <!-- 头 -->
    <circle cx="0" cy="20" r="28" fill="#FFD8A8" stroke="#5C2A18" stroke-width="2.5"/>
    <!-- 草帽 -->
    <ellipse cx="0" cy="-2" rx="40" ry="7" fill="#D4A02A" stroke="#5C2A18" stroke-width="2.5"/>
    <ellipse cx="0" cy="-8" rx="20" ry="16" fill="#E8B73A" stroke="#5C2A18" stroke-width="2.5"/>
    <rect x="-20" y="-10" width="40" height="3.5" fill="#B8281C"/>
    <!-- 大笑 -->
    <path d="M -16 22 Q 0 42 16 22" stroke="#5C2A18" stroke-width="2.5" fill="#FFFFFF"/>
    <path d="M -10 26 L -8 32 L -6 26 Z" fill="#FFFFFF" stroke="#5C2A18" stroke-width="1"/>
    <path d="M 10 26 L 8 32 L 6 26 Z" fill="#FFFFFF" stroke="#5C2A18" stroke-width="1"/>
    <!-- 眼 -->
    <circle cx="-10" cy="10" r="3" fill="#1F1410"/>
    <circle cx="10" cy="10" r="3" fill="#1F1410"/>
    <!-- 伤疤 -->
    <line x1="8" y1="6" x2="14" y2="14" stroke="#5C2A18" stroke-width="1.5" stroke-linecap="round"/>
    <!-- 红背心 -->
    <path d="M -28 42 Q 0 64 28 42 L 28 100 L -28 100 Z" fill="#C8281C" stroke="#5C2A18" stroke-width="2.5"/>
    <!-- 翻账本 -->
    <rect x="-30" y="80" width="60" height="40" rx="3" fill="#FFFFFF" stroke="#5C2A18" stroke-width="2"/>
    <line x1="0" y1="80" x2="0" y2="120" stroke="#5C2A18" stroke-width="1.5"/>
    <line x1="-25" y1="92" x2="-5" y2="92" stroke="#7A4A28" stroke-width="1.5"/>
    <line x1="-25" y1="100" x2="-5" y2="100" stroke="#7A4A28" stroke-width="1.5"/>
    <line x1="-25" y1="108" x2="-10" y2="108" stroke="#7A4A28" stroke-width="1.5"/>
    <line x1="5" y1="92" x2="25" y2="92" stroke="#7A4A28" stroke-width="1.5"/>
    <line x1="5" y1="100" x2="25" y2="100" stroke="#7A4A28" stroke-width="1.5"/>
    <line x1="5" y1="108" x2="20" y2="108" stroke="#7A4A28" stroke-width="1.5"/>
  </g>
  <!-- 乔巴（右侧小） -->
  <g transform="translate(280, 150)">
    <!-- 鹿角 -->
    <line x1="-12" y1="-20" x2="-22" y2="-34" stroke="#7A4A28" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="-12" y1="-20" x2="-8" y2="-34" stroke="#7A4A28" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="12" y1="-20" x2="22" y2="-34" stroke="#7A4A28" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="12" y1="-20" x2="8" y2="-34" stroke="#7A4A28" stroke-width="2.5" stroke-linecap="round"/>
    <!-- 头白 -->
    <circle cx="0" cy="0" r="22" fill="#FFFFFF" stroke="#5C2A18" stroke-width="2.5"/>
    <!-- 蓝帽 -->
    <path d="M -22 -16 Q 0 -36 22 -16 L 22 -8 L -22 -8 Z" fill="#1E5A8A" stroke="#5C2A18" stroke-width="2"/>
    <circle cx="-8" cy="-22" r="2" fill="#FFFFFF"/>
    <circle cx="0" cy="-28" r="2" fill="#FFFFFF"/>
    <circle cx="8" cy="-22" r="2" fill="#FFFFFF"/>
    <!-- 粉鼻 -->
    <ellipse cx="0" cy="8" rx="6" ry="4" fill="#FF8AA0" stroke="#5C2A18" stroke-width="1.5"/>
    <!-- 眼 -->
    <circle cx="-8" cy="-2" r="2.5" fill="#1F1410"/>
    <circle cx="8" cy="-2" r="2.5" fill="#1F1410"/>
    <!-- 笑 -->
    <path d="M 0 14 Q -4 18 -8 16" stroke="#5C2A18" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <path d="M 0 14 Q 4 18 8 16" stroke="#5C2A18" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <!-- 蓝身 -->
    <rect x="-18" y="20" width="36" height="40" rx="6" fill="#1E5A8A" stroke="#5C2A18" stroke-width="2"/>
    <circle cx="-8" cy="34" r="2" fill="#FFFFFF"/>
    <circle cx="8" cy="34" r="2" fill="#FFFFFF"/>
    <rect x="-6" y="44" width="12" height="4" fill="#B8281C"/>
  </g>
  <!-- 飘动金币 -->
  <circle cx="180" cy="60" r="8" fill="#FFD45C" stroke="#7A4A28" stroke-width="1.5"/>
  <text x="180" y="65" text-anchor="middle" fill="#7A4A28" font-size="11" font-weight="bold">¥</text>
  <circle cx="220" cy="80" r="6" fill="#FFD45C" stroke="#7A4A28" stroke-width="1.5"/>
  <text x="220" y="84" text-anchor="middle" fill="#7A4A28" font-size="9" font-weight="bold">¥</text>
</g>`

// 空白场景按 IP 切换：onepiece 在账单场景显示
const sceneSvg = computed(() => {
  if (!props.useScene || props.scene === 'none') return ''
  if (ip.value === 'onepiece') return SCENE_ONEPIECE
  return ''
})

/* ============================================================
 * 卡片右侧大插画 - 海贼王 双角色（路飞 + 索隆）v2 精细版
 * 仿动漫风格：圆大脸、夸张笑脸、还原原版配色
 * ============================================================ */
const CARD_ONEPIECE_EXPENSE = `
<g>
  <!-- =========== 路飞（左侧大头像） =========== -->
  <g transform="translate(180, 130)">
    <!-- 头（圆大） -->
    <circle cx="0" cy="0" r="56" fill="#FFD8A8" stroke="#5C2A18" stroke-width="3"/>
    <!-- 草帽（圆形+宽边） -->
    <!-- 帽顶圆球 -->
    <ellipse cx="0" cy="-48" rx="28" ry="24" fill="#FFC832" stroke="#5C2A18" stroke-width="3"/>
    <!-- 帽顶纹理（中线） -->
    <path d="M 0 -68 Q 0 -48 0 -32" stroke="#7A4A10" stroke-width="1.5" fill="none" opacity="0.6"/>
    <!-- 红缎带 -->
    <ellipse cx="0" cy="-26" rx="30" ry="6" fill="#D8281C" stroke="#5C2A18" stroke-width="2"/>
    <!-- 帽宽边 -->
    <ellipse cx="0" cy="-18" rx="58" ry="10" fill="#E8B028" stroke="#5C2A18" stroke-width="3"/>
    <!-- 帽边中线 -->
    <ellipse cx="0" cy="-18" rx="56" ry="2" fill="#C89820" opacity="0.6"/>

    <!-- 黑色头发露出的边 -->
    <path d="M -50 0 Q -50 12 -42 18 L -34 14 L -28 22 L -22 14 L -16 22 L -8 14 L 0 22 L 8 14 L 16 22 L 22 14 L 28 22 L 34 14 L 42 18 Q 50 12 50 0 L 48 -10 L 42 -8 L 36 -14 L 28 -8 L 20 -14 L 12 -8 L 4 -14 L -4 -8 L -12 -14 L -20 -8 L -28 -14 L -36 -8 L -42 -14 L -48 -10 Z" fill="#1F1410" stroke="#1F1410" stroke-width="1.5"/>

    <!-- 圆脸眼白 -->
    <ellipse cx="-20" cy="-6" rx="11" ry="14" fill="#FFFFFF" stroke="#1F1410" stroke-width="2.5"/>
    <ellipse cx="20" cy="-6" rx="11" ry="14" fill="#FFFFFF" stroke="#1F1410" stroke-width="2.5"/>
    <!-- 黑圆眼珠 -->
    <circle cx="-20" cy="-2" r="6" fill="#1F1410"/>
    <circle cx="20" cy="-2" r="6" fill="#1F1410"/>
    <!-- 眼高光 -->
    <circle cx="-18" cy="-5" r="2.5" fill="#FFFFFF"/>
    <circle cx="22" cy="-5" r="2.5" fill="#FFFFFF"/>
    <!-- 眼上眉（粗黑） -->
    <path d="M -32 -22 Q -20 -28 -10 -22" stroke="#1F1410" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M 10 -22 Q 20 -28 32 -22" stroke="#1F1410" stroke-width="3" fill="none" stroke-linecap="round"/>
    <!-- 鼻 -->
    <path d="M -3 12 Q 0 8 3 12" stroke="#5C2A18" stroke-width="2" fill="none" stroke-linecap="round"/>
    <!-- 鼻下弧线（路飞标志） -->
    <path d="M 0 12 Q 0 18 -3 20" stroke="#5C2A18" stroke-width="1.5" fill="none"/>
    <!-- 伤疤（左眼下斜划） -->
    <line x1="14" y1="-12" x2="24" y2="-2" stroke="#9C1F12" stroke-width="2.5" stroke-linecap="round"/>
    <!-- 大笑嘴 -->
    <path d="M -26 22 Q 0 50 26 22 L 20 22 Q 0 36 -20 22 Z" fill="#1F1410" stroke="#1F1410" stroke-width="2"/>
    <!-- 牙（笑露齿） -->
    <path d="M -20 24 L -19 36 L -15 24 Z" fill="#FFFFFF" stroke="#1F1410" stroke-width="1"/>
    <path d="M 20 24 L 19 36 L 15 24 Z" fill="#FFFFFF" stroke="#1F1410" stroke-width="1"/>
    <!-- 牙中线 -->
    <line x1="0" y1="26" x2="0" y2="36" stroke="#1F1410" stroke-width="1.5"/>
    <!-- 红背心（V 领） -->
    <path d="M -54 50 L -54 100 L 54 100 L 54 50 Q 30 56 16 48 L 8 58 L 0 50 L -8 58 L -16 48 Q -30 56 -54 50 Z" fill="#C8281C" stroke="#5C2A18" stroke-width="3"/>
    <!-- 蓝裤（露出 V 领里） -->
    <path d="M -16 48 Q 0 56 16 48 L 8 58 L 0 50 L -8 58 Z" fill="#1E4A6A" stroke="#1F1410" stroke-width="2"/>
    <!-- 腰带 -->
    <rect x="-54" y="80" width="108" height="10" fill="#5C2A18" stroke="#1F1410" stroke-width="2"/>
    <!-- 腰带金扣 -->
    <rect x="-6" y="80" width="12" height="10" fill="#FFD45C" stroke="#5C2A18" stroke-width="1.5"/>
  </g>

  <!-- =========== 索隆（右侧小头像） =========== -->
  <g transform="translate(310, 145)">
    <!-- 绿藻头（蘑菇云状，仿原版） -->
    <path d="M -40 -30 Q -44 -50 -28 -54 Q -22 -60 -10 -56 Q 0 -64 10 -56 Q 22 -60 28 -54 Q 44 -50 40 -30 L 36 20 L -36 20 Z" fill="#2E8A4A" stroke="#1F1410" stroke-width="2.5"/>
    <!-- 蘑菇云头内部高光 -->
    <path d="M -20 -52 Q -10 -56 0 -50" stroke="#5CAA6A" stroke-width="2" fill="none" opacity="0.7"/>

    <!-- 头（圆脸） -->
    <circle cx="0" cy="0" r="40" fill="#FFD8A8" stroke="#5C2A18" stroke-width="2.5"/>
    <!-- 绿藻头刘海（黑色小戳遮额头） -->
    <path d="M -34 -10 L -30 4 L -24 -6 L -18 6 L -12 -4 L -6 8 L 0 -2 L 6 8 L 12 -4 L 18 6 L 24 -6 L 30 4 L 34 -10 L 32 -16 L 22 -14 L 12 -16 L 0 -14 L -12 -16 L -22 -14 L -32 -16 Z" fill="#2E8A4A" stroke="#1F1410" stroke-width="2"/>

    <!-- 黑色眼罩（盖左眼） -->
    <path d="M -38 -8 Q -22 -14 -8 -8 L -8 6 Q -22 12 -38 6 Z" fill="#1F1410" stroke="#1F1410" stroke-width="1.5"/>
    <!-- 眼罩带子（绕过耳） -->
    <line x1="-40" y1="-4" x2="-44" y2="-12" stroke="#1F1410" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="-40" y1="4" x2="-44" y2="10" stroke="#1F1410" stroke-width="2.5" stroke-linecap="round"/>

    <!-- 右眼（闭 - 缝） -->
    <path d="M 8 -2 Q 16 4 24 -2" stroke="#1F1410" stroke-width="3" fill="none" stroke-linecap="round"/>
    <!-- 眉（短） -->
    <line x1="6" y1="-12" x2="22" y2="-10" stroke="#1F1410" stroke-width="2.5" stroke-linecap="round"/>

    <!-- 耳 + 3 金耳环 -->
    <ellipse cx="32" cy="8" rx="4" ry="6" fill="#FFD8A8" stroke="#5C2A18" stroke-width="1.5"/>
    <circle cx="36" cy="14" r="3" fill="#FFD45C" stroke="#1F1410" stroke-width="1.2"/>
    <circle cx="38" cy="22" r="3" fill="#FFD45C" stroke="#1F1410" stroke-width="1.2"/>
    <circle cx="40" cy="30" r="3" fill="#FFD45C" stroke="#1F1410" stroke-width="1.2"/>

    <!-- 嘴（严肃抿嘴） -->
    <path d="M -8 16 Q 0 22 8 16" stroke="#5C2A18" stroke-width="2" fill="none" stroke-linecap="round"/>
    <!-- 下颌线（粗） -->
    <path d="M -16 24 Q 0 32 16 24" stroke="#5C2A18" stroke-width="2" fill="none" opacity="0.4"/>

    <!-- 绿衣（V 领露胸） -->
    <path d="M -42 32 L -42 90 L 42 90 L 42 32 Q 24 38 12 30 L 4 38 L -4 30 Q -12 38 -24 38 Z" fill="#1E5A2A" stroke="#1F1410" stroke-width="2.5"/>
    <!-- 露胸（V 领） -->
    <path d="M -4 30 L 0 50 L 4 30 Z" fill="#FFD8A8" stroke="#5C2A18" stroke-width="1.5"/>
    <!-- 白色腰巾 -->
    <rect x="-42" y="72" width="84" height="12" fill="#FFFFFF" stroke="#1F1410" stroke-width="2"/>
    <line x1="-42" y1="78" x2="42" y2="78" stroke="#1F1410" stroke-width="1" opacity="0.4"/>

    <!-- 左肩刀柄露出（3 把刀） -->
    <rect x="-48" y="22" width="4" height="38" fill="#7A4A28" stroke="#1F1410" stroke-width="1.2" transform="rotate(8 -46 41)"/>
    <rect x="-44" y="20" width="4" height="40" fill="#7A4A28" stroke="#1F1410" stroke-width="1.2" transform="rotate(2 -42 40)"/>
    <rect x="-40" y="22" width="4" height="36" fill="#5C2A18" stroke="#1F1410" stroke-width="1.2" transform="rotate(-4 -38 40)"/>
    <!-- 刀柄头（黑） -->
    <rect x="-49" y="20" width="6" height="4" fill="#1F1410" transform="rotate(8 -46 22)"/>
    <rect x="-45" y="18" width="6" height="4" fill="#1F1410" transform="rotate(2 -42 20)"/>
    <rect x="-41" y="20" width="6" height="4" fill="#1F1410" transform="rotate(-4 -38 22)"/>
  </g>
</g>`

/* ============================================================
 * 卡片右侧 - 海贼王 支出场景（统计页专用）：娜美
 * ============================================================ */
const CARD_NAMI = `
<g>
  <!-- =========== 娜美（左侧大头像） =========== -->
  <g transform="translate(180, 135)">
    <!-- 头（圆脸） -->
    <circle cx="0" cy="0" r="56" fill="#FFD8A8" stroke="#5C2A18" stroke-width="3"/>

    <!-- 橙色长发（爆炸式卷发） -->
    <path d="M -64 -10 Q -68 -50 -40 -54 Q -28 -68 -10 -62 Q 0 -70 10 -62 Q 28 -68 40 -54 Q 68 -50 64 -10 L 58 30 Q 50 8 46 30 L 38 8 L 30 30 L 22 8 L 14 30 L 6 8 L -2 30 L -10 8 L -18 30 L -26 8 L -34 30 L -42 8 L -50 30 L -58 8 Z" fill="#F09030" stroke="#5C2A18" stroke-width="2.5"/>
    <!-- 头发高光（卷发分束线） -->
    <path d="M -42 -52 Q -30 -58 -16 -50" stroke="#FFC060" stroke-width="2" fill="none" opacity="0.7"/>
    <path d="M 16 -50 Q 30 -58 42 -52" stroke="#FFC060" stroke-width="2" fill="none" opacity="0.7"/>

    <!-- 头巾条（左边一条细长发带） -->
    <path d="M -54 -36 L 50 -28" stroke="#5C2A18" stroke-width="2" fill="none"/>
    <!-- 头巾布（左侧小三角） -->
    <path d="M -54 -36 L -66 -42 L -56 -28 Z" fill="#5C2A18" stroke="#5C2A18" stroke-width="1.5"/>

    <!-- 椭圆大眼（绿色眼睛） -->
    <ellipse cx="-20" cy="-2" rx="10" ry="13" fill="#FFFFFF" stroke="#1F1410" stroke-width="2.5"/>
    <ellipse cx="20" cy="-2" rx="10" ry="13" fill="#FFFFFF" stroke="#1F1410" stroke-width="2.5"/>
    <!-- 绿眼珠 -->
    <circle cx="-20" cy="-2" r="6" fill="#1E8A4A"/>
    <circle cx="20" cy="-2" r="6" fill="#1E8A4A"/>
    <!-- 黑瞳 -->
    <circle cx="-20" cy="-1" r="3.5" fill="#1F1410"/>
    <circle cx="20" cy="-1" r="3.5" fill="#1F1410"/>
    <!-- 眼高光 -->
    <circle cx="-18" cy="-5" r="2" fill="#FFFFFF"/>
    <circle cx="22" cy="-5" r="2" fill="#FFFFFF"/>
    <!-- 眉（细长上挑） -->
    <path d="M -32 -18 Q -20 -24 -10 -18" stroke="#5C2A18" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M 10 -18 Q 20 -24 32 -18" stroke="#5C2A18" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <!-- 睫毛（长） -->
    <line x1="-30" y1="-12" x2="-32" y2="-16" stroke="#1F1410" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="30" y1="-12" x2="32" y2="-16" stroke="#1F1410" stroke-width="1.5" stroke-linecap="round"/>

    <!-- 鼻（小） -->
    <path d="M -3 12 Q 0 16 3 12" stroke="#5C2A18" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <!-- 嘴（微笑） -->
    <path d="M -10 22 Q 0 28 10 22" stroke="#C8281C" stroke-width="2" fill="none" stroke-linecap="round"/>
    <!-- 美人痣（左眼下） -->
    <circle cx="-12" cy="6" r="1.5" fill="#1F1410"/>

    <!-- 蓝白条纹衣（V 领吊带） -->
    <path d="M -54 50 L -54 100 L 54 100 L 54 50 Q 30 56 18 48 L 10 58 L 0 50 L -10 58 L -18 48 Q -30 56 -54 50 Z" fill="#FFFFFF" stroke="#1F1410" stroke-width="2.5"/>
    <!-- 蓝条纹（横条） -->
    <rect x="-54" y="58" width="108" height="5" fill="#4A6FB8"/>
    <rect x="-54" y="70" width="108" height="5" fill="#4A6FB8"/>
    <rect x="-54" y="82" width="108" height="5" fill="#4A6FB8"/>
    <rect x="-54" y="94" width="108" height="4" fill="#4A6FB8"/>
    <!-- V 领（露胸） -->
    <path d="M -18 48 L 0 70 L 18 48 Z" fill="#FFD8A8" stroke="#5C2A18" stroke-width="2"/>
  </g>

  <!-- =========== 乔巴（右侧小头像） =========== -->
  <g transform="translate(305, 155)">
    <!-- 鹿角（淡蓝色） -->
    <path d="M -22 -42 L -32 -62 L -28 -58 L -22 -50 L -16 -60 L -18 -48 L -8 -56 L -10 -42 Z" fill="#7AC8E8" stroke="#5C2A18" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M 22 -42 L 32 -62 L 28 -58 L 22 -50 L 16 -60 L 18 -48 L 8 -56 L 10 -42 Z" fill="#7AC8E8" stroke="#5C2A18" stroke-width="1.8" stroke-linejoin="round"/>

    <!-- 头部（圆，浅色） -->
    <ellipse cx="0" cy="0" rx="36" ry="34" fill="#F8C0C8" stroke="#5C2A18" stroke-width="2.5"/>
    <!-- 鹿鼻（粉） -->
    <ellipse cx="0" cy="6" rx="9" ry="6" fill="#F07088" stroke="#5C2A18" stroke-width="1.8"/>

    <!-- 蓝帽子（蓝毛绒） -->
    <path d="M -34 -22 Q -38 -50 -10 -48 Q 0 -54 10 -48 Q 38 -50 34 -22 Z" fill="#D8281C" stroke="#5C2A18" stroke-width="2"/>
    <!-- 帽子白十字 -->
    <line x1="0" y1="-46" x2="0" y2="-30" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="-8" y1="-38" x2="8" y2="-38" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
    <!-- 鹿耳（小白毛） -->
    <ellipse cx="-30" cy="-18" rx="6" ry="10" fill="#FFFFFF" stroke="#5C2A18" stroke-width="1.5"/>
    <ellipse cx="30" cy="-18" rx="6" ry="10" fill="#FFFFFF" stroke="#5C2A18" stroke-width="1.5"/>

    <!-- 圆大眼 -->
    <circle cx="-12" cy="-2" r="6" fill="#FFFFFF" stroke="#1F1410" stroke-width="1.8"/>
    <circle cx="12" cy="-2" r="6" fill="#FFFFFF" stroke="#1F1410" stroke-width="1.8"/>
    <circle cx="-12" cy="-1" r="3" fill="#1F1410"/>
    <circle cx="12" cy="-1" r="3" fill="#1F1410"/>

    <!-- 嘴（微笑） -->
    <path d="M -6 16 Q 0 22 6 16" stroke="#5C2A18" stroke-width="1.8" fill="none" stroke-linecap="round"/>

    <!-- 蓝围巾 -->
    <path d="M -32 22 L -38 38 L 38 38 L 32 22 Q 0 28 -32 22 Z" fill="#4A6FB8" stroke="#1F1410" stroke-width="2"/>
    <rect x="-38" y="36" width="76" height="3" fill="#FFFFFF"/>
  </g>
</g>`

/* ============================================================
 * 卡片右侧 - 海贼王 收入场景（统计页专用）：罗宾
 * ============================================================ */
const CARD_ROBIN = `
<g>
  <!-- =========== 罗宾（左侧大头像） =========== -->
  <g transform="translate(180, 130)">
    <!-- 头（圆脸） -->
    <circle cx="0" cy="0" r="56" fill="#FAE8D0" stroke="#5C2A18" stroke-width="3"/>

    <!-- 长黑直发（齐腰） -->
    <path d="M -56 -10 Q -60 -50 -30 -54 Q 0 -60 30 -54 Q 60 -50 56 -10 L 60 60 Q 50 80 40 90 L 36 70 L 28 90 L 20 70 L 12 90 L 4 70 L -4 90 L -12 70 L -20 90 L -28 70 L -36 90 L -40 70 Q -50 80 -60 60 Z" fill="#1F1410" stroke="#1F1410" stroke-width="2"/>
    <!-- 头发高光（中分线） -->
    <line x1="0" y1="-56" x2="0" y2="-4" stroke="#3F2820" stroke-width="1.5" opacity="0.6"/>
    <!-- 刘海分两侧 -->
    <path d="M -34 -8 Q -16 -16 0 -8" stroke="#1F1410" stroke-width="1.5" fill="none"/>
    <path d="M 0 -8 Q 16 -16 34 -8" stroke="#1F1410" stroke-width="1.5" fill="none"/>

    <!-- 椭圆细长眼（冷峻） -->
    <ellipse cx="-20" cy="-2" rx="10" ry="6" fill="#FFFFFF" stroke="#1F1410" stroke-width="2.5"/>
    <ellipse cx="20" cy="-2" rx="10" ry="6" fill="#FFFFFF" stroke="#1F1410" stroke-width="2.5"/>
    <!-- 深蓝眼珠 -->
    <circle cx="-20" cy="-2" r="4" fill="#1A2A6A"/>
    <circle cx="20" cy="-2" r="4" fill="#1A2A6A"/>
    <circle cx="-20" cy="-1" r="2" fill="#1F1410"/>
    <circle cx="20" cy="-1" r="2" fill="#1F1410"/>
    <!-- 眼高光 -->
    <circle cx="-18" cy="-4" r="1.5" fill="#FFFFFF"/>
    <circle cx="22" cy="-4" r="1.5" fill="#FFFFFF"/>
    <!-- 眉（细长冷静） -->
    <path d="M -32 -14 Q -20 -18 -10 -14" stroke="#1F1410" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M 10 -14 Q 20 -18 32 -14" stroke="#1F1410" stroke-width="2.5" fill="none" stroke-linecap="round"/>

    <!-- 鼻（细高） -->
    <path d="M 0 6 L 0 18" stroke="#5C2A18" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <!-- 嘴（微笑冷峻） -->
    <path d="M -10 22 Q 0 26 10 22" stroke="#C8281C" stroke-width="2" fill="none" stroke-linecap="round"/>

    <!-- 紫黑色长衣（深 V 领） -->
    <path d="M -56 50 L -56 100 L 56 100 L 56 50 Q 30 56 12 50 L 4 60 L 0 52 L -4 60 L -12 50 Q -30 56 -56 50 Z" fill="#3A2A4A" stroke="#1F1410" stroke-width="2.5"/>
    <!-- 浅黄围胸（V 领内） -->
    <path d="M -12 50 L 0 76 L 12 50 Z" fill="#F0C0A0" stroke="#5C2A18" stroke-width="1.5"/>
    <!-- 衣领反折（紫黑加深） -->
    <path d="M -56 50 L -42 56 L -42 66 L -56 60 Z" fill="#1A0A1A" stroke="#1F1410" stroke-width="1.5"/>
    <path d="M 56 50 L 42 56 L 42 66 L 56 60 Z" fill="#1A0A1A" stroke="#1F1410" stroke-width="1.5"/>
  </g>

  <!-- =========== 弗兰奇（右侧小头像） =========== -->
  <g transform="translate(305, 150)">
    <!-- 头（圆，蓝色） -->
    <ellipse cx="0" cy="0" rx="38" ry="36" fill="#4A7AB8" stroke="#1F1410" stroke-width="2.5"/>
    <!-- 头前凸（双下巴） -->
    <ellipse cx="0" cy="22" rx="22" ry="8" fill="#3A6AA8" stroke="#1F1410" stroke-width="1.5"/>

    <!-- 戴护目镜（蓝色） -->
    <rect x="-30" y="-18" width="60" height="20" rx="4" fill="#5CC0E8" stroke="#1F1410" stroke-width="2.5"/>
    <line x1="0" y1="-18" x2="0" y2="2" stroke="#1F1410" stroke-width="2"/>
    <!-- 护目镜反光 -->
    <rect x="-26" y="-16" width="20" height="6" rx="2" fill="#FFFFFF" opacity="0.6"/>
    <rect x="6" y="-16" width="20" height="6" rx="2" fill="#FFFFFF" opacity="0.6"/>

    <!-- 鼻（圆红大） -->
    <ellipse cx="0" cy="14" rx="10" ry="8" fill="#C8281C" stroke="#1F1410" stroke-width="1.5"/>

    <!-- 嘴（横长笑） -->
    <path d="M -16 30 Q 0 36 16 30" stroke="#1F1410" stroke-width="2.5" fill="none" stroke-linecap="round"/>

    <!-- 衣领（黑白蓝条纹） -->
    <path d="M -40 38 L -46 60 L 46 60 L 40 38 Q 0 44 -40 38 Z" fill="#FFFFFF" stroke="#1F1410" stroke-width="2"/>
    <line x1="-40" y1="46" x2="40" y2="46" stroke="#4A7AB8" stroke-width="3"/>
    <line x1="-44" y1="54" x2="44" y2="54" stroke="#4A7AB8" stroke-width="3"/>
  </g>
</g>`

/* ============================================================
 * 卡片右侧 - 海贼王 支出场景：路飞+索隆（首页保留旧版本）
 * ============================================================ */
const CARD_ONEPIECE_INCOME = `
<g>
  <!-- =========== 娜美（左侧大头像） =========== -->
  <g transform="translate(150, 130)">
    <!-- 头发（橙色长卷） -->
    <path d="M -50 -20 Q -50 -60 0 -60 Q 50 -60 50 -20 L 46 30 Q 30 36 0 36 Q -30 36 -46 30 Z" fill="#E89A4A" stroke="#7A3A1A" stroke-width="2.5"/>
    <!-- 头 -->
    <circle cx="0" cy="0" r="48" fill="#FFE0C0" stroke="#7A3A1A" stroke-width="2.5"/>
    <!-- 刘海 -->
    <path d="M -38 -22 Q -20 -38 0 -28 Q 20 -38 38 -22 L 36 -6 L 22 -10 L 8 -8 L 0 -14 L -8 -8 L -22 -10 L -36 -6 Z" fill="#E89A4A" stroke="#7A3A1A" stroke-width="2"/>
    <!-- 大眼 -->
    <ellipse cx="-16" cy="-2" rx="6" ry="9" fill="#1E5A8A" stroke="#1F1410" stroke-width="1.5"/>
    <ellipse cx="16" cy="-2" rx="6" ry="9" fill="#1E5A8A" stroke="#1F1410" stroke-width="1.5"/>
    <circle cx="-16" cy="0" r="3" fill="#1F1410"/>
    <circle cx="16" cy="0" r="3" fill="#1F1410"/>
    <circle cx="-15" cy="-3" r="1.5" fill="#FFFFFF"/>
    <circle cx="17" cy="-3" r="1.5" fill="#FFFFFF"/>
    <!-- 睫毛 -->
    <line x1="-22" y1="-12" x2="-20" y2="-8" stroke="#1F1410" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="22" y1="-12" x2="20" y2="-8" stroke="#1F1410" stroke-width="1.2" stroke-linecap="round"/>
    <!-- 嘴（笑） -->
    <path d="M -8 18 Q 0 24 8 18" stroke="#7A3A1A" stroke-width="2" fill="none" stroke-linecap="round"/>
    <!-- 纹（左肩文身简） -->
    <path d="M -40 32 q 8 6 16 0" stroke="#7A3A1A" stroke-width="1.2" fill="none" opacity="0.5"/>
    <!-- 蓝白条纹上衣 -->
    <path d="M -44 40 L -40 90 L 40 90 L 44 40 Q 0 56 -44 40 Z" fill="#1E5A8A" stroke="#1F1410" stroke-width="2.5"/>
    <line x1="-40" y1="50" x2="40" y2="50" stroke="#FFFFFF" stroke-width="3"/>
    <line x1="-42" y1="64" x2="42" y2="64" stroke="#FFFFFF" stroke-width="3"/>
    <line x1="-42" y1="78" x2="42" y2="78" stroke="#FFFFFF" stroke-width="3"/>
  </g>
  <!-- 乔巴（右侧小） -->
  <g transform="translate(310, 150)">
    <!-- 鹿角 -->
    <line x1="-15" y1="-26" x2="-28" y2="-44" stroke="#7A4A28" stroke-width="3" stroke-linecap="round"/>
    <line x1="-15" y1="-26" x2="-10" y2="-46" stroke="#7A4A28" stroke-width="3" stroke-linecap="round"/>
    <line x1="15" y1="-26" x2="28" y2="-44" stroke="#7A4A28" stroke-width="3" stroke-linecap="round"/>
    <line x1="15" y1="-26" x2="10" y2="-46" stroke="#7A4A28" stroke-width="3" stroke-linecap="round"/>
    <!-- 头白 -->
    <circle cx="0" cy="0" r="32" fill="#FFFFFF" stroke="#5C2A18" stroke-width="3"/>
    <!-- 蓝帽 -->
    <path d="M -30 -22 Q 0 -50 30 -22 L 30 -10 L -30 -10 Z" fill="#1E5A8A" stroke="#5C2A18" stroke-width="2.5"/>
    <circle cx="-12" cy="-30" r="3" fill="#FFFFFF"/>
    <circle cx="0" cy="-38" r="3" fill="#FFFFFF"/>
    <circle cx="12" cy="-30" r="3" fill="#FFFFFF"/>
    <!-- 粉鼻 -->
    <ellipse cx="0" cy="12" rx="8" ry="6" fill="#FF8AA0" stroke="#5C2A18" stroke-width="2"/>
    <!-- 大眼 -->
    <circle cx="-12" cy="-2" r="4" fill="#1F1410"/>
    <circle cx="12" cy="-2" r="4" fill="#1F1410"/>
    <circle cx="-11" cy="-4" r="1.5" fill="#FFFFFF"/>
    <circle cx="13" cy="-4" r="1.5" fill="#FFFFFF"/>
    <!-- 笑嘴 -->
    <path d="M 0 18 Q -6 24 -10 22" stroke="#5C2A18" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M 0 18 Q 6 24 10 22" stroke="#5C2A18" stroke-width="2" fill="none" stroke-linecap="round"/>
    <!-- 蓝身 -->
    <rect x="-26" y="28" width="52" height="58" rx="8" fill="#1E5A8A" stroke="#5C2A18" stroke-width="3"/>
    <circle cx="-12" cy="48" r="3" fill="#FFFFFF"/>
    <circle cx="12" cy="48" r="3" fill="#FFFFFF"/>
    <rect x="-8" y="62" width="16" height="6" fill="#B8281C"/>
  </g>
</g>`

const cardSceneSvg = computed(() => {
  if (props.cardScene === 'none') return ''
  if (ip.value === 'onepiece') {
    // 统计页专用：娜美（支出）/ 罗宾（收入）
    if (props.statsUnique) {
      return props.cardScene === 'expense' ? CARD_NAMI : CARD_ROBIN
    }
    // 首页默认：路飞+索隆（支出）/ 娜美+乔巴（收入）
    return props.cardScene === 'expense' ? CARD_ONEPIECE_EXPENSE : CARD_ONEPIECE_INCOME
  }
  return ''
})
</script>

<style scoped>
/* 全屏底层暗纹 - 透明度 5-8%，铺满整个页面底层，z-index:0，绝不挡上层 */
.ip-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.7;
  background-repeat: repeat;
}

/* 海贼王主题 - 全屏底层透明（不铺网点+船舵暗纹） */
.ip-bg-onepiece {
  display: none;  /* 已删除：网点纸+船舵暗纹平铺 */
}

/* 空白页中央插画 - 仅无数据时显示 */
.ip-scene {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50%;
  max-width: 320px;
  pointer-events: none;
  z-index: 1;  /* 高于暗纹 (0)，低于卡片 (2) 和文字 (9) */
}

.ip-scene-svg {
  width: 100%;
  height: auto;
  display: block;
  opacity: 0.85;
}

/* 空白页中央插画 - 图片模式（家人主题等） */
.ip-scene-img {
  width: 100%;
  height: auto;
  max-height: 240px;
  object-fit: cover;
  object-position: center 30%;
  display: block;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-soft);
  animation: float 3s ease-in-out infinite;
}

/* 卡片右侧大插画（参考图风格：右侧大角色占位）
   必须 .ip-card-scene 的父容器是 position: relative（卡片本身已设置） */
.ip-card-scene {
  position: absolute;
  inset: 0;
  width: 100%;
  pointer-events: none;
  z-index: 2;  /* 高于暗纹(0)，低于文字(9) */
  overflow: hidden;
}

.ip-card-svg {
  width: 100%;
  height: 100%;
  display: block;
}

/* 图片模式：铺满整个卡片，作为底层背景 */
.ip-card-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  display: block;
  border-radius: var(--radius-xl);
  transition: opacity 0.3s;
}

/* 标准主题：完全透明不显示 */
.ip-card-standard {
  display: none;
}

/* 家人主题：保持显示图片（与海贼王一致：照片铺满卡片作为大图背景） */
.ip-card-family {
  opacity: 1;
}
.ip-card-family .ip-card-img {
  object-position: center 30%;
}

/* === 图表容器内低透底纹（统计页 BarChart/LineChart/PieChart 区域） === */
.ip-chart-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  border-radius: var(--radius-xl);
}
.ip-chart-bg-onepiece {
  /* 复古漫画网点纸 + 暗角色剪影 */
  background-image:
    radial-gradient(circle at 20% 20%, rgba(120, 60, 30, 0.06) 1.2px, transparent 1.5px),
    radial-gradient(circle at 80% 80%, rgba(120, 60, 30, 0.06) 1.2px, transparent 1.5px),
    radial-gradient(circle at 50% 50%, rgba(120, 60, 30, 0.04) 1.5px, transparent 1.8px);
  background-size: 16px 16px, 16px 16px, 24px 24px;
  background-position: 0 0, 8px 8px, 0 0;
  opacity: 0.85;
}
.ip-chart-bg-standard {
  display: none;
}
</style>
