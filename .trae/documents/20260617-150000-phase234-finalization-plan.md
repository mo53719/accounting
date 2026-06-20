# 阶段二/三/四 收尾计划（在手测 + 模拟器、文档 + 修复、不构建 APK 范围内）

> **范围对齐（已与用户确认）**：
> 1. 阶段二/三：手测为主 + 启动 Android 模拟器跑一遍关键路径
> 2. 阶段四：仅输出文档（PACKAGING.md / THEME_GUIDE.md / BACKUP_GUIDE.md）+ 必要的源码修复（WebView 持久化 / 资源路径 / 调试输出），**不构建 APK**（由用户本地 gradle 自行生成）
> 3. 主题仍按 2 套：标准 / 海贼王（旧 `pet`/`comic` 键已自动迁移到 `onepiece`，符合「不破坏老数据」原则）
>
> **前置确认**：阶段一（代码静态自查 + Bug 批量修复 + IDB 迁移）已落地；阶段一产出的关键文件 `utils/idb.ts` / `composables/useFilteredStats.ts` / `views/DataBackupView.vue` / `stores/transaction.ts` / `stores/book.ts` 等不再大改，仅做必要的回归修正。

---

## 阶段一 复盘（已落地，不重做）

| 修复点 | 落位 |
|--------|------|
| 0-1 IDB 化 | `src/utils/idb.ts` 抽象层 + `stores/transaction.ts` 改造 |
| 0-2 monthBudgets 写键一致 | `stores/book.ts:setMonthBudget` |
| 0-3 切账本 bookId 过滤 | `useFilteredStats` 中 `scopeToCurrentBook: true` |
| 0-4 联动统一 | `composables/useFilteredStats.ts` 共享 |
| 0-5 z-index 集中 | `assets/styles/main.css` 增 `--z-*` 变量 |
| 0-6 备份全表 | `DataBackupView.vue` v2 格式 |
| 0-7 备份校验 | `handleFile` 50MB 上限 + version 校验 + 二次确认 |
| 0-8 fab 边距 | `HomeView.vue` 的 fab 留 `env(safe-area-inset-bottom)` |
| 0-9 柱状图年份维度 | `useFilteredStats.monthlyBarData` |
| 0-10 路由守卫 IDB | `router/index.ts:beforeEach` |
| 0-11 插画错误回退 | `IllustrationImage.vue` onError |
| 0-12 主题切换清池 | `useTheme.ts:watch` → `clearAllIllustrationPools()` |
| 0-14 currentThemeSet 联动 | 同 0-12 |

---

## 阶段二：全场景功能黑盒测试（手测 + Android 模拟器）

**测试载体**：
- **桌面浏览器（dev）**：`npm run dev` → http://localhost:5173 走查每条用例
- **Android 模拟器**：启动 Capacitor 配套的模拟器（详见阶段四），安装 dev 包做一遍

**测试输出**：
- `.trae/documents/TEST_CHECKLIST.md`：每条用例带 ✅/❌ 标记 + 备注
- 失败用例 → 立即修源码 → 复测 → 标记为 ✅ 并写入 `BUG_LOG.md`
- 截图：关键路径（首页/账单/统计/主题切换/备份恢复）3~5 张放入 `docs/screenshots/`（新建）

### 模块 1：首页（手测 5min）

| 用例 | 步骤 | 期望 |
|------|------|------|
| 1.1 切日/月/年 | 首页 seg-control 切换 | 预算环、收支额、柱状图随之刷新 |
| 1.2 切账本 | 账本卡片换账本 | 数字 / 笔数只显示当前账本 |
| 1.3 切主题 | 设置→主题→海贼王/标准 | 全页插画/色系/图标同步；标准主题下插画区为空 |
| 1.4 新增账单 | 底部 + → 填金额 → 保存 | 首页数据无需手动刷新即更新 |
| 1.5 删除账单 | 账单页长按删除 | 首页金额同步扣减 |
| 1.6 月份 ±30 | dateOffset 一直 ± | 不崩 |

### 模块 2：账单页（手测 3min）

| 用例 | 步骤 | 期望 |
|------|------|------|
| 2.1 顶部无总额 | 进入 `/list` | 页面顶部只有月份 + 笔数，**无收支汇总** |
| 2.2 分组渲染 | 默认本月 | 按日分组，今天/昨天/日期+周几 |
| 2.3 月份切换 | 左/右箭头 | 列表过滤正确 |
| 2.4 空态 | 选无数据月份 | 标题 + 描述 + 海贼王插画/标准 SVG |
| 2.5 新增/编辑/删除 | 三种操作 | 列表立即变化 |

