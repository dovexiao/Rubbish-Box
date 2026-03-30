package com.boklock.m

import android.app.Application
import android.content.res.Configuration
import android.util.Log
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader
import com.boklock.m.NativeModules.AppPackage
import com.boklock.m.NativeModules.BluetoothManagerPackage
import com.boklock.m.NativeModules.MobPushPackage
import com.mob.MobSDK
import java.io.File
import com.wechatlib.WeChatLibPackage

class MainApplication : Application(), ReactApplication {

  private val mReactNativeHost: ReactNativeHost =
    object : DefaultReactNativeHost(this) {
      override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

      override fun getPackages(): List<ReactPackage> =
        PackageList(this).packages.apply {
          add(AppPackage())
          add(BluetoothManagerPackage())
          add(MobPushPackage())
          add(WeChatLibPackage())
        }

      override fun getJSMainModuleName(): String = "index"

      override fun getBundleAssetName(): String = "index.android.bundle"

      override fun getJSBundleFile(): String? {
        val jsBundleFile = super.getJSBundleFile()
        val dir = filesDir.absolutePath + File.separator + "boklock" + File.separator + "bundle" + File.separator

        if (BuildConfig.DEBUG) {
          return jsBundleFile
        }

        // 如果不存在版本文件，则直接使用默认的bundle，一般是新安装apk的时候
        val versionFile = dir + "version"
        val verFile = File(versionFile)
        if (!verFile.exists()) {
          return jsBundleFile
        }

        // 读取远程增量包版本
        val bundleVersionStr = try {
          verFile.readLines()[0].trim()
        } catch (e: Exception) {
          Log.e("jsBundleFile", "读取版本文件失败: ${e.localizedMessage}")
          return jsBundleFile
        }

        val customJsBundleFile = dir + "index.android.bundle"
        val file = File(customJsBundleFile)
        if (!file.exists()) {
          return jsBundleFile
        }

        // 本地函数：对 x.y.z 语义化版本的简单比较（非严格）
        fun compareSemver(a: String, b: String): Int {
          val af = a.split(".").mapNotNull { it.toIntOrNull() }
          val bf = b.split(".").mapNotNull { it.toIntOrNull() }
          if (af.isEmpty() || bf.isEmpty()) return 0
          val max = maxOf(af.size, bf.size)
          for (i in 0 until max) {
            val ai = if (i < af.size) af[i] else 0
            val bi = if (i < bf.size) bf[i] else 0
            if (ai != bi) return ai.compareTo(bi)
          }
          return 0
        }

        val deployVerStr = BuildConfig.DEPLOY_VERSION ?: ""
        val deployVerLong = deployVerStr.toLongOrNull()
        val bundleVerLong = bundleVersionStr.toLongOrNull()

        val useIncremental = when {
          deployVerLong != null && bundleVerLong != null -> deployVerLong < bundleVerLong
          else -> compareSemver(deployVerStr, bundleVersionStr) < 0
        }

        return if (useIncremental) {
          Log.e("jsBundleFile", "使用增量包 ($bundleVersionStr)")
          customJsBundleFile
        } else {
          jsBundleFile
        }
      }

      override val isNewArchEnabled: Boolean
        get() = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED

      override val isHermesEnabled: Boolean?
        get() = BuildConfig.IS_HERMES_ENABLED
    }

  override fun getReactNativeHost(): ReactNativeHost = mReactNativeHost

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, false)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      DefaultNewArchitectureEntryPoint.load()
    }
    
    // 初始化应用时，由于用户还未同意隐私协议，强制设置为否，阻止 MobSDK 收集隐私信息
    try {
      val prefs = getSharedPreferences("AppPrefs", android.content.Context.MODE_PRIVATE)
      val agreed = prefs.getBoolean("privacy_agreed", false)
      MobSDK.submitPolicyGrantResult(agreed)
    } catch (e: Throwable) {
      Log.w("MobSDK", "MobSDK.submitPolicyGrantResult failed: ${e.localizedMessage}")
    }
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
  }
}
