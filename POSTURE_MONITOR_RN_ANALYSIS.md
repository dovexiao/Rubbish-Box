# 姿势检测插件 React Native 实现方案

## 📊 原始 UniApp 插件分析

### 核心功能
1. **实时姿势检测**：使用 TensorFlow Lite 检测17个人体关键点
2. **坐姿评估**：判断肩膀是否平衡、头部是否居中和抬起
3. **语音和震动反馈**：不良坐姿时提醒用户
4. **统计和奖励**：记录良好坐姿时长，达标后奖励
5. **后台持续监控**：通过前台服务实现长期监控
6. **悬浮窗显示**：可选的实时状态显示窗口

### 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                      PoseMonitorModule                       │
│              (UniApp 桥接层 - JSMethod)                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  PoseMonitorService                          │
│            (前台服务 - 持续运行)                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ CameraManager│  │ PoseDetector │  │MediaPlayer   │     │
│  │  (相机管理)  │  │ (TF Lite推理)│  │  (音频播放)  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                 pose_model.tflite                            │
│           (MoveNet 模型 - 17个关键点)                        │
└─────────────────────────────────────────────────────────────┘
```

### 关键技术要点

| 组件 | 技术 | 用途 |
|------|------|------|
| **PoseDetector** | TensorFlow Lite 2.9.0 | 姿势识别推理 |
| **CameraManager** | Camera2 API | 实时图像捕获 (640x480 @ 3fps) |
| **PoseMonitorService** | Foreground Service | 后台持续监控 |
| **PoseOverlayView** | Custom View + Canvas | 绘制关键点骨架 |
| **MediaPlayer** | Android MediaPlayer | 播放语音提示 |
| **Vibrator** | Android Vibrator | 震动反馈 |
| **SharedPreferences** | Android Storage | 数据持久化 |
| **WindowManager** | TYPE_APPLICATION_OVERLAY | 悬浮窗显示 |

---

## ✅ React Native 实现可行性评估

### 1️⃣ **完全可行的功能** (无需原生代码)

#### ✅ TensorFlow Lite 集成
```bash
npm install @tensorflow/tfjs @tensorflow/tfjs-react-native
```

**方案**：
- 使用 `@tensorflow/tfjs-react-native` 加载 `.tflite` 模型
- 支持 GPU 加速
- 可以实现相同的 17 个关键点检测

**示例代码**：
```typescript
import * as tf from '@tensorflow/tfjs';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';

const model = await tf.loadGraphModel(
  bundleResourceIO(require('./assets/pose_model.tflite'))
);
```

#### ✅ 相机实时捕获
```bash
npm install react-native-vision-camera
```

**方案**：
- 使用 `react-native-vision-camera` (最强大的 RN 相机库)
- 支持 Frame Processors (实时帧分析)
- 支持自定义分辨率和帧率控制

**示例代码**：
```typescript
import { Camera, useFrameProcessor } from 'react-native-vision-camera';

const frameProcessor = useFrameProcessor((frame) => {
  'worklet';
  // 在 JS 线程处理每一帧
  const pose = detectPose(frame);
}, []);

<Camera frameProcessor={frameProcessor} />
```

#### ✅ 音频播放
```bash
npm install react-native-sound
```

**示例代码**：
```typescript
import Sound from 'react-native-sound';

const sound = new Sound('good_posture.mp3', Sound.MAIN_BUNDLE);
sound.play();
```

#### ✅ 震动反馈
```typescript
import { Vibration } from 'react-native';

Vibration.vibrate(500); // 震动500毫秒
```

#### ✅ 数据持久化
```bash
npm install @react-native-async-storage/async-storage
```

**示例代码**：
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

await AsyncStorage.setItem('good_posture_count', '100');
const count = await AsyncStorage.getItem('good_posture_count');
```

#### ✅ 通知
```bash
npm install @notifee/react-native
```

---

### 2️⃣ **需要原生模块的功能**

#### ⚠️ 前台服务 (Android)
**原因**：React Native 默认不支持前台服务  
**解决方案**：
1. 使用 `react-native-background-actions` (简单场景)
2. 编写原生 Android 模块 (完全控制)

```bash
npm install react-native-background-actions
```

**或编写原生模块**：
```java
// android/app/src/main/java/.../PostureService.java
public class PostureService extends Service {
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        startForeground(NOTIFICATION_ID, createNotification());
        return START_STICKY;
    }
}
```

