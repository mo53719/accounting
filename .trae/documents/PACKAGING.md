# 打包配置说明（Capacitor 6 · Android APK）

> 本项目为**纯前端**记账 APP，使用 Capacitor 6 + Vite 6 打包为 Android APK 安装包。
> 本文档说明：环境要求 → 构建流程 → 模拟器调试 → 真机安装 → 常见问题。

---

## 1. 环境要求

| 工具 | 版本 | 备注 |
|------|------|------|
| Node.js | ≥ 18.x | 推荐 20.x LTS |
| npm | ≥ 9.x | 随 Node 自带 |
| JDK | 17 (LTS) | Capacitor 6 / Gradle 8 要求 |
| Android Studio | Hedgehog (2023.1) 或更新 | 自带 SDK Manager |
| Android SDK | API 22 ~ 34 | minSdk=22, targetSdk=34 |
| Gradle | 8.x | 仓库自带 wrapper |
| Android SDK Build-Tools | ≥ 34.0.0 | |
| Android Emulator | API 30+ | Pixel 5 推荐 |

### 1.1 环境变量（Windows）

```powershell
setx ANDROID_HOME "C:\Users\<you>\AppData\Local\Android\Sdk"
setx JAVA_HOME "C:\Program Files\Java\jdk-17"
# 追加 PATH
setx PATH "%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\emulator;%JAVA_HOME%\bin"
```

### 1.2 验证

```bash
node -v
npm -v
java -version
adb version
emulator -list-avds
```

---

## 2. 项目结构速览

```
demo1/
├── src/                  # 前端源码（Vue 3 + Vite + Pinia）
│   ├── assets/images/onepiece/   # 海贼王插画（45+ 张）
│   ├── composables/      # 业务 composables
│   ├── stores/           # Pinia stores
│   ├── views/            # 页面
│   └── utils/idb.ts      # IndexedDB 抽象层
├── android/              # Capacitor Android 工程
│   └── app/
│       ├── src/main/
│       │   ├── java/com/family/accountbook/
│       │   │   └── MainActivity.java  # ← WebView 持久化配置已写入
│       │   ├── assets/public/  # 构建后注入此目录
│       │   └── AndroidManifest.xml
│       └── build.gradle
├── capacitor.config.ts   # Capacitor 配置（webDir=dist, androidScheme=https）
├── vite.config.ts        # Vite 构建（assetsInlineLimit=4096, 资源分类）
└── index.html            # viewport-fit=cover（已加）
```

---

## 3. 构建流程

### 3.1 安装依赖

```bash
cd e:\Users\Administrator\demo1
npm install
```

### 3.2 前端构建

```bash
npm run build
# 等价于 vue-tsc -b && vite build
# 产物在 dist/，包含 index.html、assets/*
```

### 3.3 同步到 Android 工程

```bash
npx cap sync android
# 拷贝 dist/ → android/app/src/main/assets/public/
# 更新 android/app/src/main/assets/capacitor.config.json
# 更新 native 依赖（如 @capacitor/android）
```

> `cap sync` 会**自动**复制 dist → public。**无需手动复制**。

### 3.4 编译 Debug APK

```bash
cd android
./gradlew assembleDebug        # Mac/Linux
# 或
.\gradlew.bat assembleDebug    # Windows
```

**产物路径**：
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### 3.5 安装到设备

```bash
# 方式 A：通过 adb 安装到任意已连接设备/模拟器
adb install -r android\app\build\outputs\apk\debug\app-debug.apk

# 方式 B：Capacitor 一键
npx cap run android            # 自动 build + sync + install + 启动
```

---

## 4. 启动 Android 模拟器（关键调试步骤）

### 4.1 创建 AVD（如未创建）

Android Studio → Device Manager → Create Device → Pixel 5 → API 34 → Finish

### 4.2 启动模拟器

```bash
emulator -avd Pixel_5_API_34 -no-snapshot-load
# 或在 Android Studio 点 ▶
```

### 4.3 装包并启动

```bash
npx cap run android
# 等价于：npm run build && npx cap sync android && adb install -r ... && adb shell am start ...
```

### 4.4 关键日志

```bash
# WebView / Chromium / IndexedDB 相关
adb logcat -v time | findstr "chromium webview fab_db"

# JS 异常
adb logcat -v time | findstr "console"
```

