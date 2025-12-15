package com.xhtx.app

import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * 系统属性读取模块
 * 用于读取 Android ro 属性，无需权限
 */
class SystemPropertiesModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val TAG = "SystemPropertiesModule"
    }

    override fun getName(): String = "SystemPropertiesModule"

    /**
     * 获取设备序列号（从 ro.serialno）
     */
    @ReactMethod
    fun getSerialNumber(promise: Promise) {
        try {
            val serialNumber = getSystemProperty("ro.serialno")
            if (serialNumber.isNotEmpty() && serialNumber != "unknown") {
                Log.d(TAG, "✅ 从 ro.serialno 读取到序列号: $serialNumber")
                promise.resolve(serialNumber)
            } else {
                // 尝试其他属性
                val alternatives = listOf(
                    "ro.boot.serialno",
                    "ril.serialnumber",
                    "ro.serialno"
                )
                
                for (prop in alternatives) {
                    val value = getSystemProperty(prop)
                    if (value.isNotEmpty() && value != "unknown") {
                        Log.d(TAG, "✅ 从 $prop 读取到序列号: $value")
                        promise.resolve(value)
                        return
                    }
                }
                
                Log.w(TAG, "⚠️ 未能从系统属性读取到有效序列号")
                promise.resolve("")
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ 读取序列号失败: ${e.message}", e)
            promise.reject("READ_ERROR", "读取序列号失败: ${e.message}", e)
        }
    }

    /**
     * 读取任意系统属性
     */
    @ReactMethod
    fun getProperty(key: String, promise: Promise) {
        try {
            val value = getSystemProperty(key)
            promise.resolve(value)
        } catch (e: Exception) {
            Log.e(TAG, "❌ 读取系统属性失败: ${e.message}", e)
            promise.reject("READ_ERROR", "读取系统属性失败: ${e.message}", e)
        }
    }

    /**
     * 使用反射读取系统属性
     */
    private fun getSystemProperty(key: String): String {
        return try {
            val systemProperties = Class.forName("android.os.SystemProperties")
            val getMethod = systemProperties.getMethod("get", String::class.java)
            getMethod.invoke(null, key) as? String ?: ""
        } catch (e: Exception) {
            Log.w(TAG, "读取系统属性 $key 失败: ${e.message}")
            ""
        }
    }

    /**
     * 获取所有常用的设备标识信息
     */
    @ReactMethod
    fun getAllDeviceIdentifiers(promise: Promise) {
        try {
            val identifiers = com.facebook.react.bridge.Arguments.createMap()
            
            // 尝试读取多个可能的序列号属性
            val properties = listOf(
                "ro.serialno",
                "ro.boot.serialno",
                "ril.serialnumber",
                "ro.product.model",
                "ro.product.brand",
                "ro.product.manufacturer",
                "ro.build.id",
                "ro.build.display.id"
            )
            
            for (prop in properties) {
                val value = getSystemProperty(prop)
                if (value.isNotEmpty()) {
                    identifiers.putString(prop, value)
                }
            }
            
            Log.d(TAG, "✅ 读取到的设备标识")
            promise.resolve(identifiers)
        } catch (e: Exception) {
            Log.e(TAG, "❌ 读取设备标识失败: ${e.message}", e)
            promise.reject("READ_ERROR", "读取设备标识失败: ${e.message}", e)
        }
    }
}

