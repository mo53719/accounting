# 家庭记账 Android APP 开发计划

## 项目概述
一款支持双人共享的分类记账 Android APP，供夫妻共同管理家庭财务。使用 Kotlin + Jetpack Compose 开发，Firebase 提供云端同步，功能覆盖分类记账、预算管理、趋势分析、多账户管理、借贷记录、投资追踪、数据导出、报表定制等。

---

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 语言 | Kotlin | Android 官方推荐语言 |
| UI | Jetpack Compose + Material 3 | 声明式 UI，现代设计 |
| 架构 | MVVM + Clean Architecture | 分层解耦，可测试 |
| 本地存储 | Room | SQLite ORM，离线支持 |
| 云端同步 | Firebase Firestore | 实时数据库，自动同步 |
| 认证 | Firebase Authentication | 邮箱/Google 登录 |
| 依赖注入 | Hilt | Google 官方 DI 框架 |
| 异步 | Kotlin Coroutines + Flow | 响应式数据流 |
| 图表 | Vico | Compose 原生图表库 |
| 导航 | Compose Navigation | 单 Activity 架构 |
| 构建 | Gradle Kotlin DSL | 类型安全构建脚本 |

---

## 功能模块

### 1. 用户与家庭管理
- 邮箱/Google 账号注册登录
- 创建/加入家庭组（通过邀请码）
- 家庭成员管理（2人共享）
- 个人设置（货币、主题等）

### 2. 分类记账
- 支出/收入分类管理（自定义分类 + 预设分类）
- 快速记账（金额、分类、备注、日期、账户）
- 标签系统（一笔账可打多个标签）
- 记账人标识（谁记的账）
- 图片附件（拍照/相册上传收据）

### 3. 多账户管理
- 账户类型：现金、银行卡、信用卡、电子钱包、储蓄
- 账户间转账
- 账户余额实时计算
- 账户对账功能

### 4. 预算管理
- 月度预算设置（按分类/总体）
- 预算进度条实时显示
- 超预算提醒通知
- 预算 vs 实际对比

### 5. 借贷记录
- 借入/借出记录
- 还款计划与提醒
- 借贷状态追踪（未还/部分还款/已还）
- 联系人关联

### 6. 投资追踪
- 投资账户管理（基金、股票、理财）
- 买入/卖出记录
- 持仓查看
- 收益计算

### 7. 查询与筛选
- 按日期范围查询
- 按分类/标签筛选
- 按金额范围筛选
- 按记账人筛选
- 按账户筛选
- 全文搜索（备注）

### 8. 统计与视图
- 月度/年度收支汇总
- 分类占比饼图
- 收支趋势折线图
- 日历热力图（记账频率）
- 双人记账对比
- 周报/月报自动生成

### 9. 数据导出
- 导出为 CSV/Excel
- 导出为 PDF 报表
- 按时间范围/分类导出
- 分享报表

### 10. 报表定制
- 自定义报表维度
- 保存常用报表模板
- 报表定时推送

### 11. 账单提醒
- 定期账单提醒（房租、水电等）
- 自定义提醒时间
- 通知推送

### 12. 数据同步
- Firebase Firestore 实时同步
- 离线优先（本地 Room 优先写入）
- 冲突解决策略（最后写入胜出）
- 数据备份与恢复

---

## 项目结构