---

## 5. 关键修复点（防止数据被清空）

### 5.1 WebView 持久化（已修复）

`android/app/src/main/java/com/family/accountbook/MainActivity.java`：

```java
WebSettings settings = webView.getSettings();
settings.setJavaScriptEnabled(true);
settings.setDomStorageEnabled(true);   // localStorage
settings.setDatabaseEnabled(true);
String dbPath = getApplicationContext().getDir("database", MODE_PRIVATE).getPath();
settings.setDatabasePath(dbPath);
settings.setAllowFileAccess(true);
settings.setAllowContentAccess(true);
```

不开启 → 杀进程 / 系统清缓存 → IndexedDB 数据**全部丢失**。

### 5.2 viewport 安全边距（已修复）

`index.html`：

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
```

`viewport-fit=cover` 让页面延伸到水滴屏 / 挖孔屏边缘，再配合 CSS 中 `env(safe-area-inset-*)` 留出安全边距。

### 5.3 Capacitor 配置

`capacitor.config.ts`：

```ts
{
  appId: 'com.family.accountbook',
  appName: '家庭记账本',
  webDir: 'dist',
  server: { androidScheme: 'https' }   // WebView 走 https://localhost
}
```

`androidScheme: 'https'` 避免 Capacitor 走 `file://` 时 IndexedDB 在某些 Android 版本被禁用。

### 5.4 资源路径

- 插画图（海贼王 45+ 张）通过 `new URL(...).href` 引用（src/assets/illustrations.config.ts）
- Vite build 后自动输出到 `dist/assets/images/onepiece/*`
- `vite.config.ts` 的 `assetsInlineLimit: 4096` 防止大图被 base64 内联

---

## 6. 调试 / 排错

### 6.1 真机调试

```bash
# 在 Android 设备上启用 USB 调试 → 连接电脑
adb devices                       # 确认设备显示
chrome://inspect                  # Chrome DevTools 调试 WebView
```

### 6.2 常见错误

| 现象 | 原因 | 修复 |
|------|------|------|
| 安装后白屏 | dist 未同步 | `npx cap sync android` 重做 |
| 重启数据全丢 | WebView 持久化未开 | 确认 MainActivity.java 修改生效 |
| 图片 404 | assets 路径未生成 | `npm run build` 后检查 dist/assets/images/ |
| 主题切回标准仍显示插画 | 插画缓存未清 | 确认 useTheme watch → clearAllIllustrationPools |
| IDB 写入失败 | 浏览器隐私模式 | 仅普通模式可用（Capacitor 打包后无此问题） |
| 模拟器闪退 | 内存不足 | 关其它应用，给 AVD 分配 2G+ RAM |

### 6.3 清理重建

```bash
# 清理 Android 工程
cd android
./gradlew clean
cd ..

# 清理 Vite 缓存
rm -rf node_modules/.vite dist

# 重新全量构建
npm install
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
```

---

## 7. Release 包（可选，不在本次范围）

如需发布到应用市场，需：
1. 生成 keystore：`keytool -genkey -v -keystore release.keystore -alias fab -keyalg RSA -validity 10000`
2. `android/app/build.gradle` 添加 `signingConfigs.release`
3. `./gradlew assembleRelease` → `app-release.apk`
4. 启用 `minifyEnabled true` + ProGuard 规则

---

## 8. 不构建 APK 的快速参考（仅源码交付）

如果用户只需要源码 + 工程配置，不需要 APK，按以下交付：

| 类别 | 路径 | 说明 |
|------|------|------|
| 源码 | `e:\Users\Administrator\demo1\` | 整个工程 |
| IDB 抽象层 | `src/utils/idb.ts` | 核心新增文件 |
| 备份/恢复 | `src/views/DataBackupView.vue` | v2 格式全表备份 |
| WebView 配置 | `android/.../MainActivity.java` | 已写好持久化 |
| 主题逻辑 | `src/composables/useTheme.ts` + `useIllustrationPicker.ts` | 2 套主题 + 模块池 |
| 文档 | `.trae/documents/*.md` | 5 份验收文档 |

用户在本地执行：
```bash
npm install
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
```

即可得到 `app-debug.apk`。
