# 本地化部署方案 — 移除服务器依赖

## 一、Summary

**目标**：将 demo1 项目从"本地优先 + Supabase 云端可选同步"模式，改造为**完全本地化**的纯前端记账应用，所有数据只存储在用户手机本地（Web 端浏览器 localStorage / Android Capacitor WebView 本地存储），移除 Supabase 云端依赖。

**当前架构定位**：
- ✅ 本地优先（localStorage 已是主要存储）
- ⚠️ 已集成 Supabase / MemFire Cloud 可选云端同步
- ❌ `.env` 中预留了 `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
- ❌ `useCloud.ts` 实现 Supabase CRUD
- ❌ `useSync.ts` 实现云端拉取 / 实时订阅 / 离线队列
- ❌ `DataBackupView.vue` 暴露"云端备份"入口（实际提示需要配置凭证）
- ❌ `SyncStatus.vue` 组件显示在线 / 同步状态

**Android 端**：
- ✅ 已使用 Capacitor 6 打包为 Android APK（`com.family.accountbook`）
- ✅ 应用内 `localStorage` 通过 Capacitor WebView 持久化到 `/data/data/com.family.accountbook/`
- ✅ 数据天然跟随 APP 存储在用户手机上，无需后端

## 二、Current State Analysis

### 数据流现状

```
┌─────────────────────┐
│   Vue View Layer    │  (记账、账单、统计等 24 个页面)
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│   Pinia Stores      │  (book.ts / transaction.ts / category.ts / sync.ts)
└──────────┬──────────┘
           │
   ┌───────┴────────┐
   │                │
