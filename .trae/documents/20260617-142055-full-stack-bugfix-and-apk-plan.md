# 全栈记账 APP 全面修复与 APK 交付计划

> **执行约束**：纯前端 · 无后端 · 全部数据本地持久化 · 最终打包 APK  
> **关键决策（已与用户确认）**：
> 1. 存储：核心数据走 IndexedDB（账单/预算/分类/账本/借条），轻量配置（主题/登录态/全局设置）走 localStorage
> 2. 打包：沿用现有 Capacitor 6 工程（`android/` 已就绪），不切换 HBuilderX
> 3. 范围：4 阶段全跑（静态修复 → 功能测试 → 存储压力测试 → APK 交付）
> 4. 不大面积重写：保留原业务逻辑、3 套主题架构（已合并为 2 套：标准 / 海贼王）、PaintedScene + IllustrationImage 渲染管线

---

## 阶段零：全局问题清单（来自用户消息 + 静态预扫描）

| # | 缺陷点 | 当前代码 | 影响 |
|---|--------|----------|------|
| 0-1 | 全部数据存 localStorage，5MB 上限风险 | `utils/storage.ts` 全部走 `localStorage` | APK 大量数据后会丢 |
| 0-2 | `removeMember` 删除后未 setLocal 月度预算 | `stores/book.ts` `setMonthBudget` 用直接 `mb = {...}; localStorage.setItem` 而非 `setLocal` | 存储键不一致 |
| 0-3 | `HomeView` `filteredTransactions` 在 `day/month/year` 维度未严格限定 `bookId` | `HomeView.vue:625` | 切账本后混入其它账本流水 |
| 0-4 | `useStatistics` 按日期范围过滤，与首页日/月/年维度不联动 | `useStatistics.ts:10-12` 与 HomeView 独立计算 | 同一筛选下两处数字对不上 |
| 0-5 | 插画 `z-index` 局部定义，未在 `main.css` 集中管控 | `DataBackupView.vue:363-381` 等多处 `position:absolute` 但未声明 z-index | 主题切换时可能挡住文字 |
| 0-6 | DataBackupView 导出文件未导出账本/预算/分类 | `DataBackupView.vue:108-117` 仅备份 transactions | 恢复后预算账本全丢 |
| 0-7 | DataBackupView 文件读取未做大小/格式校验 | `DataBackupView.vue:128-141` 直接 parse | 异常文件可能写空数据 |
| 0-8 | `BottomNav` 高度 0 → `position: fixed` 与 `HomeView` 的 `.fab-row` 底部 `80px` 不联动 | `BottomNav.vue` 无 height 暴露 | 安卓手势条会遮挡 |
| 0-9 | `useStatistics` 月度柱状图硬编码「最近 6 个月」 | `useStatistics.ts:51-65` | 用户切年维度时数据错误 |
| 0-10 | 路由守卫 `getLocal<string>('bookId')` 直接从 localStorage 读 | `router/index.ts:136` | IDB 化后需异步化 |
| 0-11 | `IllustrationImage` 错误回退只 `display:none`，无视觉提示 | `IllustrationImage.vue` | 加载失败无感 |
| 0-12 | 主题切换未清空 useIllustrationPicker 缓存 | `useIllustrationPicker.ts:38-50` 缓存存于 `globalModulePools`，与 currentThemeSet 解耦 | 切回标准主题时仍可能渲染旧图 |
| 0-13 | Android WebView 未声明 `setDomStorageEnabled` `setDatabaseEnabled` | `MainActivity.java` 未配置 | APK 后数据被清 |
| 0-14 | 主题切换时 `currentThemeSet` 监听未触发 pool 重建 | `useTheme.ts:86-89` | 上述 0-12 的根因 |
| 0-15 | `EntryView` 未在用户消息中涉及，但首次进入无插画无插图 | 待确认 | —— |

---

## 阶段一：代码静态全量自查 & Bug 批量修复

### 1.1 准备：搭建 IDB 抽象层（不破坏调用方）

**新建文件**：`src/utils/idb.ts`  
封装 IndexedDB 基础 API（get/set/del/keys/clear），使用原生 IDB（不引入额外依赖以减小 APK 体积）。  
表设计：
```
db: fab_db
  objectStore: kv          (key: string, value: any)   ← 通用 KV
  objectStore: transactions (keyPath: 'objectId')       ← 索引: bookId, date
  objectStore: books       (keyPath: 'id')
  objectStore: categories  (keyPath: 'id')
  objectStore: lendborrow  (keyPath: 'objectId')
```

**改造**：`src/utils/storage.ts`
- 保留 `getLocal/setLocal/removeLocal` 三个本地函数（轻量配置专用）
- 新增 `idbGet/idbSet/idbDel/idbClear` 四个 IDB 函数（异步）
- 所有写入 IDB 的 store 调用统一走 `idbSet` + 失败时降级 `setLocal`（`QuotaExceededError` 兜底）

