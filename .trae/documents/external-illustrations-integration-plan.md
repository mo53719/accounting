# 外部素材集成计划

## Summary

用户将**自己**从图片库下载/收集插画素材，放到 `E:\Users\Administrator\demo1\src\assets\images\`，我负责**改造插画组件架构**让其能加载外部图片，并在三套主题（standard / pet / comic）和四个使用场景（HomeView 卡片大插画 / 空状态中央 / SettingsView 角标 / 弹窗 + 底部导航）里挂接图片。

**关键约束**：
- 业务逻辑、记账、预算、登录、路由、store 完全不动
- 主题 CSS 变量体系不变（`--primary` / `--expense` / `--income` / `--text-*` 继续生效）
- 现有 `currentThemeSet` 主题切换机制保留
- 旧的手绘 SVG 路径代码**作为 fallback 保留**（图片缺失时自动用 SVG）

## Current State Analysis

### 现有插画组件（3 个）

| 文件 | 大小 | 职责 |
|------|------|------|
| [PaintedScene.vue](file:///e:/Users/Administrator/demo1/src/components/PaintedScene.vue) | ~500 行 | 全屏暗纹 + 空白页中央插画 + 卡片右侧大插画（手绘 SVG 字符串） |
| [IPSticker.vue](file:///e:/Users/Administrator/demo1/src/components/IPSticker.vue) | ~280 行 | 10 个迷你 IP 贴纸（手绘 SVG 字符串） |
| Illustrations.ts | 9 行 | 当前是空文件占位（无内容） |

### 现有使用处（4 处）

| 文件 | 用途 |
|------|------|
| [HomeView.vue:4](file:///e:/Users/Administrator/demo1/src/views/HomeView.vue#L4) | 顶层 `<PaintedScene :ip="ipForPainted" />` 全屏底纹 |
| [HomeView.vue:74-89](file:///e:/Users/Administrator/demo1/src/views/HomeView.vue#L74-L89) | 支出/收入卡 `card-scene="expense" / "income"` 右侧大插画 |
| [HomeView.vue:110, 144](file:///e:/Users/Administrator/demo1/src/views/HomeView.vue#L110-L144) | 空白页中央 `<PaintedScene :use-scene="true" />` |
| [SettingsView.vue](file:///e:/Users/Administrator/demo1/src/views/SettingsView.vue) | 多处 `<IPSticker>` 角标 |

### 主题切换
- [useTheme.ts](file:///e:/Users/Administrator/demo1/src/composables/useTheme.ts) 第 1 行 `import { ref, watch } from 'vue'`
- 单一标识 `themeSet: 'standard' | 'pet' | 'comic'`，localStorage 存储
- body 挂载 `set-standard` / `set-pet` / `set-comic` class

### vite 配置
- [vite.config.ts](file:///e:/Users/Administrator/demo1/vite.config.ts) —— 标准 Vite + Vue + Tailwind
- 无 publicDir 自定义 → **没有 public 目录**
- 静态资源放 `src/assets/`，通过 `import` 引用，**Vite 哈希处理**后输出到 `dist/assets/`

## Proposed Changes

### 步骤 1：创建素材目录结构（用户已选）
```
E:\Users\Administrator\demo1\src\assets\images\
├── standard\              ← 标准简约主题（可用空文件夹或放 1 张 logo）
│   └── (空 或 logo.png)
├── pet\                   ← 萌宠主题
│   ├── card-expense.png   ← 支出卡右侧大幅插画（横长，600×240）
│   ├── card-income.png    ← 收入卡右侧大幅插画
│   ├── empty-bills.png    ← 空账单页中央
│   ├── empty-savings.png  ← 空存钱页中央
│   ├── empty-lend.png     ← 人情往来空页
│   ├── empty-budget.png   ← 空预算页中央
│   ├── sticker-corner.png ← SettingsView 角标（80×80）
│   └── ...                ← 其他场景
└── comic\                 ← 漫画主题（命名同 pet）
    ├── card-expense.png
    ├── card-income.png
    └── ...
```

### 步骤 2：创建资源清单配置（新增）
**新文件**：`src/assets/illustrations.config.ts`

```ts
// 外部图片素材清单
// 用户把图片放到 src/assets/images/{theme}/{name}.png 后，这里能 import
// 如果某图片缺失，对应位置 fallback 到手绘 SVG

