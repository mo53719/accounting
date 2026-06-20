# 家庭记账本 UI 与功能升级计划

## 概述

根据用户反馈的 8 个问题 + 云服务迁移需求，对现有温馨可爱风记账 APP 进行全面升级。涉及：云服务从 LeanCloud 迁移到 MemFire Cloud、登录页丰富化、首页顶部扩展、分类图标完善、统计图表多样化、自定义分类与记账人、日期精确筛选、背景重设计。

---

## 当前状态分析

| 问题 | 现状 | 目标 |
|------|------|------|
| 0. 云服务不可用 | LeanCloud 不支持新注册 | 迁移到 MemFire Cloud（国内版 Supabase） |
| 1. 登录界面内容少 | 仅标题+副标题+密码输入+键盘 | 增加功能介绍、使用说明、视觉装饰 |
| 2. 首页顶部小 | 顶部渐变区高度有限，月度汇总卡片紧凑 | 扩大顶部区域，增加信息展示 |
| 3. 类型缩图缺失 | 分类用 emoji 显示，部分 emoji 在不同设备显示不一致 | 提供丰富的预设图标库供选择 |
| 4. 统计图单一 | 只有饼图+柱状图 | 增加折线图、图表类型切换功能 |
| 5. 分类少且不可自定义 | 支出6类/收入3类，硬编码 | 用户可自定义分类，提供大量预设图标 |
| 6. 记账人不可增加 | 固定3人（我/老公/老婆） | 用户可添加/编辑记账人 |
| 7. 日期筛选粗 | 仅按月切换 | 精确到日，自由选择日期范围 |
| 8. 背景单调 | 纯色 #FFF9FA | 增加装饰性背景元素 |

---

## 改动方案

### 0. 云服务迁移：LeanCloud → MemFire Cloud

**背景**：LeanCloud 已不支持新账号注册，需要替换为国内可用的免费云服务。MemFire Cloud 是国内版 Supabase，基于 PostgreSQL，支持实时数据订阅，有 JS SDK，免费额度可持续使用。

**涉及文件**:
- `package.json` — 移除 `leancloud-storage`，添加 `@supabase/supabase-js`
- `.env` / `.env.example` — 环境变量从 LeanCloud 改为 MemFire Cloud
- `src/composables/useLeanCloud.ts` → 重写为 `src/composables/useCloud.ts`
- `src/composables/useSync.ts` — 适配新的云服务 API
- `src/composables/useTransaction.ts` — 适配新 API
- `src/main.ts` — 初始化改为 MemFire Cloud
- `src/views/EntryView.vue` — getOrCreateBook 逻辑适配

**MemFire Cloud 接入方案**:

1. 安装依赖：`npm install @supabase/supabase-js`
2. 移除依赖：`npm uninstall leancloud-storage`
3. 环境变量：
   ```
   VITE_SUPABASE_URL=你的MemFire Cloud项目URL
   VITE_SUPABASE_ANON_KEY=你的匿名Key
   ```
4. 数据库表设计（在 MemFire Cloud 控制台创建）：
   - `books` 表：id (uuid), book_id (text), created_at (timestamptz)
   - `transactions` 表：id (uuid), book_id (text), type (text), amount (numeric), date (date), category (text), payment_method (text), note (text), created_by (text), created_at (timestamptz)

5. API 映射（LeanCloud → MemFire Cloud）：
   - `AV.Object.extend('Transaction')` + `new Transaction()` + `save()` → `supabase.from('transactions').insert(data)`
   - `AV.Query('Transaction')` + `find()` → `supabase.from('transactions').select().eq('book_id', bookId)`
   - `AV.Object.createWithoutData()` + `destroy()` → `supabase.from('transactions').delete().eq('id', objectId)`
   - `LiveQuery.subscribe()` → `supabase.channel().on('postgres_changes', ...).subscribe()`

6. 实时订阅实现：
   ```typescript
   const channel = supabase
     .channel('transactions-changes')
     .on('postgres_changes',
       { event: '*', schema: 'public', table: 'transactions', filter: `book_id=eq.${bookId}` },
       (payload) => { /* 处理变更 */ }
     )
     .subscribe()
   ```

