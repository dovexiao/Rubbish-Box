# 姿势监控 API 参考文档

## 📚 核心 API

### `usePostureMonitor` Hook

主要的 React Hook，提供姿势监控的所有功能。

```typescript
import { usePostureMonitor } from './hooks/usePostureMonitor';

const {
  isMonitoring,        // 是否正在监控
  currentStatus,       // 当前姿势状态
  statistics,          // 统计数据
  lastPoseData,        // 最后一次检测数据
  startMonitoring,     // 开始监控
  stopMonitoring,      // 停止监控
  processPoseData,     // 处理姿势数据
  resetStatistics,     // 重置统计
  updateConfig,        // 更新配置
  getStatusText,       // 获取状态文本
} = usePostureMonitor(config, callbacks);
```

#### 参数

**config** (`Partial<PostureMonitorConfig>`)

```typescript
{
  detectionInterval: number;   // 检测间隔（毫秒）默认 333 (3fps)
  updateInterval: number;      // 统计更新间隔（毫秒）默认 30000
  rewardThreshold: number;     // 奖励阈值（次数）默认 600
  enableAudio: boolean;        // 启用音频 默认 true
  enableVibration: boolean;    // 启用震动 默认 true
  minConfidence: number;       // 最小置信度 默认 0.3
}
```

**callbacks** (`PostureEventCallbacks`)

```typescript
{
  onPoseDetected?: (data: PoseData) => void;      // 检测到姿势
  onStatusChanged?: (status: PostureStatus) => void; // 状态改变
  onRewardAchieved?: (count: number) => void;     // 达到奖励
  onError?: (error: Error) => void;               // 发生错误
}
```

#### 返回值

| 属性 | 类型 | 说明 |
|------|------|------|
| `isMonitoring` | `boolean` | 是否正在监控 |
| `currentStatus` | `PostureStatus` | 当前姿势状态 |
| `statistics` | `PostureStatistics` | 统计数据对象 |
| `lastPoseData` | `PoseData \| null` | 最后一次检测的完整数据 |
| `startMonitoring()` | `() => Promise<void>` | 开始监控 |
| `stopMonitoring()` | `() => Promise<void>` | 停止监控 |
| `processPoseData()` | `(keypoints: KeyPoint[]) => Promise<void>` | 处理姿势数据 |
| `resetStatistics()` | `() => Promise<void>` | 重置统计数据 |
| `updateConfig()` | `(config: Partial<PostureMonitorConfig>) => void` | 更新配置 |
| `getStatusText()` | `() => string` | 获取当前状态的文本描述 |

---

## 🎯 类型定义

### PostureStatus

姿势状态枚举：

```typescript
type PostureStatus =
  | "good"                  // ✅ 良好坐姿
  | "shoulders_not_level"   // ⚠️ 肩膀不水平
  | "head_not_centered"     // ⚠️ 头部不居中
  | "head_not_up"           // ⚠️ 头部未抬起
  | "no_person"             // 🔍 未检测到人
  | "detecting";            // 🔍 检测中
```

### KeyPoint

关键点数据结构：

```typescript
interface KeyPoint {
  x: number;          // X 坐标 (归一化 0-1)
  y: number;          // Y 坐标 (归一化 0-1)
  confidence: number; // 置信度 (0-1)
}
```

### PoseData

完整的姿势检测结果：

```typescript
interface PoseData {
  keypoints: KeyPoint[];     // 17个关键点数组
  status: PostureStatus;     // 姿势状态
  confidence: number;        // 整体置信度
  timestamp: number;         // 时间戳
}
```

### PostureStatistics

统计数据结构：

```typescript
interface PostureStatistics {
  good: number;                // 良好坐姿次数
  shouldersNotLevel: number;   // 肩膀不平次数
  headNotCentered: number;     // 头部不居中次数
  headNotUp: number;           // 头部未抬起次数
  total: number;               // 总检测次数
  rewardCount: number;         // 奖励计数
  lastUpdateTime: number;      // 最后更新时间
}
```

---

## 🔧 服务类 API

### PostureMonitorService

核心服务类（通常通过 Hook 使用，也可直接实例化）

```typescript
import { PostureMonitorService } from './services/postureMonitorService';

const service = new PostureMonitorService(config, callbacks);
```

#### 方法

