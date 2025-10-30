# 🧘 姿势监控功能 - React Native 实现

> ✅ 基于原生 UniApp 插件，使用 React Native 完全重写
> 
> 🎯 方案 A：纯 React Native（90% 功能，无需悬浮窗）

---

## 🎉 已完成功能

### ✅ 核心服务
- [x] 姿势评估算法（肩膀、头部检测）
- [x] 音频播放服务（6 种提示音）
- [x] 震动反馈
- [x] 数据统计和持久化
- [x] 自动每日重置
- [x] 奖励系统

### ✅ 类型定义
- [x] 完整的 TypeScript 类型
- [x] 17 个关键点数据结构
- [x] 姿势状态枚举
- [x] 配置和回调接口

### ✅ React 集成
- [x] `usePostureMonitor` Hook
- [x] 主界面组件示例
- [x] 三种使用示例

### ✅ 文档
- [x] 技术分析文档
- [x] 安装配置指南
- [x] API 参考文档
- [x] 快速示例代码

---

## 📁 项目结构

```
src/
├── types/
│   └── posture.ts                    # 类型定义
├── services/
│   ├── postureEvaluator.ts          # 姿势评估算法 ✅
│   ├── audioService.ts               # 音频播放 ✅
│   ├── postureStorage.ts            # 数据持久化 ✅
│   └── postureMonitorService.ts     # 主服务 ✅
├── hooks/
│   └── usePostureMonitor.ts         # React Hook ✅
├── screens/
│   └── PostureMonitorScreen.tsx     # 主界面 ✅
└── examples/
    └── PostureMonitorExample.tsx    # 使用示例 ✅

assets/
└── audio/                            # 音频文件 ⚠️ 待复制
    ├── good_posture.mp3
    ├── shoulders_not_level.mp3
    ├── head_not_centered.mp3
    ├── head_not_up.mp3
    ├── adjust_posture.mp3
    └── rest_reminder.mp3
```

---

## 🚀 快速开始

### 1️⃣ 安装依赖

```bash
# 使用自动安装脚本（推荐）
./install-posture-monitor.sh

# 或手动安装
npm install react-native-vision-camera
npm install react-native-sound
npm install @react-native-async-storage/async-storage
npm install react-native-permissions
cd ios && pod install && cd ..
```

### 2️⃣ 配置权限