**useCloud.ts 核心接口**（保持与原 useLeanCloud 相同的返回签名，减少其他文件改动）：
- `initCloud()` — 初始化 Supabase 客户端
- `getOrCreateBook(bookId)` — 查询或创建账本
- `saveTransaction(data)` — 保存交易
- `deleteTransaction(objectId)` — 删除交易
- `queryTransactions(bookId, startDate?, endDate?)` — 查询交易
- `subscribeTransactions(bookId, callback)` — 实时订阅

### 1. 登录界面丰富化 — EntryView.vue

**文件**: `src/views/EntryView.vue`

**改动**:
- 在密码输入区上方增加 3 个功能亮点卡片（横向滑动或纵向排列）：
  - 📊 智能统计 — 自动生成收支图表
  - 👫 共享账本 — 两人实时同步记账
  - 🔒 隐私安全 — 密码加密保护数据
- 增加加载状态：点击确认后显示 loading 动画（旋转花朵或弹跳圆点）
- 增加错误提示：密码不足6位时显示红色提示文字
- 底部增加"使用说明"折叠区域，简单说明共享原理

### 2. 首页顶部扩展 — HomeView.vue

**文件**: `src/views/HomeView.vue`

**改动**:
- 顶部渐变区域高度从当前增加约 40%（pt-14 → pt-16，增加 padding）
- 月度汇总卡片改为更大的独立区域，三项（收入/支出/结余）改为纵向排列或更大间距
- 增加当日快捷信息：今日支出小计
- 月份切换按钮移到顶部（左右箭头），方便快速切换查看不同月份
- 顶部增加装饰性波浪或云朵 SVG

### 3. 分类图标库 — 新增 ICON_PRESETS 常量

**文件**: `src/utils/format.ts`

**改动**:
- 新增 `ICON_PRESETS` 常量，提供 40+ 预设图标供用户选择分类缩略图：

```
支出类: 🍔🍜🍕🥗🍰☕🚌🚗🛵✈️🛒👗💄📱🎮🏡🛋️💡🧹💊🎓👶🐾🎁💌💐🎉✨
收入类: 💰💼📈🏦🎁🧧💎🎯⭐🌟💫
通用类: 📌❤️🔥💡🎯⭐🌈🍀🌸🎀🎪🎨
```

- 修改 `CATEGORIES` 结构，每个分类增加 `icon` 字段为可配置（当前已固定 emoji）
- 新增自定义分类的默认图标选择逻辑

### 4. 统计图表类型切换 — StatsView.vue + 新增 LineChart.vue

**文件**:
- `src/views/StatsView.vue` — 增加图表类型切换 UI
- `src/components/LineChart.vue` — 新建折线图组件
- `src/components/PieChart.vue` — 保留
- `src/components/BarChart.vue` — 保留

**改动**:

StatsView 增加图表类型切换栏：
- 支出分类占比区域：饼图 / 环形图 切换（复用 PieChart 的 roseType 配置）
- 月度趋势区域：柱状图 / 折线图 切换，用 3 个按钮组（📊柱状 📈折线 🥧饼图）

新增 LineChart.vue：
- 基于 ECharts 的折线图
- 双线：收入（绿色）+ 支出（粉色）
- 平滑曲线（smooth: true）
- 面积填充（半透明）
- 接收与 BarChart 相同的 data 格式

### 5. 自定义分类功能 — 新增分类管理页 + Store

**文件**:
- `src/views/CategoryManageView.vue` — 新建分类管理页面
- `src/stores/category.ts` — 新建分类 Store
- `src/utils/format.ts` — 修改 CATEGORIES 为可扩展
- `src/views/AddView.vue` — 修改分类选择区域
- `src/router/index.ts` — 增加路由

**改动**:

