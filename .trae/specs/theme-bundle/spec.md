# 三套主题包系统 - Product Requirement Document

## Overview
- **Summary**: 将现有的双层主题系统（4 色调 × 3 风格 = 12 种组合）重构为三套完整独立的主题包（standard/pet/comic）。每个主题包自包含完整色彩变量、装饰画风、装饰组件。切换一个标识值（`themeSet`）即同时切换整套配色与装饰。
- **Purpose**: 解决当前双层主题切换后页面无明显变化问题；简化用户操作，实现"一点即成套"的主题切换体验；统一色彩与画风绑定。
- **Target Users**: 家庭记账本用户（记账人、家长、学生）。

## Goals
- **G1**: localStorage 只存 1 个 `themeSet` 值（standard/pet/comic），启动时读取并加载整套主题
- **G2**: `<body>` 只挂载 1 个 class（`.set-standard` / `.set-pet` / `.set-comic`）
- **G3**: 每个主题包独立定义完整 `:root` 色彩变量（--primary/light/dark/shadow-hover 等）
- **G4**: 每个主题包独立控制装饰渲染（standard 清空全部插画/pet 显示全套萌宠/comic 显示全套漫画）
- **G5**: 设置弹窗中显示 3 张主题大卡片并排，选中后立即生效
- **G6**: 所有页面（首页、统计、账单、功能页、弹窗、空白页）同步整套样式
- **G7**: 过渡动画（色彩 0.2s 柔和淡入，无延迟无空白
- **G8**: 原有业务逻辑（记账/预算/账单/人情往来/增删改查 JS）零改动

## Non-Goals (Out of Scope)
- **不改动** 任何功能 JS 逻辑、数据模型、API 调用
- **不改动** 分类图标导航、开关、按钮的核心点击交互图标的图形
- **不改动** 用户名、设备名输入框逻辑
- **不改动** 保存按钮点击、退出账本等原有交互
- **不引入** 新的数据存储 key（除主题存储精简合并工作
- **不引入** 新的路由或页面
- **不替换** 功能点击操作图标（仅在空白/装饰处添加装饰性元素，不影响操作图标

## Background & Context
- 现有系统：
  - 双层主题：`useTheme.ts` 中维护 `themeColor`（4 色调）+ `styleType`（3 风格），共 12 种组合
  - 每个主题与风格都有独立的主题 class，localStorage 存 2 个 key
  - 页面同时挂载 2 个 class，CSS 由 `.theme-*` 控制色彩、`.style-*` 控制装饰
  - 设置弹窗：先选 3 张风格卡再选 4 色色板
  - 当前痛点：双层配置繁琐，用户感觉变化不大，每次需要两层操作才能完整

- 本次重构：
  - 把 4 × 3 = 12 种可能缩减为 3 种标准（每一套自包含完整色彩与完整画风绑定）
  - 简化 localStorage 为单一 `themeSet`
  - 简化 body class 为单一 `set-*`
  - 简化设置弹窗为 3 张大卡片并排
  - 三个主题包完整色彩与画风完全独立隔离
  - 每张卡片 = 一套完整主题
  - 一键切换即全局同步

## Functional Requirements
- **FR-1**: `useTheme.ts` 重构为单值模式，只存 `themeSet`（standard/pet/comic）
- **FR-2**: `main.css` 重构为三套 `.set-standard` / `.set-pet` / `.set-comic`三套装主题包（各自包含色彩 + 装饰样式）
- **FR-3**: `SettingsView.vue` 中「我的设置」弹窗改为3张主题大卡片并排展示
- **FR-4**: 页面加载时读取 `themeSet` 给 body 挂对应 class
- **FR-5**: 切换主题即写入 `themeSet`，更新 body class，全局立即变色并同步所有页面/弹窗装饰同步显示
- **FR-6**: 首页今日空白、周期记账空白、标签管理空白、税费记录空白、记账弹窗角落、设置页 hero 区全部按主题包渲染装饰
- **FR-7**: 0.2s 过渡动画与装饰淡入

