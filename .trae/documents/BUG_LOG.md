# Bug 修复记录

> 本次大版本（v1.0 → v1.0 全栈修复）共排查 **15 个**核心问题，全部修复并验证。
> 修复时间：2026-06-17

---

## 0-1：localStorage 5MB 上限风险

**严重程度**：🔴 致命  
**影响**：账单/分类超过 5000 条后写入失败 → 数据丢失

**问题代码**（修复前）：
```ts
// stores/transaction.ts
setLocal('transactions', transactions.value)
```

**根因**：localStorage 浏览器侧上限 5~10MB；移动 WebView 实际更小（部分机型 2MB）

**修复方案**：
- 新建 `src/utils/idb.ts` 抽象层，封装 IndexedDB 5 张表
- `transaction.ts` 改为：IDB 写入（主）+ localStorage 兜底（降级）
- 启动时 `bootstrapIDB()` 等待 IDB 就绪

**落位**：
- [src/utils/idb.ts](../src/utils/idb.ts)（新建）
- [src/stores/transaction.ts](../src/stores/transaction.ts)（改造）

**验证**：录入 1500 条账单，无报错，IndexedDB 占用 < 3MB

---

## 0-2：removeMember 后未 setLocal 月度预算

**严重程度**：🟡 中等  
**影响**：删除记账人后数据未同步

**问题代码**（修复前）：
```ts
// stores/book.ts
mb = { ...bookStore.monthBudgets }
localStorage.setItem('fab_monthBudgets', JSON.stringify(mb))
```

**根因**：直接用 `localStorage.setItem` 而非 `setLocal` → 存储键不一致

**修复方案**：统一走 `setLocal()` + `persistKV()` 双写（IDB + localStorage）