#### ⚠️ 悬浮窗 (Android Overlay Window)
**原因**：需要 `SYSTEM_ALERT_WINDOW` 权限和原生 WindowManager  
**解决方案**：必须编写原生模块

```java
WindowManager.LayoutParams params = new WindowManager.LayoutParams(
    WindowManager.LayoutParams.WRAP_CONTENT,
    WindowManager.LayoutParams.WRAP_CONTENT,
    WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
    PixelFormat.TRANSLUCENT
);
windowManager.addView(floatingView, params);
```

**Bridge 到 RN**：
```typescript
import { NativeModules } from 'react-native';

const { OverlayModule } = NativeModules;
OverlayModule.showFloatingWindow();
```

#### ⚠️ 后台相机访问
**挑战**：Android 限制后台应用访问相机  
**解决方案**：
- 使用前台服务 + 透明悬浮窗承载相机预览
- 需要原生代码实现

---

### 3️⃣ **性能考虑**

| 操作 | 原生性能 | RN 性能 | 优化方案 |
|------|---------|---------|----------|
| 模型推理 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 使用 JSI/Turbo Modules |
| 图像处理 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Frame Processor (C++) |
| UI 更新 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | RN 擅长 |
| 电池消耗 | ⭐⭐⭐⭐ | ⭐⭐⭐ | 优化检测频率 |

---

## 🎯 推荐实现方案

### 方案 A：纯 React Native (90% 功能)
**适用场景**：不需要悬浮窗，允许应用在前台运行

**优点**：
- ✅ 开发速度快
- ✅ 跨平台 (iOS + Android)
- ✅ 易于维护
- ✅ 热更新支持

**缺点**：
- ❌ 无悬浮窗
- ❌ 后台能力受限
- ⚠️ 性能略低于原生

**技术栈**：
```
- react-native-vision-camera (相机)
- @tensorflow/tfjs-react-native (模型推理)
- react-native-sound (音频)
- @notifee/react-native (通知)
- @react-native-async-storage/async-storage (存储)
```

### 方案 B：混合方案 (100% 功能) ⭐ 推荐
**适用场景**：需要完整复刻原插件的所有功能

**架构**：
```
┌─────────────────────────────────────────────┐
│          React Native UI Layer              │
│     (业务逻辑、数据管理、用户界面)          │
└──────────────────┬──────────────────────────┘
                   │ Native Modules Bridge
┌──────────────────▼──────────────────────────┐
│         Native Performance Layer            │
│  ┌──────────────────────────────────────┐  │
│  │  PostureMonitorModule (原生模块)     │  │
│  │  - 相机管理                          │  │
│  │  - TensorFlow Lite 推理              │  │
│  │  - 前台服务                          │  │
│  │  - 悬浮窗管理                        │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

**关键原生模块**：

```java
// PostureMonitorModule.java
@ReactMethod
public void startMonitoring(Promise promise) {
    // 启动前台服务
    Intent intent = new Intent(context, PostureService.class);
    context.startForegroundService(intent);
    promise.resolve(true);
}

@ReactMethod
public void showOverlay(ReadableMap config) {
    // 显示悬浮窗
    windowManager.addView(overlayView, params);
}
```

**React Native 调用**：
```typescript
import { NativeModules, NativeEventEmitter } from 'react-native';

const { PostureMonitor } = NativeModules;
const eventEmitter = new NativeEventEmitter(PostureMonitor);

// 监听姿势状态
eventEmitter.addListener('onPoseDetected', (data) => {
  console.log('姿势状态:', data.status);
  if (data.status === 'good') {
    setGoodPostureCount(prev => prev + 1);
  }
});

// 启动监控
await PostureMonitor.startMonitoring();