```
app/
├── src/main/java/com/family/accountbook/
│   ├── di/                          # Hilt 依赖注入模块
│   │   ├── AppModule.kt
│   │   ├── DatabaseModule.kt
│   │   ├── FirebaseModule.kt
│   │   └── RepositoryModule.kt
│   ├── data/
│   │   ├── local/
│   │   │   ├── db/
│   │   │   │   ├── AppDatabase.kt
│   │   │   │   ├── dao/
│   │   │   │   │   ├── TransactionDao.kt
│   │   │   │   │   ├── CategoryDao.kt
│   │   │   │   │   ├── AccountDao.kt
│   │   │   │   │   ├── BudgetDao.kt
│   │   │   │   │   ├── DebtDao.kt
│   │   │   │   │   └── InvestmentDao.kt
│   │   │   │   └── entity/
│   │   │   │       ├── TransactionEntity.kt
│   │   │   │       ├── CategoryEntity.kt
│   │   │   │       ├── AccountEntity.kt
│   │   │   │       ├── BudgetEntity.kt
│   │   │   │       ├── DebtEntity.kt
│   │   │   │       └── InvestmentEntity.kt
│   │   │   └── datastore/
│   │   │       └── UserPreferences.kt
│   │   ├── remote/
│   │   │   ├── FirestoreDataSource.kt
│   │   │   └── dto/
│   │   │       ├── TransactionDto.kt
│   │   │       └── SyncMetadataDto.kt
│   │   ├── repository/
│   │   │   ├── TransactionRepositoryImpl.kt
│   │   │   ├── CategoryRepositoryImpl.kt
│   │   │   ├── AccountRepositoryImpl.kt
│   │   │   ├── BudgetRepositoryImpl.kt
│   │   │   ├── DebtRepositoryImpl.kt
│   │   │   ├── InvestmentRepositoryImpl.kt
│   │   │   └── SyncRepositoryImpl.kt
│   │   └── sync/
│   │       ├── SyncManager.kt
│   │       └── ConflictResolver.kt
│   ├── domain/
│   │   ├── model/
│   │   │   ├── Transaction.kt
│   │   │   ├── Category.kt
│   │   │   ├── Account.kt
│   │   │   ├── Budget.kt
│   │   │   ├── Debt.kt
│   │   │   ├── Investment.kt
│   │   │   └── FamilyGroup.kt
│   │   ├── repository/
│   │   │   ├── TransactionRepository.kt
│   │   │   ├── CategoryRepository.kt
│   │   │   ├── AccountRepository.kt
│   │   │   ├── BudgetRepository.kt
│   │   │   ├── DebtRepository.kt
│   │   │   ├── InvestmentRepository.kt
│   │   │   └── SyncRepository.kt
│   │   └── usecase/
│   │       ├── transaction/
│   │       │   ├── AddTransactionUseCase.kt
│   │       │   ├── GetTransactionsUseCase.kt
│   │       │   └── DeleteTransactionUseCase.kt
│   │       ├── budget/
│   │       │   ├── SetBudgetUseCase.kt
│   │       │   └── GetBudgetStatusUseCase.kt
│   │       ├── sync/
│   │       │   ├── SyncDataUseCase.kt
│   │       │   └── ResolveConflictUseCase.kt
│   │       └── export/
│   │           ├── ExportCsvUseCase.kt
│   │           └── ExportPdfUseCase.kt
│   ├── ui/
│   │   ├── navigation/
│   │   │   └── AppNavigation.kt
│   │   ├── theme/
│   │   │   ├── Theme.kt
│   │   │   ├── Color.kt
│   │   │   └── Typography.kt
│   │   ├── components/               # 通用 UI 组件
│   │   │   ├── AmountInput.kt
│   │   │   ├── CategoryPicker.kt
│   │   │   ├── DatePicker.kt
│   │   │   └── LoadingIndicator.kt
│   │   ├── screens/
│   │   │   ├── auth/
│   │   │   │   ├── LoginScreen.kt
│   │   │   │   └── RegisterScreen.kt
│   │   │   ├── home/
│   │   │   │   └── HomeScreen.kt
│   │   │   ├── transaction/
│   │   │   │   ├── AddTransactionScreen.kt
│   │   │   │   ├── TransactionListScreen.kt
│   │   │   │   └── TransactionDetailScreen.kt
│   │   │   ├── statistics/
│   │   │   │   └── StatisticsScreen.kt
│   │   │   ├── budget/
│   │   │   │   └── BudgetScreen.kt
│   │   │   ├── account/
│   │   │   │   └── AccountScreen.kt
│   │   │   ├── debt/
│   │   │   │   └── DebtScreen.kt
│   │   │   ├── investment/
│   │   │   │   └── InvestmentScreen.kt
│   │   │   ├── search/
│   │   │   │   └── SearchScreen.kt
│   │   │   ├── export/
│   │   │   │   └── ExportScreen.kt
│   │   │   ├── report/
│   │   │   │   └── ReportScreen.kt
│   │   │   └── settings/
│   │   │       └── SettingsScreen.kt
│   │   └── viewmodel/
│   │       ├── AuthViewModel.kt
│   │       ├── HomeViewModel.kt
│   │       ├── TransactionViewModel.kt
│   │       ├── StatisticsViewModel.kt
│   │       ├── BudgetViewModel.kt
│   │       ├── AccountViewModel.kt
│   │       ├── DebtViewModel.kt
│   │       ├── InvestmentViewModel.kt
│   │       ├── SearchViewModel.kt
│   │       └── SettingsViewModel.kt
│   ├── service/
│   │   ├── ReminderService.kt
│   │   └── SyncWorker.kt
│   └── util/
│       ├── DateTimeUtils.kt
│       ├── CurrencyUtils.kt
│       └── ExportUtils.kt
├── src/main/res/
│   ├── values/
│   │   ├── strings.xml
│   │   ├── colors.xml
│   │   └── themes.xml
│   └── drawable/
└── build.gradle.kts
```

