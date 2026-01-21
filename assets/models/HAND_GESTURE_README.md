## 手势“抓一下(握拳)”模型放置说明（Android）

本项目的手势自动拍照使用 **MediaPipe Tasks Vision HandLandmarker**（CPU）实现，代码默认从 **Android assets** 加载模型文件：

- **文件名**：`hand_landmarker.task`
- **放置位置（推荐）**：`assets/models/hand_landmarker.task`

原因：

- `android/app/build.gradle` 的 `sourceSets.main.assets.srcDirs` 已包含 `../../assets/models`，放到这里会自动打包进 APK 的 assets。

### 获取模型

请从 Google AI Edge / MediaPipe 官方示例下载 `hand_landmarker.task`（Lite 版本更适合 CPU）并放到上述位置。

### 代码入口

- Android 原生相机页：`android/app/src/main/java/com/xhtx/app/NativeCameraActivity.java`
- 手势检测：`android/app/src/main/java/com/xhtx/app/gesture/HandGrabDetector.java`

