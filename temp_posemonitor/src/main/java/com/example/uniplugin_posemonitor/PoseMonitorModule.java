package com.example.uniplugin_posemonitor;

// Java standard library imports
import java.util.ArrayList;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

// Android framework imports
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.ServiceConnection;
import android.content.ComponentName;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.os.IBinder;
import android.provider.Settings;
import android.util.Log;

// Third-party library imports
import androidx.annotation.NonNull;
import com.alibaba.fastjson.JSONObject;
import com.taobao.weex.annotation.JSMethod;
import com.taobao.weex.bridge.JSCallback;
import com.taobao.weex.common.WXModule;

// Project internal imports
import com.example.uniplugin_posemonitor.model.PoseData;
import com.example.uniplugin_posemonitor.service.PoseMonitorService;

public class PoseMonitorModule extends WXModule implements PoseMonitorService.PoseDetectionCallback {
    private static final String TAG = "PoseMonitorModule";
    private static int requiredCount = 10 * 60; // 30*60次良好坐姿获得奖励
    // private static int requiredCount = 30 * 1000 * 60; // 30次良好坐姿获得奖励
    private static final long updateInterval = 30000; // 60秒更新一次
    private static final int HOUR_IN_SECONDS = 60 * 60; // 1小时的秒数

    private Context mContext;
    private boolean isMonitoring = false;
    private boolean isModuleDestroyed = false;
    private static final boolean SHOW_LOG = false;
    // 添加绑定服务相关变量
    private PoseMonitorService.PoseMonitorBinder serviceBinder;
    private boolean isServiceBound = false;

    // 服务连接回调
    private ServiceConnection serviceConnection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            serviceBinder = (PoseMonitorService.PoseMonitorBinder) service;
            isServiceBound = true;

