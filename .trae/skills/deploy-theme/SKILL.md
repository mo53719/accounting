---
name: "deploy-theme"
description: "Deploy a new illustration theme (主题包) for the family-account-book project. Invoke when user provides a theme name + image folder and asks to add a new theme (e.g. 海贼王/家人温馨/新主题). Handles 素材路径、illustrationPaths、useTheme、useIllustrationPicker、PaintedScene、main.css、ipForPainted 等所有联动点。"
---

# 新增主题包一键部署 Skill

本 skill 用于在 `demo1` 项目中按「海贼王主题」的形式一键部署新主题（当前已支持：`standard` / `onepiece` / `family`）。用户只需提供：
- **主题名**（英文 key，如 `family`）
- **主题中文名**（如 `家人温馨主题`）
- **主题色调**（主色 + 浅色 + 深色 + emoji + swatch）
- **图片文件夹名**（如 `family`，与 `onepiece` 同级放在 `src/assets/images/`）

skill 会自动完成 7 个文件的修改 + 一次构建验证。

---

## 一、必做的 7 步流程

### 第 1 步：素材准备
把图片放到 `src/assets/images/<theme>/`（与 `onepiece` 同级）。文件后缀支持 `.jpg / .jpeg / .png / .webp`。**文件名大小写必须与清单中保持一致**。

### 第 2 步：注册素材清单 + URL 生成器
文件：`src/assets/illustrations.config.ts`
- (a) 在文件顶部按 `op = (file) => new URL(...)` 模式加一行 `const <theme> = (file) => new URL('./images/<theme>/${file}', import.meta.url).href`
- (b) 列出全部文件名常量 `<THEME>_FILES = [ ... ]`（**逐字大小写**）
- (c) `export const ALL_<THEME>_URLS: string[] = <THEME>_FILES.map(<theme>)`
- (d) 加分类规则（hero/mini/corner/pattern），参照 `getOnePieceUrlsByKind` / `getFamilyUrlsByKind` 写一个 `get<Theme>UrlsByKind`
- (e) 加 `const build<Theme> = (() => { ... return { cardExpense, cardIncome, emptyBills, ..., chartBar, chartPie } })()`
- (f) 把新主题对象塞进 `illustrationPaths`：`<theme>: build<Theme>`
- (g) 更新 `export type ThemeName = 'standard' | 'onepiece' | '<theme>'`
- (h) 末尾加 `void <THEME>_FILES` 防止 tree-shaking 裁掉图

### 第 3 步：注册主题状态
文件：`src/composables/useTheme.ts`
- (a) `const VALID_THEME_SETS = ['standard', 'onepiece', '<theme>'] as const`
- (b) `themeSetList` 数组里加一项：
  ```ts
  { value: '<theme>', label: '<中文名>', desc: '', swatch: '<主色>', emoji: '<表情>' }
  ```
- (c) 旧 key 迁移逻辑（`readInitialThemeSet`）如需保留兼容值，按需补

### 第 4 步：注册随机抽图池
文件：`src/composables/useIllustrationPicker.ts`
- (a) 顶部 `import { ALL_ONEPIECE_URLS, ALL_FAMILY_URLS }` 旁加 `, ALL_<THEME>_URLS`
- (b) `getOrCreateModulePool` 中的 `const urlPool = theme === 'family' ? ALL_FAMILY_URLS : ALL_ONEPIECE_URLS` 改成三级三元：`theme === '<theme>' ? ALL_<THEME>_URLS : (theme === 'family' ? ALL_FAMILY_URLS : ALL_ONEPIECE_URLS)`
- (c) `drawOne` 中池重洗那行同步改：
  ```ts
  const resetPool = currentThemeSet.value === '<theme>' ? ALL_<THEME>_URLS
                  : currentThemeSet.value === 'family' ? ALL_FAMILY_URLS
                  : ALL_ONEPIECE_URLS
  ```

### 第 5 步：注册 PaintedScene（卡片大图 + 空状态）
文件：`src/components/PaintedScene.vue`
- (a) `ip?: 'onepiece' | 'family' | 'none'` 扩成 `ip?: 'onepiece' | 'family' | '<theme>' | 'none'`
- (b) `ip` computed 加 `if (currentThemeSet.value === '<theme>') return '<theme>'`
- (c) `ipTheme` computed 加 `if (ip.value === '<theme>') return '<theme>'`（否则 standard 会让 cardImageUrl 返回空）
- (d) **关键：中央 SVG 区域加 IllustrationImage fallback**——当主题没有专属 SVG 时，显示家庭照片：
  ```vue
  <div v-if="useScene && scene !== 'none'" class="ip-scene" aria-hidden="true">
    <svg v-if="sceneSvg" class="ip-scene-svg" v-html="sceneSvg" />
    <IllustrationImage
      v-else-if="ip !== 'none'"
      :theme="ipTheme"
      slot="emptyBills"
      :page-id="pageId"
      :module-id="pageId || undefined"
      css-class="ip-scene-img"
    />
  </div>
  ```
