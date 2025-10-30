# 全局坐姿监控使用说明

## ✅ 已实现功能

### 1. **自动启动监控**
应用启动时（`onAppLaunch`）会自动启动坐姿监控

### 2. **实时状态显示**
首页 `index.tsx` 会实时显示当前坐姿状态：
- ✅ 坐姿正确
- ⚠️ 头部偏移
- ⚠️ 低头
- ⚠️ 肩膀倾斜
- 🔍 正在检测

### 3. **智能提醒系统**
- **Toast 提醒**: 不良姿势持续 30 秒后，每 30 秒提醒一次
- **音频警告**: 播放警告音效
- **弹窗奖励**: 保持良好坐姿达到阈值时弹窗提示（默认 10 分钟）

### 4. **后台处理**
- **进入后台**: 自动暂停检测，节省资源和电量
- **回到前台**: 自动恢复检测
- **数据保存**: 每分钟自动保存统计数据

### 5. **统计数据**
实时记录并存储：
- 总使用时长
- 良好坐姿时长
- 不良坐姿时长
- 各类不良姿势分类时长（头部偏移、低头、肩膀倾斜）

## 📱 使用方式

### 首页显示状态

在 `src/app/(tabs)/index.tsx` 中已经集成：

```typescript
const getPostureStatusText = () => {
  const stats = postureStore.nowStatus
  if (stats === "good") return "坐姿正确"
  if (stats === "head_not_centered") return "头部倾斜"
  if (stats === "head_not_up") return "低头"
  if (stats === "shoulders_not_level") return "肩膀倾斜"
  return "正在检测"
}

// 使用
<Text>{getPostureStatusText()}</Text>
```

### 控制监控

```typescript
import { usePostureStore } from '../stores/postureStore'

const postureStore = usePostureStore()

// 检查监控状态
const isMonitoring = postureStore.isMonitoring

// 查看当前状态
const currentStatus = postureStore.nowStatus

// 查看统计数据
const goodTime = postureStore.goodTime
const headTiltTime = postureStore.headTiltTime
const headDownTime = postureStore.headDownTime
const shoulderTiltTime = postureStore.shoulderTiltTime
```

## 🎯 提醒规则

### Toast 警告提醒
- **触发条件**: 不良姿势持续 30 秒
- **提醒频率**: 每 30 秒一次
- **提醒内容**:
  - 头部偏移: "检测到头部偏移，请调整坐姿保持头部居中"
  - 低头: "检测到低头，请抬起头部保持正确坐姿"
  - 肩膀倾斜: "检测到肩膀倾斜，请调整坐姿保持肩膀水平"

### 奖励弹窗
- **触发条件**: 保持良好坐姿达到阈值（默认 10 分钟）
- **奖励内容**: 积分奖励（默认 1 积分）
- **显示方式**: 使用 `GlobalDialog` 弹窗

## ⚙️ 配置选项

在 `_layout.tsx` 的 `onAppLaunch` 中可以配置：

```typescript
// 修改奖励配置
postureStore.setRewardConfig({
  goodPostureCount: 10 * 60, // 10分钟（600秒）
  rewardPoints: 1,            // 1积分
})
```

## 🔧 技术实现

### 核心文件
1. **`src/hooks/useGlobalPostureMonitor.ts`** - 全局监控 Hook
2. **`src/app/_layout.tsx`** - 集成启动监控
3. **`src/stores/postureStore.ts`** - 状态管理
4. **`src/services/poseDetectionService.ts`** - AI 检测服务
5. **`src/services/postureEvaluator.ts`** - 姿势评估逻辑

### 数据流
```
相机帧 
  ↓
AI 检测 (TensorFlow Lite)
  ↓
姿势评估 (PostureEvaluator)
  ↓
更新状态 (postureStore)
  ↓
首页实时显示 + 提醒弹窗
```

## 🚨 当前限制

### 1. **模拟检测模式**
- 当前使用模拟关键点数据
- 原因: TensorFlow Lite 模型加载需要解决路径问题
- 待修复后将自动切换到真实 AI 检测

### 2. **相机访问**
- 后台无法访问相机（系统限制）
- 进入后台时会自动暂停检测

### 3. **奖励接口**
- `handlePostureReward()` 当前返回模拟成功
- 需要接入真实的积分添加 API

## 📝 待优化项

1. ✅ 修复 TensorFlow Lite 模型加载问题
2. ⬜ 集成真实相机帧处理
3. ⬜ 接入积分奖励 API
4. ⬜ 优化检测频率（节省电量）
5. ⬜ 添加用户设置（开关监控、调整提醒频率等）

## 🐛 故障排查

### 模型加载失败
```bash
# 重启 Metro Bundler 清除缓存
npx expo start -c
```

### 监控未启动
```typescript
// 检查日志
console.log("监控状态:", postureStore.isMonitoring)
console.log("当前状态:", postureStore.nowStatus)
```

### 首页不更新
- 确保 `postureStore.nowStatus` 被正确订阅
- 检查是否有多个 store 实例

---

**最后更新**: 2025-10-29  
**版本**: v1.0.0


