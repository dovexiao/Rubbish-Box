# Android 全屏功能实现指南

## 概述
本项目实现了完整的Android沉浸式全屏功能，应用始终保持全屏状态。使用`WindowInsetsControllerCompat` API隐藏系统栏（状态栏和导航栏），用户可以通过边缘滑动手势临时查看系统信息，系统栏会自动隐藏，确保最佳的学习体验。

## 核心实现

### 1. MainActivity.kt 配置

在`MainActivity.kt`中实现了以下功能：

```kotlin
private fun setupFullscreen() {
    // 确保内容可以延伸到系统栏后面
    WindowCompat.setDecorFitsSystemWindows(window, false)
    
    // 获取WindowInsetsController
    val windowInsetsController = WindowCompat.getInsetsController(window, window.decorView)
    windowInsetsController?.let { controller ->
        // 隐藏系统栏（同时隐藏状态栏和导航栏）
        controller.hide(WindowInsetsCompat.Type.systemBars())
        
        // 设置系统栏行为
        controller.systemBarsBehavior = 
            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    }
    
    // 保持屏幕常亮（可选）
    window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
}
```

### 2. 依赖配置

在`android/app/build.gradle`中添加了必要的依赖：

```gradle
dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
}
```

## 核心配置说明

### 当前配置

应用采用以下配置实现沉浸式全屏体验：

#### 1. 隐藏所有系统栏
```kotlin
controller.hide(WindowInsetsCompat.Type.systemBars())
```
同时隐藏状态栏和导航栏，提供完整的全屏体验。

#### 2. 临时显示系统栏行为
```kotlin
controller.systemBarsBehavior = 
    WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
```
- **交互方式**：用户从屏幕边缘滑动可临时显示系统栏
- **显示效果**：系统栏叠加在应用内容之上，半透明显示
- **自动隐藏**：短时间（约3-5秒）后自动隐藏
- **适用场景**：教育类应用、阅读应用、沉浸式学习环境

## 自动维护全屏状态

实现了`onWindowFocusChanged`回调来确保全屏状态：

```kotlin
override fun onWindowFocusChanged(hasFocus: Boolean) {
    super.onWindowFocusChanged(hasFocus)
    // 当窗口重新获得焦点时，确保全屏状态
    if (hasFocus) {
        setupFullscreen()
    }
}
```

这样可以确保：
- 从其他应用返回时重新进入全屏
- 从通知栏返回时重新进入全屏
- 从最近任务列表返回时重新进入全屏

## 自定义状态栏组件

项目还实现了React Native层面的自定义状态栏组件（`src/components/StatusBar.tsx`），用于在隐藏系统状态栏后显示自定义的状态栏内容。

### 特点：
- 显示当前时间
- 显示WiFi图标
- 支持明暗主题切换
- 使用rpx响应式单位
- 固定高度：`38.28125rpx` (98px转rpx)

### 使用示例：
```typescript
import { StatusBar } from "../components/StatusBar"

<StatusBar theme="dark" backgroundColor="transparent" translucent={true} />
```

## 屏幕常亮配置

应用默认启用了屏幕常亮功能，防止学习过程中屏幕自动熄灭：

```kotlin
window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
```

这对于教育应用非常重要，确保学生在观看内容、做题或阅读时不会被屏幕熄灭打断。

## 兼容性说明

- **最低Android版本**：Android 5.0 (API 21)
- **推荐Android版本**：Android 11 (API 30) 及以上
- **WindowInsetsControllerCompat**：兼容所有Android版本，自动处理不同版本的API差异

## 测试建议

1. **不同Android版本测试**：
   - Android 5.0-6.0：测试基本功能
   - Android 7.0-10.0：测试手势交互
   - Android 11+：测试最新API行为

2. **不同场景测试**：
   - 从其他应用切换回来
   - 从通知栏返回
   - 从最近任务列表返回
   - 旋转屏幕
   - 分屏模式

