package com.example.uniplugin_posemonitor;

// Java standard library imports
import java.util.HashMap;
import java.util.Map;

// Android framework imports
import android.content.Context;
import android.content.Intent;
import android.content.BroadcastReceiver;
import android.content.IntentFilter;
import android.util.Log;

// Third-party library imports
import com.taobao.weex.annotation.JSMethod;
import com.taobao.weex.common.WXModule;

/**
 * 独立的系统按键监听模块，用于监听 HOME/RECENTS 并向 UniApp 发送全局事件。
 */
public class SystemKeyModule extends WXModule {
    private static final String TAG = "SystemKeyModule";

    private static final String ACTION_CLOSE_SYSTEM_DIALOGS = Intent.ACTION_CLOSE_SYSTEM_DIALOGS;
    private static final String SYSTEM_DIALOG_REASON_KEY = "reason";
    private static final String SYSTEM_DIALOG_REASON_RECENT_APPS = "recentapps";
    private static final String SYSTEM_DIALOG_REASON_HOME_KEY = "homekey";

    private BroadcastReceiver systemDialogReceiver;
    private boolean isReceiverRegistered = false;
    private static final boolean SHOW_LOG = false;

    public SystemKeyModule() {
        if (SHOW_LOG) Log.d(TAG, "SystemKeyModule constructed");
    }

    @JSMethod(uiThread = false)
    public void startHomeKeyListener() {
        if (SHOW_LOG) Log.d(TAG, "startHomeKeyListener called");
        registerReceiverInternal();
    }

    @JSMethod(uiThread = false)
    public void stopHomeKeyListener() {
        unregisterReceiverInternal();
    }

    private void registerReceiverInternal() {
        if (isReceiverRegistered) {
            if (SHOW_LOG)  Log.d(TAG, "Receiver already registered");
            return;
        }
        Context base = mWXSDKInstance == null ? null : mWXSDKInstance.getContext();
        Context context = base == null ? null : base.getApplicationContext();
        if (context == null) {
            if (SHOW_LOG)
                Log.e(TAG, "Context is null, cannot register receiver");
            return;
        }

        systemDialogReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context ctx, Intent intent) {
                if (intent == null)
                    return;
                String action = intent.getAction();
                if (ACTION_CLOSE_SYSTEM_DIALOGS.equals(action)) {
                    String reason = intent.getStringExtra(SYSTEM_DIALOG_REASON_KEY);
                    if (reason == null)
                        return;

                    String keyType = null;
                    if (SYSTEM_DIALOG_REASON_HOME_KEY.equals(reason)) {
                        keyType = "home";
                    } else if (SYSTEM_DIALOG_REASON_RECENT_APPS.equals(reason)) {
                        keyType = "recents";
                    }

                    if (keyType != null) {
                        Map<String, Object> params = new HashMap<>();
                        params.put("key", keyType);
                        params.put("reason", reason);
                        params.put("action", "close_system_dialogs");
                        params.put("timestamp", System.currentTimeMillis());

                        if (mWXSDKInstance != null) {
                            mWXSDKInstance.fireGlobalEventCallback("onSystemKey", params);
                            Log.d(TAG, "Fired onSystemKey: " + params);
                        } else {
                            if (SHOW_LOG)
                                Log.e(TAG, "mWXSDKInstance is null, cannot fire onSystemKey");
                        }
                    }
                }
            }
        };

        try {
            IntentFilter filter = new IntentFilter(ACTION_CLOSE_SYSTEM_DIALOGS);
            context.registerReceiver(systemDialogReceiver, filter);
            isReceiverRegistered = true;
            if (SHOW_LOG) Log.d(TAG, "System key receiver registered");
        } catch (Exception e) {
            if (SHOW_LOG)
                Log.e(TAG, "Register receiver failed", e);
        }
    }

    private void unregisterReceiverInternal() {
        if (!isReceiverRegistered || systemDialogReceiver == null)
            return;
        try {
            Context base = mWXSDKInstance == null ? null : mWXSDKInstance.getContext();
            Context context = base == null ? null : base.getApplicationContext();
            if (context != null) {
                context.unregisterReceiver(systemDialogReceiver);
            }
        } catch (Exception e) {
            if (SHOW_LOG)
                Log.w(TAG, "Unregister receiver error", e);
        } finally {
            systemDialogReceiver = null;
            isReceiverRegistered = false;
            if (SHOW_LOG) Log.d(TAG, "System key receiver unregistered");
        }
    }

    /**
     * 供前端主动触发清理
     */
    @JSMethod(uiThread = false)
    public void cleanup() {
        unregisterReceiverInternal();
    }
}