**category.ts Store**:
- `customCategories`: 用户自定义分类列表，持久化到 localStorage
- `getAllCategories()`: 合并预设 + 自定义分类
- `addCustomCategory(data)`: 添加自定义分类
- `removeCustomCategory(id)`: 删除自定义分类
- `updateCustomCategory(id, data)`: 编辑自定义分类

**CategoryManageView.vue**:
- 分为"支出分类"和"收入分类"两个 tab
- 显示当前所有分类（预设 + 自定义），预设分类不可删除
- 每个分类显示：图标 + 名称 + 颜色
- "添加分类"按钮 → 弹出表单：选择图标（从 ICON_PRESETS 网格选择）+ 输入名称 + 选择颜色
- 自定义分类可删除（左滑或长按）

**AddView.vue 修改**:
- 分类网格末尾增加 "+" 按钮，点击跳转分类管理页
- 分类数据从 category Store 获取（合并预设+自定义）

### 6. 记账人可设置增加 — SettingsView.vue + book Store

**文件**:
- `src/views/SettingsView.vue` — 增加记账人管理区域
- `src/stores/book.ts` — 增加 members 字段
- `src/utils/format.ts` — FAMILY_MEMBERS 改为默认值
- `src/views/AddView.vue` — 记账人从 Store 读取

**改动**:

**book.ts Store**:
- 新增 `members` 字段（类型 `Array<{name: string, icon: string}>`），默认 `[{name:'我',icon:'🙋'},{name:'老公',icon:'🙋‍♂️'},{name:'老婆',icon:'🙋‍♀️'}]`
- `addMember(member)`: 添加记账人
- `removeMember(name)`: 删除记账人（不能删"我"）
- 持久化到 localStorage

**SettingsView.vue**:
- 新增"记账人管理"卡片
- 列出当前所有记账人，每人一行：图标 + 名称 + 删除按钮
- "添加记账人"按钮 → 弹出输入框，输入名称后添加
- 预设图标选择（从 ICON_PRESETS 中选人物类）

**AddView.vue 修改**:
- 记账人列表从 `bookStore.members` 读取，而非固定 FAMILY_MEMBERS
- 末尾增加 "+" 按钮，点击跳转设置页记账人管理

### 7. 日期精确筛选 — StatsView.vue + useStatistics.ts

**文件**:
- `src/views/StatsView.vue` — 重构日期筛选 UI
- `src/composables/useStatistics.ts` — 支持日期范围参数

**改动**:

**StatsView 日期筛选 UI**:
- 替换当前的月份左右箭头为日期选择器
- 提供 3 种快捷选项：本月 / 本周 / 自定义
- 自定义模式：点击后弹出日历选择器（起始日期 ~ 结束日期）
- 显示当前筛选范围文字，如"2026年6月1日 - 6月11日"
- 增加"跳转到今天"快捷按钮

**useStatistics.ts 修改**:
- 参数从 `(year, month)` 改为 `(startDate, endDate)` 或 `(dateRange)`
- 按日期范围筛选交易记录
- 修复响应式问题：参数改为 ref 类型

### 8. 背景画面重新调整 — main.css + 各 View

**文件**:
- `src/assets/styles/main.css` — 全局背景样式
- 各 View 文件 — 局部背景调整

**改动**:

**main.css**:
- body 背景从纯色 `#FFF9FA` 改为渐变 + 装饰元素
- 增加 CSS 背景图案：使用 radial-gradient 制作散落的粉色圆点/星星装饰
- 增加微妙的网格或波点纹理

```css
body {
  background:
    radial-gradient(circle at 10% 20%, rgba(255,138,158,0.08) 0%, transparent 50%),
    radial-gradient(circle at 90% 80%, rgba(126,200,227,0.08) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(255,217,61,0.04) 0%, transparent 50%),
    #FFF9FA;
}
```

- 增加浮动装饰动画（可选）：用 CSS animation 让小圆点/星星缓慢漂浮

**各 View**:
- EntryView: 增加飘浮的爱心/星星 CSS 动画装饰
- HomeView: 顶部渐变区域增加波浪 SVG 分隔线
- StatsView: 图表区域增加浅色装饰背景

---

## 新增文件清单