| 方法 | 签名 | 说明 |
|------|------|------|
| `startMonitoring()` | `Promise<void>` | 开始监控 |
| `stopMonitoring()` | `Promise<void>` | 停止监控 |
| `processPoseData()` | `(poseData: PoseData) => Promise<void>` | 处理姿势数据 |
| `getStatistics()` | `() => PostureStatistics` | 获取统计数据 |
| `resetStatistics()` | `() => Promise<void>` | 重置统计数据 |
| `updateConfig()` | `(config: Partial<PostureMonitorConfig>) => void` | 更新配置 |
| `getConfig()` | `() => PostureMonitorConfig` | 获取当前配置 |
| `testAudio()` | `(audioType: string) => Promise<void>` | 测试音频播放 |
| `isMonitoringActive()` | `() => boolean` | 检查监控状态 |
| `dispose()` | `() => void` | 释放资源 |

---

### PostureEvaluator

姿势评估器（单例模式）

```typescript
import { postureEvaluator } from './services/postureEvaluator';
```

#### 方法

```typescript
// 评估姿势
const status = postureEvaluator.evaluate(keypoints);

// 计算置信度
const confidence = postureEvaluator.calculateConfidence(keypoints);

// 获取状态文本
const text = postureEvaluator.getStatusText(status);

// 获取对应的音频类型
const audioType = postureEvaluator.getAudioType(status);
```

---

### AudioService

音频和震动服务（单例模式）

```typescript
import { audioService } from './services/audioService';
```

#### 方法

```typescript
// 播放音频
await audioService.play('good_posture');
await audioService.play('shoulders_not_level');
await audioService.play('head_not_centered');
await audioService.play('head_not_up');
await audioService.play('adjust_posture');
await audioService.play('rest_reminder');

// 停止音频
audioService.stop();

// 震动
audioService.vibrate(500); // 震动500毫秒

// 配置
audioService.setAudioEnabled(true);
audioService.setVibrationEnabled(false);

// 查询状态
const isEnabled = audioService.isAudioEnabled();
const isVibrationEnabled = audioService.isVibrationEnabled();

// 释放资源
audioService.dispose();
```

---

### PostureStorageService

数据持久化服务（单例模式）

```typescript
import { postureStorage } from './services/postureStorage';
```

#### 方法

```typescript
// 加载统计数据
const stats = await postureStorage.loadStatistics();

// 保存统计数据
await postureStorage.saveStatistics(stats);

// 更新统计数据
const updated = await postureStorage.updateStatistics({
  good: 100,
  total: 150,
});

// 增加计数
await postureStorage.incrementCount('good', 1);
await postureStorage.incrementCount('total', 1);

// 重置每日统计
await postureStorage.resetDailyStatistics();

// 清除所有数据
await postureStorage.clearAll();

// 导出统计数据（JSON）
const json = await postureStorage.exportStatistics();

// 获取统计摘要
const summary = await postureStorage.getStatisticsSummary();
// 返回: { totalDetections, goodPercentage, mostCommonIssue }
```

---

## 💡 使用示例

### 示例 1: 基础使用

```typescript
import { usePostureMonitor } from './hooks/usePostureMonitor';

function MyComponent() {
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
      <Text>良好坐姿: {statistics.good}</Text>
      <Text>总检测: {statistics.total}</Text>
    </View>
  );
}
```

### 示例 2: 带回调

```typescript
const {
  processPoseData,
} = usePostureMonitor(
  {
    enableAudio: true,
    rewardThreshold: 600,
  },
  {
    onStatusChanged: (status) => {
      console.log('状态改变:', status);
    },
    onRewardAchieved: (count) => {
      Alert.alert('🎉 奖励', `连续良好坐姿 ${count} 次！`);
    },
  }
);
```

### 示例 3: 集成相机

```typescript
import { Camera, useFrameProcessor } from 'react-native-vision-camera';

const { processPoseData, isMonitoring } = usePostureMonitor();

const frameProcessor = useFrameProcessor((frame) => {
  'worklet';
  // 1. 从帧中提取图像数据
  // 2. 使用 TensorFlow Lite 检测关键点
  // const keypoints = detectPose(frame);
  
  // 3. 处理姿势数据
  // processPoseData(keypoints);
}, []);

return (
  <Camera
    device={device}
    isActive={isMonitoring}
    frameProcessor={frameProcessor}
  />
);
```

### 示例 4: 测试音频

