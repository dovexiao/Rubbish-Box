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
import com.xhtx.app.BuildConfig

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





network_security_config.xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- 允许HTTP流量，因为生产环境也使用HTTP -->
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">8.135.11.47</domain>
        <domain includeSubdomains="true">192.168.31.169</domain>
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">10.0.3.2</domain>
    </domain-config>
    
    <!-- 全局允许HTTP流量（开发和生产环境都需要） -->
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system"/>
        </trust-anchors>
    </base-config>
</network-security-config>





gradle.properties
# Project-wide Gradle settings.

# IDE (e.g. Android Studio) users:
# Gradle settings configured through the IDE *will override*
# any settings specified in this file.

# For more details on how to configure your build environment visit
# http://www.gradle.org/docs/current/userguide/build_environment.html

# Specifies the JVM arguments used for the daemon process.
# The setting is particularly useful for tweaking memory settings.
# Default value: -Xmx512m -XX:MaxMetaspaceSize=256m
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m

# When configured, Gradle will run in incubating parallel mode.
# This option should only be used with decoupled projects. More details, visit
# http://www.gradle.org/docs/current/userguide/multi_project_builds.html#sec:decoupled_projects
org.gradle.parallel=true

# AndroidX package structure to make it clearer which packages are bundled with the
# Android operating system, and which are packaged with your app's APK
# https://developer.android.com/topic/libraries/support-library/androidx-rn
android.useAndroidX=true

# Enable AAPT2 PNG crunching
android.enablePngCrunchInReleaseBuilds=true

# Use this property to specify which architecture you want to build.
# You can also override it from the CLI using
# ./gradlew <task> -PreactNativeArchitectures=x86_64
reactNativeArchitectures=arm64-v8a

# Use this property to enable support to the new architecture.
# This will allow you to use TurboModules and the Fabric render in
# your application. You should enable this flag either if you want
# to write custom TurboModules/Fabric components OR use libraries that
# are providing them.
newArchEnabled=true

# Use this property to enable or disable the Hermes JS engine.
# If set to false, you will be using JSC instead.
hermesEnabled=true

# Enable GIF support in React Native images (~200 B increase)
expo.gif.enabled=true
# Enable webp support in React Native images (~85 KB increase)
expo.webp.enabled=true
# Enable animated webp support (~3.4 MB increase)
# Disabled by default because iOS doesn't support animated webp
expo.webp.animated=false

# Enable network inspector
EX_DEV_CLIENT_NETWORK_INSPECTOR=true

# Use legacy packaging to compress native libraries in the resulting APK.
expo.useLegacyPackaging=false

# Whether the app is configured to use edge-to-edge via the app config or `react-native-edge-to-edge` plugin
expo.edgeToEdgeEnabled=false

# Additional Gradle optimizations
org.gradle.daemon=true
org.gradle.configureondemand=true
org.gradle.caching=true

# Android build optimizations
android.enableSeparateBuildPerCPUArchitecture=false
android.enableAapt2=true
android.enableJetifier=true




 adb logcat -c && echo "日志已清空，准备重启..." && adb reboot && sleep 5 && echo "设备重启中，开始抓取日志..." && adb wait-for-device && adb logcat > ~/Desktop/xhtx-app/xhtx/src/app/ai/boot_rotation_log1.txt



cd /Users/zhoudabo/Desktop/xhtx-app/xhtx && adb shell dumpsys media.camera | grep -A 5 -B 5 "122.*V4L2\|Current V4L2.*122"

cd /Users/zhoudabo/Desktop/xhtx-app/xhtx && adb shell dumpsys media.camera | grep -A 5 -B 5 "120\|device.*120\|camera.*120"

# Expo 调试模式相关 adb 命令

# 1. 打开 Expo 开发者菜单（最常用）
adb shell input keyevent 82

# 2. 或者使用菜单键代码
adb shell input keyevent KEYCODE_MENU

# 3. 打开开发者选项（Android 系统设置）
adb shell am start -a android.settings.APPLICATION_DEVELOPMENT_SETTINGS