            // 设置回调
            serviceBinder.setCallback(PoseMonitorModule.this);
            if (SHOW_LOG)
                Log.d(TAG, "Service connected and callback set");
        }

        @Override
        public void onServiceDisconnected(ComponentName name) {
            serviceBinder = null;
            isServiceBound = false;
            isMonitoring = false;
            if (SHOW_LOG)
                Log.d(TAG, "Service disconnected");

            // 清理回调以避免内存泄漏
            PoseMonitorService.setPoseDetectionCallback(null);
        }
    };
    private int dailyGoodPostureCount = 0; // 当天良好坐姿次数
    private int rewardGoodPostureCount = 0; // 奖励良好坐姿次数
    private int shouldersTiltedCount = 0; // 肩膀倾斜次数
    private int headTiltedCount = 0; // 头部倾斜次数
    private int headNotUpCount = 0; // 头部不向上次数
    private int totalCount = 0; // 总次数
    private long lastUpdateTime = 0;
    private long lastRewardTime = 0;
    private boolean hasRewardBeenSent = false;
    private String lastStatus = "";
    private int hourlyTriggerCount = HOUR_IN_SECONDS; // 每小时触发一次的计数阈值
    private long lastDataSendTime = 0;
    private long lastSaveDataSendTime = 0;

    // System key listener removed to decouple from pose monitor

    // ====== Persistent cache (SharedPreferences) for posture stats ======
    private static final String PREF_NAME = "PoseMonitorModulePrefs";
    private static final String KEY_STATUS = "status";
    private static final String KEY_GOOD = "good";
    private static final String KEY_SHOULDERS_TILTED = "shoulders_tilted";
    private static final String KEY_HEAD_TILTED = "head_tilted";
    private static final String KEY_HEAD_NOT_UP = "head_not_up";
    private static final String KEY_TOTAL = "total";
    private static final String KEY_REWARD_DURATION = "reward_duration";

    private SharedPreferences getPrefs() {
        if (mWXSDKInstance == null || mWXSDKInstance.getContext() == null)
            return null;
        return mWXSDKInstance.getContext().getApplicationContext()
                .getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
    }

    private void loadStatsFromCache() {
        try {
            SharedPreferences prefs = getPrefs();
            if (prefs == null)
                return;
            lastStatus = prefs.getString(KEY_STATUS, "");
            dailyGoodPostureCount = prefs.getInt(KEY_GOOD, 0);
            shouldersTiltedCount = prefs.getInt(KEY_SHOULDERS_TILTED, 0);
            headTiltedCount = prefs.getInt(KEY_HEAD_TILTED, 0);
            headNotUpCount = prefs.getInt(KEY_HEAD_NOT_UP, 0);
            totalCount = prefs.getInt(KEY_TOTAL, 0);
            rewardGoodPostureCount = prefs.getInt(KEY_REWARD_DURATION, 0);
            if (SHOW_LOG)
                Log.d(TAG,
                        String.format("从缓存加载: status=%s, good=%d, shoulders=%d, head=%d, notUp=%d, total=%d, reward=%d",
                                lastStatus, dailyGoodPostureCount, shouldersTiltedCount, headTiltedCount,
                                headNotUpCount, totalCount, rewardGoodPostureCount));
        } catch (Exception e) {
            if (SHOW_LOG)
                Log.w(TAG, "加载缓存失败", e);
        }
    }

    private void saveStatsToCache() {
        try {
            SharedPreferences prefs = getPrefs();
            if (prefs == null)
                return;
            prefs.edit()
                    .putString(KEY_STATUS, lastStatus)
                    .putInt(KEY_GOOD, dailyGoodPostureCount)
                    .putInt(KEY_SHOULDERS_TILTED, shouldersTiltedCount)
                    .putInt(KEY_HEAD_TILTED, headTiltedCount)
                    .putInt(KEY_HEAD_NOT_UP, headNotUpCount)
                    .putInt(KEY_TOTAL, totalCount)
                    .putInt(KEY_REWARD_DURATION, rewardGoodPostureCount)
                    .apply();
        } catch (Exception e) {
            if (SHOW_LOG)
                Log.w(TAG, "保存缓存失败", e);
        }
    }

    private void resetStatsAndCache() {
        dailyGoodPostureCount = 0;
        rewardGoodPostureCount = 0;
        shouldersTiltedCount = 0;
        headTiltedCount = 0;
        headNotUpCount = 0;
        totalCount = 0;
        saveStatsToCache();
        if (SHOW_LOG)
            Log.d(TAG, "统计数据已重置并写入缓存");
    }

    @JSMethod(uiThread = true)
    public void startMonitoring() {
        if (SHOW_LOG)
            Log.d(TAG, "开始姿态监测");

        if (isMonitoring) {
            if (SHOW_LOG)
                Log.d(TAG, "监测已在运行中");
            return;
        }

        if (mWXSDKInstance == null || mWXSDKInstance.getContext() == null) {
            if (SHOW_LOG)
                Log.e(TAG, "WXSDKInstance 或 Context 为空，无法启动监测");
            return;
        }

        if (!checkPermissions()) {
            if (SHOW_LOG)
                Log.e(TAG, "权限检查失败");
            return;
        }

        try {
            Intent intent = new Intent(mWXSDKInstance.getContext(), PoseMonitorService.class);
            intent.putExtra("updateInterval", updateInterval);
            intent.putExtra("requiredCount", requiredCount);

            // 1. 启动前台服务（保持后台运行能力）
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                mWXSDKInstance.getContext().startForegroundService(intent);
            } else {
                mWXSDKInstance.getContext().startService(intent);
            }

            // 2. 绑定服务（生命周期管理）
            boolean bindResult = mWXSDKInstance.getContext().bindService(intent, serviceConnection,
                    Context.BIND_AUTO_CREATE);

            if (bindResult) {
                isMonitoring = true;
                if (SHOW_LOG)
                    Log.d(TAG, "姿态监测服务启动和绑定成功");

                // 发送初始状态
                // 从缓存恢复历史统计后再发送初始状态
                loadStatsFromCache();
                sendStatusUpdate("detecting", "update");

                // 系统按键监听已独立为 SystemKeyModule
            } else {
                if (SHOW_LOG)
                    Log.e(TAG, "绑定服务失败");
                // 如果绑定失败，停止已启动的服务
                mWXSDKInstance.getContext().stopService(intent);
            }

        } catch (Exception e) {
            if (SHOW_LOG)
                Log.e(TAG, "启动监测失败: " + e.getMessage());
            isMonitoring = false;
        }
    }

    @JSMethod(uiThread = false)
    public void stopMonitoring() {
        if (SHOW_LOG)
            Log.d(TAG, "停止监控");

        isMonitoring = false;

        // 1. 通过绑定的服务停止监控
        if (isServiceBound && serviceBinder != null) {
            try {
                serviceBinder.stopMonitoring();
                if (SHOW_LOG)
                    Log.d(TAG, "通过绑定服务停止监控");
            } catch (Exception e) {
                if (SHOW_LOG)
                    Log.e(TAG, "通过绑定服务停止监控时出错", e);
            }
        }

        // 2. 解绑服务
        if (isServiceBound) {
            try {
                if (mWXSDKInstance != null && mWXSDKInstance.getContext() != null) {
                    mWXSDKInstance.getContext().unbindService(serviceConnection);
                    isServiceBound = false;
                    if (SHOW_LOG)
                        Log.d(TAG, "服务解绑成功");
                }
            } catch (Exception e) {
                if (SHOW_LOG)
                    Log.e(TAG, "解绑服务时出错", e);
                isServiceBound = false; // 即使出错也要重置状态
            }
        }

        // 3. 停止服务（清理资源）
        try {
            if (mWXSDKInstance != null && mWXSDKInstance.getContext() != null) {
                Intent serviceIntent = new Intent(mWXSDKInstance.getContext(), PoseMonitorService.class);
                mWXSDKInstance.getContext().stopService(serviceIntent);
                if (SHOW_LOG)
                    Log.d(TAG, "服务停止命令已发送");
            }
        } catch (Exception e) {
            if (SHOW_LOG)
                Log.e(TAG, "停止服务时出错", e);
        }

        // 4. 清除静态回调（兼容性保留）
        PoseMonitorService.setPoseDetectionCallback(null);

        // 系统按键监听已独立为 SystemKeyModule
        // 保存当前统计以便下次恢复
        saveStatsToCache();
    }

    @JSMethod(uiThread = false)
    public void setRewardConfig(JSONObject config) {
        try {
            if (config != null) {
                if (config.containsKey("goodPostureCount")) {
                    int newCount = config.getInteger("goodPostureCount");
                    if (newCount != requiredCount) {
                        requiredCount = newCount;
                        if (SHOW_LOG)
                            Log.d(TAG, "奖励所需次数已修改为: " + requiredCount + "次");
                    }
                }
            }

            // 重置累计统计
            dailyGoodPostureCount = 0;
            rewardGoodPostureCount = 0;
            headNotUpCount = 0;
            lastRewardTime = 0;
            lastDataSendTime = System.currentTimeMillis(); // 重置数据发送时间
            lastSaveDataSendTime = System.currentTimeMillis(); // 重置数据发送时间
            hasRewardBeenSent = false;
            if (SHOW_LOG)
                Log.d(TAG, "重置累计统计");
            // 同步到缓存
            saveStatsToCache();

        } catch (Exception e) {
            if (SHOW_LOG)
                Log.e(TAG, "Error setting reward config", e);
        }
    }

    // 添加一个方法供前端主动获取状态数据
    @JSMethod(uiThread = false)
    public void getCurrentStatus(JSCallback callback) {
        JSONObject result = new JSONObject();
        result.put("status", lastStatus);
        result.put("good", dailyGoodPostureCount);
        result.put("shoulders_tilted", shouldersTiltedCount);
        result.put("head_tilted", headTiltedCount);
        result.put("head_not_up", headNotUpCount);
        result.put("total", totalCount);
        result.put("isMonitoring", isMonitoring);
        result.put("reward_duration", rewardGoodPostureCount);

        if (callback != null) {
            callback.invoke(result);
        }
    }

    // 添加一个方法供前端主动获取奖励状态
    @JSMethod(uiThread = false)
    public void getRewardStatus(JSCallback callback) {
        JSONObject result = new JSONObject();
        result.put("current_count", rewardGoodPostureCount);
        result.put("required_count", requiredCount);
        result.put("can_reward", rewardGoodPostureCount >= requiredCount);

        if (callback != null) {
            callback.invoke(result);
        }
    }

    private void sendStatusUpdate(String status, String type) {
        if (SHOW_LOG)
            Log.d(TAG, String.format("发送状态更新: status=%s, good=%d, shoulders=%d, head=%d, total=%d",
                    status, dailyGoodPostureCount, shouldersTiltedCount, headTiltedCount, totalCount));

        // 构建数据对象
        Map<String, Object> params = new HashMap<>();
        params.put("status", status);
        params.put("good", dailyGoodPostureCount);
        params.put("shoulders_tilted", shouldersTiltedCount);
        params.put("head_tilted", headTiltedCount);
        params.put("head_not_up", headNotUpCount);
        params.put("total", totalCount);
        params.put("isMonitoring", isMonitoring);
        params.put("reward_duration", rewardGoodPostureCount);
        params.put("type", type);
        // 使用 fireGlobalEventCallback 发送 globalEvent 事件
        if (mWXSDKInstance != null) {
            mWXSDKInstance.fireGlobalEventCallback("onPoseStatus", params);
            if (SHOW_LOG)
                Log.d(TAG, "姿态数据已通过 fireGlobalEventCallback 发送 onPoseStatus 事件");
            if (SHOW_LOG)
                Log.d(TAG, String.format("姿态数据: %s", params));
        } else {
            if (SHOW_LOG)
                Log.e(TAG, "mWXSDKInstance is null, cannot send onPoseStatus event");
        }
    }

    // 实现 PoseDetectionCallback 接口
    @Override
    public void onPoseDetected(PoseData poseData) {
        if (!isMonitoring)
            return;

        long currentTime = System.currentTimeMillis();
        String currentStatus = poseData.getStatus();

        // 每秒检测一次，每次检测都增加对应状态的计数
        if (currentTime - lastUpdateTime >= 1000) { // 1秒间隔
            lastUpdateTime = currentTime;

            // 根据当前状态增加对应计数
            switch (currentStatus) {
                case "good":
                    dailyGoodPostureCount++; // 更新每日累计次数
                    rewardGoodPostureCount++; // 奖励累计：所有有效状态都计入

                    // if (SHOW_LOG)
                    //     Log.d(TAG, String.format("良好坐姿计数增加: 每日=%d, 奖励=%d",
                    //             dailyGoodPostureCount, rewardGoodPostureCount));
                    // 检查是否达到奖励条件
                    if (rewardGoodPostureCount >= requiredCount) {
                        sendRewardNotification();
                        // 重置奖励累计次数，开始新一轮
                        rewardGoodPostureCount = 0;
                        lastRewardTime = currentTime;
                        hasRewardBeenSent = false;
                        // if (SHOW_LOG)
                        //     Log.d(TAG, "奖励已发送，重置奖励累计次数，开始新一轮");
                        saveStatsToCache();
                    }
                    break;
                case "shoulders_not_level":
                    shouldersTiltedCount++;
                    rewardGoodPostureCount++; // 奖励累计：所有有效状态都计入
                    break;
                case "head_not_centered":
                    headTiltedCount++;
                    rewardGoodPostureCount++; // 奖励累计：所有有效状态都计入
                    break;
                case "head_not_up":
                    headNotUpCount++;
                    rewardGoodPostureCount++; // 奖励累计：所有有效状态都计入
                    break;
                case "no_person":
                    // 检测不到人时不增加任何计数
                    // if (SHOW_LOG)
                    //     Log.d(TAG, "未检测到人，不增加计数");
                    break;
                case "detecting":
                    // 检测状态不增加计数
                    break;
            }

            // 更新总次数
            totalCount = dailyGoodPostureCount + shouldersTiltedCount + headTiltedCount + headNotUpCount;

            // if (SHOW_LOG)
            //     Log.d(TAG, String.format("每秒检测: 状态=%s, 每日良好=%d, 奖励=%d, 肩膀=%d, 头部=%d, 总计=%d",
            //             currentStatus, dailyGoodPostureCount, rewardGoodPostureCount,
            //             shouldersTiltedCount, headTiltedCount, headNotUpCount, totalCount));

            // 检查是否达到60秒间隔，达到就向前端发送数据
            if (currentTime - lastDataSendTime >= updateInterval) {
                lastDataSendTime = currentTime;
                sendStatusUpdate(currentStatus, "update");
                // if (SHOW_LOG)
                //     Log.d(TAG, "达到60秒间隔，向前端发送数据");
                // 定期持久化缓存
                saveStatsToCache();
            }

            // 检查totalCount是否达到1小时的阈值，达到就向前端发送数据并重置计数
            if (totalCount >= hourlyTriggerCount) {
                sendStatusUpdate(currentStatus, "updateTime");
                if (SHOW_LOG)
                    Log.d(TAG, "totalCount达到1小时阈值(" + hourlyTriggerCount + ")，向前端发送updateTime数据");
                // 重置计数器并清理缓存，为下一个小时做准备
                resetStatsAndCache();
            }
        }

        // 记录当前状态（不发送更新）
        lastStatus = currentStatus;
    }

    private boolean checkPermissions() {
        Context context = mWXSDKInstance.getContext();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            // 检查相机权限
            boolean hasCameraPermission = context
                    .checkSelfPermission(android.Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED;

            if (!hasCameraPermission) {
                if (SHOW_LOG)
                    Log.e(TAG, "Camera permission not granted");
                return false;
            }

            // 检查悬浮窗权限
            boolean hasOverlayPermission = Settings.canDrawOverlays(context);
            if (!hasOverlayPermission) {
                if (SHOW_LOG)
                    Log.e(TAG, "Overlay permission not granted");
                // 不直接跳转，让前端处理
                return false;
            }

            if (SHOW_LOG)
                Log.d(TAG, "All permissions granted");
        }
        return true;
    }

    @JSMethod(uiThread = false)
    public void checkAndRequestPermissions(JSCallback callback) {
        Context context = mWXSDKInstance.getContext();
        JSONObject result = new JSONObject();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            // 检查相机权限
            boolean hasCameraPermission = context
                    .checkSelfPermission(android.Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED;

            // 检查悬浮窗权限
            boolean hasOverlayPermission = Settings.canDrawOverlays(context);

            result.put("camera", hasCameraPermission);
            result.put("overlay", hasOverlayPermission);
            result.put("allGranted", hasCameraPermission && hasOverlayPermission);

            // 如果需要悬浮窗权限，提供跳转信息
            if (!hasOverlayPermission) {
                result.put("overlaySettingsIntent", true);
            }
        } else {
            // Android 6.0 以下默认有权限
            result.put("camera", true);
            result.put("overlay", true);
            result.put("allGranted", true);
        }

        if (callback != null) {
            callback.invoke(result);
        }
    }

    @JSMethod(uiThread = false)
    public void openOverlaySettings() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Context context = mWXSDKInstance.getContext();
            Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION);
            intent.setData(Uri.parse("package:" + context.getPackageName()));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
        }
    }

    @JSMethod(uiThread = false)
    public void isServiceRunning(JSCallback callback) {
        boolean isRunning = isServiceRunning(PoseMonitorService.class);

        JSONObject result = new JSONObject();
        result.put("isRunning", isRunning);
        result.put("isMonitoring", isMonitoring);

        if (callback != null) {
            callback.invoke(result);
        }
    }

    private boolean isServiceRunning(Class<?> serviceClass) {
        android.app.ActivityManager manager = (android.app.ActivityManager) mWXSDKInstance.getContext()
                .getSystemService(Context.ACTIVITY_SERVICE);

        if (manager != null) {
            for (android.app.ActivityManager.RunningServiceInfo service : manager
                    .getRunningServices(Integer.MAX_VALUE)) {
                if (serviceClass.getName().equals(service.service.getClassName())) {
                    return true;
                }
            }
        }
        return false;
    }

    @JSMethod(uiThread = false)
    public void forceStopService(JSCallback callback) {
        if (SHOW_LOG)
            Log.d(TAG, "强制停止服务");

        // 先正常停止
        stopMonitoring();

        // 等待一下
        try {
            Thread.sleep(200);
        } catch (InterruptedException e) {
            if (SHOW_LOG)
                Log.e(TAG, "等待被中断", e);
        }

        // 再次尝试停止服务
        try {
            Intent serviceIntent = new Intent(mWXSDKInstance.getContext(), PoseMonitorService.class);
            mWXSDKInstance.getContext().stopService(serviceIntent);
        } catch (Exception e) {
            if (SHOW_LOG)
                Log.e(TAG, "强制停止服务时出错", e);
        }

        // 检查是否停止成功
        boolean isStillRunning = isServiceRunning(PoseMonitorService.class);

        JSONObject result = new JSONObject();
        result.put("success", !isStillRunning);
        result.put("isRunning", isStillRunning);

        if (callback != null) {
            callback.invoke(result);
        }
    }

    private void sendRewardNotification() {
        if (SHOW_LOG)
            Log.d(TAG, String.format("奖励累计良好坐姿达到%d次，发送奖励通知", requiredCount));

        // 构建奖励数据对象
        Map<String, Object> params = new HashMap<>();
        params.put("message", String.format("恭喜！累计保持良好坐姿%d次，获得积分奖励！", requiredCount));
        params.put("duration", rewardGoodPostureCount);
        params.put("timestamp", System.currentTimeMillis());
        params.put("type", "reward");

        // 使用 fireGlobalEventCallback 发送 globalEvent 事件
        if (mWXSDKInstance != null) {
            mWXSDKInstance.fireGlobalEventCallback("onPoseReward", params);
            if (SHOW_LOG)
                Log.d(TAG, "奖励通知已通过 fireGlobalEventCallback 发送 onPoseReward 事件");
        } else {
            if (SHOW_LOG)
                Log.e(TAG, "mWXSDKInstance is null, cannot send onPoseReward event");
        }
    }

    // 模块销毁时的清理方法
    public void onDestroy() {
        if (SHOW_LOG)
            Log.d(TAG, "PoseMonitorModule onDestroy called");

        // 确保清理资源
        if (isMonitoring) {
            stopMonitoring();
        }

        // 最后确保解绑
        if (isServiceBound) {
            try {
                mWXSDKInstance.getContext().unbindService(serviceConnection);
                isServiceBound = false;
                if (SHOW_LOG)
                    Log.d(TAG, "Module onDestroy: 服务解绑完成");
            } catch (Exception e) {
                if (SHOW_LOG)
                    Log.e(TAG, "Module onDestroy: 解绑服务时出错", e);
            }
        }
    }

    // 添加一个手动清理的方法，供前端调用
    @JSMethod(uiThread = false)
    public void cleanup() {
        if (SHOW_LOG)
            Log.d(TAG, "手动清理模块资源");
        onDestroy();
    }

    // System key listener code moved to SystemKeyModule
}