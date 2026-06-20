@echo off
chcp 65001
title 小余简单记 - 安卓一键构建脚本

echo ======================================
echo    小余简单记 安卓一键构建脚本
echo ======================================
echo.

:: 1. 清理旧构建产物
echo [1/4] 清理旧构建文件...
rmdir /s /q dist
echo 清理完成。
echo.

:: 2. 重新打包前端项目
echo [2/4] 构建前端dist文件...
npm run build
if %errorlevel% neq 0 (
    echo ❌ 前端构建失败，请检查npm依赖和配置。
    pause
    exit /b 1
)
echo 前端构建完成。
echo.

:: 3. 同步资源到安卓工程
echo [3/4] 同步dist到安卓工程...
npx cap sync android
if %errorlevel% neq 0 (
    echo ❌ Capacitor同步失败，请检查配置。
    pause
    exit /b 1
)
echo 同步完成。
echo.

:: 4. 清理安卓缓存并打包
echo [4/4] 打包安卓APK...
cd android
call gradlew clean
call gradlew assembleDebug
if %errorlevel% neq 0 (
    echo ❌ 安卓打包失败，请检查Android环境。
    pause
    exit /b 1
)
cd ..
echo.

echo ======================================
echo ✅ 构建完成！
echo APK文件路径：
echo %cd%\android\app\build\outputs\apk\debug\app-debug.apk
echo ======================================
pause