# 4. 重新加载应用（在开发者菜单打开后）
adb shell input text "r"

# 5. 打开调试器（在开发者菜单打开后）
adb shell input text "d"

# 6. 显示性能监控（在开发者菜单打开后）
adb shell input text "p"

# 7. 组合命令：打开菜单并等待
adb shell input keyevent 82 && sleep 1

# 8. 检查 Expo 开发服务器连接
adb reverse tcp:8081 tcp:8081
adb reverse tcp:19000 tcp:19000
adb reverse tcp:19001 tcp:19001

# 9. 查看 Expo 相关日志
adb logcat | grep -i expo

# 10. 清除应用数据并重启（用于调试）
adb shell pm clear com.xhtx.app && adb shell am start -n com.xhtx.app/.MainActivity







# XHTX React Native + Expo 项目开发规范

## 架构规范
- 使用 expo-router 文件系统路由，_layout.tsx 定义布局
- (tabs)/ (auth)/ 等括号目录为路由组，不影响URL
- 页面组件必须有JSDoc注释，标注"100%还原UniApp项目"

## 样式规范
- 必须使用 createStyles 和 rpx 单位（from "../utils/rpxStyleSheet"）
- 页面背景统一使用 LinearGradient：colors={["#93abff", "#e4f4ff", "#cdedff", "#ffffff"]}
- 禁止使用 StyleSheet.create

## 组件规范
- 导入顺序：React → RN → 第三方 → 自定义组件 → Utils/Services
- 使用函数组件 + Hooks
- 必须包含 <StatusBar theme="dark" />
- 使用 useFocusEffect 处理页面聚焦
- 使用 InteractionManager.runAfterInteractions 优化性能

## 状态管理
- 用户信息使用 useUserStore，坐姿监测使用 usePostureStore
- 页面加载时调用 userStore.initializeFromStorage()
- 避免直接操作 AsyncStorage

## API调用
- 所有API必须通过 Service 层调用（services/xxx.ts）
- 使用 try-catch 处理错误，显示加载状态
- 并行请求使用 Promise.all()

## 性能优化
- 数据加载使用 InteractionManager
- 使用 useMemo 缓存计算结果
- 使用 useCallback 缓存回调函数
- 列表使用 FlatList 优化

## 路由导航
- 使用 router.push()/replace()/back()
- 认证页面在 (auth)/_layout.tsx 实现路由守卫
- 带参数跳转使用 { pathname, params } 对象

## 命名规范
- 组件名：PascalCase，文件名：kebab-case
- 函数名/变量：camelCase，常量：UPPER_CASE
- TypeScript 必须完整类型注解

## 特殊功能
- 使用 globalImmersive.forceRestore() 恢复沉浸式
- 统一使用 showLoginModal 登录弹窗系统
- 图片资源使用 Images 常量（from "../constants/Assets"）
- 横屏锁定使用 ScreenOrientation.lockAsync(LANDSCAPE)

## UI/UX
- 必须实现加载状态显示（ActivityIndicator）
- TouchableOpacity 使用 activeOpacity={0.8}
- 操作结果使用 Alert.alert 提示









import { useState, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
} from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { StatusBar } from "../../components/StatusBar"
import { NavBar } from "../../components/NavBar"
import { createStyles, rpx } from "../../utils/rpxStyleSheet"
import { showSuccess, showInfo, showWarning } from "../../utils/toast"
import { showConfirm, showDanger } from "../../utils/dialog"

interface PhotoInfo {
  path: string
  id: string
  timestamp: number
}

/**
 * 照片管理页面
 * 100%还原UniApp项目 /src/pages/AI/photo-manager.vue
 * 多张照片上传管理，用于AI批改
 */
