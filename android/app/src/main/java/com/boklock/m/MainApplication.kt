package com.boklock.m

import android.app.Application
import android.content.res.Configuration
import android.util.Log
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.boklock.m.NativeModules.AppPackage
import com.boklock.m.NativeModules.BluetoothManagerPackage
import com.boklock.m.NativeModules.MobPushPackage
import com.mob.MobSDK
import java.io.File
import java.io.IOException

class MainApplication : Application(), ReactApplication {
  private val newArchEnabled = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
          PackageList(this).packages.apply {
            add(AppPackage())
            add(BluetoothManagerPackage())
            add(MobPushPackage())
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
            android.util.Log.e("jsBundleFile", "读取版本文件失败: ${e.localizedMessage}")
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
            android.util.Log.e("jsBundleFile", "使用增量包 ($bundleVersionStr)")
            customJsBundleFile
          } else {
            jsBundleFile
          }
        }

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(this.applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    try {
      SoLoader.init(this, OpenSourceMergedSoMapping)
    } catch (e: IOException) {
      // Fallback to default init when merged mapping fails.
      SoLoader.init(this, false)
    }
    if (newArchEnabled) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      load()
    }
    try {
      // 初始化 MobSDK，若 plugin 已处理此步则无害
      MobSDK.init(this)
    } catch (e: Throwable) {
      Log.w("MobSDK", "MobSDK.init failed: ${e.localizedMessage}")
    }
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
  }
}