export const illustrations = {
  // 卡片右侧大插画
  cardScene: {
    pet: {
      expense: () => import.meta.globEager('../assets/images/pet/card-expense.png'),
      income:  () => import.meta.globEager('../assets/images/pet/card-income.png'),
    },
    comic: {
      expense: () => import.meta.globEager('../assets/images/comic/card-expense.png'),
      income:  () => import.meta.globEager('../assets/images/comic/card-income.png'),
    },
  },
  // 空白页中央插画
  emptyScene: {
    pet: {
      'empty-bills':   () => import.meta.glob('../assets/images/pet/empty-bills.png', { eager: true }),
      'empty-savings': () => import.meta.glob('../assets/images/pet/empty-savings.png', { eager: true }),
      'empty-lend':    () => import.meta.glob('../assets/images/pet/empty-lend.png', { eager: true }),
      'empty-budget':  () => import.meta.glob('../assets/images/pet/empty-budget.png', { eager: true }),
    },
    // ...
  },
  // 角标贴纸
  sticker: {
    pet:   { tr: () => import('../assets/images/pet/sticker-tr.png') },
    comic: { tr: () => import('../assets/images/comic/sticker-tr.png') },
    // ...
  },
}
```

**改用更稳的方式**（vite glob 在路径不存在时仍能工作）—— 用相对路径字符串 + 运行时检测：

```ts
// src/assets/illustrations.config.ts
export const illustrationPaths = {
  pet: {
    cardExpense: new URL('./images/pet/card-expense.png', import.meta.url).href,
    cardIncome:  new URL('./images/pet/card-income.png', import.meta.url).href,
    // ...
  },
  comic: {
    cardExpense: new URL('./images/comic/card-expense.png', import.meta.url).href,
    cardIncome:  new URL('./images/comic/card-income.png', import.meta.url).href,
    // ...
  },
}

// 运行时检测图片是否存在（fallback 到 SVG）
export async function loadImage(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(url)
    img.onerror = () => resolve(null)
    img.src = url
  })
}
```

### 步骤 3：改造 PaintedScene.vue 支持图片渲染
**[PaintedScene.vue](file:///e:/Users/Administrator/demo1/src/components/PaintedScene.vue)** 的核心改造：
- 新增 `<img>` 渲染分支（在 SVG 渲染之前判断）
- `cardScene` prop 的计算逻辑改为：先尝试加载图片 URL，失败则用旧 SVG
- 保留所有现有手绘 SVG 路径代码（**完全不动 SVG 部分**）
- `<template>` 加 `<img v-else-if="imageUrl">` 分支

```vue
<template>
  <!-- 卡片右侧大插画（新增图片支持） -->
  <div v-if="cardScene" class="ip-card-scene" :class="`ip-card-${ip}`" aria-hidden="true">
    <!-- 优先用图片（用户素材），没有时 fallback 到 SVG -->
    <img v-if="cardImageUrl" :src="cardImageUrl" class="ip-card-img" alt="" />
    <svg v-else class="ip-card-svg" viewBox="0 0 400 240" preserveAspectRatio="xMaxYMid slice" v-html="cardSceneSvg" />
  </div>
</template>
```

CSS 调整（图片模式）：
```css
.ip-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;        /* 填满右侧 65% 区域 */
  object-position: right center;  /* 图片重点放右侧 */
  display: block;
  border-radius: 0 var(--radius-xl) var(--radius-xl) 0;
}
```

### 步骤 4：改造 IPSticker.vue 支持图片渲染
**[IPSticker.vue](file:///e:/Users/Administrator/demo1/src/components/IPSticker.vue)** 核心改造：
- 新增 `imageUrl` prop（可选，传入时优先用图片）
- 检测 prop 是否有 `imageUrl`，有就渲染 `<img>`，没有就渲染 SVG
- 保留所有现有 SVG 字符串

```vue
<template>
  <img
    v-if="imageUrl"
    class="ip-sticker"
    :src="imageUrl"
    :style="styleObj"
    alt=""
  />
  <svg v-else-if="svg.length" class="ip-sticker" :style="styleObj" ... />
</template>
```

### 步骤 5：创建 IllustrationImage 组件（薄包装）
**新文件**：`src/components/IllustrationImage.vue`

职责：
- 接收 `theme` / `slot` / `name` props
- 自动到 `illustrations.config.ts` 查路径
- 渲染图片或 fallback 空
- 处理加载失败的占位

```vue
<template>
  <img v-if="resolvedUrl" :src="resolvedUrl" :class="cssClass" :style="styleObj" alt="" @error="onError" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { illustrationPaths } from '../assets/illustrations.config'

