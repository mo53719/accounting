# 三套主题包系统 - The Implementation Plan

## [ ] Task 1: 重构 useTheme.ts - 单值主题存储与加载
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 将 currentTheme + currentStyle 合并为单一 currentThemeSet，可选值：`standard` / `pet` / `comic`
  - localStorage 只存一个 key: `themeSet`，默认值 `standard`
  - `applyTheme()` 只给 body 挂一个 class: `set-standard` / `set-pet` / `set-comic`
  - 同时同步到 `document.documentElement.dataset.themeSet`
  - 保留 API：`setThemeSet()` 对外暴露 `currentThemeSet`
  - watch: `currentThemeSet` 变化时写入 localStorage
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4, AC-10
- **Test Requirements**:
  - `programmatic` TR-1.1: `useTheme.ts` 中 `VALID_THEMES` 常量只包含 `standard` | `pet` | `comic` 三个字符串字面量
  - `programmatic` TR-1.2: 页面加载时 `localStorage.getItem('themeSet')` 能读到值
  - `programmatic` TR-1.3: `document.body.classList` 恰好包含一个 `set-*` class，不包含旧的 `theme-*` / `style-*` class
  - `programmatic` TR-1.4: `setThemeSet('pet')` 调用后 body class 变为 `set-pet`，localStorage `themeSet` 值为 `pet`
  - `programmatic` TR-1.5: `setThemeSet('comic')` 调用后 body class 变为 `set-comic`，localStorage `themeSet` 值为 `comic`
- **Notes**: 确保旧的 `themeColor` / `styleType` localStorage key 被忽略或迁移

## [ ] Task 2: 重构 main.css - 三套完整独立主题包
- **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 删除旧的 `.theme-green/theme-purple/theme-gray/theme-orange` 四套色调定义
  - 删除旧的 `.style-standard/.style-pet/.style-comic` 三套风格定义
  - 新增三套主题包独立 class：
    - `.set-standard`：薄荷绿 #52a88c 全套色彩；隐藏所有插画装饰
    - `.set-pet`：柔和暖调萌系色彩（浅薄荷为主色 #63b99d，低饱和马卡龙背景 #e9f7f2）；显示全套萌宠猫狗装饰；添加爪印小装饰样式
    - `.set-comic`：温柔手绘浅米色（主色 #c89b7b，米白背景 #fff3eb）；显示全套漫画人物装饰；线条柔化
  - 每套主题包完整定义：`--primary` / `--primary-light` / `--primary-dark` / `--shadow-hover` / 其他色彩变量
  - 装饰元素的显隐通过：`display: none` / `display: block` 由 `set-*` class 控制
  - 保留装饰过渡动画（`transition: all 0.2s ease`）
  - pet 主题新增爪印边框、水印小头像样式
  - comic 主题新增手绘线条、手绘风格装饰样式
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-5, AC-6, AC-7, AC-8, AC-9, AC-11
- **Test Requirements**:
  - `programmatic` TR-2.1: main.css 中存在 `.set-standard` / `.set-pet` / `.set-comic` 三个选择器
  - `programmatic` TR-2.2: `.set-standard .empty-state-mascot` 的 `display` 为 `none`
  - `programmatic` TR-2.3: `.set-pet` 的 `--primary` 值为 `#63b99d`（或对应浅薄荷色）
  - `programmatic` TR-2.4: `.set-comic` 的 `--primary` 值为 `#c89b7b`（或对应米色调）
  - `programmatic` TR-2.5: 三套主题包下，装饰容器的显隐与当前主题匹配
  - `human-judgement` TR-2.6: pet 主题中卡片有细微爪印装饰但不遮挡内容
  - `human-judgement` TR-2.7: comic 主题线条有柔化感

## [ ] Task 3: 重构 SettingsView - 三套主题大卡片选择器
- **Priority**: P0
- **Depends On**: Task 1, Task 2
- **Description**:
  - 删除原有「界面风格」与「主题色调」双分区选择器
  - 新增三张主题大卡片：
    - 卡片 1：标准纯净简约（绿色块 + 无装饰图标预览）
    - 卡片 2：萌宠猫狗治愈包（萌系色块 + 小猫/小狗 SVG 预览图标）
    - 卡片 3：手绘漫画人物包（米色色块 + 小人 SVG 预览图标）
  - 卡片选中态：边框 2px + 背景 --primary-light + 右上角 ✓
  - 点击卡片立即调用 `setThemeSet()`，全局即时生效
  - 保留原有用户名输入、设备名输入、退出账本、保存按钮
