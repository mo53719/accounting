package com.family.accountbook.plugins;

import android.app.Notification;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class AutoRecordNotificationListener extends NotificationListenerService {

    private static final String TAG = "AutoRecord";
    private static final String PREFS_NAME = "auto_record_prefs";
    private static final String KEY_ACTIVE = "active";
    private static final String KEY_QUEUE = "pending_queue";

    // 是否激活（App 启动时从 SharedPreferences 恢复，避免 App 进程死后状态丢失）
    private static boolean active = false;
    private static AutoRecordNotificationListener instance;

    @Override
    public void onCreate() {
        super.onCreate();
        instance = this;
        // 恢复上次激活状态
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        active = prefs.getBoolean(KEY_ACTIVE, false);
        Log.d(TAG, "Service onCreate, active restored: " + active);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (instance == this) instance = null;
    }

    @Override
    public void onListenerConnected() {
        super.onListenerConnected();
        instance = this;
        // 系统每次重新连接时也恢复状态
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        active = prefs.getBoolean(KEY_ACTIVE, false);
        Log.d(TAG, "onListenerConnected, active: " + active);
    }

    @Override
    public void onListenerDisconnected() {
        Log.d(TAG, "Notification listener disconnected");
    }

    /* ====== 公开 API：Java 端控制 ====== */
    public static void setActive(boolean isActive) {
        active = isActive;
        if (instance != null) {
            SharedPreferences prefs = instance.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            prefs.edit().putBoolean(KEY_ACTIVE, isActive).apply();
        }
        Log.d(TAG, "setActive: " + isActive);
    }

    public static boolean isActive() {
        return active;
    }

    /* 清空 JS 端拉取后的队列 */
    public static void clearQueue() {
        if (instance != null) {
            SharedPreferences prefs = instance.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            prefs.edit().remove(KEY_QUEUE).apply();
        }
    }

    /* 读取并清空队列（JS flushQueue 时调用） */
    public static String drainQueue() {
        if (instance == null) return "[]";
        SharedPreferences prefs = instance.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String json = prefs.getString(KEY_QUEUE, "[]");
        prefs.edit().remove(KEY_QUEUE).apply();
        return json;
    }

    /* ====== 核心：接收系统通知 ====== */
    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        if (!active) return;

        String packageName = sbn.getPackageName();
        String source = identifySource(packageName);
        if (source == null) return;

        Notification notification = sbn.getNotification();
        if (notification == null || notification.extras == null) return;

        Bundle extras = notification.extras;
        String title = extras.getString(Notification.EXTRA_TITLE, "");
        CharSequence textSeq = extras.getCharSequence(Notification.EXTRA_TEXT);
        String text = textSeq != null ? textSeq.toString() : "";
        CharSequence bigTextSeq = extras.getCharSequence(Notification.EXTRA_BIG_TEXT);
        String bigText = bigTextSeq != null ? bigTextSeq.toString() : "";
        CharSequence subTextSeq = extras.getCharSequence(Notification.EXTRA_SUB_TEXT);
        String subText = subTextSeq != null ? subTextSeq.toString() : "";

        String fullText = (title + " " + text + " " + bigText + " " + subText).trim();

        ParseResult result = parse(fullText, source);
        if (result != null) {
            Log.d(TAG, "Payment detected: " + source + " " + result.amount + "元 type=" + result.type
                    + " merchant=" + result.merchant + " text=" + fullText);
            JSONObject data = new JSONObject();
            try {
                data.put("source", source);
                data.put("amount", result.amount);
                data.put("type", result.type);
                data.put("merchant", result.merchant);
                data.put("rawText", fullText);
                data.put("timestamp", System.currentTimeMillis());
            } catch (JSONException e) {
                Log.e(TAG, "JSON error", e);
            }
            // 推给 JS；如失败入队
            if (!AutoRecordPlugin.onPaymentDetected(data)) {
                enqueuePending(data);
            }
        }
    }

    /* 解析结果 */
    private static class ParseResult {
        double amount;
        String type;       // expense / income
        String merchant;
    }

    private ParseResult parse(String text, String source) {
        ParseResult r = new ParseResult();

        // ---------- 1) 提取金额 ----------
        Double amount = null;
        // 优先按用户提供的正则（精确匹配微信/支付宝格式）
        Pattern[] amountPatterns = {
            // 微信支出：你向XXX支付 ¥25.00
            Pattern.compile("你向.{1,30}?支付\\s*[¥￥]?\\s*([\\d]+(?:\\.[\\d]{1,2})?)"),
            // 微信收入：收到XXX转账 ¥25.00
            Pattern.compile("收到.{1,30}?转账\\s*[¥￥]?\\s*([\\d]+(?:\\.[\\d]{1,2})?)"),
            // 支付宝支出：支付宝...支付 25.00 元
            Pattern.compile("支付宝.*?支付\\s*([\\d]+(?:\\.[\\d]{1,2})?)\\s*元"),
            // 支付宝收入：支付宝收款 25.00 元
            Pattern.compile("支付宝收款\\s*([\\d]+(?:\\.[\\d]{1,2})?)\\s*元"),
            // 通用：¥25.00 / ￥25.00
            Pattern.compile("[¥￥]\\s*([\\d]+(?:\\.[\\d]{1,2})?)"),
            // 通用：付款25.00元 / 支付25.00元
            Pattern.compile("(?:付款|支付|消费|支出|扣款|收款|金额)\\s*[¥￥]?\\s*([\\d]+(?:\\.[\\d]{1,2})?)\\s*元"),
        };
        for (Pattern p : amountPatterns) {
            Matcher m = p.matcher(text);
            if (m.find()) {
                try { amount = Double.parseDouble(m.group(1)); break; }
                catch (NumberFormatException e) { /* continue */ }
            }
        }
        if (amount == null || amount <= 0) return null;
        r.amount = amount;

        // ---------- 2) 提取类型 ----------
        if (Pattern.compile("(收到|收款|转入|入账|到账|退款)").matcher(text).find()) {
            r.type = "income";
        } else {
            r.type = "expense";
        }

        // ---------- 3) 提取商户 ----------
        r.merchant = extractMerchant(text, source);
        return r;
    }

    private String extractMerchant(String text, String source) {
        // 微信
        Matcher m1 = Pattern.compile("你向\\s*(.+?)\\s*支付").matcher(text);
        if (m1.find()) return clean(m1.group(1));
        Matcher m2 = Pattern.compile("收到\\s*(.+?)\\s*转账").matcher(text);
        if (m2.find()) return clean(m2.group(1));
        Matcher m3 = Pattern.compile("向\\s*(.+?)\\s*付款").matcher(text);
        if (m3.find()) return clean(m3.group(1));
        // 支付宝
        Matcher m4 = Pattern.compile("支付宝收款\\s*[\\d.]+\\s*元\\s*(?:来自|于)?(.+?)$").matcher(text);
        if (m4.find()) return clean(m4.group(1));
        return source.equals("wechat") ? "微信支付" : "支付宝";
    }

    private String clean(String s) {
        if (s == null) return "";
        return s.replaceAll("[\\s\\u3000]", "").replaceAll("[\"《》<>\\[\\]（）()【】]", "").trim();
    }

    private String identifySource(String packageName) {
        if (packageName == null) return null;
        if (packageName.equals("com.tencent.mm")) return "wechat";
        if (packageName.equals("com.eg.android.AlipayGphone")) return "alipay";
        if (packageName.startsWith("com.icbc")) return "bank_icbc";
        if (packageName.startsWith("com.ccb")) return "bank_ccb";
        if (packageName.startsWith("com.cmbchina")) return "bank_cmb";
        if (packageName.startsWith("com.abchina")) return "bank_abc";
        return null;
    }

    /* 把待推送给 JS 的数据暂存到 SharedPreferences（App 进程死时） */
    private void enqueuePending(JSONObject data) {
        if (instance == null) return;
        try {
            SharedPreferences prefs = instance.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            String existing = prefs.getString(KEY_QUEUE, "[]");
            JSONArray arr = new JSONArray(existing);
            arr.put(data);
            // 限制队列最大 200 条
            if (arr.length() > 200) {
                JSONArray trimmed = new JSONArray();
                for (int i = arr.length() - 200; i < arr.length(); i++) {
                    trimmed.put(arr.get(i));
                }
                arr = trimmed;
            }
            prefs.edit().putString(KEY_QUEUE, arr.toString()).apply();
            Log.d(TAG, "Enqueued (App not ready). queue size=" + arr.length());
        } catch (JSONException e) {
            Log.e(TAG, "enqueuePending error", e);
        }
    }
}
