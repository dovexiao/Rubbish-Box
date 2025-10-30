# 姿势检测功能指南

## ✅ 已完成

### 1. 依赖安装
- ✅ `react-native-fast-tflite` - TensorFlow Lite 运行库
- ✅ `react-native-vision-camera` - 相机访问
- ✅ `react-native-sound` - 音频反馈
- ✅ `@react-native-async-storage/async-storage` - 数据持久化

### 2. 模型配置
- ✅ 模型文件: `assets/models/pose_model.tflite` (4.5 MB)
- ✅ Android build.gradle 已配置 assets 目录
- ✅ 模型输入: 192x192x3 (RGB 图像)
- ✅ 模型输出: 17 个关键点 (MoveNet)

### 3. 核心服务
- ✅ `PoseDetectionService` - TensorFlow Lite 模型加载和推理
- ✅ `PostureEvaluator` - 姿势评估逻辑（肩膀水平、头部居中、头部抬起）
- ✅ `AudioService` - 音频播放和振动反馈
- ✅ `PostureStorage` - 统计数据持久化
- ✅ `PostureMonitorService` - 主监控服务

### 4. React 组件
- ✅ `usePostureMonitor` Hook - 状态管理
- ✅ `PostureMonitorScreen` - 主界面

## 🚀 测试步骤

### 方法 1: 使用测试页面
```bash
# 1. 启动开发服务器
npm start

# 2. 构建并运行 Android 应用
npm run android

# 3. 在应用中导航到测试页面
# 路由: /posture-test
```

### 方法 2: 使用 Expo
```bash
# 1. 启动 Expo
npx expo start

# 2. 在开发菜单中访问 /posture-test
```

## 📱 界面功能

### 主界面元素
1. **相机预览** - 实时显示前置摄像头画面
2. **状态指示器** - 显示当前姿势状态
   - 🟢 良好 (Good)
   - 🟡 头部偏移 (Head Not Centered)
   - 🟡 肩膀倾斜 (Shoulders Not Level)
   - 🟡 低头 (Head Not Up)
3. **统计信息** - 显示今日统计
   - 良好次数
   - 不良次数
   - 持续时间

### 控制按钮
- **开始监控** - 启动姿势检测
- **停止监控** - 停止检测
- **重置统计** - 清除数据
- **切换 AI/模拟** - 切换检测模式

## 🔧 当前状态

### AI 检测模式
- ✅ 模型加载: 使用 `loadTensorflowModel()` 从本地加载
- ✅ 模型推理: 使用 `model.runSync([imageData])` 进行推理
- ⚠️ 输入数据: **当前使用随机像素模拟数据**
- 🔜 待实现: 从相机获取真实帧数据

### 模拟检测模式
- ✅ 生成随机关键点数据
- ✅ 模拟不同姿势状态
- ✅ 测试完整流程（评估 → 音频 → 统计）

## 🎯 下一步优化

### 1. 真实相机输入 (高优先级)
需要集成相机帧处理，有两个方案：

#### 方案 A: 使用 vision-camera-resize-plugin
```bash
npm install vision-camera-resize-plugin
```

然后在 Frame Processor 中使用：
```typescript
const { resize } = useResizePlugin();
const frameProcessor = useFrameProcessor((frame) => {
  'worklet';
  const resized = resize(frame, {
    scale: { width: 192, height: 192 },
    pixelFormat: 'rgb',
    dataType: 'uint8',
  });
  const outputs = model.runSync([resized]);
  // 处理输出...
}, [model]);
```

#### 方案 B: 使用定时拍照 + 图像处理
使用 `Camera.takePhoto()` + 第三方图像处理库（如 `react-native-image-resizer`）

### 2. 性能优化
- [ ] 调整检测频率（当前 1 秒/次，可优化到 100-200ms）
- [ ] 使用 GPU 加速（Android GPU Delegate）
- [ ] 优化图像预处理

### 3. UI 增强
- [ ] 添加骨架叠加层（在相机预览上绘制关键点）
- [ ] 添加实时反馈动画
- [ ] 优化状态切换过渡效果

### 4. 后台运行
- [ ] 实现 Android Foreground Service
- [ ] 添加通知栏控制
- [ ] 锁屏状态检测

## 📋 配置文件清单

### Android
- ✅ `android/app/build.gradle` - 已添加 models 资源目录
- ✅ `android/app/src/main/AndroidManifest.xml` - 已添加相机权限

### Assets
- ✅ `assets/models/pose_model.tflite` - MoveNet 模型文件
- ✅ `assets/audio/` - 音频反馈文件（如果有）

## ⚠️ 注意事项

1. **模型兼容性**: 当前使用的是 MoveNet SinglePose Lightning 模型，确保 `.tflite` 文件版本匹配
2. **权限**: 首次运行需要授予相机权限
3. **性能**: 在低端设备上可能需要降低检测频率
4. **后台限制**: Android 后台运行需要 Foreground Service

## 🐛 故障排查

### 模型加载失败
```
检查: assets/models/pose_model.tflite 是否存在
检查: android/app/build.gradle 中 assets.srcDirs 配置
```

### 相机无法启动
```
检查: 相机权限是否授予
检查: AndroidManifest.xml 中 CAMERA 权限
```

### 检测结果不准确
```
当前使用模拟数据，预期行为
待实现真实相机输入后可获得准确结果
```

## 📚 相关文档

- [react-native-fast-tflite](https://github.com/mrousavy/react-native-fast-tflite)
- [react-native-vision-camera](https://react-native-vision-camera.com/)
- [MoveNet 模型说明](https://tfhub.dev/google/movenet)

---

**最后更新**: 2025-10-29
**当前版本**: v0.1.0 (Alpha)