**改造**：`src/stores/transaction.ts`
- 把 `getLocal('transactions')` → 初始化时先尝试 `idbGet('transactions')`，失败再回落 `getLocal('transactions')`
- `addTransaction/removeTransaction/updateTransaction` 全部走 `idbSet('transactions', transactions.value)`，外层 try/catch 失败弹窗
- 启动时 `await` 完成再让页面挂载（在 `main.ts` 增 `bootstrap()`）

**改造**：`src/stores/book.ts`
- `bookId`/`deviceName`/`userName`/`userPhoto` → 保留 `localStorage`（轻量配置）
- `books`/`members`/`budgets`/`monthBudgets` → 全部迁移 `idbSet`
- 修复 0-2 bug：统一用 `setLocal('monthBudgets', mb)` 改为 `idbSet('monthBudgets', mb)`
- 修复 0-12 联动：监听 `currentThemeSet`，变化时 `globalModulePools.clear()`

**改造**：`src/stores/category.ts`
- `customCategories` → IDB；`CATEGORIES` 预设仍在代码常量

**改造**：`src/stores/lendBorrow.ts`（先读全文结构）
- `lendBorrow` → IDB

### 1.2 修复首页（HomeView）bug

文件：`src/views/HomeView.vue`

- 修 0-3：`filteredTransactions` 增加 `t.bookId === bookStore.bookId` 过滤
- 修 0-4：把 `useStatistics` 的「区间计算」抽出为 `composables/useFilteredStats.ts`，HomeView 与 StatsView 共用
- 修预算百分比：使用 `Math.min(100, ...)` 展示 + 实际超额时 `budgetPercent` 仍返回 真实百分比，UI 单独展示「已超额」标签
- 修 0-8：在 `.fab-row` 改为 `bottom: calc(80px + env(safe-area-inset-bottom, 0px))`
- 修空态：删除残留的 `display:none` `<PetMascot>` / `<MangaMascot>` 模板代码（保持文件干净，但不影响显示）

### 1.3 修复统计页（StatsView）bug

文件：`src/views/StatsView.vue`

- 复用 `useFilteredStats` 替代手写计算
- 修 0-9：柱状图年份维度时改为「按当前年逐月」展示，与折线保持一致
- 排行 `progress` 数据与饼图 sum 100% 校对
- 修复 `card-content` 与插画 z-index 冲突：`z-index: 1` 给插画, `z-index: 9` 给文字（与 HomeView 统一）

### 1.4 修复账单页（ListView）bug

文件：`src/views/ListView.vue`

- 顶部移除「收支总额」统计（按需求 1.1 第 3 条）
- 按日期分组 + 笔数统计
- 空态 `<IllustrationImage>` 加 `@error` 回退提示

### 1.5 修复插画层级 & 主题切换布局

文件：`src/assets/styles/main.css`

新增集中式 z-index 变量：
```css
:root {
  --z-illustration-bg: 1;
  --z-illustration-corner: 2;
  --z-card-content: 9;
  --z-fab: 50;
  --z-modal-mask: 90;
  --z-modal-content: 95;
  --z-nav: 100;
  --z-toast: 200;
}
```
并把现有 scattered 样式统一引用这些变量。  
透明度统一规范：背景大图 `opacity: 0.10~0.12`，角标贴纸 `opacity: 0.85~0.95`，底部暗纹 `opacity: 0.06~0.08`（避免遮挡文字）。

### 1.6 修复 `useTheme` 与 `useIllustrationPicker` 解耦 bug

- 修 0-12、0-14：在 `useTheme.ts` 的 `watch(currentThemeSet, ...)` 内部调用 `globalModulePools.clear()`（`useIllustrationPicker.ts` 需 `export const globalModulePools`）
- 修 0-11：`IllustrationImage.vue` `onError` 时记录到控制台 + 渲染一个 1×1 透明占位 + 不影响布局

### 1.7 修路由守卫 IDB 化

`src/router/index.ts`：

```ts
import { isBootstrapped } from '../utils/idb'
router.beforeEach(async (to, from, next) => {
  if (!isBootstrapped()) {
    // 等待 IDB 初始化完成
    await waitForBootstrap()
  }
  const bookId = getLocal<string>('bookId')
  ...
})
```

### 1.8 修复 DataBackupView 完整备份恢复

`src/views/DataBackupView.vue`：

- 导出：除 `transactions` 外，增加 `books / categories / lendBorrow / budgets / monthBudgets / customCategories`；格式升级为：
  ```json
  {
    "version": 2,
    "exportedAt": "ISO",
    "data": { "transactions": [...], "books": [...], ... }
  }
  ```
