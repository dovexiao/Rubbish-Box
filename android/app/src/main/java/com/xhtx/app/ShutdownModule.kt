package com.xhtx.app

import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import android.util.Log
import java.io.DataOutputStream

/**
 * ShutdownModule - 关机原生模块
 * 
 * 功能：在 root 过的设备上执行关机命令
 */
@ReactModule(name = ShutdownModule.NAME)
class ShutdownModule(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "ShutdownModule"
        private const val TAG = "ShutdownModule"
    }

    override fun getName(): String = NAME

    /**
     * 关机
     * 
     * 执行 root 命令： su -c "reboot -p"
     * -p 参数表示 power off（关机）
     */
    @ReactMethod
    fun shutdown(promise: Promise) {
        try {
            Log.d(TAG, "开始执行关机命令...")
            
            // 执行 root 命令
            val process = Runtime.getRuntime().exec("su")
            val os = DataOutputStream(process.outputStream)
            
            // 写入关机命令
            os.writeBytes("reboot -p\n")
            os.flush()
            os.writeBytes("exit\n")
            os.flush()
            os.close()
            
            // 等待命令执行
            process.waitFor()
            
            Log.d(TAG, "关机命令已发送")
            promise.resolve(true)
            
        } catch (e: Exception) {
            Log.e(TAG, "关机失败", e)
            promise.reject("SHUTDOWN_ERROR", "关机失败: ${e.message}", e)
        }
    }
    
    /**
     * 重启
     * 
     * 执行 root 命令： su -c "reboot"
     */
    @ReactMethod
    fun reboot(promise: Promise) {
        try {
            Log.d(TAG, "开始执行重启命令...")
            
            // 执行 root 命令
            val process = Runtime.getRuntime().exec("su")
            val os = DataOutputStream(process.outputStream)
            
            // 写入重启命令
            os.writeBytes("reboot\n")
            os.flush()
            os.writeBytes("exit\n")
            os.flush()
            os.close()
            
            // 等待命令执行
            process.waitFor()
            
            Log.d(TAG, "重启命令已发送")
            promise.resolve(true)
            
        } catch (e: Exception) {
            Log.e(TAG, "重启失败", e)
            promise.reject("REBOOT_ERROR", "重启失败: ${e.message}", e)
        }
    }
}

