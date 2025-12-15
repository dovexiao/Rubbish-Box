package com.xhtx.app

import android.content.Intent
import android.provider.Settings
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * 系统设置打开模块
 * 用于打开 Android 系统设置页面，使用原生 Intent 确保每次都能打开
 */
class SystemSettingsModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val TAG = "SystemSettingsModule"
    }

    override fun getName(): String = "SystemSettingsModule"

    /**
     * 打开 WiFi 设置
     */
    @ReactMethod
    fun openWifiSettings(promise: Promise) {
        try {
            val activity = currentActivity
            if (activity == null) {
                promise.reject("NO_ACTIVITY", "Activity不存在")
                return
            }

            val intent = Intent(Settings.ACTION_WIFI_SETTINGS).apply {
                // 使用 FLAG_ACTIVITY_NEW_TASK 确保在新任务中启动
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                // 使用 FLAG_ACTIVITY_CLEAR_TOP 如果活动已存在，清除其上的所有活动
                addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
            }

            activity.startActivity(intent)
            Log.d(TAG, "✅ 已打开 WiFi 设置")
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "❌ 打开 WiFi 设置失败: ${e.message}", e)
            promise.reject("OPEN_ERROR", "打开 WiFi 设置失败: ${e.message}", e)
        }
    }

    /**
     * 打开蓝牙设置
     */
    @ReactMethod
    fun openBluetoothSettings(promise: Promise) {
        try {
            val activity = currentActivity
            if (activity == null) {
                promise.reject("NO_ACTIVITY", "Activity不存在")
                return
            }

            val intent = Intent(Settings.ACTION_BLUETOOTH_SETTINGS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
            }

            activity.startActivity(intent)
            Log.d(TAG, "✅ 已打开蓝牙设置")
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "❌ 打开蓝牙设置失败: ${e.message}", e)
            promise.reject("OPEN_ERROR", "打开蓝牙设置失败: ${e.message}", e)
        }
    }

    /**
     * 打开声音设置
     */
    @ReactMethod
    fun openSoundSettings(promise: Promise) {
        try {
            val activity = currentActivity
            if (activity == null) {
                promise.reject("NO_ACTIVITY", "Activity不存在")
                return
            }

            val intent = Intent(Settings.ACTION_SOUND_SETTINGS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
            }

            activity.startActivity(intent)
            Log.d(TAG, "✅ 已打开声音设置")
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "❌ 打开声音设置失败: ${e.message}", e)
            promise.reject("OPEN_ERROR", "打开声音设置失败: ${e.message}", e)
        }
    }

    /**
     * 打开系统设置主页
     */
    @ReactMethod
    fun openSystemSettings(promise: Promise) {
        try {
            val activity = currentActivity
            if (activity == null) {
                promise.reject("NO_ACTIVITY", "Activity不存在")
                return
            }

            val intent = Intent(Settings.ACTION_SETTINGS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
            }

            activity.startActivity(intent)
            Log.d(TAG, "✅ 已打开系统设置主页")
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "❌ 打开系统设置主页失败: ${e.message}", e)
            promise.reject("OPEN_ERROR", "打开系统设置主页失败: ${e.message}", e)
        }
    }
}
