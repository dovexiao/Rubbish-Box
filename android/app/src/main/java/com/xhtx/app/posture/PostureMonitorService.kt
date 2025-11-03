package com.xhtx.app.posture

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * 坐姿监控前台服务
 * 在后台持续运行相机和 AI 检测
 */
class PostureMonitorService : Service() {

    companion object {
        private const val TAG = "PostureMonitorService"
        private const val CHANNEL_ID = "posture_monitor_channel"
        private const val NOTIFICATION_ID = 1001
        
        // SharedPreferences 配置
        private const val PREF_NAME = "PostureMonitorPrefs"
        private const val KEY_LAST_DATE = "last_date"
        private const val KEY_REWARD_ACCUMULATED = "reward_accumulated"
        private const val KEY_GOOD_POSTURE = "good_posture"
        private const val KEY_SHOULDERS_TILTED = "shoulders_tilted"
        private const val KEY_HEAD_TILTED = "head_tilted"
        private const val KEY_HEAD_NOT_UP = "head_not_up"
        
        // 时间常量
        private const val UPDATE_INTERVAL_SECONDS = 30 // 30秒更新一次前端
         private const val REST_REMINDER_INTERVAL = 45 * 60 * 1000L // 45分钟休息提醒（毫秒）

        private const val DETECTION_INTERVAL_SECONDS = 10 // Native每10秒检测一次
        private const val REWARD_INTERVAL_SECONDS = 10 * 60 // 10分钟 = 600秒
        private const val HOUR_IN_SECONDS = 60 * 60 // 1小时 = 3600秒
      


       //private const val DETECTION_INTERVAL_SECONDS = 10 // 保持10秒
       // private const val REWARD_INTERVAL_SECONDS = 30 // 测试：30秒奖励一次
       // private const val HOUR_IN_SECONDS = 60 // 测试：60秒上报一次
     
        
        var isRunning = false
            private set
        
        // 保存 ReactContext，用于发送事件
        private var savedReactContext: ReactApplicationContext? = null
        
        fun start(context: Context, reactContext: ReactApplicationContext?) {
            savedReactContext = reactContext
            val intent = Intent(context, PostureMonitorService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }
        
        fun stop(context: Context) {
            val intent = Intent(context, PostureMonitorService::class.java)
            context.stopService(intent)
        }
    }

    private var cameraManager: BackgroundCameraManager? = null
    private var reactContext: ReactApplicationContext? = null
    private var poseDetector: PoseDetector? = null
    
    // 🎯 核心逻辑1：10分钟奖励计时器（秒）
    private var rewardAccumulatedSeconds = 0
    
    // 🎯 核心逻辑2：1小时上报计时器（秒）
    private var dailyGoodPostureSeconds = 0
    private var shouldersTiltedSeconds = 0
    private var headTiltedSeconds = 0
    private var headNotUpSeconds = 0
    private var totalSeconds = 0
    
    // 辅助变量
    private var lastUpdateTime = 0L
    private var lastFrontendUpdateTime = 0L
    private var lastStatus = "detecting"
    
    // 45分钟休息提醒
    private val restReminderHandler = android.os.Handler(android.os.Looper.getMainLooper())
    private val restReminderRunnable = object : Runnable {
        override fun run() {
            Log.d(TAG, "⏰ 45分钟休息提醒")
            sendRestReminderToJS()
            // 继续下一次提醒
            restReminderHandler.postDelayed(this, REST_REMINDER_INTERVAL)
        }
    }

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "服务创建")
        
        // 初始化姿势检测器
        poseDetector = PoseDetector(applicationContext)
        
        // 获取保存的 ReactContext
        reactContext = savedReactContext
        if (reactContext != null) {
            Log.d(TAG, "✅ ReactContext 已设置")
        } else {
            Log.w(TAG, "⚠️ ReactContext 为空，无法发送事件到 JS")
        }
        
        // 📦 加载持久化的统计数据
        loadStatistics()
        
        createNotificationChannel()
        startForeground(NOTIFICATION_ID, createNotification())
        
        isRunning = true
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(TAG, "服务启动")
        
        // 初始化相机管理器
        initializeCameraManager()
        
        // 启动45分钟休息提醒定时器
        restReminderHandler.postDelayed(restReminderRunnable, REST_REMINDER_INTERVAL)
        Log.d(TAG, "⏰ 已启动45分钟休息提醒定时器")
        
        // 使用 START_NOT_STICKY：应用退出时不自动重启服务
        return START_NOT_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.d(TAG, "服务销毁")
        
        // 💾 保存统计数据
        saveStatistics()
        Log.d(TAG, "💾 已保存统计数据")
        
        // 停止休息提醒定时器
        restReminderHandler.removeCallbacks(restReminderRunnable)
        Log.d(TAG, "⏰ 已停止45分钟休息提醒定时器")
        
        // 停止相机
        cameraManager?.stopCamera()
        cameraManager = null
        