// 显示悬浮窗
PostureMonitor.showOverlay({
  position: 'top-right',
  size: { width: 200, height: 150 }
});
```

---

## 📋 完整实现步骤

### Phase 1: 基础功能 (2-3天)
1. ✅ 搭建 React Native 项目
2. ✅ 集成 react-native-vision-camera
3. ✅ 加载 TensorFlow Lite 模型
4. ✅ 实现基础的关键点检测
5. ✅ UI 界面开发

### Phase 2: 核心功能 (3-4天)
6. ✅ 姿势评估算法 (肩膀、头部判断)
7. ✅ 音频和震动反馈
8. ✅ 数据统计和持久化
9. ✅ 状态管理 (Zustand/Redux)

### Phase 3: 高级功能 (3-5天)
10. ⚠️ 编写原生前台服务模块
11. ⚠️ 编写悬浮窗原生模块
12. ⚠️ 后台相机访问处理
13. ⚠️ 权限管理

### Phase 4: 优化和测试 (2-3天)
14. 🔧 性能优化 (降低 CPU/内存使用)
15. 🔧 电池优化
16. 🧪 真机测试
17. 📝 文档编写

**总工期预估**：10-15天

---

## 🔥 关键代码示例

### 1. 姿势检测核心逻辑
```typescript
// services/poseDetection.ts
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';

export class PoseDetectionService {
  private model: tf.GraphModel | null = null;
  
  async loadModel() {
    await tf.ready();
    this.model = await tf.loadGraphModel(
      bundleResourceIO(require('../assets/pose_model.tflite'))
    );
  }
  
  async detectPose(imageData: ImageData): Promise<PoseData> {
    if (!this.model) throw new Error('Model not loaded');
    
    // 预处理图像 (192x192)
    const tensor = tf.browser.fromPixels(imageData)
      .resizeBilinear([192, 192])
      .expandDims(0)
      .toFloat()
      .div(255.0);
    
    // 推理
    const output = await this.model.predict(tensor) as tf.Tensor;
    const keypoints = await output.array();
    
    // 解析17个关键点
    return this.parseKeypoints(keypoints[0][0]);
  }
  
  private parseKeypoints(raw: number[][][]): PoseData {
    const keypoints: KeyPoint[] = [];
    for (let i = 0; i < 17; i++) {
      keypoints.push({
        y: raw[i][0],
        x: raw[i][1],
        confidence: raw[i][2]
      });
    }
    
    // 判断姿势
    const status = this.evaluatePosture(keypoints);
    
    return { keypoints, status };
  }
  
  private evaluatePosture(keypoints: KeyPoint[]): PostureStatus {
    const leftShoulder = keypoints[5];
    const rightShoulder = keypoints[6];
    const nose = keypoints[0];
    
    // 肩膀水平检测
    const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);
    if (shoulderDiff > 0.08) return 'shoulders_not_level';
    
    // 头部居中检测
    const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
    const headCenterDiff = Math.abs(nose.x - shoulderMidX);
    if (headCenterDiff > 0.15) return 'head_not_centered';
    
    // 头部抬起检测
    const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
    const headHeight = shoulderMidY - nose.y;
    if (headHeight < 0.12) return 'head_not_up';
    
    return 'good';
  }
}
```

### 2. React Native UI 组件
```typescript
// screens/PostureMonitor.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Camera, useFrameProcessor } from 'react-native-vision-camera';
import { usePoseDetection } from '../hooks/usePoseDetection';

export const PostureMonitorScreen = () => {
  const { detectPose, postureStatus } = usePoseDetection();
  const [goodPostureCount, setGoodPostureCount] = useState(0);
  
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    const result = detectPose(frame);
    if (result.status === 'good') {
      setGoodPostureCount(prev => prev + 1);
    }
  }, []);
  
  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
      />
      
      <View style={styles.overlay}>
        <Text style={styles.status}>
          {getStatusText(postureStatus)}
        </Text>
        <Text style={styles.count}>
          良好坐姿: {goodPostureCount} 次
        </Text>
      </View>
    </View>
  );
};

function getStatusText(status: PostureStatus): string {
  switch (status) {
    case 'good': return '✅ 坐姿正确，继续保持';
    case 'shoulders_not_level': return '⚠️ 请保持肩膀放松';
    case 'head_not_centered': return '⚠️ 请保持头部居中';
    case 'head_not_up': return '⚠️ 请抬头挺胸';
    default: return '🔍 正在检测...';
  }
}
```

### 3. 原生模块桥接 (Android)
```java
// android/app/src/main/java/.../PostureMonitorModule.java
package com.xhtx.posture;

