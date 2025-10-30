# 姿势监控功能 - 安装配置指南

## 📦 第一步：安装依赖包

### 必需依赖

```bash
# 相机库（强大的相机支持）
npm install react-native-vision-camera

# 音频播放
npm install react-native-sound

# 数据持久化
npm install @react-native-async-storage/async-storage

# iOS 安装 pods
cd ios && pod install && cd ..
```

### 可选依赖（TensorFlow Lite - 如需 AI 检测）

```bash
# TensorFlow.js for React Native
npm install @tensorflow/tfjs @tensorflow/tfjs-react-native
npm install @react-native-community/async-storage
npm install expo-gl
```

**注意**：TensorFlow Lite 集成较复杂，建议先实现基础功能，后续再添加 AI 检测。

---

## ⚙️ 第二步：配置权限

### Android (android/app/src/main/AndroidManifest.xml)

```xml
<manifest>
  <!-- 相机权限 -->
  <uses-permission android:name="android.permission.CAMERA" />
  
  <!-- 震动权限 -->
  <uses-permission android:name="android.permission.VIBRATE" />
  
  <!-- 音频权限（可选）-->
  <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
  
  <!-- 相机特性声明 -->
  <uses-feature android:name="android.hardware.camera" android:required="false" />
  <uses-feature android:name="android.hardware.camera.front" android:required="false" />
</manifest>
```

### iOS (ios/xhtx/Info.plist)

```xml
<dict>
  <!-- 相机权限说明 -->
  <key>NSCameraUsageDescription</key>
  <string>需要使用相机检测您的坐姿</string>
  
  <!-- 麦克风权限（如需录音）-->
  <key>NSMicrophoneUsageDescription</key>
  <string>需要访问麦克风以播放提示音</string>
</dict>
```

---

## 📁 第三步：复制音频文件

将以下音频文件复制到项目中：

```bash
# 从原插件复制音频文件
cp temp_posemonitor/src/main/assets/*.mp3 ./assets/audio/

# 或手动创建以下文件：
# - assets/audio/good_posture.mp3
# - assets/audio/shoulders_not_level.mp3
# - assets/audio/head_not_centered.mp3
# - assets/audio/head_not_up.mp3
# - assets/audio/adjust_posture.mp3
# - assets/audio/rest_reminder.mp3
```

### 配置音频加载 (react-native-sound)

在 `android/app/build.gradle` 中添加：

```gradle
android {
    ...
    sourceSets {
        main {
            assets.srcDirs = ['src/main/assets', '../../assets/audio']
        }
    }
}
```

---

## 🎯 第四步：集成相机 (react-native-vision-camera)

### 1. 配置 VisionCamera

```typescript
// src/screens/PostureMonitorScreen.tsx
import { Camera, useCameraDevice, useFrameProcessor } from 'react-native-vision-camera';
import { usePostureMonitor } from '../hooks/usePostureMonitor';

export const PostureMonitorScreen = () => {
  const device = useCameraDevice('front'); // 前置摄像头
  const { processPoseData, isMonitoring } = usePostureMonitor();

  // 请求相机权限
  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      if (status !== 'granted') {
        Alert.alert('错误', '需要相机权限才能使用姿势检测功能');
      }
    })();
  }, []);

  // Frame Processor - 处理每一帧
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    // TODO: 在这里添加 TensorFlow Lite 推理
    // const keypoints = detectPoseFromFrame(frame);
    // processPoseData(keypoints);
  }, []);

  if (!device) return <ActivityIndicator />;

  return (
    <View style={{ flex: 1 }}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isMonitoring}
        frameProcessor={frameProcessor}
      />
      {/* 其他 UI 组件 */}
    </View>
  );
};
```

---

## 🤖 第五步：集成 TensorFlow Lite (可选)

### 方案 A：使用现有的简化检测（推荐先使用）

暂时使用模拟数据测试功能：

```typescript
// 模拟姿势检测结果
const mockKeypoints = [
  { x: 0.5, y: 0.3, confidence: 0.9 }, // nose
  { x: 0.45, y: 0.28, confidence: 0.8 }, // left_eye
  { x: 0.55, y: 0.28, confidence: 0.8 }, // right_eye
  // ... 其他关键点
];

processPoseData(mockKeypoints);
```

### 方案 B：完整 TensorFlow Lite 集成

```bash
# 安装 TensorFlow.js
npm install @tensorflow/tfjs @tensorflow/tfjs-react-native
npm install @react-native-community/async-storage
npm install react-native-fs
npm install expo-gl
```