```typescript
import { audioService } from './services/audioService';

// 测试所有音频
const testAllAudio = async () => {
  await audioService.play('good_posture');
  await new Promise(r => setTimeout(r, 2000));
  
  await audioService.play('shoulders_not_level');
  await new Promise(r => setTimeout(r, 2000));
  
  await audioService.play('head_not_centered');
};
```

### 示例 5: 数据统计

```typescript
import { postureStorage } from './services/postureStorage';

// 获取统计摘要
const showSummary = async () => {
  const summary = await postureStorage.getStatisticsSummary();
  
  Alert.alert('统计摘要', `
    总检测次数: ${summary.totalDetections}
    良好坐姿占比: ${summary.goodPercentage}%
    最常见问题: ${summary.mostCommonIssue}
  `);
};
```

---

## 🎨 UI 组件示例

完整的 UI 组件示例请参考：
- `src/screens/PostureMonitorScreen.tsx` - 完整界面
- `src/examples/PostureMonitorExample.tsx` - 各种使用示例

---

## 📋 关键点索引

MoveNet 模型的 17 个关键点索引：

```typescript
enum KeyPointIndex {
  NOSE = 0,           // 鼻子
  LEFT_EYE = 1,       // 左眼
  RIGHT_EYE = 2,      // 右眼
  LEFT_EAR = 3,       // 左耳
  RIGHT_EAR = 4,      // 右耳
  LEFT_SHOULDER = 5,  // 左肩
  RIGHT_SHOULDER = 6, // 右肩
  LEFT_ELBOW = 7,     // 左肘
  RIGHT_ELBOW = 8,    // 右肘
  LEFT_WRIST = 9,     // 左腕
  RIGHT_WRIST = 10,   // 右腕
  LEFT_HIP = 11,      // 左髋
  RIGHT_HIP = 12,     // 右髋
  LEFT_KNEE = 13,     // 左膝
  RIGHT_KNEE = 14,    // 右膝
  LEFT_ANKLE = 15,    // 左踝
  RIGHT_ANKLE = 16,   // 右踝
}
```

---

## 🔍 姿势评估阈值

默认阈值（可在 `postureEvaluator.ts` 中修改）：

```typescript
const THRESHOLDS = {
  SHOULDER_LEVEL: 0.08,          // 肩膀水平阈值
  HEAD_CENTER: 0.15,             // 头部居中阈值
  HEAD_UP: 0.12,                 // 头部抬起阈值
  KEYPOINT_CONFIDENCE: 0.3,      // 关键点置信度阈值
  MIN_VALID_KEYPOINTS: 5,        // 最少有效关键点数量
};
```

---

## 📖 更多文档

- **完整实现分析**: `POSTURE_MONITOR_RN_ANALYSIS.md`
- **安装配置指南**: `POSTURE_MONITOR_SETUP.md`
- **快速示例**: `src/examples/PostureMonitorExample.tsx`

---

## 🐛 调试技巧

### 1. 打印关键点数据

```typescript
const { lastPoseData } = usePostureMonitor();

useEffect(() => {
  if (lastPoseData) {
    console.log('关键点:', lastPoseData.keypoints);
    console.log('状态:', lastPoseData.status);
    console.log('置信度:', lastPoseData.confidence);
  }
}, [lastPoseData]);
```

### 2. 查看统计数据

```typescript
import { postureStorage } from './services/postureStorage';

const debugStats = async () => {
  const json = await postureStorage.exportStatistics();
  console.log('统计数据:', json);
};
```

### 3. 测试音频文件

```typescript
import { audioService } from './services/audioService';

const testAudio = async (type: string) => {
  try {
    await audioService.play(type as any);
    console.log('音频播放成功:', type);
  } catch (error) {
    console.error('音频播放失败:', error);
  }
};
```

---

## ⚠️ 注意事项

1. **相机权限**: 必须在 AndroidManifest.xml 和 Info.plist 中配置
2. **音频文件**: 确保音频文件在 `assets/audio/` 目录下
3. **内存管理**: 长时间运行时注意释放资源
4. **性能优化**: 根据需求调整 `detectionInterval`
5. **错误处理**: 始终提供 `onError` 回调

---

## 🚀 快速开始

```bash
# 1. 安装依赖
./install-posture-monitor.sh

# 2. 配置权限
# 查看 POSTURE_MONITOR_SETUP.md

# 3. 在组件中使用
import { usePostureMonitor } from './hooks/usePostureMonitor';
```

需要帮助？查看示例代码或提出问题！🎯


