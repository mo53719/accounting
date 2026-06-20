# 家庭记账 APP - 编译修复计划

## 概述
项目已创建完整文件结构，但存在 10 个致命编译错误、2 个严重运行时错误和若干代码质量问题，需要全部修复才能编译运行。

## 修复清单

### 1. 移除 Firebase google-services 插件（避免缺少 google-services.json 导致构建失败）
- **文件**: `app/build.gradle.kts`
- **操作**: 移除 `id("com.google.gms.google-services")` 插件声明，改为运行时按需初始化 Firebase
- **文件**: `build.gradle.kts` (根目录)
- **操作**: 移除 `id("com.google.gms.google-services") version "4.4.2" apply false`

### 2. 修复 Compose 编译器配置冲突
- **文件**: `app/build.gradle.kts`
- **操作**: 移除 `composeOptions { kotlinCompilerExtensionVersion = "1.5.15" }` 块，因为已使用 `org.jetbrains.kotlin.plugin.compose` 插件管理版本

### 3. 添加缺失的依赖
- **文件**: `app/build.gradle.kts`
- **操作**: 添加以下依赖：
  - `implementation("org.jetbrains.kotlinx:kotlinx-coroutines-play-services:1.9.0")` — Firebase Task.await() 需要
  - `implementation("androidx.core:core-splashscreen:1.0.1")` — SplashScreen 主题需要

### 4. 修复 Mappers.kt 缺少 TypeToken 导入
- **文件**: `app/src/main/java/com/family/accountbook/data/local/db/Mappers.kt`
- **操作**: 添加 `import com.google.gson.reflect.TypeToken`

### 5. 修复 SyncWorker.kt 的多个错误
- **文件**: `app/src/main/java/com/family/accountbook/service/SyncWorker.kt`
- **操作**: 
  - 添加 `import kotlinx.coroutines.flow.first` 导入
  - 将 `userPreferences.familyId.kotlinx.coroutines.flow.first()` 改为 `userPreferences.familyId.first()`
  - 删除底部自定义的 `first()` 扩展函数

### 6. 修复 ExportCsvUseCase.kt 的 collect 错误和永久挂起问题
- **文件**: `app/src/main/java/com/family/accountbook/domain/usecase/export/ExportCsvUseCase.kt`
- **操作**: 
  - 添加 `import kotlinx.coroutines.flow.first` 导入
  - 将 `transactionRepository.getTransactionsByDateRange(startDate, endDate).collect { list -> transactions.addAll(list) }` 改为 `val transactions = transactionRepository.getTransactionsByDateRange(startDate, endDate).first()`
  - 删除底部的自定义 `collect` 扩展函数

### 7. 修复 values-v31/themes.xml
- **文件**: `app/src/main/res/values-v31/themes.xml`
- **操作**: 修复 SplashScreen 主题，使用正确的资源引用：
  ```xml
  <style name="Theme.FamilyAccountBook.Splash" parent="Theme.SplashScreen">
      <item name="windowSplashScreenBackground">@color/primary</item>
      <item name="windowSplashScreenAnimatedIcon">@mipmap/ic_launcher</item>
      <item name="postSplashScreenTheme">@style/Theme.FamilyAccountBook</item>
  </style>
  ```

### 8. 创建 mipmap 图标资源
- **文件**: `app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml` 等
- **操作**: 创建自适应图标 XML 文件，使用简单的矢量图作为应用图标

### 9. 修复 Color.kt 中 Surface 命名冲突
- **文件**: `app/src/main/java/com/family/accountbook/ui/theme/Color.kt`
- **操作**: 将 `Surface` 重命名为 `SurfaceColor`，同步更新 Theme.kt 中的引用

### 10. 修复 SyncRepositoryImpl.kt 直接实例化问题
- **文件**: `app/src/main/java/com/family/accountbook/data/sync/SyncRepositoryImpl.kt`
- **操作**: 注入 `SyncManager` 而非在方法中手动实例化

### 11. 清理未使用的导入
- **文件**: `FirestoreDataSource.kt` — 移除 `import com.family.accountbook.data.local.db.Mappers.toEntity`
- **文件**: `AppDatabase.kt` — 移除 `import com.family.accountbook.domain.model.*`

### 12. 创建 Firebase 初始化配置
- **文件**: 新建 `app/src/main/java/com/family/accountbook/di/FirebaseInitProvider.kt`
- **操作**: 创建 ContentProvider 方式初始化 Firebase（替代 google-services 插件）

## 验证步骤
1. 确认所有 .kt 文件无编译错误
2. 确认所有 XML 资源文件有效
3. 确认项目 Gradle 配置正确