const props = withDefaults(defineProps<{
  theme: 'standard' | 'pet' | 'comic'
  name: string          // e.g. 'cardExpense' | 'cardIncome' | 'emptyBills'
  fallback?: string     // 没有图片时显示的 alt 文字
  cssClass?: string
  styleObj?: object
}>(), { ... })

const errored = ref(false)
const resolvedUrl = computed(() => {
  if (errored.value) return ''
  const map = illustrationPaths[props.theme] as any
  return map?.[props.name] || ''
})

function onError() { errored.value = true }
</script>
```

### 步骤 6：HomeView 改造
**[HomeView.vue](file:///e:/Users/Administrator/demo1/src/views/HomeView.vue)** 改造点：

- 卡片右侧大插画（第 74-89 行）：从 `<PaintedScene card-scene="expense" />` 改为 `<IllustrationImage theme="pet" name="cardExpense" />`，按主题传不同 theme 值
- 空状态中央插画（第 110、144 行）：同样改用 `<IllustrationImage>`
- 业务逻辑（`currentStats`、`viewMode`、`ipForPainted` 等）完全不动

```vue
<!-- 改造前 -->
<PaintedScene v-if="ipForPainted !== 'none'" :ip="ipForPainted" card-scene="expense" />

<!-- 改造后 -->
<IllustrationImage
  v-if="ipForPainted !== 'none'"
  :theme="ipForPainted"
  :name="viewMode === 'list' ? 'cardExpense' : 'cardIncome'"
  css-class="ip-card-img"
/>
```

### 步骤 7：SettingsView 改造
**[SettingsView.vue](file:///e:/Users/Administrator/demo1/src/views/SettingsView.vue)** 改造点：
- 3 处 `<IPSticker>` 角标（第 42、55、68 行附近）改为 `<IllustrationImage theme="pet" name="stickerCorner" />`
- 顶部右上角 IP 贴纸（第 30+ 行）同样改
- 主题弹窗预览（`bundle-ip` 部分）改为图片
- 业务逻辑（路由跳转、主题保存、用户修改）完全不动

### 步骤 8：构建验证
- 删除 PaintedScene.vue 内对 `import.meta.globEager` 的引用（已经用 `new URL` 替代）
- `npm run build` 通过
- 启动 dev server 测试：
  - 用户没放图片时：旧手绘 SVG 正常显示
  - 用户放图片后：自动替换为图片

## Assumptions & Decisions

| 假设 | 理由 |
|------|------|
| 图片用 `src/assets/images/` | 用户明确指定 |
| 不透明 PNG | 用户明确指定（带背景色） |
| 图片缺失时 fallback 到手绘 SVG | 保证用户没及时放图也不会黑屏 |
| 3 套主题对应 3 个子目录 | 主题和素材 1:1 映射 |
| 命名固定为 `card-expense.png` / `card-income.png` 等 | 用户能按命名规范快速放图 |
| 用户**自己**找素材并放好 | 用户明确"我可以去给你找素材" |
| 不引入外部库 | 用 vite 自带 `import.meta.url` + `new URL` 即可 |
| 业务 JS 完全不动 | 严格遵守前置约束 |

## Verification Steps

### 用户方
1. 在 `src/assets/images/{pet,comic,standard}/` 下放好对应命名的图片
2. 启动 `npm run dev` → http://localhost:5173/
3. 设置 → 切换主题 → 验证图片能正确显示在：
   - 首页支出/收入卡片右侧
   - 空账单页中央
   - 设置页角标
4. 切到 standard 主题 → 验证 **不** 显示任何插画（standard 是空文件夹）

### 我方构建验证
```bash
cd e:\Users\Administrator\demo1
npm run build
# 应输出 0 error
```

### 降级验证
- 用户**没**放图片时 → 旧手绘 SVG 路径自动显示
- 图片加载失败（404）→ 控制台不报错，UI 不崩
- 控制台 `onerror` 静默处理

## 风险与回退

| 风险 | 回退方案 |
|------|---------|
| 用户没放图片 | 旧 SVG 完整保留作 fallback |
| 图片太大影响性能 | 文档化建议 ≤ 500KB / 张 |
| vite 哈希后路径变动 | 用 `new URL` 静态分析，路径稳定 |
| 三套主题色差异大 | 图片自己带背景色，与卡片底色可能冲突 → 留 4-8px 内边距让图片不贴边 |