3. **手势测试**：
   - 从顶部边缘下滑（显示状态栏）
   - 从底部边缘上滑（显示导航栏）
   - 验证系统栏自动隐藏时间

## 故障排除

### 系统栏没有隐藏
1. 确认`androidx.core:core-ktx`依赖已正确添加
2. 检查`setupFullscreen()`是否被调用
3. 验证Android版本兼容性

### 系统栏频繁显示
1. 检查`systemBarsBehavior`配置
2. 避免使用`BEHAVIOR_SHOW_BARS_BY_TOUCH`
3. 确保`onWindowFocusChanged`正确实现

### 内容被系统栏遮挡
1. 确认调用了`WindowCompat.setDecorFitsSystemWindows(window, false)`
2. 在React Native布局中添加适当的内边距
3. 使用`useSafeAreaInsets()`获取安全区域

## 实现效果

当前实现确保应用始终保持全屏状态：
- ✅ 启动时自动进入全屏
- ✅ 从其他应用返回时自动恢复全屏
- ✅ 用户可以通过边缘滑动手势临时查看系统栏
- ✅ 系统栏会在短时间后自动隐藏
- ✅ 屏幕保持常亮

## 参考资料

- [Android WindowInsetsController 官方文档](https://developer.android.com/reference/androidx/core/view/WindowInsetsControllerCompat)
- [全屏模式最佳实践](https://developer.android.com/training/system-ui/immersive)
- [WindowInsets 指南](https://developer.android.com/develop/ui/views/layout/edge-to-edge)






package com.xhtx.app
import expo.modules.splashscreen.SplashScreenManager

import android.os.Build
import android.os.Bundle
import android.view.WindowManager

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

import expo.modules.ReactActivityDelegateWrapper

import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat

class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    // Set the theme to AppTheme BEFORE onCreate to support
    // coloring the background, status bar, and navigation bar.
    // This is required for expo-splash-screen.
    // setTheme(R.style.AppTheme);
    // @generated begin expo-splashscreen - expo prebuild (DO NOT MODIFY) sync-f3ff59a738c56c9a6119210cb55f0b613eb8b6af
    SplashScreenManager.registerOnActivity(this)
    // @generated end expo-splashscreen
    super.onCreate(null)
    
    // 设置全屏模式
    setupFullscreen()
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "main"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return ReactActivityDelegateWrapper(
          this,
          BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
          object : DefaultReactActivityDelegate(
              this,
              mainComponentName,
              fabricEnabled
          ){})
  }

  /**
    * Align the back button behavior with Android S
    * where moving root activities to background instead of finishing activities.
    * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
    */
  override fun invokeDefaultOnBackPressed() {
      if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
          if (!moveTaskToBack(false)) {
              // For non-root activities, use the default implementation to finish them.
              super.invokeDefaultOnBackPressed()
          }
          return
      }

      // Use the default back button implementation on Android S
      // because it's doing more than [Activity.moveTaskToBack] in fact.
      super.invokeDefaultOnBackPressed()
  }

  /**
   * 设置沉浸式全屏模式
   */
  private fun setupFullscreen() {
    // 确保内容可以延伸到系统栏后面
    WindowCompat.setDecorFitsSystemWindows(window, false)
    
    // 获取WindowInsetsController
    val windowInsetsController = WindowCompat.getInsetsController(window, window.decorView)
    windowInsetsController?.let { controller ->
        // 隐藏系统栏（同时隐藏状态栏和导航栏）
        controller.hide(WindowInsetsCompat.Type.systemBars())
        
        // 设置系统栏行为 - 用户可以通过边缘滑动临时显示系统栏
        controller.systemBarsBehavior = 
            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    }
    
    // 保持屏幕常亮
    window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
  }

  /**
   * 当窗口焦点改变时，确保全屏状态
   */
  override fun onWindowFocusChanged(hasFocus: Boolean) {
    super.onWindowFocusChanged(hasFocus)
    // 当窗口重新获得焦点时，确保全屏状态
    if (hasFocus) {
        setupFullscreen()
    }
  }
}