- **Acceptance Criteria Addressed**: AC-2, AC-3, AC-5, AC-10
- **Test Requirements**:
  - `programmatic` TR-3.1: SettingsView 模板中存在 3 张主题卡容器
  - `programmatic` TR-3.2: 点击卡片触发对应用 `setThemeSet()` 调用
  - `programmatic` TR-3.3: 选中卡片有 active 样式类
  - `human-judgement` TR-3.4: 三张卡片并排显示，视觉清晰，不被挤压
  - `human-judgement` TR-3.5: 原有用户名输入框、保存按钮、退出账本按钮仍正常工作

## [ ] Task 4: 统一装饰组件接口 - PetMascot / MangaMascot class 兼容新主题 class
- **Priority**: P1
- **Depends On**: Task 1, Task 2
- **Description**:
  - PetMascot.vue 和 MangaMascot.vue 的 SVG class 名与 main.css 中 `.set-*` 选择器匹配
  - 确保 SVG 内部元素使用 `pet-fill-main/light/dark` class，fill 为 `var(--primary/light/dark)`
  - 确认组件在 `set-pet` 下显示萌宠；`set-comic` 下显示漫画人物
  - ThemeDecorator.vue 可保留但不再被使用或标记 deprecated
- **Acceptance Criteria Addressed**: AC-2, AC-3, AC-6
- **Test Requirements**:
  - `programmatic` TR-4.1: SVG 根元素 `class` 含 `pet-svg`
  - `programmatic` TR-4.2: SVG 内部填充元素 class 含 `pet-fill-main` / `pet-fill-light` / `pet-fill-dark`
  - `human-judgement` TR-4.3: 装饰色彩跟随当前主题色

## [ ] Task 5: 全页面装饰渲染校验
- **Priority**: P1
- **Depends On**: Task 1, Task 2, Task 4
- **Description**:
  - 遍历 HomeView / AddView / SettingsView / TagsView / PeriodBooksView / TaxRecordsView 六个页面
  - 每个空白态区域/角落装饰区域均同时渲染 pet 和 comic 两套装饰组件
  - 通过 main.css 的 `.set-standard/.set-pet/.set-comic` class 控制显示/隐藏
  - 统一装饰容器 class 命名：`empty-state-mascot`（空白页大装饰）、`hero-mini-decor`（hero 迷你）、`pet-corner`/`comic-corner`（弹窗角落）
  - 清理不再使用的旧 class 引用
- **Acceptance Criteria Addressed**: AC-6, AC-7, AC-8, AC-9
- **Test Requirements**:
  - `programmatic` TR-5.1: 上述 6 个页面模板中不包含任何对 ThemeDecorator 组件的 import（应直接使用 PetMascot + MangaMascot 并排）
  - `human-judgement` TR-5.2: 手动访问首页空状态 → 切换三套主题，装饰随之切换
  - `human-judgement` TR-5.3: 记账弹窗角落装饰按主题切换
  - `human-judgement` TR-5.4: 设置页 hero 区装饰按主题切换
  - `human-judgement` TR-5.5: 功能页（周期记账/标签/税费）空白页装饰按主题切换

## [ ] Task 6: 构建与交互验证
- **Priority**: P0
- **Depends On**: Task 1-5
- **Description**:
  - 运行 `npm run build` 验证通过
  - 手动冒烟测试：首页、记账弹窗、设置弹窗、功能页
- **Acceptance Criteria Addressed**: AC-10, AC-12
- **Test Requirements**:
  - `programmatic` TR-6.1: `npm run build` exit code == 0
  - `programmatic` TR-6.2: 控制台无 Vue 编译 warning
  - `human-judgement` TR-6.3: 数据操作不受影响（新增/删除一条记录可成功）
  - `human-judgement` TR-6.4: 预算/账单/分类等页面功能正常

---

*Tasks 生成日期：2026-06-13*