        isRunning = false
    }

    private fun initializeCameraManager() {
        try {
            cameraManager = BackgroundCameraManager(
                context = this,
                onFrameCaptured = { imageData, width, height ->
                    // 在原生层直接进行姿势检测
                    processFrame(imageData, width, height)
                }
            )
            cameraManager?.startCamera()
            Log.d(TAG, "相机管理器初始化成功")
        } catch (e: Exception) {
            Log.e(TAG, "相机管理器初始化失败: ${e.message}", e)
        }
    }
    
    /**
     * 处理相机帧并进行姿势检测
     * 每10秒调用一次，进行时间统计（性能优化）
     */
    private fun processFrame(imageData: ByteArray, width: Int, height: Int) {
        try {
            val currentTime = System.currentTimeMillis()
            
            // 使用 TFLite 检测姿势
            val keypoints = poseDetector?.detectPose(imageData) ?: return
            
            // 评估坐姿状态
            val status = poseDetector?.evaluatePosture(keypoints) ?: "detecting"
            lastStatus = status
            
            // 🎯 核心统计逻辑：每10秒累加一次（每次累加10秒）
            when (status) {
                "good" -> {
                    dailyGoodPostureSeconds += DETECTION_INTERVAL_SECONDS
                    rewardAccumulatedSeconds += DETECTION_INTERVAL_SECONDS // 所有有效状态都计入奖励
                }
                "shoulders_not_level" -> {
                    shouldersTiltedSeconds += DETECTION_INTERVAL_SECONDS
                    rewardAccumulatedSeconds += DETECTION_INTERVAL_SECONDS
                }
                "head_not_centered" -> {
                    headTiltedSeconds += DETECTION_INTERVAL_SECONDS
                    rewardAccumulatedSeconds += DETECTION_INTERVAL_SECONDS
                }
                "head_not_up" -> {
                    headNotUpSeconds += DETECTION_INTERVAL_SECONDS
                    rewardAccumulatedSeconds += DETECTION_INTERVAL_SECONDS
                }
                "no_person", "detecting" -> {
                    // 检测不到人或检测中，不增加计数
                }
            }
            
            // 更新总时长
            totalSeconds = dailyGoodPostureSeconds + shouldersTiltedSeconds + 
                          headTiltedSeconds + headNotUpSeconds
            
            // 💾 每次累加后保存数据
            saveStatistics()
            
            Log.d(TAG, "📊 累计时间: total=${totalSeconds}s, reward=${rewardAccumulatedSeconds}s, status=${status}")
            
            // 🎯 核心逻辑1：检查10分钟奖励（600秒 = 60次检测）
            if (rewardAccumulatedSeconds >= REWARD_INTERVAL_SECONDS) {
                Log.d(TAG, "✅ 达到10分钟奖励阈值: ${rewardAccumulatedSeconds}秒")
                sendRewardToJS()
                // 立即发送一次状态更新，确保前端显示最新状态
                sendPostureStatusToJS(status, "update")
                rewardAccumulatedSeconds = 0 // 重置奖励计时器，开始新一轮
            }
            
            // 🎯 核心逻辑2：检查1小时上报（3600秒 = 360次检测）
            if (totalSeconds >= HOUR_IN_SECONDS) {
                Log.d(TAG, "⏰ 达到1小时阈值，上报数据并重置")
                sendPostureStatusToJS(status, "updateTime")
                resetStatistics()
            }
            
            // 每30秒向前端发送一次状态更新（每3次检测发送一次）
            if (currentTime - lastFrontendUpdateTime >= UPDATE_INTERVAL_SECONDS * 1000) {
                lastFrontendUpdateTime = currentTime
                sendPostureStatusToJS(status, "update")
            }
            
        } catch (e: Exception) {
            Log.e(TAG, "❌ 处理帧失败: ${e.message}", e)
        }
    }
    
    /**
     * 重置统计数据（1小时后调用）
     */
    private fun resetStatistics() {
        dailyGoodPostureSeconds = 0
        shouldersTiltedSeconds = 0
        headTiltedSeconds = 0
        headNotUpSeconds = 0
        totalSeconds = 0
        // 注意：rewardAccumulatedSeconds 不重置，它独立计时
    }

    /**
     * 发送坐姿状态到 JS（包含完整统计数据）
     */
    private fun sendPostureStatusToJS(status: String, type: String = "update") {
        if (reactContext == null) {
            Log.w(TAG, "⚠️ ReactContext 为空，无法发送状态")
            return
        }
        
        reactContext?.let { context ->
            try {
                val params = Arguments.createMap().apply {
                    putString("status", status)
                    putDouble("timestamp", System.currentTimeMillis().toDouble())
                    putString("type", type)
                    
                    // 🎯 核心逻辑1：10分钟奖励计时器
                    putInt("reward_accumulated_seconds", rewardAccumulatedSeconds)
                    
                    // 🎯 核心逻辑2：1小时上报统计
                    putInt("good", dailyGoodPostureSeconds)
                    putInt("shoulders_tilted", shouldersTiltedSeconds)
                    putInt("head_tilted", headTiltedSeconds)
                    putInt("head_not_up", headNotUpSeconds)
                    putInt("total", totalSeconds)
                }
                
                Log.d(TAG, "📊 发送坐姿数据到 JS: status=$status, type=$type, reward=$rewardAccumulatedSeconds, total=$totalSeconds")
                
                context
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("onPostureStatus", params)
                    
            } catch (e: Exception) {
                Log.e(TAG, "❌ 发送状态失败: ${e.message}", e)
            }
        }
    }
    
    /**
     * 发送奖励通知到 JS
     */
    private fun sendRewardToJS() {
        if (reactContext == null) {
            Log.w(TAG, "⚠️ ReactContext 为空，无法发送奖励")
            return
        }
        
        reactContext?.let { context ->
            try {
                val params = Arguments.createMap().apply {
                    putString("message", "恭喜！累计学习10分钟，获得积分奖励！")
                    putInt("duration", REWARD_INTERVAL_SECONDS)
                    putDouble("timestamp", System.currentTimeMillis().toDouble())
                    putString("type", "reward")
                }
                
                Log.d(TAG, "🎉 发送奖励通知到 JS")
                
                context
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("onPostureReward", params)
                    
            } catch (e: Exception) {
                Log.e(TAG, "❌ 发送奖励失败: ${e.message}", e)
            }
        }
    }

    /**
     * 发送休息提醒到 JS
     */
    private fun sendRestReminderToJS() {
        if (reactContext == null) {
            Log.w(TAG, "⚠️ ReactContext 为空，无法发送休息提醒")
            return
        }
        
        reactContext?.let { context ->
            try {
                val params = Arguments.createMap().apply {
                    putString("message", "您已持续学习45分钟，建议休息一下，保护视力！")
                    putInt("duration", 45)
                    putDouble("timestamp", System.currentTimeMillis().toDouble())
                    putString("type", "rest_reminder")
                }
                
                Log.d(TAG, "⏰ 发送45分钟休息提醒到 JS")
                
                context
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("onRestReminder", params)
                    
            } catch (e: Exception) {
                Log.e(TAG, "❌ 发送休息提醒失败: ${e.message}", e)
            }
        }
    }

    fun setReactContext(context: ReactApplicationContext) {
        this.reactContext = context
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "坐姿监控服务",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "正在监控坐姿，保护视力健康"
                setShowBadge(false)
            }
            
            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun createNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("坐姿监控中")
            .setContentText("正在保护您的视力健康")
            .setSmallIcon(android.R.drawable.ic_menu_camera)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .build()
    }
    
    /**
     * 📦 从 SharedPreferences 加载统计数据
     * 如果是新的一天，会重置所有数据
     */
    private fun loadStatistics() {
        val prefs: SharedPreferences = getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
        val lastDate = prefs.getString(KEY_LAST_DATE, "")
        val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
        
        if (today != lastDate) {
            // 新的一天，重置所有数据
            Log.d(TAG, "📦 新的一天($today)，重置统计数据")
            rewardAccumulatedSeconds = 0
            dailyGoodPostureSeconds = 0
            shouldersTiltedSeconds = 0
            headTiltedSeconds = 0
            headNotUpSeconds = 0
            totalSeconds = 0
            
            // 保存新的日期
            prefs.edit()
                .putString(KEY_LAST_DATE, today)
                .putInt(KEY_REWARD_ACCUMULATED, 0)
                .putInt(KEY_GOOD_POSTURE, 0)
                .putInt(KEY_SHOULDERS_TILTED, 0)
                .putInt(KEY_HEAD_TILTED, 0)
                .putInt(KEY_HEAD_NOT_UP, 0)
                .apply()
        } else {
            // 同一天，加载之前的数据
            rewardAccumulatedSeconds = prefs.getInt(KEY_REWARD_ACCUMULATED, 0)
            dailyGoodPostureSeconds = prefs.getInt(KEY_GOOD_POSTURE, 0)
            shouldersTiltedSeconds = prefs.getInt(KEY_SHOULDERS_TILTED, 0)
            headTiltedSeconds = prefs.getInt(KEY_HEAD_TILTED, 0)
            headNotUpSeconds = prefs.getInt(KEY_HEAD_NOT_UP, 0)
            totalSeconds = dailyGoodPostureSeconds + shouldersTiltedSeconds + 
                          headTiltedSeconds + headNotUpSeconds
            
            Log.d(TAG, "📦 加载统计数据: reward=${rewardAccumulatedSeconds}s, total=${totalSeconds}s")
        }
    }
    
    /**
     * 💾 保存统计数据到 SharedPreferences
     */
    private fun saveStatistics() {
        val prefs: SharedPreferences = getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
        val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
        
        prefs.edit()
            .putString(KEY_LAST_DATE, today)
            .putInt(KEY_REWARD_ACCUMULATED, rewardAccumulatedSeconds)
            .putInt(KEY_GOOD_POSTURE, dailyGoodPostureSeconds)
            .putInt(KEY_SHOULDERS_TILTED, shouldersTiltedSeconds)
            .putInt(KEY_HEAD_TILTED, headTiltedSeconds)
            .putInt(KEY_HEAD_NOT_UP, headNotUpSeconds)
            .apply()
    }
}