---

## 数据模型设计

### Transaction（交易记录）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (UUID) | 主键 |
| type | Enum | EXPENSE / INCOME / TRANSFER |
| amount | Double | 金额 |
| categoryId | String | 分类ID |
| accountId | String | 账户ID |
| toAccountId | String? | 转账目标账户 |
| note | String? | 备注 |
| tags | List\<String\> | 标签列表 |
| date | LocalDateTime | 交易日期 |
| createdBy | String | 记账人UID |
| imageUrl | String? | 收据图片URL |
| isSynced | Boolean | 是否已同步 |
| createdAt | LocalDateTime | 创建时间 |
| updatedAt | LocalDateTime | 更新时间 |

### Category（分类）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 主键 |
| name | String | 分类名称 |
| icon | String | 图标标识 |
| type | Enum | EXPENSE / INCOME |
| color | Long | 颜色值 |
| isDefault | Boolean | 是否预设分类 |
| sortOrder | Int | 排序 |
| familyId | String | 家庭组ID |

### Account（账户）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 主键 |
| name | String | 账户名称 |
| type | Enum | CASH/BANK/CREDIT/EWALLET/SAVINGS |
| balance | Double | 余额 |
| currency | String | 货币 |
| icon | String | 图标 |
| familyId | String | 家庭组ID |

### Budget（预算）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 主键 |
| categoryId | String? | 分类ID（null表示总预算）|
| amount | Double | 预算金额 |
| period | Enum | MONTHLY / YEARLY |
| year | Int | 年份 |
| month | Int | 月份 |
| familyId | String | 家庭组ID |

### Debt（借贷）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 主键 |
| type | Enum | BORROW / LEND |
| amount | Double | 总金额 |
| repaidAmount | Double | 已还金额 |
| contactName | String | 联系人 |
| note | String? | 备注 |
| dueDate | LocalDate? | 到期日 |
| status | Enum | PENDING / PARTIAL / SETTLED |
| familyId | String | 家庭组ID |

### Investment（投资）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 主键 |
| name | String | 投资名称 |
| type | Enum | FUND / STOCK / BOND / OTHER |
| buyPrice | Double | 买入价 |
| currentPrice | Double | 当前价 |
| quantity | Double | 数量 |
| buyDate | LocalDate | 买入日期 |
| accountId | String | 关联账户 |
| familyId | String | 家庭组ID |

---

## Firebase 数据结构

```
firestore/
├── families/
│   └── {familyId}/
│       ├── members: [uid1, uid2]
│       ├── createdAt: timestamp
│       └── inviteCode: string
├── transactions/
│   └── {transactionId}/
│       ├── ... (同上 Transaction 模型)
│       └── familyId: string
├── categories/
│   └── {categoryId}/
│       ├── ... (同上 Category 模型)
│       └── familyId: string
├── accounts/
│   └── {accountId}/
│       ├── ... (同上 Account 模型)
│       └── familyId: string
├── budgets/
│   └── {budgetId}/
│       ├── ... (同上 Budget 模型)
│       └── familyId: string
├── debts/
│   └── {debtId}/
│       ├── ... (同上 Debt 模型)
│       └── familyId: string
└── investments/
    └── {investmentId}/
        ├── ... (同上 Investment 模型)
        └── familyId: string
```

---

## 同步策略

1. **离线优先**：所有写操作先写入本地 Room 数据库，标记 `isSynced = false`
2. **后台同步**：通过 WorkManager 定期将未同步数据上传到 Firestore
3. **实时监听**：对 Firestore 添加 SnapshotListener，实时接收对方的数据变更
4. **冲突解决**：采用 Last-Write-Wins 策略，基于 `updatedAt` 时间戳
5. **首次同步**：登录后全量拉取家庭组数据到本地

---

## 分阶段实施计划

### 第一阶段：项目基础搭建
1. 创建 Android 项目，配置 Gradle（Kotlin DSL）
2. 添加依赖：Compose、Hilt、Room、Firebase、Vico 等
3. 搭建 Clean Architecture 分层结构
4. 配置 Firebase 项目（Firestore、Authentication）
5. 实现 Material 3 主题系统（亮色/暗色）

