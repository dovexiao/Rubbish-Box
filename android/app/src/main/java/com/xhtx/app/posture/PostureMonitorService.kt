package com.xhtx.app.posture

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.modules.core.DeviceEventManagerModule

/**
 * 坐姿监控前台服务
 * 在后台持续运行相机和 AI 检测
 */
class PostureMonitorService : Service() {

    companion object {
        private const val TAG = "PostureMonitorService"
        private const val CHANNEL_ID = "posture_monitor_channel"
        private const val NOTIFICATION_ID = 1001
        
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
        
        createNotificationChannel()
        startForeground(NOTIFICATION_ID, createNotification())
        
        isRunning = true
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(TAG, "服务启动")
        
        // 初始化相机管理器
        initializeCameraManager()
        
        // 使用 START_NOT_STICKY：应用退出时不自动重启服务
        return START_NOT_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.d(TAG, "服务销毁")
        
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
     */
    private fun processFrame(imageData: ByteArray, width: Int, height: Int) {
        try {
            // 使用 TFLite 检测姿势
            val keypoints = poseDetector?.detectPose(imageData) ?: return
            
            // 评估坐姿状态
            val status = poseDetector?.evaluatePosture(keypoints) ?: "detecting"
            
            // 发送状态到 JS
            sendPostureStatusToJS(status)
            
        } catch (e: Exception) {
            Log.e(TAG, "❌ 处理帧失败: ${e.message}", e)
        }
    }

    /**
     * 发送坐姿状态到 JS
     */
    private fun sendPostureStatusToJS(status: String) {
        if (reactContext == null) {
            Log.w(TAG, "⚠️ ReactContext 为空，无法发送状态")
            return
        }
        
        reactContext?.let { context ->
            try {
                val params = Arguments.createMap().apply {
                    putString("status", status)
                    putDouble("timestamp", System.currentTimeMillis().toDouble())
                }
                
                Log.d(TAG, "📊 发送坐姿状态到 JS: $status")
                
                context
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("onPostureStatus", params)
                    
            } catch (e: Exception) {
                Log.e(TAG, "❌ 发送状态失败: ${e.message}", e)
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
}

