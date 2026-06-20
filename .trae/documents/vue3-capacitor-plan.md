# 家庭记账 APP - Vue3 + Capacitor 方案计划

## 概述
用 Vue3 + TailwindCSS 开发夫妻共享记账网页，接入 LeanCloud 国内免费云数据库实现双手机实时同步，最后通过 Capacitor 打包成 Android APK。

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | Vue 3 + TypeScript | Composition API |
| 构建工具 | Vite | 快速开发构建 |
| UI 样式 | TailwindCSS 4 | 原子化 CSS，手机优先 |
| 图表 | ECharts | 饼图、柱状图 |
| 云数据库 | LeanCloud（开发版免费） | 1GB存储、3万次/天API、LiveQuery实时同步 |
| 离线存储 | localStorage + 同步队列 | 离线先存本地，联网自动同步 |
| 跨端打包 | Capacitor 6 | 一键打包 Android APK |
| 路由 | Vue Router 4 | SPA 路由 |
| 状态管理 | Pinia | 轻量状态管理 |
| 日期处理 | dayjs | 轻量日期库 |

## 核心功能

### 1. 6位数字账本密码
- 输入6位数字密码即可进入账本
- 相同密码 = 同一个账本（两人共享）
- 密码通过 SHA-256 哈希后作为账本ID
- 无需注册登录，极简体验

### 2. 记账功能
- 收入/支出切换
- 金额输入
- 日期选择（默认今天）
- 分类选择（预设8个分类）
- 支付方式（现金/微信/支付宝/银行卡）
- 备注输入

### 3. 预设分类
- 支出：餐饮、交通、购物、居家、人情、其他
- 收入：工资、红包、其他

### 4. 统计图表
- 月度支出分类饼图
- 月度收支柱状图
- 日/周/月切换

### 5. 实时同步
- LeanCloud LiveQuery 监听数据变更
- 一方记账，另一方实时看到
- 离线时存本地，联网自动上传

### 6. Capacitor 打包
- 添加 Capacitor 配置
- 生成 Android 项目
- Android Studio 构建 APK

## 项目结构

```
family-account-book/
├── src/
│   ├── assets/
│   │   └── styles/
│   │       └── main.css          # TailwindCSS 入口
│   ├── components/
│   │   ├── AmountInput.vue       # 金额输入组件
│   │   ├── CategoryPicker.vue    # 分类选择器
│   │   ├── TransactionItem.vue   # 交易列表项
│   │   ├── PieChart.vue          # 饼图组件
│   │   ├── BarChart.vue          # 柱状图组件
│   │   └── SyncStatus.vue        # 同步状态指示器
│   ├── composables/
│   │   ├── useLeanCloud.ts       # LeanCloud 初始化与操作
│   │   ├── useSync.ts            # 同步逻辑（离线队列+自动同步）
│   │   ├── useTransaction.ts     # 交易 CRUD
│   │   └── useStatistics.ts      # 统计计算
│   ├── stores/
│   │   ├── book.ts               # 账本状态（密码、ID）
│   │   ├── transaction.ts        # 交易数据
│   │   └── sync.ts               # 同步状态
│   ├── views/
│   │   ├── EntryView.vue         # 输入密码进入账本
│   │   ├── HomeView.vue          # 首页（本月概览+最近记录）
│   │   ├── AddView.vue           # 记一笔
│   │   ├── ListView.vue          # 全部账单列表
│   │   ├── StatsView.vue         # 统计图表
│   │   └── SettingsView.vue      # 设置
│   ├── router/
│   │   └── index.ts
│   ├── utils/
│   │   ├── crypto.ts             # SHA-256 哈希
│   │   ├── storage.ts            # localStorage 封装
│   │   └── format.ts             # 金额/日期格式化
│   ├── App.vue
│   └── main.ts
├── public/
├── android/                      # Capacitor 生成的 Android 项目
├── capacitor.config.ts
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## LeanCloud 数据结构

### Book（账本）
```
Book {
  objectId: string        // LeanCloud 自动生成
  bookId: string          // SHA-256(6位密码) 的前16位
  createdAt: Date
}
```

### Transaction（交易记录）
```
Transaction {
  objectId: string        // LeanCloud 自动生成
  bookId: string          // 所属账本ID
  type: string            // "expense" | "income"
  amount: number          // 金额
  date: string            // 日期 "2025-01-15"
  category: string        // 分类名
  paymentMethod: string   // 支付方式
  note: string            // 备注
  createdBy: string       // 记账人标识（设备A/设备B）
  createdAt: Date
  updatedAt: Date
}
```

## 同步策略

1. **进入账本**：从 LeanCloud 拉取该 bookId 下所有交易记录
2. **记账**：先写 localStorage，再推送到 LeanCloud
3. **实时监听**：LiveQuery 订阅 Transaction 表的 bookId 相关变更
4. **离线队列**：断网时记账存入 pendingQueue，联网后自动批量上传
5. **冲突解决**：以 updatedAt 最新的为准

## 分步实施

### 第一步：项目初始化
1. 用 Vite 创建 Vue3 + TypeScript 项目
2. 安装 TailwindCSS、Vue Router、Pinia、ECharts、dayjs
3. 安装 leancloud-storage SDK
4. 配置项目结构和基础文件

### 第二步：密码进入 + 账本系统
1. 实现 6位数字密码输入界面
2. SHA-256 哈希生成 bookId
3. LeanCloud 查询/创建账本
4. 路由守卫（未输入密码不能进入）

### 第三步：核心记账功能
1. 记账页面（收入/支出、金额、日期、分类、支付方式、备注）
2. 交易列表展示
3. 首页月度概览
4. 删除/编辑交易

### 第四步：LeanCloud 实时同步
1. LiveQuery 订阅
2. 离线队列 + 自动同步
3. 同步状态指示器

### 第五步：统计图表
1. 月度支出分类饼图
2. 月度收支柱状图
3. 月份切换

### 第六步：Capacitor 打包 APK
1. 安装 Capacitor
2. 配置 capacitor.config.ts
3. npx cap add android
4. npx cap sync
5. Android Studio 打开 android/ 目录
6. Build APK

## 验证步骤
1. 两个浏览器标签页输入相同密码，验证实时同步
2. 断网记账，联网后验证自动同步
3. 手机浏览器访问，验证移动端适配
4. Capacitor 打包后安装 APK 验证功能正常
