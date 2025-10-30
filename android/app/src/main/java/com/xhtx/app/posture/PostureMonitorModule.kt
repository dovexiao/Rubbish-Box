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
     */
    @ReactMethod
    fun startMonitoringService(promise: Promise) {
        try {
            val context = reactApplicationContext
            PostureMonitorService.start(context, reactApplicationContext)
            
            Log.d(TAG, "后台监控服务已启动")
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "启动服务失败: ${e.message}", e)
            promise.reject("START_ERROR", "启动服务失败: ${e.message}", e)
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