- 导入：解析 `data.data.*`，逐项写回 IDB；解析失败 / 字段缺失 → 弹窗提示「文件已损坏或版本不匹配」并拒绝写入
- 大小限制：> 50MB 拒绝（保护设备）
- 路径兼容：在 Capacitor 环境优先用 `@capacitor/filesystem` 保存到 `Download/` 目录，浏览器回退 Blob 下载

### 1.9 UI 布局统一修复

- 全局检查 `border-radius / box-shadow / font-size` 是否都引用 CSS 变量；硬编码值记录到 `BUG_LOG.md` 后续修
- 适配水滴屏 / 挖孔屏：`body` 增加 `padding-top: env(safe-area-inset-top, 0); padding-bottom: env(safe-area-inset-bottom, 0);`
- 底部导航 `BottomNav.vue` 增加 `padding-bottom: env(safe-area-inset-bottom, 0);`，避免安卓手势遮挡

### 1.10 数据表结构校验

在 `src/utils/idb.ts` 启动时校验各表 schema：
- transactions 必含 `objectId/bookId/type/amount/date/category/paymentMethod/note/createdBy/createdAt/updatedAt`
- 缺字段自动补默认，弹窗提示「已自动修复 N 条老数据」

---

## 阶段二：全场景功能黑盒测试

> 测试方法：手动逐模块走查（无单测框架），每条通过后在 `TEST_CHECKLIST.md` 标记。

### 模块 1：首页（HomeView）
- 切换日/月/年/全部/自定义，预算环 + 收支额 + 柱状图同步
- 切账本：金额 + 笔数 + 图表仅显示当前账本数据（验证 0-3 修复）
- 主题切换：插画/色彩/图标同步更新，标准主题无任何插画
- 新增账单 → 首页实时刷新（无需手动 F5）
- 删除账单 → 金额同步扣减
- 切日期 `dateOffset` ±30 月无崩

### 模块 2：账单页（ListView）
- 顶部收支总额块确认已移除
- 按日期分组渲染，新增/编辑/删除实时更新
- 单条账单角标插画独立互不干扰
- 空态插画正确显示
- 月份切换流畅

### 模块 3：统计页（StatsView）
- 柱状/折线/饼图切换正常
- 分类排行进度条数据 = 饼图 sum
- 年月筛选图表联动
- 总额 = 账单流水 sum（误差 < 0.01）

### 模块 4：个人主页三子页
- TransactionCountView / PersistentDaysView / CategoryUsageView
- 三页统计数值与 transactionStore 全局数据完全一致
- 各自插画模块独立渲染

### 模块 5：配套全功能
- 预算中心 / 存钱计划 / 人情往来 / 周期记账 / 分类管理 / 导入导出 / 每日对账 / 记账提醒 / 主题设置 / 登录页
- 主题切换持久化（重启 APP 读取正确）
- 登录页插画正确显示「欢迎使用 XXX 记账」
- 暴力测试：连点 50 次添加按钮、Tab 快速切 20 次、新增 200 笔账单后操作流畅
- 控制台 0 报错（除了 vite dev 模式下的 HMR 提示）

---

## 阶段三：本地存储专项压力测试

> 仍以手动 + 脚本注入为主。

### 测试 1：基础持久
- 新增 50 笔账单 → kill APP → 重新打开 → 100% 保留
- 切主题 → kill → 重新打开 → 主题保留
- 修改预算 → kill → 重新打开 → 预算保留

### 测试 2：多账本隔离
- 建 3 个账本，各加 10 笔 → 切换账本 → 数据互不混淆
- 删账本 A → A 数据清除，B/C 不受影响

### 测试 3：备份恢复
- 导出 JSON → 清空 `idb` 全部表 → 导入 JSON → 全部数据完整还原
- 验证：transactions / books / categories / lendBorrow / budgets / monthBudgets / customCategories 全部

### 测试 4：存储边界
- 录入 500 条账单，操作不卡顿
- 录入 1500 条账单（逼近 localStorage 限制），IDB 仍能容纳
- 大量删除后 IDB 体积正确回收

### 测试 5：异常断电
- 录入中途直接 kill → 重新打开 → 已存数据完整
- 录入中途拔电池（模拟器）→ 重新打开 → IDB 事务回滚或已写入，无半成品

### 测试 6：清除缓存
- Android 系统设置 → 应用 → 清除缓存（不清数据）→ 重新打开 → 数据保留
- IDB 与 cache 分目录存储；校验 `android/app/src/main/assets/public/` 不含数据

---

## 阶段四：打包安卓 APK 适配配置 & 最终交付

### 4.1 WebView 持久化配置

文件：`android/app/src/main/java/com/family/accountbook/MainActivity.java`

