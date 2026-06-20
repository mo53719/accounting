package com.family.accountbook.plugins;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.provider.Settings;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

@CapacitorPlugin(name = "AutoRecord")
public class AutoRecordPlugin extends Plugin {

    private static final String PREFS_NAME = "auto_record_prefs";
    private static final String KEY_ACTIVE = "active";

    private static AutoRecordPlugin instance;

    @Override
    public void load() {
        instance = this;
        // 同步 active 状态给 Service（恢复 App 启动前的设置）
        try {
            SharedPreferences prefs = getContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            boolean active = prefs.getBoolean(KEY_ACTIVE, false);
            AutoRecordNotificationListener.setActive(active);
        } catch (Exception e) {
            // 忽略
        }
    }

    @PluginMethod
    public void checkPermission(PluginCall call) {
        ComponentName cn = new ComponentName(getContext(), AutoRecordNotificationListener.class);
        String flat = Settings.Secure.getString(getContext().getContentResolver(), "enabled_notification_listeners");
        boolean enabled = flat != null && flat.contains(cn.flattenToString());
        JSObject ret = new JSObject();
        ret.put("granted", enabled);
        call.resolve(ret);
    }

    @PluginMethod
    public void requestPermission(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
        } catch (Exception e) {
            // 兜底：跳到 APP 设置页
            try {
                Intent fallback = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                fallback.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(fallback);
            } catch (Exception ignored) {}
        }
        call.resolve();
    }

    @PluginMethod
    public void startListening(PluginCall call) {
        AutoRecordNotificationListener.setActive(true);
        JSObject ret = new JSObject();
        ret.put("started", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void stopListening(PluginCall call) {
        AutoRecordNotificationListener.setActive(false);
        JSObject ret = new JSObject();
        ret.put("stopped", true);
        call.resolve(ret);
    }

    /* JS 启动时调用：拉取"App 被杀期间"漏抓的支付数据 */
    @PluginMethod
    public void flushQueue(PluginCall call) {
        String json = AutoRecordNotificationListener.drainQueue();
        JSObject ret = new JSObject();
        try {
            JSONArray arr = new JSONArray(json);
            ret.put("records", arr);
        } catch (JSONException e) {
            ret.put("records", new JSONArray());
        }
        call.resolve(ret);
    }

    /**
     * Java 端 Service 调用：把解析好的数据推给 JS
     * @return true=推送成功；false=JS 未注册监听（入队等下次 flush）
     */
    public static boolean onPaymentDetected(JSONObject data) {
        if (instance == null) return false;
        try {
            // 关键修复：把 JSONObject 转成 Capacitor 支持的 JSObject
            JSObject jsData = JSObject.fromJSONObject(data);
            instance.notifyListeners("autoRecord", jsData);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}