- (e) 加 CSS：
  ```css
  .ip-scene-img {
    width: 100%; height: auto; max-height: 240px;
    object-fit: cover; object-position: center 30%;
    display: block; border-radius: var(--radius-md);
    box-shadow: var(--shadow-soft);
    animation: float 3s ease-in-out infinite;
  }
  .ip-card-<theme> { opacity: 1; }
  .ip-card-<theme> .ip-card-img { object-position: center 30%; }
  ```
- (f) 若主题**不要**装饰 SVG（家人主题无装饰），则 `sceneSvg` computed 中不为新主题返回 SVG 即可

### 第 6 步：注册 CSS 变量（主题色 + 装饰隐藏）
文件：`src/assets/styles/main.css`
- (a) 加 CSS 变量块：
  ```css
  .set-<theme>,
  .set-<theme> #app {
    --primary: <主色>;
    --primary-light: <浅色>;
    --primary-dark: <深色>;
    --shadow-hover: 0 8px 20px rgba(<R>,<G>,<B>, 0.30);
  }
  ```
- (b) 若主题**不要**底层纹理 / 装饰，加：
  ```css
  .set-<theme>::before { content: none; }
  .set-<theme> #app::before { content: none; }
  ```
- (c) **关键：装饰元素隐藏规则**——只隐藏装饰（SVG / 大 Mascot / 角落装饰），**绝不能**隐藏插画容器：
  ```css
  /* 正确：只隐藏装饰 */
  .set-<theme> .hero-mini-decor,
  .set-<theme> .pet-corner,
  .set-<theme> .comic-corner,
  .set-<theme> .page-corner-decor,
  .set-<theme> .manga-mascot,
  .set-<theme> .pet-mascot,
  .set-<theme> .comic-mascot { display: none !important; }

  /* 错误：千万不要隐藏这些！它们是插画容器（内含 IllustrationImage） */
  /* .set-<theme> .empty-state-mascot, ❌ */
  /* .set-<theme> .empty-state-comic,   ❌ */
  /* .set-<theme> .empty-state-illust, ❌ */
  /* .set-<theme> .empty-state-pet     ❌ */
  ```

### 第 7 步：所有 view 文件的 v-if 渲染条件 + ipForPainted
- (a) **批量替换** 全局 `v-if="currentThemeSet === 'onepiece'"` → `v-if="currentThemeSet !== 'standard'"`（让新主题也能渲染插画）。可用 Node 脚本批量：
  ```js
  // fix-vif.cjs
  const fs = require('fs'), path = require('path')
  const SRC = 'e:/Users/Administrator/demo1/src'
  function walk(dir, cb) { /* 递归遍历 */ }
  walk(SRC, (f) => {
    if (!/\.(vue|ts|tsx|js)$/.test(f)) return
    let s = fs.readFileSync(f, 'utf8')
    const o = s
    s = s.replace(/currentThemeSet\s*===\s*'onepiece'/g, "currentThemeSet !== 'standard'")
    s = s.replace(/currentThemeSet\s*===\s*"onepiece"/g, 'currentThemeSet !== "standard"')
    if (s !== o) fs.writeFileSync(f, s, 'utf8')
  })
  ```
  执行：`node fix-vif.cjs`，跑完即删除脚本。
- (b) **所有定义 `ipForPainted` 的 view**（通常 `HomeView`、`SettingsView`）把类型从 `<'onepiece' | 'none'>` 扩成 `<'onepiece' | '<theme>' | 'none'>`，computed 加 `if (currentThemeSet.value === '<theme>') return '<theme>'`
- (c) **ThemeDecorator.vue** 里的 MangaMascot 渲染分支：仅 onepiece 渲染，新主题保持纯净（即 `v-else` 不渲染）。如已用 `(currentThemeSet as string) === 'onepiece'` 写法则无需改

---

## 二、一次构建验证

```
npm run build
```

期望：vue-tsc 无错误；vite 输出 805+ modules transformed；dist/assets/images 下出现新主题的 hash 文件名。

---

## 三、可选：UI 配置（弹窗主题卡片）