### 第二阶段：用户认证与家庭组
1. 实现登录/注册界面（邮箱 + Google 登录）
2. Firebase Auth 集成
3. 创建/加入家庭组功能
4. 邀请码生成与验证
5. 用户偏好设置（DataStore）

### 第三阶段：核心记账功能
1. Room 数据库设计与实现（所有 Entity + DAO）
2. 分类管理（预设分类 + 自定义分类）
3. 快速记账界面（金额输入、分类选择、日期选择）
4. 交易列表展示（按日期分组、分页加载）
5. 交易详情查看与编辑/删除
6. 标签系统

### 第四阶段：多账户管理
1. 账户 CRUD
2. 账户间转账
3. 余额自动计算
4. 账户对账

### 第五阶段：数据同步
1. Firestore 数据源实现
2. SyncManager 同步管理器
3. WorkManager 后台同步
4. SnapshotListener 实时监听
5. 冲突解决机制
6. 首次登录全量同步

### 第六阶段：预算管理
1. 预算设置界面
2. 预算进度展示
3. 超预算提醒（Notification）

### 第七阶段：借贷记录
1. 借贷 CRUD
2. 还款记录
3. 状态追踪
4. 到期提醒

### 第八阶段：投资追踪
1. 投资记录 CRUD
2. 持仓查看
3. 收益计算

### 第九阶段：查询与统计
1. 高级搜索与筛选
2. 月度/年度统计图表（Vico）
3. 分类占比饼图
4. 收支趋势折线图
5. 日历热力图
6. 双人记账对比

### 第十阶段：导出与报表
1. CSV/Excel 导出
2. PDF 报表生成
3. 报表定制与模板保存
4. 分享功能

### 第十一阶段：账单提醒
1. 定期账单设置
2. AlarmManager / WorkManager 定时提醒
3. 通知推送

### 第十二阶段：优化与发布
1. UI/UX 打磨与动画
2. 性能优化
3. 离线体验优化
4. ProGuard 混淆配置
5. 签名打包
6. 上架 Google Play

---

## 关键依赖

```kotlin
// build.gradle.kts 核心依赖
dependencies {
    // Compose
    implementation(platform("androidx.compose:compose-bom:2024.12.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.navigation:navigation-compose:2.8.5")

    // Hilt
    implementation("com.google.dagger:hilt-android:2.53.1")
    kapt("com.google.dagger:hilt-compiler:2.53.1")
    implementation("androidx.hilt:hilt-navigation-compose:1.2.0")

    // Room
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    kapt("androidx.room:room-compiler:2.6.1")

    // Firebase
    implementation(platform("com.google.firebase:firebase-bom:33.7.0"))
    implementation("com.google.firebase:firebase-auth-ktx")
    implementation("com.google.firebase:firebase-firestore-ktx")
    implementation("com.google.android.gms:play-services-auth:21.3.0")

    // Charts
    implementation("com.patrykandpatrick.vico:compose-m3:2.0.1")

    // WorkManager
    implementation("androidx.work:work-runtime-ktx:2.10.0")

    // DataStore
    implementation("androidx.datastore:datastore-preferences:1.1.1")

    // Image loading (for receipts)
    implementation("io.coil-kt:coil-compose:2.7.0")

    // Export
    implementation("com.itextpdf:itext7-core:7.2.5")
    implementation("org.apache.poi:poi-ooxml:5.3.0")
}
```

---

## 假设与决策

1. **最低 SDK 版本**：API 26 (Android 8.0)，覆盖 95%+ 设备
2. **目标 SDK 版本**：API 35
3. **同步策略**：离线优先 + 后台同步，保证无网也能记账
4. **冲突解决**：Last-Write-Wins，简单可靠
5. **货币**：默认 CNY，支持多货币切换
6. **语言**：中文优先，预留国际化接口
7. **家庭组**：限制 2 人，简化权限管理
8. **图片存储**：Firebase Storage（收据图片）
9. **安全规则**：Firestore Security Rules 基于 familyId 限制访问

---

## 验证步骤

1. 每个阶段完成后进行功能测试
2. 同步功能：两台设备同时操作，验证数据一致性
3. 离线场景：断网记账 → 联网后自动同步
4. 冲突场景：双方同时编辑同一笔记录，验证冲突解决
5. 性能测试：大量数据下的列表滚动和查询速度
6. 内存泄漏检测：使用 LeakCanary
