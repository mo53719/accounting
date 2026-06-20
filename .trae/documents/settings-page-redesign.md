# 设置页改造规划

## Why
当前 SettingsView 是一个老式的"绿色顶栏 + 多卡片堆叠"的设置页，和项目其它页（Home/Stats/List）的白底风格不统一，且功能入口不够集中、操作不直观。参考用户提供截图（"Clare"记账APP风格）后决定按图重做：顶部绿色 Hero + 用户名/VIP 标识 + 三个统计卡（连续记账/坚持记账/记账总数） + **4 列 4 行的 16 个网格功能按钮** + 底部分组入口（我的账本/推荐好友/我的设置）。

## What Changes
- **BREAKING**: SettingsView.vue 整体重写，从卡片式布局改成 Hero + 网格 + 列表布局
- 新增路由：
  - `/budget` - 预算中心
  - `/period-books` - 周期记账
  - `/tax-records` - 税费记账
  - `/search` - 搜索账单
  - `/lend-borrow` - 人情往来
  - `/coupons` - 报销管理
  - `/tags` - 标签管理
  - `/data-backup` - 数据备份
  - `/export` - 导入导出
  - `/savings-plan` - 存钱计划
  - `/account-stats` - 账单统计（已是 stats 页，可能改为别名）
  - `/check` - 每日对账
  - `/reminder` - 记账提醒
  - `/image-bill` - 账单图片
- 现有功能入口整理（合并/重命名）
- 统计 store 补充三个统计数（连续记账/坚持记账/记账总数）

## Impact
- Affected specs: 设置页
- Affected code:
  - `src/views/SettingsView.vue` - 整体重写
  - `src/router/index.ts` - 补充 14 个新路由
  - `src/stores/transaction.ts` - 补充统计计算（连续记账天数、记账总数）
  - `src/composables/useBook.ts` - 补充"坚持记账天数"逻辑（首次记录至今）
  - 新增 14 个 view 页面（先做占位 Vue 组件，后续按需展开）

## ADDED Requirements

### Requirement: Hero 区域
顶部 120-160px 绿色背景（沿用项目主色 #7BA87B），中央圆形头像 + 下方"Clare"用户名 + VIP 标识（橙红色徽章），下方一行三个统计卡（连续记账/坚持记账/记账总数），用浅色文字 + 大数字。

#### Scenario: 用户首次进入
- **WHEN** 用户进入设置页
- **THEN** 显示 Hero 区域，包括头像、用户名 "Clare"、VIP 标签、三个统计数（默认 15/15/76，可在 store 中动态计算）

### Requirement: 功能网格
Hero 下方是 4 列 4 行的 16 个功能入口（圆形绿色图标 + 文字）。每个入口对应一个路由。

#### Scenario: 用户点击任意入口
- **WHEN** 点击网格中某项
- **THEN** 路由跳转到对应页面（占位页面显示"功能开发中"即可）

### Requirement: 底部列表入口
"我的账本"（右侧显示"日常账本"标签）、"推荐好友"（带 ›）、"我的设置"（带 ›）。

#### Scenario: 用户点击列表项
- **WHEN** 点击"我的账本"或"我的设置"
- **THEN** 跳转/弹出对应操作

## Proposed Changes

### 1. `src/views/SettingsView.vue`（重写）
布局：
```
<div class="settings-page">
  <div class="hero">        <!-- 绿色背景 -->
    <div class="avatar" />   <!-- 圆形头像，月亮图标 -->
    <div class="name">Clare <span class="vip">VIP</span></div>
    <div class="stats">     <!-- 三个统计卡 -->
      连续记账 / 坚持记账 / 记账总数
    </div>
  </div>
  <div class="grid">        <!-- 4x4 功能网格 -->
    预算中心 / 自动记账 / 周期记账 / 税费记账 /
    分类管理 / 搜索账单 / 人情往来 / 报销管理 /
    标签管理 / 数据备份 / 导入导出 / 存钱计划 /
    账单统计 / 每日对账 / 记账提醒 / 账单图片
  </div>
  <div class="list">        <!-- 底部列表 -->
    我的账本 / 推荐好友 / 我的设置
  </div>
  <BottomNav />
</div>
```

### 2. `src/router/index.ts`（补充路由）
14 个新路由，懒加载对应 view 组件：
```ts
{ path: '/budget', component: () => import('../views/BudgetView.vue') }
{ path: '/auto-record', component: () => import('../views/AutoRecordView.vue') }
{ path: '/period-books', component: () => import('../views/PeriodBooksView.vue') }
{ path: '/tax-records', component: () => import('../views/TaxRecordsView.vue') }
{ path: '/search', component: () => import('../views/SearchView.vue') }
{ path: '/lend-borrow', component: () => import('../views/LendBorrowView.vue') }
{ path: '/coupons', component: () => import('../views/CouponsView.vue') }
{ path: '/tags', component: () => import('../views/TagsView.vue') }
{ path: '/data-backup', component: () => import('../views/DataBackupView.vue') }
{ path: '/export', component: () => import('../views/ExportView.vue') }
{ path: '/savings-plan', component: () => import('../views/SavingsPlanView.vue') }
{ path: '/check', component: () => import('../views/CheckView.vue') }
{ path: '/reminder', component: () => import('../views/ReminderView.vue') }
{ path: '/image-bill', component: () => import('../views/ImageBillView.vue') }
```

### 3. 14 个新 View 组件（占位）
每个都是简单的 Vue 组件：
```vue
<template>
  <div class="page">
    <div class="header">标题</div>
    <EmptyState text="功能开发中" />
    <BottomNav />
  </div>
</template>
```

### 4. `src/stores/transaction.ts`（补充计算）
- `consecutiveDays`：从今天往前推，每天都有记录则 +1，遇到断档则停止
- `totalCount`：所有记录条数
- `firstRecordDate`：最早记录日期，用于计算"坚持 X 天"

## Assumptions & Decisions
- 用户名暂定"Clare"，后续可在设置中改
- VIP 标识仅为 UI 装饰，不做实际权限
- 三个统计数字先写死（15/15/76）让 UI 跑起来，后续从 transaction 计算
- 16 个功能大部分暂时占位，后续按用户需求逐个展开

## Verification
1. 浏览器进入设置页，验证 Hero 区域显示正确
2. 验证 4x4 网格布局对齐
3. 点击任意功能入口，验证能跳转（占位页面"功能开发中"）
4. 验证底部导航仍然显示
5. 验证从其它页返回时设置页正常显示
6. `npx vite build` 编译通过