文件：`src/views/SettingsView.vue` 的 `theme-bundle-select` 区域
- 主题卡片本身已通过 `themeSetList` 自动渲染（v-for 遍历），**无需手动加卡**
- 主题预览贴纸 `bundle-ip` 区域：当前只给 onepiece 渲染贴纸，其他主题显示 "·" 占位。如新主题希望也显示预览贴纸，把对应分支加进 v-for 即可

---

## 四、关键约定（防错）

| 项 | 规则 |
|---|---|
| 文件名大小写 | 与 `ONEPIECE_FILES` / `FAMILY_FILES` 数组**逐字一致**（Vite 哈希化严格匹配） |
| 后缀 | `.jpg .jpeg .png .webp` 都支持；`family` 含 `.png` 也已验证可打包 |
| 文件夹位置 | `src/assets/images/<theme>/` 与 `onepiece` / `family` **同根** |
| CSS 变量 | 主题名只允许 `standard / onepiece / family / <新主题>`，class 命名 `set-<theme>` |
| 持久化 | `localStorage` key 统一为 `themeSet`，旧 key `themeColor / styleType` 已写迁移逻辑 |
| 过渡 | 0.2s 保留在元素级 transition，主题切换由 CSS 变量级联驱动，无需额外 JS |
| 主题切换动画 | 主题切换瞬间 `clearAllIllustrationPools()` 会清空 pool，IllustrationImage 的 watcher 自动重建，无需手动 reload |
| 弹窗 stacking | 弹窗必须用 `<Teleport to="body">` 渲染，z-index 1000；`.settings-page` 不要设 z-index |
| **页面级插画去重** | **同页内所有 IllustrationImage / `pickOne()` 互不重复**（自动用 `useRoute().name` 作 pageKey 跨模块去重），新主题自动继承该约束，无需额外代码 |

### 插画分配规则（核心约定）

**同页内不重复**：所有 `useModuleIllustrationPool(moduleId)` / `usePageIllustrationPool(pageId)` 调用，**只要在同一路由下，就会跨 moduleId 共享「已使用清单」**。这意味着：
- 同一页面的支出/收入卡片、列表项、空状态插画等**不会抽到同一张图**
- 切换路由后，旧的 pageKey 的 used 集合被自然废弃（无需手动清）
- 切主题时 `clearAllIllustrationPools()` 会同时清空 pool 和 pageKey 集合

**实现位置**：[useIllustrationPicker.ts:47-62](file:///e:/Users/Administrator/demo1/src/composables/useIllustrationPicker.ts#L47-L62) 的 `globalPageUsed` 全局 Map。新增主题**无需修改**这段代码——自动复用。

---

## 五、标准执行清单（用户输入后照着做）

```
□ 1. 素材放入 src/assets/images/<theme>/
□ 2. illustrations.config.ts: 加 <THEME>_FILES + ALL_<THEME>_URLS + build<Theme> + illustrationPaths['<theme>'] + ThemeName
□ 3. useTheme.ts: VALID_THEME_SETS + themeSetList 新增项
□ 4. useIllustrationPicker.ts: import ALL_<THEME>_URLS + urlPool / resetPool 三级三元
□ 5. PaintedScene.vue: ip prop 类型扩 + ip/ipTheme computed 分支 + .ip-card-<theme> 样式
□ 6. main.css: .set-<theme> 变量块 + 装饰隐藏
□ 7. 批量 fix-vif 脚本：把所有 currentThemeSet === 'onepiece' 改为 !== 'standard'
□ 8. HomeView / SettingsView 的 ipForPainted 扩 type + 分支
□ 9. npm run build 验证无错
```

---

## 六、参考实现

新主题可参照 `family`（家人温馨主题）的完整实现：
- [src/assets/illustrations.config.ts](file:///e:/Users/Administrator/demo1/src/assets/illustrations.config.ts) — `FAMILY_FILES` / `ALL_FAMILY_URLS` / `buildFamily` / `getFamilyUrlsByKind`
- [src/composables/useTheme.ts](file:///e:/Users/Administrator/demo1/src/composables/useTheme.ts) — `VALID_THEME_SETS` / `themeSetList`
- [src/composables/useIllustrationPicker.ts](file:///e:/Users/Administrator/demo1/src/composables/useIllustrationPicker.ts) — urlPool / drawOne 主题分支
- [src/components/PaintedScene.vue](file:///e:/Users/Administrator/demo1/src/components/PaintedScene.vue) — ip/ipTheme/cardSceneSvg
- [src/assets/styles/main.css](file:///e:/Users/Administrator/demo1/src/assets/styles/main.css) — `.set-family` 块
