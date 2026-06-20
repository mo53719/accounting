# 主题包系统 2.0 升级计划

## Summary
把现有的「角落 logo 装饰」版主题包，升级为「全页面分层背景 + 全卡片装饰 + 全套图标替换」的真实画风系统。三套主题（标准/萌宠/漫画）从只换色彩 + 在角落贴一只小猫，升级为整页背景纹理 + 卡片插画装饰 + 全部图标画风统一。功能交互图标允许根据主题切换画风（不再死守单一线性），但保持清晰可识别。

## Current State Analysis

### 现有系统（升级前）
1. **存储层**：[useTheme.ts](file:///e:/Users/Administrator/demo1/src/composables/useTheme.ts) 已经是单值 `themeSet`，3 套主题（standard/pet/comic），切换后 `body.set-*` class
2. **CSS 层**：[main.css:71-228](file:///e:/Users/Administrator/demo1/src/assets/styles/main.css#L71-L228) 已定义三套色彩变量 + 部分装饰样式
3. **现状问题**：
   - 装饰仅限于「空状态大图 + 卡片角落微小径向渐变」+ 角落 `pet-corner / comic-corner` 单个小猫/小人
   - 页面底层完全没有背景纹理（页底纯色 `var(--page-bg)`）
   - 卡片没有「四角嵌入小插画」
   - 图标层完全没动：底部导航、分类、按钮、开关、Checkbox、Radios 全部还是 2px Feather 线性
   - 弹窗只在角落有一个 mini 装饰，没有弹窗专属底图
4. **已有素材**：
   - [PetMascot.vue](file:///e:/Users/Administrator/demo1/src/components/PetMascot.vue) — 猫咪/小狗 SVG
   - [MangaMascot.vue](file:///e:/Users/Administrator/demo1/src/components/MangaMascot.vue) — 手绘小人 SVG
   - [Illustrations.ts](file:///e:/Users/Administrator/demo1/src/components/Illustrations.ts) — 存钱罐等线性插画
5. **主题选择器**：[SettingsView.vue:299-316](file:///e:/Users/Administrator/demo1/src/views/SettingsView.vue#L299-L316) 已用 3 张主题大卡片 + swatch + emoji + label + desc + 选中✓，无需改
6. **底部导航**：[BottomNav.vue](file:///e:/Users/Administrator/demo1/src/components/BottomNav.vue) — 4 个 tab + 中间加号，硬编码 2px Feather SVG path

## Proposed Changes

### 阶段 1：图标库重构（核心）
新建主题感知图标系统，让图标画风跟随主题切换。

**文件 1**：[src/components/icons/index.ts](file:///e:/Users/Administrator/demo1/src/components/icons/index.ts) — 新建
- 导出 `getIcon(name, theme)` 函数
- 3 套图标库：
  - **standard**：2px Feather 线性（现有 path 全部迁移过来）
  - **pet**：3px 圆润画风（猫狗轮廓 + 萌系细节）
  - **comic**：1.5-2px 手绘抖动感线条
- 图标清单：home / stats / list / add / category (food/transport/shop/play/medical/...) / check / close / eye / lock / user / bell / settings / chart / wallet / arrow / pencil / paw / star

**文件 2**：[src/components/icons/Icon.vue](file:///e:/Users/Administrator/demo1/src/components/icons/Icon.vue) — 新建
```vue
<template>
  <svg :viewBox="icon.viewBox" :width="size" :height="size" fill="none" stroke="currentColor"
       :stroke-width="strokeWidth" stroke-linecap="round" stroke-linejoin="round"
       :class="['theme-icon', `theme-icon-${themeName}`]" v-html="path"></svg>
</template>
```
- 通过 `useTheme()` 读取 `currentThemeSet`
- 根据主题选择 stroke-width 和 path
- 颜色用 currentColor 跟随父级

### 阶段 2：CSS 背景分层（页面级）
**文件 3**：[src/assets/styles/main.css](file:///e:/Users/Administrator/demo1/src/assets/styles/main.css) — 大幅扩展
- 在 `.set-pet` / `.set-comic` 下加 **body 背景纹理**（用 SVG data URL 平铺）：
  - **pet**：8-12% 透明度，猫爪 + 小狗剪影交替平铺（48x48 tile，repeat）
  - **comic**：8-12% 透明度，纸张横纹 + 细噪点（48x48 tile，repeat）
- 在 `.set-standard` 下清空背景
- 全局 `transition: background-image 0.2s ease` 切换平滑

### 阶段 3：卡片装饰
**文件 4**：扩展 [main.css](file:///e:/Users/Administrator/demo1/src/assets/styles/main.css) 卡片装饰
- `.set-pet .card` 4 角嵌入迷你猫狗 SVG 装饰（用 ::before/::after，固定 28x28 透明）
- `.set-comic .card` 4 角嵌入简笔小人剪影（用 ::before/::after，固定 24x24）
- 装饰用 mask + linear-gradient 实现，不影响 padding/点击区
- 装饰 `pointer-events: none` 永远不挡操作

### 阶段 4：组件级改造（不碰业务 JS）
| 组件 | 改造点 |
|------|--------|
| [BottomNav.vue](file:///e:/Users/Administrator/demo1/src/components/BottomNav.vue) | 4 个 tab SVG path 替换为 `getIcon()` 派发 |
| [SettingsView.vue](file:///e:/Users/Administrator/demo1/src/views/SettingsView.vue) | 设置项小图标 → `getIcon()` |
| [AddView.vue](file:///e:/Users/Administrator/demo1/src/views/AddView.vue) | 分类/输入/按钮图标 → `getIcon()` |
| [HomeView.vue](file:///e:/Users/Administrator/demo1/src/views/HomeView.vue) | 预算、支出收入、统计小图标 → `getIcon()` |
| 其他 16 个功能页 | 通过 `Icon.vue` 统一调用，无须各页改 |

### 阶段 5：弹窗装饰
**文件 5**：[src/assets/styles/main.css](file:///e:/Users/Administrator/demo1/src/assets/styles/main.css) 弹窗装饰
- `.modal-card` 在 pet 主题下底部加 `background-image`（大幅猫狗主插画 SVG，80px 高度，不挡输入区）
- comic 主题下手绘纸张底色
- 弹窗顶部角落加迷你装饰

### 阶段 6：日志与验证
- 全部完成后 `npm run build` 验证 703+ modules 无错误
- dev server 重启，浏览器打开 http://localhost:5173/
- F12 → Application → Local Storage 改 `themeSet` 验证 3 套主题全局生效

## Assumptions & Decisions

1. **图标库架构**：选择「按主题分支渲染 path + 一致接口」方案，而不是「3 套独立 Vue 组件」。理由：维护成本低，dev 时只改 path 不改组件结构。
2. **背景透明度上限 12%**：严格按需求，避免文字/数字阅读被干扰。卡片装饰同样低透明度。
3. **业务 JS 一行不动**：所有 `useTransaction` / `useTheme` / `useBook` store 内部逻辑、`handleSave` / `setTimeRange` / 路由跳转、localStorage 键名、密码校验 — 全部原样。只动 SFC 的 `<template>` 中的 SVG 和 `<style>` 中的 CSS。
4. **图标辨识度优先**：萌宠/漫画主题下图标仍然是轮廓（不会被填色猫狗覆盖），仅调整 stroke-width 和 path 风格。
5. **新增装饰位置选择**：卡片装饰用 `::before/::after` + `position: absolute` 而非 DOM 节点，避免污染业务 JS、避免影响布局。
6. **不删除旧装饰**：保留原有 `.empty-state-mascot / .empty-state-comic / .hero-mini-decor / .pet-corner / .comic-corner` 全部容器及 body class 控制逻辑，只扩展新增分层背景和卡片装饰。

## Verification Steps

### 自动化验证
- `npm run build` 退出码 0 + 0 TypeScript 错误
- 模块数量 >= 703（新增图标库会增加模块数）

### 浏览器手动验证（dev server 重启后）
1. **默认主题（standard）**：
   - 打开 http://localhost:5173/ → 应看到标准薄荷绿 + 无任何装饰 + 2px 线性 Feather 图标
2. **切到萌宠**：
   - 设置 → 主题包 → 选「萌宠猫狗治愈包」→ 保存
   - 页面底层应有 8% 猫爪纹路平铺
   - 卡片 4 角有迷你猫狗装饰
   - 底部导航图标应变成萌宠风
   - 弹窗（设置/记账）应有猫狗底图
3. **切到漫画**：
   - 切到「手绘漫画人物包」→ 保存
   - 页面底层应有手绘纸张纹理
   - 卡片 4 角有手绘小人装饰
   - 底部导航变成手绘抖动感线条
4. **持久化**：
   - F12 → Local Storage 看 `themeSet` 键
   - 刷新页面 → 主题保持
   - 关闭浏览器再开 → 主题保持
5. **业务零改动**：
   - 输入密码 → 进入首页 → 记账 → 看分类
   - 切换账本、改预算、加新分类 — 全部正常
6. **0.2s 过渡**：
   - 切换主题时色彩、插画、图标全部平滑淡入，无白屏闪烁

## Implementation Order（分步骤执行）

1. **S1 P0** 创建主题感知 Icon 组件 + 图标库（3 套 path）
2. **S2 P0** main.css 新增 body 背景纹理层（pet 平铺爪印 / comic 平铺纸张）
3. **S3 P0** main.css 卡片 4 角装饰层（pet/comic）
4. **S4 P1** BottomNav / SettingsView 替换为 Icon 组件
5. **S5 P1** AddView / HomeView 替换为 Icon 组件
6. **S6 P0** main.css 弹窗装饰层（modal-card 底部大幅插画）
7. **S7 P0** 构建 + dev server 验证 + 浏览器全量回归