复制模型文件：

```bash
cp temp_posemonitor/src/main/assets/pose_model.tflite ./assets/models/
```

创建检测服务：

```typescript
// src/services/poseDetectionService.ts
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';

export class PoseDetectionService {
  private model: tf.GraphModel | null = null;

  async loadModel() {
    await tf.ready();
    this.model = await tf.loadGraphModel(
      bundleResourceIO(require('../../assets/models/pose_model.tflite'))
    );
  }

  async detectPose(imageData: any): Promise<KeyPoint[]> {
    // TensorFlow Lite 推理逻辑
    // 返回 17 个关键点
  }
}
```

---

## 🧪 第六步：测试功能

### 1. 启动应用

```bash
npm run android
# 或
npm run ios
```

### 2. 测试音频

```typescript
import { audioService } from './src/services/audioService';

// 测试播放音频
audioService.play('good_posture');

// 测试震动
audioService.vibrate(500);
```

### 3. 测试数据存储

```typescript
import { postureStorage } from './src/services/postureStorage';

// 保存数据
await postureStorage.saveStatistics({
  good: 10,
  total: 15,
  // ...
});

// 加载数据
const stats = await postureStorage.loadStatistics();
console.log(stats);
```

---

## 📱 第七步：添加到主应用

### 方法 1：作为独立页面

```typescript
// src/app/_layout.tsx 或路由配置
import { PostureMonitorScreen } from '../screens/PostureMonitorScreen';

// 添加路由
<Stack.Screen 
  name="posture-monitor" 
  component={PostureMonitorScreen}
  options={{ title: '姿势监控' }}
/>
```

### 方法 2：在现有页面中使用

```typescript
import { usePostureMonitor } from '../hooks/usePostureMonitor';

function MyScreen() {
  const {
    isMonitoring,
    currentStatus,
    statistics,
    startMonitoring,
    stopMonitoring,
  } = usePostureMonitor();

  return (
    <View>
      <Button 
        title={isMonitoring ? "停止" : "开始"} 
        onPress={isMonitoring ? stopMonitoring : startMonitoring}
      />
      <Text>当前状态: {currentStatus}</Text>
      <Text>良好坐姿次数: {statistics.good}</Text>
    </View>
  );
}
```

---

## 🔧 常见问题

### 1. 相机权限被拒绝

```typescript
const checkPermission = async () => {
  const status = await Camera.getCameraPermissionStatus();
  if (status === 'denied') {
    await Linking.openSettings();
  }
};
```

### 2. 音频文件找不到

确保音频文件在正确的目录：
- Android: `android/app/src/main/assets/`
- iOS: 通过 Xcode 添加到项目

### 3. TensorFlow Lite 加载失败

检查模型文件路径和格式：

```typescript
// 确认模型文件存在
import RNFS from 'react-native-fs';
const modelPath = `${RNFS.MainBundlePath}/assets/models/pose_model.tflite`;
const exists = await RNFS.exists(modelPath);
console.log('Model exists:', exists);
```

### 4. Frame Processor 不工作

确保启用了 VisionCamera Frame Processor：

```bash
# 重新构建项目
cd android && ./gradlew clean && cd ..
npm run android
```

---

## 📊 性能优化建议

### 1. 降低检测频率

```typescript
const config = {
  detectionInterval: 500, // 2fps 而不是 3fps
};
```

### 2. 使用 InteractionManager

```typescript
import { InteractionManager } from 'react-native';

const processPose = async (keypoints) => {
  InteractionManager.runAfterInteractions(() => {
    processPoseData(keypoints);
  });
};
```

### 3. 内存管理

```typescript
// 定期清理旧数据
useEffect(() => {
  const interval = setInterval(() => {
    // 清理超过24小时的数据
  }, 3600000);
  
  return () => clearInterval(interval);
}, []);
```

---

## 🎯 下一步

1. ✅ 安装所有依赖包
2. ✅ 配置权限
3. ✅ 复制音频文件
4. ✅ 测试基础功能（不含 AI）
5. ⚠️ 集成 TensorFlow Lite (可选)
6. ⚠️ 添加 Frame Processor
7. ⚠️ 完整测试和优化

---

## 📞 需要帮助？

如果遇到问题，请提供：
1. 错误日志
2. 系统版本 (iOS/Android)
3. React Native 版本
4. 具体的错误场景

我会立即帮您解决！🚀