## Non-Functional Requirements
- **NFR-1**: 主题切换后页面视觉变化应在用户可感知时间内生效（不超过 0.3s
- **NFR-2**: localStorage 存储应在首次访问时提供默认值 standard
- **NFR-3**: 色彩切换不会影响功能可用性（按钮尺寸、文本对比度、可读性）
- **NFR-4**: 所有装饰元素不能遮挡点击操作图标
- **NFR-5**: 刷新/关闭重开后主题保持不变

## Constraints
- **Technical**: Vue 3 + Vite + TypeScript + CSS Custom Properties
- **Dependencies**: `localStorage`（浏览器持久化）
- **File Constraints**: 只修改 CSS + 主题相关 JS 代码，不动业务 JS 代码

## Assumptions
- 浏览器支持 CSS 自定义属性（所有现代浏览器）
- 用户在桌面浏览器 + 移动浏览器访问
- 三套主题中文字与背景对比度满足可读性要求

## Acceptance Criteria

### AC-1: 主题存储
- **Given**: 页面首次加载
- **When**: 页面初始化
- **Then**: localStorage 只存在 `themeSet` 键，默认值 `standard`；body 有 class `set-standard`
- **Verification**: programmatic

### AC-2: 主题切换
- **Given**: 用户打开「我的设置」弹窗，点击「萌宠猫狗」主题卡；点击「保存」
- **Then**: localStorage `themeSet` 值为 `pet`；body class 为 `set-pet`；全局色彩变为萌系；所有装饰元素显示萌宠插画
- **Verification**: programmatic

### AC-3: 主题切换漫画人物
- **Given**: 用户选择「漫画人物」主题卡
- **Then**: body class 变为 `set-comic`；色彩变为手绘米色；装饰显示漫画人物插画
- **Verification**: programmatic

### AC-4: 主题持久化
- **Given**: 用户选中任一主题后刷新页面/关闭重启
- **When**: 重新打开 APP
- **Then**: body class 与上次选中一致，色彩与装饰保持不变
- **Verification**: programmatic

### AC-5: 装饰不影响操作
- **Given**: 选择萌宠或漫画主题
- **Then**: 底部导航、按钮、开关、分类选择网格均可点击，图标清晰
- **Verification**: human-judgment

### AC-6: 空白页装饰
- **Given**: 首页今日没有记录，进入首页
- **When**: 当前为 standard/pet/comic 任一
- **Then**: standard 时无装饰；pet 时显示猫狗插画；comic 时显示漫画小人
- **Verification**: human-judgment

### AC-7: 弹窗角落装饰
- **Given**: 打开记账弹窗
- **Then**: pet 主题显示萌宠角落；comic 主题显示漫画人物角落；standard 主题不显示
- **Verification**: human-judgment

### AC-8: 设置页 hero 装饰
- **Given**: 打开设置页
- **Then**: pet 主题显示迷你猫狗头像；comic 显示迷你漫画人物；standard 不显示
- **Verification**: human-judgment

### AC-9: 功能页空白状态
- **Given**: 周期记账空白 / 标签管理空白 / 税费记录空白
- **When**: 切换主题
- **Then**: 三套主题装饰按对应插画
- **Verification**: human-judgment

### AC-10: 业务逻辑零改动
- **Given**: 任意主题状态
- **When**: 点击记录、修改预算、查看账单、删除交易
- **Then**: 数据增删改查、显示完全正常，与主题选择无关
- **Verification**: programmatic

### AC-11: 过渡动画
- **Given**: 用户点击切换主题
- **Then**: 色彩与装饰平滑过渡，0.2s 内完成，无闪白
- **Verification**: human-judgment

### AC-12: 构建通过
- **Given**: 所有改动后
- **When**: `npm run build` 执行
- **Then**: 构建成功（exit code 0）
- **Verification**: programmatic

## Open Questions
- [ ] 需要确认弹窗中「保存」按钮是否需要额外处理，还是依靠 watch(currentTheme) 自动保存（当前设计 watch currentTheme 自动保存。用户描述提到 "点击保存后全局立即加载整套色 + 整套画风装饰"——实际上 watch 已经实现即时切换；「保存」按钮可能仅保存昵称/设备名。）

---

*本 PRD 生成日期：2026-06-13*
