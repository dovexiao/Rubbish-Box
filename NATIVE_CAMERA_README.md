# 原生相机实现说明

## 问题背景
在 Android 14 + USB 外接相机环境下，`expo-camera` 的 `takePictureAsync` 拍照后会导致预览冻结，无法连续拍摄。而系统自带相机工作正常。

## 解决方案
使用原生 Java + Camera2 API 实现完整的相机 Activity，包含 UI 和拍照逻辑，完全替代 expo-camera。

## 已实现的功能

### Java 原生层
1. **NativeCameraActivity.java** - 完整的相机 Activity
   - Camera2 API 直接控制
   - TextureView 预览
   - 九宫格辅助线
   - 拍照功能（最多6张）
   - 缩略图列表（可删除）
   - "开始批改"按钮
   - 照片路径回传给 RN

2. **NativeCameraModule.java** - RN Bridge
   - `openNativeCamera(type)` 方法
   - Promise 返回照片数组
   - ActivityResult 处理

3. **NativeCameraPackage.java** - Package 注册

### 布局文件
- `activity_native_camera.xml` - 主界面布局
- `item_thumbnail.xml` - 缩略图 item

### RN 层
- `camera_native.tsx` - 简化的入口（自动调用原生，接收结果后上传）

## 如何使用

### 1. 编译安装（必须）
```bash
cd android && ./gradlew clean && cd ..
npx expo run:android
```

### 2. 替换路由（可选）
方式一：重命名文件
```bash
mv src/app/ai/camera.tsx src/app/ai/camera_old.tsx
mv src/app/ai/camera_native.tsx src/app/ai/camera.tsx
```

方式二：手动修改路由指向

### 3. 测试
进入 AI 相机页面 -> 自动启动原生全屏相机 -> 拍照 -> 点击"开始批改" -> 自动上传 -> 跳转

## 优势
- ✅ 完全避开 expo-camera 的兼容性问题
- ✅ 使用底层 Camera2 API，和系统相机同等稳定
- ✅ 保留完整 UI（九宫格、缩略图等）
- ✅ 拍照后自动恢复预览（`setRepeatingRequest`）

## 注意事项
- 仅支持 Android（不影响 iOS，iOS 可以继续用原来的逻辑）
- 需要重新编译才能生效（因为修改了 Java 代码）
- 首次进入会有短暂的 Loading（"正在启动相机..."）