### 模块 3：统计页（手测 3min）

| 用例 | 步骤 | 期望 |
|------|------|------|
| 3.1 柱/折/饼切换 | Tab 切换 | 三图各自正常 |
| 3.2 分类排行 | 默认月份 | 进度条 = 饼图比例 sum 100% |
| 3.3 切筛选 | 月/年/自定义 | 图与排行联动 |
| 3.4 总额匹配 | 切到年维度 | 总额 = 全年流水 sum（误差 < 0.01） |

### 模块 4：个人主页三子页（手测 3min）

| 用例 | 步骤 | 期望 |
|------|------|------|
| 4.1 记账总数 | /transaction-count | 数字 = store.totalCount |
| 4.2 坚持天数 | /persistent-days | 日历格子按日期标记 |
| 4.3 使用分类 | /category-usage | 排行 + 占比正确 |

### 模块 5：配套功能（手测 8min）

预算中心 / 存钱计划 / 人情往来 / 周期记账 / 分类管理 / 每日对账 / 记账提醒 / 主题设置 / 登录页 各走一遍主流程，确保无白屏/无报错。

| 5.1 主题持久 | 设置→切主题→杀进程→重开 | 主题保留 |
| 5.2 登录页 | 退出登录 | 「欢迎使用咪汪记账」+ 主题插画 |
| 5.3 暴力点击 | 连点「+」按钮 50 次 | 不卡死、无重复弹窗 |
| 5.4 快速切 Tab | 底部 4 Tab 切 20 次 | 切换流畅无残留 |

### 模块 6：Android 模拟器回归（启动模拟器后跑一遍）

| 6.1 安装 dev 包 | `npx cap run android` 或手动 `adb install` | 启动正常 |
| 6.2 首页滑动 | 上下滑 | 无卡顿（IndexedDB 异步加载） |
| 6.3 主题切换 | 设置→海贼王 | 全页换皮，0.2s 过渡 |
| 6.4 后台杀进程 | 录入→Home→清理应用→重开 | 账单/主题保留 |
| 6.5 字体 | 模拟器中文 | 字体不溢出、不截断 |

---

## 阶段三：本地存储专项压力测试

**测试输出**：`.trae/documents/BUG_LOG.md`（含修复前后对比）

| 测试 | 步骤 | 期望 | 失败修复方向 |
|------|------|------|------------|
| 3-1 基础持久 | 新增 50 笔 → 杀进程 → 重开 | 100% 保留 | 检查 `persistAll` IDB 写回 |
| 3-2 多账本隔离 | 建 3 账本各 10 笔 → 切换 | 数据互不混淆 | `useFilteredStats.bookId` |
| 3-3 备份恢复 | 导出 → 清 IDB → 导入 | 全表还原 | `DataBackupView.confirmRestore` |
| 3-4 边界 | 录入 500 笔 | 不卡顿 | 检查 IDB 事务粒度 |
| 3-5 异常断电 | 录入中途杀 | 已存数据完整 | IDB 事务原子性 |
| 3-6 清缓存 | 模拟器「清除缓存」（不清数据） | 数据保留 | IDB 在 files/databases/，非 cache |

> **3-6 是关键回归点**：必须验证 Capacitor 模拟器下 IDB 不会被清。这一项在阶段四会复测。

---

## 阶段四：WebView 持久化 + 资源适配 + 文档（**不构建 APK**）

### 4.1 修复 WebView 持久化权限（防数据被清空）

**文件**：`android/app/src/main/java/com/family/accountbook/MainActivity.java`

在 `onCreate` 注入以下 WebSettings：

```java
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
...
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AutoRecordPlugin.class);
        super.onCreate(savedInstanceState);

        // 修 0-13：开启 DomStorage / Database / JS
        WebView wv = this.bridge.getWebView();
        WebSettings s = wv.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        String dbPath = getApplicationContext().getDir("database", MODE_PRIVATE).getPath();
        s.setDatabasePath(dbPath);
        // Capacitor 6 内部已 enable file access，但显式声明更稳
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
    }
}
```

> 注意：以上需在 `super.onCreate(...)` 之后调用 `bridge.getWebView()`，否则 WebView 还没创建。Capacitor 6 的 `getWebView()` 是 public。

