package com.family.accountbook;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;
import com.family.accountbook.plugins.AutoRecordPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AutoRecordPlugin.class);
        super.onCreate(savedInstanceState);

        // 修 0-13：开启 WebView 持久化权限（IndexedDB / localStorage / 缓存）
        // - IndexedDB 是核心账单/预算/账本/分类/借条的存储；必须开启
        // - 关闭后 APP 重启或后台清理会导致数据全部清空
        Bridge bridge = getBridge();
        if (bridge != null) {
            WebView webView = bridge.getWebView();
            if (webView != null) {
                WebSettings settings = webView.getSettings();
                settings.setJavaScriptEnabled(true);
                settings.setDomStorageEnabled(true);   // localStorage / sessionStorage
                settings.setDatabaseEnabled(true);    // 兼容旧 WebSQL 写法
                // 把 WebView 数据库放到 app 内部目录（系统清理缓存不会触碰）
                String dbPath = getApplicationContext().getDir("database", MODE_PRIVATE).getPath();
                settings.setDatabasePath(dbPath);
                settings.setAllowFileAccess(true);
                settings.setAllowContentAccess(true);
            }
        }
    }
}
