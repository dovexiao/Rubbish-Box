package com.xhtx.app.posture

import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import android.util.Log

@ReactModule(name = PostureMonitorModule.NAME)
class PostureMonitorModule(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "PostureMonitorModule"
        private const val TAG = "PostureMonitorModule"
        
        // 保存服务实例的引用
        var serviceInstance: PostureMonitorService? = null
    }

    override fun getName(): String = NAME

    /**
     * 启动后台坐姿监控服务
     * @param enableDebug 是否启用调试模式（显示浮窗）
     */
    @ReactMethod
    fun startMonitoringService(enableDebug: Boolean, promise: Promise) {
        try {
            val context = reactApplicationContext
            
            // 如果启用调试模式，检查悬浮窗权限
            if (enableDebug && android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                if (!android.provider.Settings.canDrawOverlays(context)) {
                    Log.w(TAG, "⚠️ 缺少悬浮窗权限，无法显示调试浮窗")
                    // 仍然启动服务，但不显示浮窗
                    PostureMonitorService.start(context, reactApplicationContext, false)
                    promise.resolve(true)
                    return
                }
            }
            
            PostureMonitorService.start(context, reactApplicationContext, enableDebug)
            
            Log.d(TAG, "后台监控服务已启动${if (enableDebug) "（调试模式）" else ""}")
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "启动服务失败: ${e.message}", e)
            promise.reject("START_ERROR", "启动服务失败: ${e.message}", e)
        }
    }
    
    /**
     * 检查是否有悬浮窗权限
     */
    @ReactMethod
    fun checkOverlayPermission(promise: Promise) {
        try {
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                val hasPermission = android.provider.Settings.canDrawOverlays(reactApplicationContext)
                promise.resolve(hasPermission)
            } else {
                promise.resolve(true) // Android 6.0 以下默认有权限
            }
        } catch (e: Exception) {
            Log.e(TAG, "检查悬浮窗权限失败: ${e.message}", e)
            promise.reject("CHECK_ERROR", "检查悬浮窗权限失败: ${e.message}", e)
        }
    }
    
    /**
     * 请求悬浮窗权限
     */
    @ReactMethod
    fun requestOverlayPermission(promise: Promise) {
        try {
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                val intent = android.content.Intent(
                    android.provider.Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    android.net.Uri.parse("package:${reactApplicationContext.packageName}")
                )
                intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
                reactApplicationContext.startActivity(intent)
                promise.resolve(true)
            } else {
                promise.resolve(true) // Android 6.0 以下不需要请求
            }
        } catch (e: Exception) {
            Log.e(TAG, "请求悬浮窗权限失败: ${e.message}", e)
            promise.reject("REQUEST_ERROR", "请求悬浮窗权限失败: ${e.message}", e)
        }
    }

    /**
     * 停止后台坐姿监控服务
     */
    @ReactMethod
    fun stopMonitoringService(promise: Promise) {
        try {
            val context = reactApplicationContext
            PostureMonitorService.stop(context)
            
            Log.d(TAG, "后台监控服务已停止")
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "停止服务失败: ${e.message}", e)
            promise.reject("STOP_ERROR", "停止服务失败: ${e.message}", e)
        }
    }

    /**
     * 检查服务是否正在运行
     */
    @ReactMethod
    fun isServiceRunning(promise: Promise) {
        try {
            promise.resolve(PostureMonitorService.isRunning)
        } catch (e: Exception) {
            promise.reject("CHECK_ERROR", "检查服务状态失败: ${e.message}", e)
        }
    }

    /**
     * 导出常量到 JavaScript
     */
    override fun getConstants(): MutableMap<String, Any> {
        return hashMapOf(
            "EVENT_FRAME_CAPTURED" to "onCameraFrame"
        )
    }
}