| 文件 | 用途 |
|------|------|
| `src/composables/useCloud.ts` | MemFire Cloud 封装（替代 useLeanCloud.ts） |
| `src/views/CategoryManageView.vue` | 分类管理页面 |
| `src/stores/category.ts` | 自定义分类 Store |
| `src/components/LineChart.vue` | 折线图组件 |

## 删除文件清单

| 文件 | 原因 |
|------|------|
| `src/composables/useLeanCloud.ts` | 被 useCloud.ts 替代 |

## 修改文件清单

| 文件 | 改动内容 |
|------|----------|
| `package.json` | 移除 leancloud-storage，添加 @supabase/supabase-js |
| `.env` / `.env.example` | 环境变量改为 MemFire Cloud 配置 |
| `src/main.ts` | 初始化改为 MemFire Cloud |
| `src/composables/useSync.ts` | 适配 useCloud API |
| `src/composables/useTransaction.ts` | 适配 useCloud API |
| `src/views/EntryView.vue` | 增加功能亮点、loading、错误提示、适配新云服务 |
| `src/views/HomeView.vue` | 扩大顶部、增加今日支出、月份切换、波浪装饰 |
| `src/views/StatsView.vue` | 图表类型切换、日期精确筛选 |
| `src/views/AddView.vue` | 分类从 Store 读取、记账人从 Store 读取、增加"+"入口 |
| `src/views/SettingsView.vue` | 增加记账人管理区域 |
| `src/utils/format.ts` | 增加 ICON_PRESETS、修改 CATEGORIES/FAMILY_MEMBERS 为可扩展 |
| `src/stores/book.ts` | 增加 members 字段和管理方法 |
| `src/composables/useStatistics.ts` | 支持日期范围筛选、修复响应式 |
| `src/assets/styles/main.css` | 背景渐变装饰、波浪分隔线样式、飘浮动画 |
| `src/router/index.ts` | 增加 /category-manage 路由 |

---

## 实施顺序

1. **云服务迁移**：安装 @supabase/supabase-js → 创建 useCloud.ts → 适配 useSync.ts/useTransaction.ts/main.ts/EntryView → 移除 leancloud-storage
2. **基础层**：format.ts（ICON_PRESETS）+ category Store + book Store（members）
3. **背景层**：main.css 背景重设计
4. **页面层**：EntryView → HomeView → StatsView → AddView → SettingsView
5. **新页面**：CategoryManageView + LineChart + 路由
6. **修复层**：useStatistics 响应式修复 + updateLocalId bug 修复

---

## 假设与决策

- **云服务**：使用 MemFire Cloud（国内版 Supabase），通过 @supabase/supabase-js SDK 接入
- 自定义分类和记账人数据存 localStorage，不上云（简化实现，避免 schema 变更）
- 预设图标全部使用 emoji（跨平台兼容，无需图片资源）
- 日期选择器使用 HTML5 `<input type="date">`，不引入第三方日历组件
- 折线图与柱状图共用数据格式，便于切换
- 预设分类不可删除，自定义分类可删除
- 记账人"我"不可删除（保证至少一个记账人）
- useCloud.ts 保持与原 useLeanCloud.ts 相同的函数签名，减少其他文件改动量

---

## 验证步骤

1. 启动开发服务器 `npx vite --host`，浏览器打开预览
2. 验证云服务：配置 MemFire Cloud 环境变量后，密码输入可创建/查询账本
3. 验证登录页：功能亮点显示、密码不足6位有提示、确认后 loading 动画
4. 验证首页：顶部区域变大、今日支出显示、月份可切换
5. 验证记账页：分类末尾有"+"、记账人末尾有"+"、可选择自定义分类和记账人
6. 验证分类管理：可添加/删除自定义分类、选择图标和颜色
7. 验证设置页：记账人管理区域可添加/删除
8. 验证统计页：图表类型可切换（柱状/折线/饼图）、日期可精确到日
9. 验证背景：各页面有装饰性背景元素
10. 执行 `npx vite build` 确认编译通过