import com.facebook.react.bridge.*;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class PostureMonitorModule extends ReactContextBaseJavaModule {
    private static final String MODULE_NAME = "PostureMonitor";
    
    public PostureMonitorModule(ReactApplicationContext context) {
        super(context);
    }
    
    @Override
    public String getName() {
        return MODULE_NAME;
    }
    
    @ReactMethod
    public void startMonitoring(Promise promise) {
        try {
            Intent intent = new Intent(getReactApplicationContext(), PostureService.class);
            getReactApplicationContext().startForegroundService(intent);
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("START_ERROR", e.getMessage());
        }
    }
    
    @ReactMethod
    public void showOverlay(ReadableMap config) {
        // 实现悬浮窗显示逻辑
        OverlayManager.getInstance().show(config);
    }
    
    // 发送事件到 JS
    private void sendEvent(String eventName, WritableMap params) {
        getReactApplicationContext()
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, params);
    }
}
```

---

## 💡 优化建议

### 1. 性能优化
```typescript
// 降低检测频率 (3fps)
const FRAME_INTERVAL = 333; // 毫秒
let lastProcessTime = 0;

const frameProcessor = useFrameProcessor((frame) => {
  'worklet';
  const now = Date.now();
  if (now - lastProcessTime < FRAME_INTERVAL) return;
  
  lastProcessTime = now;
  detectPose(frame);
}, []);
```

### 2. 电池优化
```typescript
// 智能休眠：无人时降低检测频率
if (postureStatus === 'no_person') {
  detectionInterval = 2000; // 2秒检测一次
} else {
  detectionInterval = 333; // 3fps
}
```

### 3. 内存优化
```typescript
// 复用 Tensor，避免频繁创建
const imageTensor = tf.tensor(imageData).keep();
// ... 使用完毕后
imageTensor.dispose();
```

---

## 📊 功能对比表

| 功能 | 原生 UniApp 插件 | RN 方案 A (纯RN) | RN 方案 B (混合) |
|------|-----------------|------------------|------------------|
| 姿势检测 | ✅ | ✅ | ✅ |
| 实时反馈 | ✅ | ✅ | ✅ |
| 音频播放 | ✅ | ✅ | ✅ |
| 震动反馈 | ✅ | ✅ | ✅ |
| 数据统计 | ✅ | ✅ | ✅ |
| 前台服务 | ✅ | ⚠️ 受限 | ✅ |
| 悬浮窗 | ✅ | ❌ | ✅ |
| 后台相机 | ✅ | ❌ | ✅ |
| 跨平台 | ❌ Android Only | ✅ iOS + Android | ⚠️ Android 完整 |
| 开发时间 | - | 快 (7天) | 中 (12天) |
| 维护成本 | 高 | 低 | 中 |
| 性能 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 🎯 最终建议

### 如果您的需求是：
1. **快速上线，不需要悬浮窗** → 选择方案 A (纯 React Native)
2. **完整复刻所有功能** → 选择方案 B (混合方案)
3. **长期维护，需要跨平台** → 选择方案 A，未来渐进式增强

### 推荐方案：方案 B (混合方案) ⭐
**理由**：
- ✅ 保留原插件的所有功能
- ✅ React Native UI 开发体验更好
- ✅ 关键性能部分用原生保证
- ✅ 方便后续迭代和维护
- ✅ 支持 OTA 热更新(UI 层)

---

## 📦 依赖清单

```json
{
  "dependencies": {
    "react-native": "^0.73.0",
    "react-native-vision-camera": "^3.6.0",
    "@tensorflow/tfjs": "^4.15.0",
    "@tensorflow/tfjs-react-native": "^0.8.0",
    "react-native-sound": "^0.11.2",
    "@notifee/react-native": "^7.8.0",
    "@react-native-async-storage/async-storage": "^1.21.0",
    "react-native-background-actions": "^3.0.0",
    "react-native-permissions": "^4.0.0",
    "zustand": "^4.4.7"
  }
}
```

---

## 🚀 快速开始

### 1. 安装依赖
```bash
cd /Users/zhoudabo/Desktop/xhtx-app/xhtx
npm install react-native-vision-camera
npm install @tensorflow/tfjs @tensorflow/tfjs-react-native
npm install react-native-sound
npx pod-install # iOS
```

### 2. 复制模型文件
```bash
cp temp_posemonitor/src/main/assets/pose_model.tflite ./assets/
```

### 3. 请求权限 (AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
```

### 4. 运行
```bash
npm run android
```

---

## 📞 技术支持

如需帮助实现具体功能模块，请告知：
1. 优先实现哪些功能？
2. 是否需要悬浮窗？
3. iOS 支持是否必要？

我可以立即开始编写具体代码！ 🚀