┌──▼──────────┐  ┌──▼──────────────┐
│ localStorage │  │ Supabase 云端   │  ← 待移除
│ (本地主存储)  │  │ (可选同步)       │
└──────────────┘  └─────────────────┘
```

### 需要移除 / 简化的代码

| 文件 | 当前状态 | 处理方式 |
|------|----------|----------|
| `src/composables/useCloud.ts` | Supabase 客户端 CRUD | **完全删除** |
| `src/composables/useSync.ts` | 云同步 / 实时订阅 | **完全删除** |
| `src/stores/sync.ts` | 同步状态 | **完全删除** |
| `src/components/SyncStatus.vue` | 同步状态 UI | **完全删除** |
| `package.json` | `@supabase/supabase-js` 依赖 | **移除依赖** |
| `src/composables/useTransaction.ts` | 引用 `useCloud` | 改回纯本地 |
| `src/main.ts` | 调用 `initCloud()` | 删除调用 |
| `src/views/DataBackupView.vue` | "云端备份"按钮 | 改文案 / 删除按钮 |
| `src/views/SettingsView.vue` | 引用 `useCloud` / `useSync` | 清理 |
| `src/router/index.ts` | 检查是否引用 sync | 清理 |
| `.env` / `.env.example` | Supabase 凭证 | 清理占位说明 |
| `vite.config.ts` | 检查构建配置 | 保持 |

### 数据存储机制

**localStorage 现状**（`src/utils/storage.ts`）：
- 前缀：`fab_`
- 已存储的 keys：
  - `fab_transactions` — 交易记录（核心数据）
  - `fab_books` — 账本列表
  - `fab_bookId` — 当前账本 ID
  - `fab_budgets` / `fab_monthBudgets` — 预算
  - `fab_userName` / `fab_userPhoto` / `fab_deviceName` — 用户信息
  - `fab_members` — 记账人
  - `fab_pendingQueue` — 离线同步队列（删除后丢弃）
  - `fab_lastSyncTime` / `fab_lastBackup` / `fab_autoBackup` — 同步 / 备份元数据

**Android 端持久化**：
- Capacitor WebView 的 `localStorage` 默认会保存到 WebView 自身的存储目录
- 卸载 APP → 数据清空（除非额外导出备份）
- 这是用户最常见的预期行为

### 离线队列机制

- `getPendingQueue` / `addToPendingQueue` / `clearPendingQueue` 全部是为了云同步设计
- 移除云同步后，离线队列**无意义**（localStorage 本身就是本地）

## 三、Proposed Changes

### 阶段 1：清理云端依赖（纯删除，无业务影响）

#### 1.1 删除文件
- 删除 `src/composables/useCloud.ts`
- 删除 `src/composables/useSync.ts`
- 删除 `src/stores/sync.ts`
- 删除 `src/components/SyncStatus.vue`

#### 1.2 修改文件
- **`package.json`**：移除 `@supabase/supabase-js` 依赖
- **`src/main.ts`**：删除 `import { initCloud }` 和 `initCloud()` 调用
- **`src/composables/useTransaction.ts`**：移除 `import { useCloud }` 和 `saveTransaction` / `deleteTransaction` 调用
- **`src/utils/storage.ts`**：删除 `getPendingQueue` / `addToPendingQueue` / `clearPendingQueue` / `removePendingItem` 离线队列函数
- **`.env` / `.env.example`**：删除 Supabase 变量（保留空文件 / 或删除）

#### 1.3 验证无残留引用
使用 `Grep` 全局搜索：
- `useCloud` / `useSync` / `supabase` / `Supabase` / `VITE_SUPABASE`
- `pendingQueue` / `lastSyncTime`

### 阶段 2：UI 清理

#### 2.1 `src/views/DataBackupView.vue`
- 移除"云端备份"按钮（第 42-53 行）
- 文案改为"本地备份"：将数据导出为 JSON 文件，用户自行管理

#### 2.2 `src/views/SettingsView.vue`
- 检查是否引用 `useCloud` / `useSync` 相关的 UI 状态
- 如有"同步状态"展示，移除
- 保留主题、用户头像、账本选择等本地功能

#### 2.3 `src/router/index.ts`
- 检查路由配置，确保没有引用 sync 相关组件

### 阶段 3：清理 localStorage 中遗留的同步数据（兼容旧用户）

在 `src/main.ts` 的 `app.mount('#app')` 之前，添加一次性清理：

```ts
// 清理已废弃的云同步相关本地数据
try {
  localStorage.removeItem('fab_pendingQueue')
  localStorage.removeItem('fab_lastSyncTime')
  localStorage.removeItem('fab_autoBackup')
  localStorage.removeItem('fab_lastBackup')  // 可选，看是否保留
} catch {}
```

> 考虑：因为是"功能移除 + 兼容"，建议放在 `useTheme` 类似的初始化函数中

### 阶段 4：构建与验证

- `npm run build` 验证编译通过
- 启动 dev server，手动验证：
  1. 打开 APP → 数据写入 localStorage
  2. 刷新页面 → 数据自动恢复
  3. 关闭网络 → 仍可正常记账
  4. 打包 Android APK → 在手机上验证数据持久化
- 启动 Capacitor 同步：`npx cap sync android`

### 阶段 5（可选增强，建议追加到计划）

- **数据导出 / 导入增强**：保留 JSON 导出（已有），考虑增加加密导出（Web Crypto API）
- **首次启动引导**：提示用户"数据存在本机，建议定期导出备份"
- **存储空间预警**：当 localStorage 接近 5MB 上限时提示用户导出备份

## 四、Assumptions & Decisions

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 是否完全删除云端代码 | ✅ 完全删除 | 用户明确要求"数据存储在用户手机上" |
| 是否保留 `useTransaction.ts` 中的云端写入分支 | ❌ 移除 | localStorage 永远可用，无需回退路径 |
| 是否保留 `@supabase/supabase-js` 依赖 | ❌ 移除 | 减包体积、减少配置项 |
| localStorage 在 Android 上是否够用 | ✅ 够用 | 家庭记账数据量小（< 1MB），远低于浏览器配额 |
| 是否需要 IndexedDB 替换 localStorage | ❌ 不需要 | localStorage 同步 API 简单稳定，包内已封装 |
| 是否删除 Supabase 表结构文档 | ✅ 清理 | 整个 `docs/` 相关章节移除 |
| 是否保留 `crypto.ts` | ✅ 保留 | 未来可能用于本地数据加密 |

## 五、Verification Steps

### 5.1 编译验证
```bash
npm run build
```
预期：编译通过，无 TS 错误，dist 产物生成。

### 5.2 代码残留扫描
```bash
# 应全部无输出
grep -r "useCloud\|useSync\|supabase\|VITE_SUPABASE" src/
grep -r "pendingQueue\|lastSyncTime" src/
```
预期：仅在计划文档中出现，源代码 0 命中。

### 5.3 功能验证清单
- [ ] 打开 APP，正常进入首页
- [ ] 记账：金额、分类、备注、日期能保存
- [ ] 关闭浏览器 / APP 后重开 → 数据仍在
- [ ] 切换账本 → 数据正常加载
- [ ] 导出 JSON 备份 → 文件能下载、能在其他设备导入
- [ ] 控制台无 Supabase / 同步相关警告

### 5.4 Android 端验证
- [ ] `npx cap sync android` 成功
- [ ] 重新 build APK
- [ ] 安装到真机 → 数据能持久化保存
- [ ] 卸载 APP → 数据清空（预期行为）

### 5.5 关键文件最终状态
| 文件 | 状态 |
|------|------|
| `src/composables/useCloud.ts` | **已删除** |
| `src/composables/useSync.ts` | **已删除** |
| `src/stores/sync.ts` | **已删除** |
| `src/components/SyncStatus.vue` | **已删除** |
| `src/main.ts` | 不再 initCloud |
| `src/composables/useTransaction.ts` | 纯本地 |
| `src/utils/storage.ts` | 移除离线队列 |
| `package.json` | 移除 supabase 依赖 |
| `src/views/DataBackupView.vue` | 移除云端备份入口 |
| `src/views/SettingsView.vue` | 移除同步状态 UI |

## 六、回滚方案

由于本次修改主要是**删除性**变更（删除文件 + 删除 import + 删除 UI 按钮），回滚简单：
- `git checkout` 即可恢复所有被删除的文件
- 无破坏性 schema 变更（数据仍存在 localStorage）
- 不影响用户已存在的数据

---

**预估执行步骤**：5 步（清理代码 → 清理 UI → 清理依赖 → 清理 localStorage → 构建验证）
**影响范围**：仅与云同步相关的 4 个文件被删除 + 5 个文件被修改
**业务影响**：零（localStorage 本来就是主存储，云端是"可选"）
**风险等级**：低