**文件**：`android/app/src/main/assets/public/index.html`（即 `index.html` 根目录的构建产物）

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
```

### 4.2 资源路径与构建配置

- `vite.config.ts`：检查 `build.assetsInlineLimit`，确保插画图（>4KB）不被 base64 内联
- `src/assets/illustrations.config.ts` 与 `src/assets/illustrationModules.ts` 中插画 url 用 `new URL(...).href`（已是当前实现）
- 验证 Vite build 后插画图出现在 `dist/assets/images/onepiece/*`

### 4.3 关闭调试输出

- 全项目 `console.log` 改为 `console.debug`，并包 `if (import.meta.env.DEV)` 守卫（仅 dev 模式输出）
- 保留 `console.error / console.warn` 用于异常
- 涉及文件：`src/views/EntryView.vue`（有 `console.log` 调试块），其它文件按需扫一遍

### 4.4 文档输出（**核心交付物**）

新建/更新以下 4 份文档：

| 文档 | 路径 | 内容 |
|------|------|------|
| 打包配置说明 | `.trae/documents/PACKAGING.md` | HBuilderX/Capacitor 两种打包流程，gradle 命令、模拟器启动、签名、APK 路径 |
| 主题切换说明 | `.trae/documents/THEME_GUIDE.md` | 2 套主题对比、切换步骤、插画模块池说明 |
| 数据备份操作 | `.trae/documents/BACKUP_GUIDE.md` | v2 备份格式、恢复流程、容量限制、注意事项 |
| 测试验收清单 | `.trae/documents/TEST_CHECKLIST.md` | 阶段二/三所有用例 + 通过标记 |
| Bug 修复记录 | `.trae/documents/BUG_LOG.md` | 0-1 ~ 0-15 全部修复前后对比 |
| 操作说明 | `.trae/documents/USER_GUIDE.md` | 给最终用户：记账/分类/账本/主题切换/备份恢复 |

### 4.5 Android 模拟器配置（用户本地执行）

`PACKAGING.md` 中需包含：

```bash
# 1. 安装 Android Studio + SDK
# 2. 创建 AVD (Pixel 5, API 34)
# 3. 启动模拟器
emulator -avd Pixel_5_API_34

# 4. 构建并同步
npm run build
npx cap sync android

# 5. 装包测试
npx cap run android
# 或
cd android && ./gradlew installDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk

# 6. 查看日志（排查白屏/IDB 错误）
adb logcat | grep -i "chromium\|webview\|fab_db"
```

---

## 执行批次（建议）

**Batch E（文档 + 小修复，~1.5h）**：
- 4.3 关闭调试输出
- 4.1 修 MainActivity.java + index.html viewport
- 写 PACKAGING.md / THEME_GUIDE.md / BACKUP_GUIDE.md / USER_GUIDE.md
- 写 BUG_LOG.md（基于现有 0-1~0-15 整理）
- 写 TEST_CHECKLIST.md 模板（待手测填充）

**Batch F（手测 + 模拟器，~1.5h）**：
- 浏览器 dev 模式走完阶段二模块 1~5，标记结果
- 启动 Android 模拟器（用户本地操作）→ 跑模块 6
- 阶段三 6 项存储压力测试
- 把 Bug 修完 → 复测 → 更新 TEST_CHECKLIST
- 截图：首页 + 账单页 + 统计页 + 主题切换前后 + 备份恢复（5 张）

**Total**：~3 小时

---

## 全局验收红线（与原始需求一致）

- [ ] 无控制台 JS 报错（仅 dev HMR 提示）
- [ ] 杀进程后所有数据保留
- [ ] 主题切换整套插画/色彩同步
- [ ] 账单页无总额模块、统计页无总额模块、首页仅当日预算
- [ ] 筛选/图表/预算计算 100% 准确
- [ ] 模拟器（Android 9~14）全部功能正常
- [ ] 导入/导出 JSON 备份恢复完整
- [ ] 暴力点击不卡死
- [ ] 4 份文档齐备 + TEST_CHECKLIST 100% 标记
- [ ] 源码 + 文档 + 工程配置全部就位（APK 由用户本地构建）

---

## 不在本次范围（与用户确认）

- ❌ 不构建 APK / 不打 release 包
- ❌ 不补自动单测
- ❌ 不加「猫和老鼠」主题（当前为 2 套主题，旧 `pet` 键自动迁移到 `onepiece`）
- ❌ 不重写现有业务逻辑、不动 3 套主题（实际 2 套）的视觉系统
