package com.boklock.m.NativeModules;

import android.os.Build
import android.content.ComponentName
import android.content.pm.PackageManager
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.boklock.m.NativeModules.App.AppUtils
import com.boklock.m.NativeModules.App.FileUtils
import com.mob.MobSDK

import java.io.File
import java.io.IOException
import java.nio.charset.Charset


class AppModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName() = "AppModule"

  private fun getUncompressedSize(zipFilePath: String, charset: String): Long {
    var totalSize: Long = 0
    try {
      val zipFile = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
        net.lingala.zip4j.ZipFile(zipFilePath).apply {
          setCharset(Charset.forName(charset))
        }
      } else {
        net.lingala.zip4j.ZipFile(zipFilePath)
      }

      val files = zipFile.fileHeaders
      for (it in files) {
        val size = it.uncompressedSize
        if (size != -1L) {
          totalSize += size
        }
      }

      zipFile.close()
    } catch (ignored: IOException) {
      return -1
    }
    return totalSize
  }

  @ReactMethod fun installApk(filePath: String) {
    AppUtils.install(reactContext, filePath);
  }

  @ReactMethod fun toggleNotifeeCore(enabled: Boolean) {
    val pm: PackageManager = reactContext.packageManager
    val pkg: String = reactContext.packageName
    val state = if (enabled) PackageManager.COMPONENT_ENABLED_STATE_ENABLED else PackageManager.COMPONENT_ENABLED_STATE_DISABLED
    val components = arrayOf(
      // core services & receivers declared by app.notifee.core
      "app.notifee.core.ReceiverService",
      "app.notifee.core.ForegroundService",
      "app.notifee.core.RebootBroadcastReceiver",
      "app.notifee.core.AlarmPermissionBroadcastReceiver",
      "app.notifee.core.NotificationAlarmReceiver",
      "app.notifee.core.BlockStateBroadcastReceiver",
      // activity that handles notification presses
      "app.notifee.core.NotificationReceiverActivity"
      // 注意：不再切换 NotifeeInitProvider，避免上下文为空导致崩溃
    )
    for (cls in components) {
      try {
        val cn = ComponentName(pkg, cls)
        pm.setComponentEnabledSetting(cn, state, PackageManager.DONT_KILL_APP)
      } catch (_: Exception) {
        // ignore if component not found or cannot be toggled
      }
    }
  }

  /**
   * MobSDK 隐私协议授权结果提交
   * 必须在用户同意隐私协议后调用，否则 MobSDK 无法正常工作
   */
  @ReactMethod fun submitPolicyGrantResult(agree: Boolean) {
    try {
      MobSDK.submitPolicyGrantResult(agree)
    } catch (e: Exception) {
      // 忽略错误，避免崩溃
    }
  }

  @ReactMethod fun toggleMobPushOEM(enabled: Boolean) {
    val pm: PackageManager = reactContext.packageManager
    val pkg: String = reactContext.packageName
    val state = if (enabled) PackageManager.COMPONENT_ENABLED_STATE_ENABLED else PackageManager.COMPONENT_ENABLED_STATE_DISABLED
    // OEM&SDK receivers/services seen in merged manifest at runtime (via dumpsys)
    val components = arrayOf(
      // Xiaomi
      "com.mob.pushsdk.plugins.xiaomi.PushXiaoMiRevicer",
      "com.xiaomi.push.service.receivers.PingReceiver",
      // Meizu
      "com.mob.pushsdk.plugins.meizu.PushMeiZuRevicer",
      "com.meizu.cloud.pushsdk.MzPushSystemReceiver",
      // Vivo
      "com.mob.pushsdk.plugins.vivo.MobVivo.MobPushVivoReceiver",
      // Oppo (class name may vary by SDK version; best-effort common one)
      "com.mob.pushsdk.plugins.oppo.PushOppoReceiver",
      // Huawei/Honor (Mob SDK bridge services + HMS receivers/services)
      "com.mob.pushsdk.plugins.huawei.HuaweiPushService",
      "com.mob.pushsdk.plugins.honor.HonorPushService",
      "com.huawei.hms.support.api.push.PushReceiver",
      "com.huawei.hms.support.api.push.PushMsgReceiver",
      "com.huawei.hms.support.api.push.service.HmsMsgService",
      // Mob SDK internal receivers
      "com.mob.pushsdk.impl.NotifyActionReceiver",
      "com.mob.pushsdk.impl.MobLReceiver"
    )
    for (cls in components) {
      try {
        val cn = ComponentName(pkg, cls)
        pm.setComponentEnabledSetting(cn, state, PackageManager.DONT_KILL_APP)
      } catch (_: Exception) {
        // ignore if component not found or cannot be toggled
      }
    }
  }

  @ReactMethod fun unzip(zipFilePath: String, destDirectory: String, charset: String, promise: Promise) {
    Thread(Runnable {
      // Check the file exists
      try {
        File(zipFilePath)
      } catch (e: NullPointerException) {
        promise.reject("FILE_ERROR", "Couldn't open file $zipFilePath. ")
        return@Runnable
      }

      try {
        // Find the total uncompressed size of every file in the zip, so we can
        // get an accurate progress measurement
//        val totalUncompressedBytes = getUncompressedSize(zipFilePath, charset)

        val destDir = File(destDirectory)
        if (!destDir.exists()) {
          destDir.mkdirs()
        }

        // We use arrays here so we can update values
        // from inside the callback
//        val extractedBytes = 0L
//        val lastPercentage = 0

        val zipFile = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
          net.lingala.zip4j.ZipFile(zipFilePath).apply {
            setCharset(Charset.forName(charset))
          }
        } else {
          net.lingala.zip4j.ZipFile(zipFilePath)
        }

        zipFile.extractAll(destDirectory)

        zipFile.close()
        promise.resolve(destDirectory)
      } catch (ex: Exception) {
        promise.reject("EXTRACT_ERROR", "Failed to extract file ${ex.localizedMessage}")
      }
    }).start()
  }

  override fun getConstants(): Map<String, Any?> {
    val constants: MutableMap<String, Any?> = HashMap()
    val dirPath = reactContext.filesDir.absolutePath;
    val cacheDirPath = FileUtils.getCacheDirectory(reactContext).getAbsolutePath();
    constants["cacheDirPath"] = cacheDirPath
    constants["dirPath"] = dirPath
    return constants
  }
}
