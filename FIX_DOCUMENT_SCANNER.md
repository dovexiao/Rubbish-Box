# 修复 DocumentScanner 不工作的问题

## ✅ 问题分析

根据 [react-native-document-scanner-plugin 官方文档](https://react-native-document-scanner.js.org/)，发现了以下关键问题：

### 核心问题：
1. ❌ `app.json` 中缺少 `react-native-document-scanner-plugin` 插件配置
2. ❌ 没有运行 `npx expo prebuild` 重新生成原生代码
3. ⚠️ 需要注意 Android 权限问题

---

## 🔧 已完成的修复

### 1. ✅ 添加插件配置到 `app.json`

已在 `app.json` 的 `plugins` 数组中添加：

```json
[
  "react-native-document-scanner-plugin",
  {
    "cameraPermission": "We need camera access, so you can scan documents"
  }
]
```

---

## 🚀 必须执行的步骤

### 方法1：完全重新构建（推荐）

```bash
cd /Users/zhoudabo/Desktop/xhtx-app/xhtx

# 1. 清理并重新生成原生代码
npx expo prebuild --clean

# 2. 重新构建并运行
npx expo run:android
```

**说明**：
- `npx expo prebuild --clean` 会根据 `app.json` 的配置重新生成 Android/iOS 原生代码
- `--clean` 参数会先清理旧的原生代码
- 这是让插件生效的**必须步骤**

---

### 方法2：快速构建（如果方法1太慢）

```bash
cd /Users/zhoudabo/Desktop/xhtx-app/xhtx

# 1. 只重新生成原生代码（不清理）
npx expo prebuild

# 2. 重新构建并运行
npx expo run:android
```

---

## 📋 重要说明

### 关于 Expo Go

⚠️ **这个插件不能在 Expo Go 中运行！**

根据文档：
> "This plugin doesn't run in Expo Go. It works with Expo, and you can avoid manually changing iOS and Android files by following these steps."

必须使用：
- ✅ `npx expo run:android` (开发构建)
- ✅ `eas build` (生产构建)
- ❌ ~~Expo Go~~ (不支持)

---

### 关于 Android 权限

根据文档的 "Android Camera Permissions" 章节：

> "You don't need to request camera permissions unless you're using another plugin that adds `<uses-permission android:name="android.permission.CAMERA" />` to the application's `AndroidManifest.xml`."

你的项目中：
- ✅ `AndroidManifest.xml` 确实有 `CAMERA` 权限（expo-camera添加的）
- ✅ 代码中已经通过 `useCameraPermissions()` 请求了权限
- ✅ 应该不需要额外的权限请求

**但如果遇到权限错误**，可以添加显式权限请求：

```typescript
import { Platform, PermissionsAndroid, Alert } from 'react-native'

const takePictureWithDocScanner = async () => {
  // Android 权限检查
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA
    )
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      Alert.alert('错误', '需要相机权限才能使用文档扫描功能')
      return
    }
  }

  // 调用文档扫描器
  const { scannedImages, status } = await DocumentScanner.scanDocument({
    maxNumDocuments: 1,
    croppedImageQuality: 100,
  })
  
  // ... 其他代码
}
```

---

## 🧪 测试步骤

执行完 `npx expo run:android` 后：

1. **打开 App**
2. **进入错题拍照页面**
3. **点击拍照按钮**
4. **观察现象：**
   - ✅ 正常：启动文档扫描器（全屏相机界面，带绿色边缘检测框）
   - ❌ 异常：报错或者没有反应

---

## 🐛 如果还是不工作

### 检查清单

1. **确认依赖已安装**
   ```bash
   cat package.json | grep react-native-document-scanner
   # 应该看到: "react-native-document-scanner-plugin": "^2.0.2"
   ```

2. **确认 app.json 配置正确**
   ```bash
   cat app.json | grep -A 5 "react-native-document-scanner-plugin"
   # 应该看到插件配置
   ```

3. **确认已重新构建**
   ```bash
   # 查看 android/app/build.gradle 的修改时间
   ls -la android/app/build.gradle
   # 应该是最近修改的
   ```

4. **查看日志**
   ```bash
   npx expo run:android --no-install --no-bundler
   # 查看是否有错误信息
   ```

---

## 💡 备用方案：使用 expo-image-manipulator

如果 DocumentScanner 还是有问题，可以使用 Expo 官方的图像处理库：

```bash
npm install expo-image-manipulator
```

```typescript
import * as ImageManipulator from 'expo-image-manipulator'

const takePicture = async () => {
  const photo = await cameraRef.current.takePictureAsync({ quality: 1 })
  
  // 图像增强处理
  const enhanced = await ImageManipulator.manipulateAsync(
    photo.uri,
    [
      { resize: { width: 2000 } },  // 统一尺寸
      // 可以添加更多操作：rotate, crop, flip
    ],
    { 
      compress: 0.9, 
      format: ImageManipulator.SaveFormat.JPEG 
    }
  )
  
  setPhotos(prev => [...prev, {
    path: enhanced.uri,
    id: Date.now().toString(),
    timestamp: Date.now(),
  }])
}
```

**优点**：
- ✅ Expo 官方库，稳定可靠
- ✅ 无需 prebuild，立即可用
- ✅ 支持基本的图像处理
- ❌ 不支持自动边缘检测（需要服务端处理）

---

## 📚 相关文档

- [react-native-document-scanner-plugin 官方文档](https://react-native-document-scanner.js.org/)
- [Expo Prebuild 文档](https://docs.expo.dev/workflow/prebuild/)
- [Expo 插件配置文档](https://docs.expo.dev/config-plugins/introduction/)

---

## 🎯 总结

**立即执行：**

```bash
cd /Users/zhoudabo/Desktop/xhtx-app/xhtx
npx expo prebuild --clean
npx expo run:android
```

**预期结果：**
点击拍照按钮 → 启动文档扫描器 → 自动边缘检测（绿色框）→ 拍照 → 自动处理 → 返回增强后的图片

---

## ✅ 检查进度

- [x] 安装 react-native-document-scanner-plugin
- [x] 添加插件配置到 app.json
- [ ] 运行 `npx expo prebuild --clean`
- [ ] 运行 `npx expo run:android`
- [ ] 测试文档扫描功能
- [ ] 确认边缘检测工作正常

**现在执行上面的命令即可！** 🚀