#### Android (`android/app/src/main/AndroidManifest.xml`)
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.VIBRATE" />
```

#### iOS (`ios/xhtx/Info.plist`)
```xml
<key>NSCameraUsageDescription</key>
<string>需要使用相机检测您的坐姿</string>
```

### 3️⃣ 复制音频文件

```bash
# 从原插件复制
cp temp_posemonitor/src/main/assets/*.mp3 ./assets/audio/
```

### 4️⃣ 在代码中使用

```typescript
import { usePostureMonitor } from './hooks/usePostureMonitor';

function MyScreen() {
  const {
    isMonitoring,
    currentStatus,
    statistics,
    startMonitoring,
    stopMonitoring,
    getStatusText,
  } = usePostureMonitor();

  return (
    <View>
      <Button 
        title={isMonitoring ? "停止" : "开始"} 
        onPress={isMonitoring ? stopMonitoring : startMonitoring}
      />
      <Text>{getStatusText()}</Text>
      <Text>良好坐姿: {statistics.good} 次</Text>
    </View>
  );
}
```

---

## 📚 文档导航

| 文档 | 说明 | 链接 |
|------|------|------|
| 🔍 **技术分析** | 原插件分析、实现方案、可行性评估 | [POSTURE_MONITOR_RN_ANALYSIS.md](./POSTURE_MONITOR_RN_ANALYSIS.md) |
| ⚙️ **安装配置** | 依赖安装、权限配置、相机集成 | [POSTURE_MONITOR_SETUP.md](./POSTURE_MONITOR_SETUP.md) |
| 📖 **API 参考** | 完整的 API 文档和使用方法 | [POSTURE_MONITOR_API.md](./POSTURE_MONITOR_API.md) |
| 💡 **快速示例** | 三种使用示例代码 | [src/examples/PostureMonitorExample.tsx](./src/examples/PostureMonitorExample.tsx) |

---

## 🎯 核心功能

### ✅ 已实现

| 功能 | 状态 | 说明 |
|------|------|------|
| 姿势评估 | ✅ | 肩膀/头部/置信度检测 |
| 音频提示 | ✅ | 6 种音频提示 |
| 震动反馈 | ✅ | 不良姿势震动 |
| 数据统计 | ✅ | 实时统计和持久化 |
| 奖励系统 | ✅ | 连续良好坐姿奖励 |
| React Hook | ✅ | 简单易用的 Hook |
| TypeScript | ✅ | 完整类型定义 |

### ⚠️ 待集成

| 功能 | 优先级 | 说明 |
|------|-------|------|
| TensorFlow Lite | 高 | AI 姿势检测模型 |
| 相机集成 | 高 | react-native-vision-camera |
| Frame Processor | 中 | 实时帧处理 |
| iOS 适配 | 中 | 完整 iOS 支持 |

---

## 📊 技术栈

| 组件 | 技术选型 | 状态 |
|------|---------|------|
| **相机** | react-native-vision-camera | ⚠️ 待集成 |
| **AI 模型** | @tensorflow/tfjs-react-native | ⚠️ 可选 |
| **音频** | react-native-sound | ✅ 已集成 |
| **存储** | @react-native-async-storage | ✅ 已集成 |
| **震动** | React Native Vibration API | ✅ 已集成 |
| **权限** | react-native-permissions | ⚠️ 待集成 |

---

## 🧪 测试步骤

### 1. 测试基础功能（无相机）

```typescript
// 使用模拟数据
import { BasicExample } from './examples/PostureMonitorExample';

<BasicExample />
```

### 2. 测试音频播放

```typescript
import { audioService } from './services/audioService';

audioService.play('good_posture');
audioService.vibrate(500);
```

### 3. 测试数据持久化

```typescript
import { postureStorage } from './services/postureStorage';

const stats = await postureStorage.loadStatistics();
console.log(stats);
```

---

## 🔧 配置选项

```typescript
const config = {
  detectionInterval: 333,      // 检测频率 (3fps)
  updateInterval: 30000,       // 统计更新间隔 (30秒)
  rewardThreshold: 600,        // 奖励阈值 (10分钟)
  enableAudio: true,           // 启用音频
  enableVibration: true,       // 启用震动
  minConfidence: 0.3,          // 最小置信度
};
```

---

## 📱 使用场景

### 场景 1: 学习辅助
监控学生在线学习时的坐姿，定期提醒调整姿势

### 场景 2: 办公健康
长时间办公时提醒员工保持正确坐姿

### 场景 3: 健康游戏化
通过奖励机制激励用户保持良好坐姿

---

## 🐛 常见问题

### Q1: 相机权限被拒绝
```typescript
const status = await Camera.getCameraPermissionStatus();
if (status === 'denied') {
  await Linking.openSettings();
}
```

### Q2: 音频播放失败
确保音频文件在正确的目录：
- Android: `android/app/src/main/assets/`
- iOS: 通过 Xcode 添加到项目

### Q3: TensorFlow Lite 性能问题
```typescript
// 降低检测频率
const config = {
  detectionInterval: 500,  // 2fps
};
```

### Q4: 数据没有持久化
检查 AsyncStorage 权限和配置

---

## 🎨 自定义

### 修改阈值

编辑 `src/services/postureEvaluator.ts`:

```typescript
const THRESHOLDS = {
  SHOULDER_LEVEL: 0.08,     // 肩膀水平阈值
  HEAD_CENTER: 0.15,        // 头部居中阈值
  HEAD_UP: 0.12,            // 头部抬起阈值
};
```

### 自定义音频

替换 `assets/audio/` 目录下的音频文件

### 自定义 UI

参考 `src/screens/PostureMonitorScreen.tsx` 创建自己的界面

---

## 📈 性能建议

1. **降低检测频率**: 从 3fps 降至 2fps 或 1fps
2. **使用 InteractionManager**: 延迟非关键 UI 更新
3. **定期清理数据**: 自动删除超过 30 天的数据
4. **优化音频**: 压缩音频文件大小

---

## 🔜 未来计划

- [ ] 完整的 TensorFlow Lite 集成
- [ ] iOS 完整支持
- [ ] 云端数据同步
- [ ] 姿势历史趋势图
- [ ] 更多音频提示选项
- [ ] 深色模式支持
- [ ] 多语言支持

---

## 💬 需要帮助？

1. 查看 [API 文档](./POSTURE_MONITOR_API.md)
2. 查看 [示例代码](./src/examples/PostureMonitorExample.tsx)
3. 查看 [安装指南](./POSTURE_MONITOR_SETUP.md)
4. 提出问题并描述：
   - 错误日志
   - 系统版本
   - 复现步骤

---

## 📝 更新日志

### v1.0.0 (2025-01-29)
- ✅ 完成核心服务架构
- ✅ 实现姿势评估算法
- ✅ 实现音频播放服务
- ✅ 实现数据持久化
- ✅ 创建 React Hook
- ✅ 编写完整文档

---

## 📄 许可

基于原 UniApp 插件改编，仅供学习交流使用。

---

## 🙏 致谢

感谢原 UniApp 插件的设计和实现，为本项目提供了宝贵的参考！

---

**🚀 开始使用: `./install-posture-monitor.sh`**

**📖 完整文档: [POSTURE_MONITOR_SETUP.md](./POSTURE_MONITOR_SETUP.md)**

**💻 示例代码: [PostureMonitorExample.tsx](./src/examples/PostureMonitorExample.tsx)**