export default function PhotoManagerScreen() {
  const _router = useRouter()
  const params = useLocalSearchParams()

  const [photos, setPhotos] = useState<PhotoInfo[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [currentPreviewPhoto, setCurrentPreviewPhoto] = useState<PhotoInfo>({
    path: "",
    id: "",
    timestamp: 0,
  })
  const [previewIndex, setPreviewIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 生成照片ID
  const generatePhotoId = () => {
    return "photo_" + Date.now() + "_" + Math.random().toString(36).slice(2)
  }

  // 初始化照片列表
  useEffect(() => {
    const initPhotos = async () => {
      if (params.imagePath) {
        // 从拍照页面跳转过来，添加新照片
        const newPhoto: PhotoInfo = {
          path: params.imagePath as string,
          id: generatePhotoId(),
          timestamp: Date.now(),
        }

        // 从本地存储恢复之前的照片
        const savedPhotosStr = await AsyncStorage.getItem("temp_photos")
        const savedPhotos = savedPhotosStr ? JSON.parse(savedPhotosStr) : []
        const allPhotos = [...savedPhotos, newPhoto]
        setPhotos(allPhotos)

        // 保存到本地存储
        await AsyncStorage.setItem("temp_photos", JSON.stringify(allPhotos))
      } else {
        // 恢复之前保存的照片
        const savedPhotosStr = await AsyncStorage.getItem("temp_photos")
        if (savedPhotosStr) {
          setPhotos(JSON.parse(savedPhotosStr))
        }
      }
    }

    initPhotos()
  }, [params.imagePath])

  // 页面卸载时清空缓存（除非是正常提交）
  useEffect(() => {
    return () => {
      if (!isSubmitting) {
        AsyncStorage.removeItem("temp_photos")
      }
    }
  }, [isSubmitting])

  // 继续拍照
  const takeMorePhotos = async () => {
    // 保存当前照片到本地存储
    await AsyncStorage.setItem("temp_photos", JSON.stringify(photos))

    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) {
      showWarning("需要相机权限才能拍照")
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: false,
    })

    if (!result.canceled && result.assets[0]) {
      const newPhoto: PhotoInfo = {
        path: result.assets[0].uri,
        id: generatePhotoId(),
        timestamp: Date.now(),
      }

      // 从本地存储恢复之前的照片并添加新照片
      const savedPhotosStr = await AsyncStorage.getItem("temp_photos")
      const savedPhotos = savedPhotosStr ? JSON.parse(savedPhotosStr) : []
      const allPhotos = [...savedPhotos, newPhoto]
      setPhotos(allPhotos)

      // 保存到本地存储
      await AsyncStorage.setItem("temp_photos", JSON.stringify(allPhotos))
    }
  }

  // 预览照片
  const previewPhoto = (photo: PhotoInfo, index: number) => {
    setCurrentPreviewPhoto(photo)
    setPreviewIndex(index)
    setShowPreview(true)
  }

  // 关闭预览
  const closePreview = () => {
    setShowPreview(false)
  }

  // 删除照片
  const deletePhoto = async (index: number) => {
    showDanger("确认删除", "确定要删除这张照片吗？", async () => {
      const newPhotos = photos.filter((_, i) => i !== index)
      setPhotos(newPhotos)
      await AsyncStorage.setItem("temp_photos", JSON.stringify(newPhotos))
      showSuccess("已删除")
    })
  }

  // 删除当前预览的照片
  const deleteCurrentPreview = () => {
    deletePhoto(previewIndex)
    closePreview()
  }

  // 重拍当前照片
  const retakeCurrentPhoto = async () => {
    // 删除当前照片
    const newPhotos = photos.filter((_, i) => i !== previewIndex)
    setPhotos(newPhotos)
    await AsyncStorage.setItem("temp_photos", JSON.stringify(newPhotos))

    closePreview()

    // 跳转到拍照页面
    takeMorePhotos()
  }

  // 清空所有照片
  const clearAllPhotos = () => {
    showDanger("确认清空", "确定要清空所有照片吗？此操作不可恢复。", async () => {
      setPhotos([])
      await AsyncStorage.removeItem("temp_photos")
      showSuccess("已清空")
    })
  }

  // 提交照片进行AI批改
  const submitPhotos = () => {
    if (photos.length === 0) {
      showWarning("请先拍摄照片")
      return
    }

    showConfirm("确认提交", `确定要提交 ${photos.length} 张照片进行AI批改吗？`, async () => {
      setIsSubmitting(true)
      await AsyncStorage.removeItem("temp_photos")
      // TODO: 上传照片并跳转到AI加载页面
      showInfo("上传功能开发中")
    })
  }

  return (
    <LinearGradient
      colors={["#93ABFF", "#E4F4FF", "#ECF8FF", "#FFFFFF"]}
      locations={[-0.1128, 0.1494, 0.8474, 1.0586]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.photoManager}
    >
      <View style={styles.header}>
        <StatusBar theme="dark" />
        <NavBar title="照片管理" leftArrow />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 顶部提示 */}
        <View style={styles.tipSection}>
          <View style={styles.tipText}>
            <Text style={styles.tipIcon}>📷</Text>
            <Text style={styles.tipContent}>
              已拍摄 {photos.length} 张照片，最多可拍摄 9 张
            </Text>
          </View>
        </View>

        {/* 照片网格 */}
        <View style={styles.photoGrid}>
          {/* 已拍摄的照片 */}
          {photos.map((photo, index) => (
            <TouchableOpacity
              key={photo.id}
              style={styles.photoItem}
              onPress={() => previewPhoto(photo, index)}
              activeOpacity={0.8}
            >
              <Image source={{ uri: photo.path }} style={styles.photoImage} resizeMode="cover" />
              <View style={styles.photoOverlay}>
                <Text style={styles.photoIndex}>{index + 1}</Text>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={(e) => {
                    e.stopPropagation()
                    deletePhoto(index)
                  }}
                >
                  <Ionicons name="close" size={rpx(12)} color="#fff" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}

          {/* 添加照片按钮 */}
          {photos.length < 9 && (
            <TouchableOpacity
              style={styles.addPhotoBtn}
              onPress={takeMorePhotos}
              activeOpacity={0.8}
            >
              <Ionicons name="camera" size={rpx(40)} color="#999" />
              <Text style={styles.addText}>继续拍照</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 空状态 */}
        {photos.length === 0 && (
          <View style={styles.emptyState}>
            <Image
              source={require("../../../assets/images/camera.png")}
              style={styles.emptyIcon}
              resizeMode="contain"
            />
            <Text style={styles.emptyTitle}>还没有拍摄照片</Text>
            <Text style={styles.emptyDesc}>点击下方按钮开始拍照</Text>
            <TouchableOpacity
              style={[styles.btnPrimary, styles.emptyBtn]}
              onPress={takeMorePhotos}
              activeOpacity={0.8}
            >
              <Ionicons name="camera" size={rpx(15)} color="#fff" />
              <Text style={styles.btnPrimaryText}>开始拍照</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* 操作按钮区域 */}
      {photos.length > 0 && (
        <View style={styles.actionSection}>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={clearAllPhotos}
              activeOpacity={0.8}
            >
              <Ionicons name="trash" size={rpx(15)} color="#666" />
              <Text style={styles.btnSecondaryText}>清空照片</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={submitPhotos}
              activeOpacity={0.8}
              disabled={isSubmitting}
            >
              <Ionicons name="checkmark" size={rpx(15)} color="#fff" />
              <Text style={styles.btnPrimaryText}>
                {isSubmitting ? "提交中..." : `提交批改 (${photos.length})`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 照片预览弹窗 */}
      <Modal
        visible={showPreview}
        transparent
        animationType="fade"
        onRequestClose={closePreview}
      >
        <TouchableOpacity
          style={styles.previewModal}
          activeOpacity={1}
          onPress={closePreview}
        >
          <View style={styles.previewContent} onStartShouldSetResponder={() => true}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>照片 {previewIndex + 1}</Text>
              <TouchableOpacity style={styles.previewClose} onPress={closePreview}>
                <Ionicons name="close" size={rpx(18)} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.previewImageContainer}>
              <Image
                source={{ uri: currentPreviewPhoto.path }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.previewActions}>
              <TouchableOpacity
                style={[styles.previewBtn, styles.previewBtnDelete]}
                onPress={deleteCurrentPreview}
                activeOpacity={0.8}
              >
                <Ionicons name="trash" size={rpx(15)} color="#FF4D4D" />
                <Text style={styles.previewBtnDeleteText}>删除</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.previewBtn, styles.previewBtnRetake]}
                onPress={retakeCurrentPhoto}
                activeOpacity={0.8}
              >
                <Ionicons name="camera" size={rpx(15)} color="#fff" />
                <Text style={styles.previewBtnRetakeText}>重拍</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </LinearGradient>
  )
}

const styles = createStyles({
  photoManager: {
    width: "100%",
    height: "100%",
    minWidth: 750,
    minHeight: "100%",
    flexDirection: "column",
  },
  header: {
    flexShrink: 0,
  },
  content: {
    flex: 1,
    padding: 4,
  },
  // 提示区域
  tipSection: {
    marginBottom: 4,
  },
  tipText: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 6,
  },
  tipIcon: {
    marginRight: 8,
    fontSize: 14,
  },
  tipContent: {
    fontSize: 8.6,
    color: "#666",
  },
  // 照片网格
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 32,
  },
  photoItem: {
    position: "relative",
    width: "14.66%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F5F5F5",
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  photoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 8,
  },
  photoIndex: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 10,
    fontWeight: "bold",
  },
  deleteBtn: {
    backgroundColor: "rgba(255, 0, 0, 0.8)",
    width: 24,
    height: 24,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  // 添加照片按钮
  addPhotoBtn: {
    width: "14.66%",
    aspectRatio: 1,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#ccc",
    borderRadius: 12,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  addText: {
    fontSize: 10,
    color: "#999",
    marginTop: 8,
  },
  // 操作按钮区域
  actionSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 24,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 16,
  },
  btnSecondary: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  btnSecondaryText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#666",
  },
  btnPrimary: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    // Note: Use LinearGradient component for gradient background
    backgroundColor: "#4891FF",
  },
  btnPrimaryText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },
  // 空状态
  emptyState: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingVertical: 80,
    textAlign: "center",
  },
  emptyIcon: {
    width: 80,
    height: 80,
    marginBottom: 24,
    opacity: 0.3,
  },
  emptyTitle: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 12,
    color: "#999",
    marginBottom: 32,
  },
  emptyBtn: {
    width: 200,
  },
  // 预览弹窗
  previewModal: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  previewContent: {
    width: "90%",
    maxWidth: 600,
    backgroundColor: "#000",
    borderRadius: 16,
    overflow: "hidden",
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  previewTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  previewClose: {
    width: 32,
    height: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  previewImageContainer: {
    width: "100%",
    height: 400,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  previewImage: {
    maxWidth: "100%",
    maxHeight: "100%",
  },
  previewActions: {
    flexDirection: "row",
    padding: 16,
    gap: 16,
  },
  previewBtn: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  previewBtnDelete: {
    backgroundColor: "rgba(255, 77, 77, 0.2)",
    borderWidth: 1,
    borderColor: "#FF4D4D",
  },
  previewBtnDeleteText: {
    fontSize: 12,
    color: "#FF4D4D",
  },
  previewBtnRetake: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  previewBtnRetakeText: {
    fontSize: 12,
    color: "#fff",
  },
})



核心文件
src/app/sync-classroom/video.tsx - 原始视频播放器代码（保留）
src/app/sync-classroom/video-modular.tsx - 新的模块化实现（当前使用）
Store 和工具
src/stores/videoPlayerStore.ts - 视频播放器状态管理
src/utils/video/videoTimeUtils.ts - 时间格式化工具
src/utils/video/videoOperationLock.ts - 操作锁工具
组件
src/components/video/VideoHeader.tsx - 视频头部
src/components/video/VideoProgressBar.tsx - 进度条
src/components/video/VideoControls.tsx - 控制按钮
src/components/video/CenterPlayButton.tsx - 中央播放按钮
src/components/video/CompleteTip.tsx - 完成提示
src/components/video/BrightnessControl.tsx - 亮度控制
src/components/video/VolumeControl.tsx - 音量控制
src/components/video/SeekControl.tsx - 快进快退控制
Hooks
src/hooks/useVideoPlayer.ts - 核心播放逻辑

