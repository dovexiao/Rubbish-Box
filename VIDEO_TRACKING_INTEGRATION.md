# 视频模块活动追踪集成

## ✅ 已完成集成

视频模块 (`src/app/sync-classroom/video.tsx`) 已成功集成用户活动追踪功能。

## 📊 追踪行为

### 1. **进入视频 (ENTER)**
- **触发时机**: 视频信息加载成功时
- **发送数据**:
  ```json
  {
    "type": "video",
    "status": "enter",
    "timestamp": 1702800000000,
    "userId": "123",
    "deviceCode": "device-abc",
    "videoId": "video_001",
    "videoName": "第一课：认识汉字",
    "progress": 120,
    "duration": 600,
    "progressPercent": 20,
    "courseId": "course_001",
    "courseName": "小学语文一年级上册"
  }
  ```

### 2. **更新进度 (UPDATE)**
- **触发时机**: 视频播放时，每隔 **3秒** 自动发送（已节流）
- **发送数据**:
  ```json
  {
    "type": "video",
    "status": "update",
    "timestamp": 1702800003000,
    "videoId": "video_001",
    "progress": 123,
    "duration": 600,
    "progressPercent": 21
  }
  ```

### 3. **退出视频 (EXIT)**
- **触发时机**: 
  - 用户点击返回按钮
  - 页面卸载（如用户切换到其他页面）
  - 应用进入后台
- **发送数据**:
  ```json
  {
    "type": "video",
    "status": "exit",
    "timestamp": 1702800600000,
    "videoId": "video_001",
    "progress": 600,
    "duration": 600,
    "progressPercent": 100
  }
  ```

## 🔧 关键实现

### 导入 Hook
```typescript
import { useActivityTracking } from "../../hooks/useActivityTracking"
```

### 初始化追踪
```typescript
const { startVideo, updateVideoProgress, endVideo } = useActivityTracking({
  throttleDelay: 3000, // 进度更新节流3秒
  autoExitOnUnmount: true, // 组件卸载时自动发送退出通知
})
```

### 启动追踪
```typescript
// 视频信息加载完成后立即启动
startVideo({
  videoId: response.video_code,
  videoName: response.course_name,
  progress: lastSavedTime, // 当前播放位置（秒）
  duration: totalDuration, // 视频总时长（秒）
  courseId: response.album_code,
  courseName: params.title,
})
```

### 更新进度
```typescript
// 在 onPlaybackStatusUpdate 中
if (status.isPlaying && durationSeconds > 0) {
  updateVideoProgress(currentSeconds, durationSeconds)
}
```

### 手动退出
```typescript
// 用户点击返回按钮时
const goBack = () => {
  endVideo() // 发送退出消息
  router.back()
}
```

## 🧪 测试步骤

### 1. 启动应用
```bash
npx expo start
```

### 2. 进入视频播放页面
- 打开同步课堂
- 选择任意视频进入播放

### 3. 观察控制台日志

**进入视频时应看到:**
```
📊 [活动追踪] 启动视频观看追踪
📊 [ActivityStore] 活动已设置: { type: "video", status: "enter", ... }
📊 [ActivityStore] 活动数据已发送: { type: "user_activity", data: { ... } }
```

**播放过程中应看到（每3秒）:**
```
📊 [ActivityStore] 活动已更新: { type: "video", status: "update", progress: 123, ... }
📊 [ActivityStore] 活动数据已发送: { ... }
```

**退出视频时应看到:**
```
📊 [活动追踪] 手动退出视频观看
📊 [ActivityStore] 活动已更新: { type: "video", status: "exit", ... }
📊 [ActivityStore] 活动数据已发送: { ... }
```

### 4. 检查 WebSocket 消息

在浏览器的开发者工具或 React Native Debugger 中：
- 打开 Network 选项卡
- 筛选 WS（WebSocket）连接
- 查看发送的消息是否包含 `type: "user_activity"`

## 🔍 调试技巧

### 查看当前活动
```typescript
import { useCurrentActivity } from '../../hooks/useActivityTracking'

const currentActivity = useCurrentActivity()
console.log('当前活动:', currentActivity)
```

### 查看活动历史
```typescript
import { useActivityHistory } from '../../hooks/useActivityTracking'

const activityHistory = useActivityHistory()
console.log('活动历史:', activityHistory)
```

### 测试页面
访问 `/examples/activity-tracking-test` 查看完整的测试界面。

## ⚙️ 配置选项

### 调整节流时间
如果需要更频繁或更少地发送进度更新，修改 `throttleDelay`：
```typescript
const { startVideo, updateVideoProgress, endVideo } = useActivityTracking({
  throttleDelay: 5000, // 改为5秒节流
})
```

### 禁用自动退出
如果不想在组件卸载时自动发送退出消息：
```typescript
const { startVideo, updateVideoProgress, endVideo } = useActivityTracking({
  autoExitOnUnmount: false,
})
```

## 📝 注意事项

1. **进度单位**: 视频进度使用 **秒** 作为单位，而不是百分比
2. **节流机制**: UPDATE 消息有节流，ENTER 和 EXIT 消息立即发送
3. **自动退出**: 页面失焦、应用后台、组件卸载都会触发 EXIT
4. **WebSocket 连接**: 确保 WebSocket 已连接，否则消息会进入队列

## 🚀 下一步

- [ ] 集成到阅读模块 (`src/app/reader/epub.tsx` 或 `epub-new.tsx`)
- [ ] 集成到作业批改模块
- [ ] 集成到作文批改模块
- [ ] 集成到错题本模块

## 📞 问题反馈

如果遇到问题，请检查：
1. WebSocket 是否已连接（查看 `globalWebSocket.getConnectionStatus()`）
2. 用户是否已登录（`userId` 不能为空）
3. 设备码是否正常获取（查看 `deviceCode`）
4. 控制台是否有错误日志

