# WebSocket 全局连接 - 快速启动指南

## ✅ 已完成的实现

### 1. 核心文件

已创建以下文件：

```
src/
├── stores/
│   └── deviceStatusStore.ts          # 设备状态 Store
├── services/
│   └── globalWebSocket.ts            # 全局 WebSocket 服务
├── hooks/
│   └── useGlobalWebSocket.ts         # WebSocket React Hook
├── components/
│   └── DeviceStatusIndicator.tsx     # 设备状态指示器组件（示例）
└── app/
    └── _layout.tsx                    # 已添加 useGlobalWebSocket Hook
```

### 2. 功能特性

- ✅ 自动保持 WebSocket 长连接
- ✅ 用户登录后自动连接，退出后自动断开
- ✅ 切换账号自动重新连接
- ✅ 应用前后台切换自动管理
- ✅ 自动接收设备状态并更新 Store
- ✅ 支持心跳保活和断线重连
- ✅ 消息队列（离线消息缓存）

## 🚀 如何使用

### 1. 在任何页面获取设备状态

```typescript
import { useDeviceStatusStore } from '../stores/deviceStatusStore'

function MyPage() {
  // 获取设备状态
  const deviceStatus = useDeviceStatusStore((state) => state.status)
  
  // 或使用选择器
  const isBound = useDeviceStatusStore((state) => state.status?.bound)
  const canDragVideo = useDeviceStatusStore((state) => state.status?.dragVideo)
  const canDisplayAnswer = useDeviceStatusStore((state) => state.status?.displayAnswer)
  
  return (
    <View>
      <Text>绑定状态: {isBound ? '已绑定' : '未绑定'}</Text>
      <Text>拖拽视频: {canDragVideo ? '允许' : '禁止'}</Text>
      <Text>显示答案: {canDisplayAnswer ? '显示' : '隐藏'}</Text>
    </View>
  )
}
```

### 2. 添加设备状态指示器

在需要显示设备状态的页面：

```typescript
import { DeviceStatusIndicator } from '../components/DeviceStatusIndicator'

function SettingsPage() {
  return (
    <View>
      <DeviceStatusIndicator />
      {/* 其他内容 */}
    </View>
  )
}
```

### 3. 根据设备状态控制功能

#### 示例 1: 视频拖拽控制

```typescript
function VideoPlayer() {
  const canDragVideo = useDeviceStatusStore((state) => state.status?.dragVideo)
  
  return (
    <Video
      source={videoUrl}
      draggable={canDragVideo}  // 根据设备状态控制
    />
  )
}
```

#### 示例 2: 答案显示控制

```typescript
function AnswerSection({ answer }) {
  const canDisplayAnswer = useDeviceStatusStore((state) => state.status?.displayAnswer)
  
  if (!canDisplayAnswer) {
    return <Text>答案已隐藏</Text>
  }
  
  return <Text>{answer}</Text>
}
```

#### 示例 3: 绑定状态检查

```typescript
function FeatureGate() {
  const isBound = useDeviceStatusStore((state) => state.status?.bound)
  
  if (!isBound) {
    return (
      <View>
        <Text>需要绑定设备才能使用此功能</Text>
        <Button title="去绑定" onPress={() => router.push('/bind-parent')} />
      </View>
    )
  }
  
  return <ProtectedFeature />
}
```

## 📋 WebSocket 消息格式

### 服务器推送的设备状态消息

```json
{
  "type": "deviceStatus",
  "bound": true,
  "dragVideo": true,
  "displayAnswer": true
}
```

当服务器推送此消息时，Store 会自动更新，所有使用该 Store 的组件都会重新渲染。

### 客户端发送消息

```typescript
import { sendWebSocketMessage } from '../hooks/useGlobalWebSocket'

// 发送自定义消息
sendWebSocketMessage({
  action: 'updateSettings',
  params: { volume: 80 }
})
```

## 🔧 配置

### WebSocket 连接参数

当前配置（在 `globalWebSocket.ts` 中）：

```
URL: ws://115.190.2.98:2333
参数: ?deviceCode={设备码}&phone={手机号}
```

### 修改配置

如需修改配置，编辑 `src/config/websocket.ts`：

```typescript
export const getWebSocketConfig = () => ({
  url: 'ws://your-server.com',
  heartbeatInterval: 30000,    // 心跳间隔
  reconnect: {
    maxAttempts: 10,           // 最大重连次数
    initialDelay: 1000,        // 初始延迟
  },
  // ... 其他配置
})
```