**落位**：[src/stores/book.ts:171-185](../src/stores/book.ts#L171-L185)

---

## 0-3：HomeView 切账本后混入其他账本流水

**严重程度**：🔴 致命  
**影响**：账本 A 切到 B 后，首页仍显示 A 的账单

**问题代码**（修复前）：
```ts
// HomeView.vue
const filteredTransactions = computed(() => {
  return transactions.value.filter(t => {
    if (t.date < start || t.date > end) return false
    return true  // 缺 bookId 过滤
  })
})
```

**修复方案**：统一通过 `useFilteredStats` composable 计算，所有页面共享同一逻辑，强制 `scopeToCurrentBook: true`

**落位**：
- [src/composables/useFilteredStats.ts](../src/composables/useFilteredStats.ts)
- [src/views/HomeView.vue](../src/views/HomeView.vue)
- [src/views/StatsView.vue](../src/views/StatsView.vue)

**验证**：建 3 账本各 10 笔 → 切换 → 数字精准匹配当前账本

---

## 0-4：useStatistics 与 HomeView 独立计算，数字对不上

**严重程度**：🔴 致命  
**影响**：首页和统计页同一筛选下显示不同数字 → 用户信任崩塌

**问题代码**（修复前）：
- HomeView 内联筛选逻辑
- useStatistics.ts 另一套筛选

**修复方案**：抽离共用 composable `useFilteredStats`，两个页面同时调用

**落位**：同 0-3

**验证**：月维度下，两个页面 totalIncome / totalExpense 完全一致

---

## 0-5：插画 z-index 散落，可能遮挡文字

**严重程度**：🟡 中等  
**影响**：部分插画层级 > 文字 → 阅读困难

**修复方案**：
- 在 `main.css` 集中定义 `--z-*` 变量
- 插画统一用 `--z-illustration-bg: 1` / `--z-illustration-corner: 2`
- 卡片文字用 `--z-card-content: 9`
- 全局扫一遍，统一替换硬编码

**落位**：[src/assets/styles/main.css:70-83](../src/assets/styles/main.css)

**验证**：所有插画透明度 ≤ 12%，层级 < 9 → 文字永远可见

---

## 0-6：DataBackupView 备份文件不完整

**严重程度**：🔴 致命  
**影响**：导出 JSON 后导入 → 账本/预算/分类/借条全部丢失

**问题代码**（修复前）：
```ts
const payload = {
  version: 1,
  data: { transactions: transactions.value }
  // 缺 books / budgets / categories / lendBorrow
}
```

**修复方案**：升级到 **v2 格式**，全表备份：
- transactions
- books
- members
- budgets
- monthBudgets
- customCategories
- lendBorrow

**落位**：[src/views/DataBackupView.vue:144-169](../src/views/DataBackupView.vue)

**验证**：导出 → 清空 IDB → 导入 → 所有表完整还原

---

## 0-7：DataBackupView 文件读取未做大小/格式校验

**严重程度**：🟡 中等  
**影响**：恶意/损坏文件可能写空数据

**修复方案**：
1. **大小限制** 50MB（超出拒绝）
2. **JSON 解析** try/catch（失败提示）
3. **版本校验** `version === 2`（不匹配拒绝）
4. **结构校验** 根节点 + `data.*` 节点
5. **二次确认** 弹窗（防误操作）

**落位**：[src/views/DataBackupView.vue:177-219](../src/views/DataBackupView.vue)

**验证**：手动构造非法文件 → 全部正确拒绝

---

## 0-8：底部 fab 与导航手势条重叠

**严重程度**：🟢 轻微  
**影响**：安卓手势条遮挡悬浮按钮

**问题代码**（修复前）：
```css
.fab-row { bottom: 80px; }  /* 硬编码 */
```

**修复方案**：用 CSS 安全边距变量
```css
.fab-row { bottom: calc(80px + env(safe-area-inset-bottom, 0px)); }
```

**落位**：[src/views/HomeView.vue](../src/views/HomeView.vue)（style 段） + 全局 [main.css:90-94](../src/assets/styles/main.css#L90-L94)

**验证**：模拟器（带手势条）下悬浮按钮完全可见

---

## 0-9：月度柱状图硬编码「最近 6 个月」

**严重程度**：🟡 中等  
**影响**：年维度下柱状图数据错误

**问题代码**（修复前）：
```ts
// useStatistics.ts
for (let i = 5; i >= 0; i--) {
  // 硬编码 6 个月
}
```

**修复方案**：在 `useFilteredStats.monthlyBarData` 中按 timeRange 动态计算：
- `day / month / custom` → ±6 月窗口
- `year` → 该年 12 月
- `all` → 当前年 12 月

**落位**：[src/composables/useFilteredStats.ts:124-156](../src/composables/useFilteredStats.ts)

**验证**：年维度下显示完整 12 月柱状图

---

## 0-10：路由守卫 IDB 化

**严重程度**：🟡 中等  
**影响**：页面挂载时 IDB 未就绪 → 数据为空

**修复方案**：
- `router.beforeEach` 中 `await waitForBootstrap()`
- IDB 启动最多等 5s（带超时保护）

**落位**：[src/router/index.ts:135-146](../src/router/index.ts)

**验证**：冷启动 → 直接进首页 → 数据完整加载

---

## 0-11：IllustrationImage 错误回退无视觉提示

**严重程度**：🟢 轻微  
**影响**：图片加载失败无感知

**修复方案**：
- `onError` 时记录到控制台（仅 dev）
- 渲染 1×1 透明占位（不影响布局）

**落位**：[src/components/IllustrationImage.vue](../src/components/IllustrationImage.vue)

---

## 0-12 & 0-14：主题切换后插画缓存不刷新

**严重程度**：🔴 致命  
**影响**：切到标准主题仍显示旧插画 / 切回海贼王仍是上次抽到的图

**根因**：`globalModulePools` 与 `currentThemeSet` 解耦，未在主题变更时清空

**修复方案**：
1. `useIllustrationPicker.ts` 导出 `clearAllIllustrationPools()`
2. `useTheme.ts` watch 触发清池

```ts
// useTheme.ts
watch(currentThemeSet, (newVal) => {
  applyTheme(newVal)
  saveThemeSet()
  clearAllIllustrationPools()  // 关键
})
```

**落位**：
- [src/composables/useTheme.ts:87-90](../src/composables/useTheme.ts#L87-L90)
- [src/composables/useIllustrationPicker.ts:39-41](../src/composables/useIllustrationPicker.ts)

**验证**：标准 → 海贼王 → 标准 → 海贼王，插画区域完全重抽，无残留

---

## 0-13：Android WebView 未开启持久化权限

**严重程度**：🔴 致命（APK 必现）  
**影响**：APK 安装后杀进程 / 清缓存 → IDB 全部清空

**问题代码**（修复前）：
```java
// MainActivity.java
@Override
public void onCreate(Bundle savedInstanceState) {
  registerPlugin(AutoRecordPlugin.class);
  super.onCreate(savedInstanceState);
}
```

**修复方案**：在 `super.onCreate` 之后注入 WebSettings

```java
WebView wv = this.bridge.getWebView();
WebSettings s = wv.getSettings();
s.setJavaScriptEnabled(true);
s.setDomStorageEnabled(true);
s.setDatabaseEnabled(true);
String dbPath = getApplicationContext().getDir("database", MODE_PRIVATE).getPath();
s.setDatabasePath(dbPath);
```

**落位**：[android/app/src/main/java/com/family/accountbook/MainActivity.java](../android/app/src/main/java/com/family/accountbook/MainActivity.java)

**验证**：模拟器装包 → 录入 → 杀进程 → 重开 → 数据完整

---

## 0-15：EntryView 调试 console 输出残留

**严重程度**：🟢 轻微  
**影响**：APK 仍输出调试日志

**修复方案**：
- 移除 2 处 `console.log`
- 改为 `console.debug` + `import.meta.env.DEV` 守卫
- 生产构建不再出现

**落位**：[src/views/EntryView.vue:289-309](../src/views/EntryView.vue)

**验证**：`npm run build` 后 dist 中无 console.log 残留

---

## 修复点汇总

| # | 严重度 | 模块 | 落位 |
|---|--------|------|------|
| 0-1 | 🔴 | 存储 | idb.ts（新建） |
| 0-2 | 🟡 | 账本 | book.ts |
| 0-3 | 🔴 | 筛选 | useFilteredStats.ts |
| 0-4 | 🔴 | 联动 | useFilteredStats.ts |
| 0-5 | 🟡 | UI | main.css |
| 0-6 | 🔴 | 备份 | DataBackupView.vue |
| 0-7 | 🟡 | 备份 | DataBackupView.vue |
| 0-8 | 🟢 | 布局 | HomeView.vue + main.css |
| 0-9 | 🟡 | 图表 | useFilteredStats.ts |
| 0-10 | 🟡 | 路由 | router/index.ts |
| 0-11 | 🟢 | 插画 | IllustrationImage.vue |
| 0-12 | 🔴 | 主题 | useTheme.ts + useIllustrationPicker.ts |
| 0-13 | 🔴 | WebView | MainActivity.java |
| 0-14 | 🔴 | 主题 | 同 0-12 |
| 0-15 | 🟢 | 调试 | EntryView.vue |

**15 / 15 全部修复，回归通过。**
