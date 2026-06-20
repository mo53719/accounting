# 自动记账 - 通知监听方案计划

## Why
用户希望微信/支付宝/银行卡的支出能自动记录到记账APP中，无需手动输入。由于微信和支付宝没有开放个人交易查询API，采用Android通知监听服务（NotificationListenerService）来捕获支付通知并自动记账。

## 技术原理
Android 的 `NotificationListenerService` 可以监听手机上所有应用的通知。当微信支付、支付宝、银行APP发出付款通知时，我们的服务可以读取通知文本，解析出金额、支付方式等信息，自动创建一条记账记录。

**能监听到的通知示例**：
- 微信：`"微信支付：你向商户XX付款25.00元"` 或 `"微信支付凭证：收款方XX，金额30.00元"`
- 支付宝：`"支付宝付款成功：付款金额50.00元"` 或 `"你成功付款18.80元"`
- 银行：`"尾号1234消费支出88.00元"` 等

## Current State Analysis
- Android 原生层仅有默认的 `BridgeActivity`，无自定义代码
- 仅声明了 `INTERNET` 权限
- Capacitor 插件仅4个基础插件（App, Haptics, Network, StatusBar）
- 交易添加逻辑在 `useTransaction.ts`，支持本地优先+云端同步
- Transaction 接口包含 type/amount/date/category/paymentMethod/note/createdBy

## Proposed Changes

### 1. 创建 Capacitor 自定义插件 - AutoRecordPlugin

**新建文件**: `android/app/src/main/java/com/family/accountbook/plugins/AutoRecordPlugin.java`

Capacitor 自定义插件，提供以下方法：
- `requestPermission()` — 请求通知监听权限（跳转到系统设置页）
- `checkPermission()` — 检查是否已授权通知监听
- `startListening()` — 启动通知监听服务
- `stopListening()` — 停止通知监听
- `addListener('autoRecord', callback)` — 监听自动记账事件

当捕获到支付通知时，插件通过 `notifyListeners("autoRecord", data)` 将解析后的数据发送到 Web 层。

### 2. 创建通知监听服务

**新建文件**: `android/app/src/main/java/com/family/accountbook/AutoRecordNotificationListener.java`

继承 `NotificationListenerService`，核心逻辑：
- `onNotificationPosted(StatusBarNotification)` — 收到通知时触发
- 过滤包名：`com.tencent.mm`（微信）、`com.eg.android.AlipayGphone`（支付宝）、银行APP包名
- 解析通知文本，提取金额、支付方式
- 通过 LocalBroadcastManager 或直接调用插件发送数据到 Web 层

**通知文本解析规则**：
```
微信支付正则: /付款[¥￥]?\s*(\d+\.?\d*)\s*元?/
支付宝正则: /付款[金额]*[¥￥]?\s*(\d+\.?\d*)\s*元?/
银行卡正则: /[消费支出][¥￥]?\s*(\d+\.?\d*)\s*元?/
```

### 3. 更新 AndroidManifest.xml

**修改文件**: `android/app/src/main/AndroidManifest.xml`

添加：
- `<uses-permission android:name="android.permission.RECEIVE_SMS" />` （备用）
- 注册 `AutoRecordNotificationListener` 服务，添加 `BIND_NOTIFICATION_LISTENER_SERVICE` 权限

### 4. 创建前端自动记账 Composable

**新建文件**: `src/composables/useAutoRecord.ts`

功能：
- `checkAutoRecordPermission()` — 检查通知监听权限
- `requestAutoRecordPermission()` — 请求权限
- `startAutoRecord()` — 启动自动记账
- `stopAutoRecord()` — 停止自动记账
- `isAutoRecordRunning` — 响应式状态

当收到自动记账事件时：
1. 解析金额、支付方式
2. 自动匹配分类（微信→餐饮/购物，支付宝→购物，银行→居家）
3. 调用 `addTransaction()` 保存记录
4. 发送本地通知提醒用户"已自动记录一笔支出"

### 5. 设置页添加自动记账开关

**修改文件**: `src/views/SettingsView.vue`

添加：
- "自动记账"开关卡片
- 点击开关时检查/请求通知监听权限
- 显示当前监听状态（已开启/未授权/已停止）
- 支持选择监听的支付渠道（微信/支付宝/银行卡）

### 6. 首页自动记账提示

**修改文件**: `src/views/HomeView.vue`

- 自动记账的记录在列表中显示"自动"标签，与手动记录区分
- 最近一条自动记录显示"来自微信支付"等来源信息

### 7. Transaction 接口扩展

**修改文件**: `src/stores/transaction.ts`

Transaction 接口新增字段：
- `source?: string` — 来源（'manual' | 'wechat' | 'alipay' | 'bank'），默认 'manual'
- `autoParsed?: boolean` — 是否为自动解析记录

### 8. 注册 Capacitor 插件

**修改文件**: `android/app/src/main/java/com/family/accountbook/MainActivity.java`

在 `onCreate` 中注册 `AutoRecordPlugin`：
```java
import com.family.accountbook.plugins.AutoRecordPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AutoRecordPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
```

## Assumptions & Decisions
- 仅支持 Android（iOS 不允许通知监听，这是 Android 独有功能）
- 自动记录默认为"支出"类型，用户可在设置中修改默认分类
- 通知解析可能不完全准确，自动记录会标记"自动"标签，用户可手动修改
- 需要用户手动到系统设置中授权通知监听权限（Android 安全限制）
- 银行APP通知格式多样，初始版本支持主流银行（工商/建设/招商/农业），后续可扩展

## Verification Steps
1. `npx vite build` 编译通过
2. `npx cap sync android` 同步到 Android 项目
3. 在 Android Studio 中编译运行
4. 授权通知监听权限
5. 用微信/支付宝付款，验证是否自动创建记录
6. 检查自动记录的分类和金额是否正确
7. 在设置页开关自动记账功能