## 🐛 调试

### 1. 查看 WebSocket 状态

```typescript
import { useWebSocketStore } from '../stores/webSocketStore'

const status = useWebSocketStore((state) => state.status)
console.log('WebSocket 状态:', status)
// 输出: 'connected', 'connecting', 'disconnected' 等
```

### 2. 查看统计信息

```typescript
import { globalWebSocket } from '../services/globalWebSocket'

const stats = globalWebSocket.getStats()
console.log('统计信息:', {
  发送消息: stats.sentMessages,
  接收消息: stats.receivedMessages,
  重连次数: stats.reconnectCount,
})
```

### 3. 查看日志

所有 WebSocket 操作都会在控制台输出日志，搜索以下前缀：

- `[GlobalWebSocket]` - 服务日志
- `[DeviceStatusStore]` - 设备状态日志
- `[useGlobalWebSocket]` - Hook 日志

## 🎯 工作流程

### 应用启动流程

```
1. App 启动
   ↓
2. 初始化 WebSocket 服务 (useGlobalWebSocket)
   ↓
3. 检查用户登录状态
   ↓
4a. 未登录 → 等待用户登录
4b. 已登录 → 自动连接 WebSocket
   ↓
5. 连接成功
   ↓
6. 接收设备状态消息
   ↓
7. 更新 DeviceStatusStore
   ↓
8. 触发组件重新渲染
```

### 用户登录/切换账号流程

```
1. 用户登录/切换账号
   ↓
2. UserStore 更新
   ↓
3. useGlobalWebSocket 检测到变化
   ↓
4. 断开旧连接（如果存在）
   ↓
5. 使用新账号信息重新连接
   ↓
6. 接收新的设备状态
   ↓
7. 更新 DeviceStatusStore
```

### 消息接收流程

```
1. 服务器推送消息
   ↓
2. WebSocketManager 接收
   ↓
3. globalWebSocket.handleMessage() 处理
   ↓
4a. deviceStatus 消息 → 更新 DeviceStatusStore
4b. 其他消息 → 可扩展处理
   ↓
5. Store 更新触发组件重新渲染
```

## 📚 API 参考

### DeviceStatusStore

```typescript
// 状态
status: DeviceStatus | null        // 设备状态对象
isInitialized: boolean             // 是否已初始化
lastUpdatedAt: number | null       // 最后更新时间

// Actions
setStatus(status: DeviceStatus)    // 设置完整状态
updateStatus(partial)               // 更新部分状态
reset()                             // 重置状态

// 选择器
selectIsBound(state)               // 是否已绑定
selectCanDragVideo(state)          // 是否可拖拽视频
selectCanDisplayAnswer(state)      // 是否可显示答案
```

### globalWebSocket

```typescript
// 方法
initialize()                       // 初始化服务
connect(phone, deviceCode?)        // 连接
disconnect()                       // 断开
reconnect()                        // 重连
send(data, type?)                  // 发送消息
getStatus()                        // 获取连接状态
getStats()                         // 获取统计信息
```

### useGlobalWebSocket Hook

```typescript
// 导出的辅助函数
connectWebSocket(phone, deviceCode?)    // 手动连接
disconnectWebSocket()                   // 手动断开
reconnectWebSocket()                    // 手动重连
sendWebSocketMessage(data, type?)       // 发送消息
```

## ⚠️ 注意事项

1. **不要手动创建 WebSocket 连接** - 使用全局服务
2. **不要直接修改 Store** - 由 WebSocket 消息自动更新
3. **记得清理订阅** - 避免内存泄漏
4. **检查连接状态** - 发送消息前确认已连接

## 🔄 下一步

如需扩展功能：

1. **添加新的消息类型** - 在 `globalWebSocket.ts` 的 `handleMessage` 中添加
2. **添加新的 Store** - 创建新的 Zustand Store 存储其他数据
3. **添加新的事件监听** - 使用 `wsManager.on()` 添加事件监听器

## 📖 完整文档

查看 `WEBSOCKET_USAGE.md` 了解更多详细信息。

## ✨ 示例

完整示例组件：`src/components/DeviceStatusIndicator.tsx`

---

**如有问题，请查看控制台日志或参考完整文档。**