```java
import android.webkit.WebSettings;
...
WebSettings settings = webView.getSettings();
settings.setDomStorageEnabled(true);
settings.setDatabaseEnabled(true);
settings.setJavaScriptEnabled(true);
String dbPath = getApplicationContext().getDir("database", MODE_PRIVATE).getPath();
settings.setDatabasePath(dbPath);
```

文件：`android/app/src/main/assets/capacitor.config.json`  
`server.androidScheme: "https"`（已就绪）

文件：`android/app/src/main/assets/public/index.html`  
注入 `viewport-fit=cover`：
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
```

文件：`android/app/src/main/AndroidManifest.xml`  
确保 `usesCleartextTraffic` 不开启（APK 内走 https scheme），`allowBackup=true`

### 4.2 静态资源路径适配

- 图片走 Vite `new URL(...).href` 方案，打包后会被复制到 `dist/assets/images/onepiece/*`（Vite 默认行为）
- `vite.config.ts` 检查 `build.assetsInlineLimit` 避免大图被 base64（>= 4KB 不内联）

### 4.3 关闭调试输出

- `console.log` 全部移除（保留 `console.error` 用于异常）
- `import.meta.env.DEV` 块加在 dev-only 调试

### 4.4 版本兼容

- `android/app/build.gradle` 检查 `minSdkVersion >= 22`（覆盖 99% 设备）
- `compileSdkVersion = 34`，`targetSdkVersion = 34`（Android 14）

### 4.5 打包命令

```bash
# 1. 构建
npm run build

# 2. 同步
npx cap sync android

# 3. 打包（debug 版给真机测试）
cd android
./gradlew assembleDebug
# 产物: android/app/build/outputs/apk/debug/app-debug.apk
```

### 4.6 交付清单

| 文件 | 路径 | 说明 |
|------|------|------|
| 完整源码 | `e:\Users\Administrator\demo1\` | 含 .trae 文档 |
| IDB 抽象层 | `src/utils/idb.ts` | 新建 |
| 测试验收清单 | `.trae/documents/TEST_CHECKLIST.md` | 二阶段全部测试项 |
| Bug 修复记录 | `.trae/documents/BUG_LOG.md` | 全部问题及修复方案 |
| 打包配置说明 | `.trae/documents/PACKAGING.md` | 4.5 步骤展开 |
| 主题切换说明 | `.trae/documents/THEME_GUIDE.md` | 2 套主题 + 开关方式 |
| 数据备份操作 | `.trae/documents/BACKUP_GUIDE.md` | 导出/恢复步骤 |
| Debug APK | `android/app/build/outputs/apk/debug/app-debug.apk` | 需用户运行 gradle 生成 |

---

## 验证步骤

每个阶段完成后，对照下方「全局验收红线」逐项检查：

1. 浏览器控制台 0 报错（vite dev 模式 HMR 提示除外）
2. 强制刷新后所有数据保留
3. 主题切换整套插画/色彩同步
4. 账单页 / 统计页功能完全拆分
5. 筛选 / 图表 / 预算数值计算 100% 准确（误差 < 0.01）
6. APK 在真机（Android 9~14）安装运行，所有功能可用
7. 关闭 APP → 重新打开 → 数据保留
8. 系统清除缓存 → 数据保留
9. 导出/导入 JSON 备份恢复完整
10. 暴力点击无卡死

---

## 风险与回退

| 风险 | 概率 | 缓解 |
|------|------|------|
| IDB 迁移时老数据格式不兼容 | 中 | 启动时检测 version 字段，缺失时尝试从 localStorage 自动迁移并打日志 |
| APK 安装后 WebView 不支持 IndexedDB | 极低 | Android 4.4+ 全部支持，minSdkVersion=22 已覆盖 |
| 主题切换后插画缓存不刷新 | 中 | `useTheme.ts` 加 `watch` → `globalModulePools.clear()` |
| 大量账单时 IDB 写入慢 | 低 | 写入合并节流 200ms |
| 备份文件被用户误删 | — | UI 提示「建议每周导出」 |

---

## 执行顺序（建议分批）

**Batch A**（无破坏性，1-2 小时）：
- 1.1 建 IDB 抽象层
- 1.6 修 useTheme/useIllustrationPicker 解耦
- 1.9 修 UI 安全边距
- 1.5 修 z-index 集中

**Batch B**（store 迁移，2-3 小时）：
- 1.1 改造 transaction/book/category/lendBorrow store
- 1.7 路由守卫异步化
- 1.10 schema 校验

**Batch C**（页面修复，2-3 小时）：
- 1.2 / 1.3 / 1.4 首页/统计/账单页
- 1.8 DataBackup 完整备份

**Batch D**（测试 + 文档，2-3 小时）：
- 阶段二 全模块手测
- 阶段三 存储压力测
- 阶段四 打包
- 文档输出

**Total**：约 8-12 小时的修改 + 测试工作量，分批执行可降低单点失败风险。
