# WebSocket 全局连接使用文档

## 概述

项目已实现全局 WebSocket 连接管理，自动保持与服务器的长连接，并实时接收设备状态更新。

## 功能特性

- ✅ 自动保持与服务器的长连接
- ✅ 用户登录后自动连接
- ✅ 用户退出或切换账号时自动重连
- ✅ 应用前后台切换自动管理
- ✅ 自动接收设备状态更新并存储到 store
- ✅ 支持心跳保活和断线重连

## 核心文件

### 1. Store - 设备状态存储

```typescript
// src/stores/deviceStatusStore.ts
interface DeviceStatus {
  bound: boolean          // 是否已绑定
  dragVideo: boolean      // 是否允许拖拽视频
  displayAnswer: boolean  // 是否显示答案
}
```

### 2. Service - 全局 WebSocket 服务

```typescript
// src/services/globalWebSocket.ts
class GlobalWebSocketService {
  initialize()      // 初始化服务
  connect()         // 连接 WebSocket
  disconnect()      // 断开连接
  reconnect()       // 重新连接
  send()            // 发送消息
}
```

### 3. Hook - React Hook

```typescript
// src/hooks/useGlobalWebSocket.ts
useGlobalWebSocket()  // 在根组件中使用
```

## 使用方法

### 1. 获取设备状态

在任何组件中，可以通过 store 获取设备状态：

```typescript
import { useDeviceStatusStore } from '../stores/deviceStatusStore'

function MyComponent() {
  // 方式一：获取完整状态
  const deviceStatus = useDeviceStatusStore((state) => state.status)
  
  // 方式二：使用选择器获取特定字段
  const isBound = useDeviceStatusStore((state) => state.status?.bound)
  const canDragVideo = useDeviceStatusStore((state) => state.status?.dragVideo)
  const canDisplayAnswer = useDeviceStatusStore((state) => state.status?.displayAnswer)
  
  // 方式三：使用内置选择器
  const isBound = useDeviceStatusStore(selectIsBound)
  const canDragVideo = useDeviceStatusStore(selectCanDragVideo)
  const canDisplayAnswer = useDeviceStatusStore(selectCanDisplayAnswer)
  
  return (
    <View>
      <Text>绑定状态: {isBound ? '已绑定' : '未绑定'}</Text>
      <Text>拖拽视频: {canDragVideo ? '允许' : '禁止'}</Text>
      <Text>显示答案: {canDisplayAnswer ? '显示' : '隐藏'}</Text>
    </View>
  )
}
```

### 2. 手动连接/断开

如果需要手动控制连接（通常不需要，系统会自动管理）：

```typescript
import { 
  connectWebSocket, 
  disconnectWebSocket, 
  reconnectWebSocket 
} from '../hooks/useGlobalWebSocket'

// 手动连接
await connectWebSocket('17629059547', 'device123')

// 手动断开
disconnectWebSocket()

// 重新连接
await reconnectWebSocket()
```

### 3. 发送消息

```typescript
import { sendWebSocketMessage } from '../hooks/useGlobalWebSocket'

// 发送消息
const success = sendWebSocketMessage({
  action: 'updateSettings',
  data: { volume: 80 }
})

if (success) {
  console.log('消息发送成功')
} else {
  console.log('消息已加入队列，等待连接后发送')
}
```

### 4. 监听设备状态变化

使用 Zustand 的订阅机制监听状态变化：

```typescript
import { useDeviceStatusStore } from '../stores/deviceStatusStore'

useEffect(() => {
  // 订阅设备状态变化
  const unsubscribe = useDeviceStatusStore.subscribe(
    (state) => state.status,
    (newStatus, prevStatus) => {
      console.log('设备状态变化:', prevStatus, '->', newStatus)
      
      // 根据状态变化执行相应操作
      if (newStatus?.bound !== prevStatus?.bound) {
        console.log('绑定状态变化:', newStatus.bound)
      }
    }
  )
  
  return () => unsubscribe()
}, [])
```

## WebSocket 消息格式

### 服务器 → 客户端

设备状态消息格式：

```json
{
  "type": "deviceStatus",
  "bound": true,
  "dragVideo": true,
  "displayAnswer": true
}
```

### 客户端 → 服务器

发送消息格式：

```json
{
  "type": "message",
  "timestamp": 1704038400000,
  "data": {
    "action": "updateSettings",
    "params": { "volume": 80 }
  }
}
```

## 连接参数

WebSocket 连接 URL 格式：

```
ws://115.190.2.98:2333?deviceCode={设备码}&phone={手机号}
```

## 自动化行为

### 应用启动

1. 初始化 WebSocket 服务
2. 检查用户登录状态
3. 如果已登录，自动连接

### 用户登录

1. 获取用户手机号和设备码
2. 自动连接 WebSocket
3. 接收设备状态并存储

### 用户退出

1. 自动断开 WebSocket 连接
2. 清空设备状态

### 切换账号

1. 断开旧连接
2. 使用新账号重新连接
3. 接收新的设备状态

### 应用前后台切换

- **进入后台**: 暂停心跳（可配置）
- **回到前台**: 恢复心跳，检查连接状态

## 配置

WebSocket 配置文件位于 `src/config/websocket.ts`：

```typescript
export const getWebSocketConfig = (): Required<WebSocketConfig> => ({
  url: 'ws://115.190.2.98:2333',  // 默认 URL
  heartbeatInterval: 30000,        // 心跳间隔 30 秒
  heartbeatTimeout: 10000,         // 心跳超时 10 秒
  reconnect: {
    initialDelay: 1000,            // 初始重连延迟 1 秒
    maxDelay: 30000,               // 最大重连延迟 30 秒
    maxAttempts: 10,               // 最多重连 10 次
    backoffMultiplier: 1.5,        // 指数退避倍数
  },
  messageQueue: {
    maxSize: 100,                  // 最大队列 100 条
    strategy: 'fifo',              // FIFO 队列策略
  },
  background: {
    pauseHeartbeat: true,          // 后台暂停心跳
    closeConnection: false,        // 后台不关闭连接
  },
  connectionTimeout: 10000,        // 连接超时 10 秒
  autoConnect: false,              // 手动控制连接
})
```

## 调试

### 查看连接状态

```typescript
import { useWebSocketStore } from '../stores/webSocketStore'

const status = useWebSocketStore((state) => state.status)
console.log('WebSocket 状态:', status)
// 可能的值: 'disconnected', 'connecting', 'connected', 'reconnecting', 'failed'
```

### 查看统计信息

```typescript
import { globalWebSocket } from '../services/globalWebSocket'

const stats = globalWebSocket.getStats()
console.log('WebSocket 统计:', {
  发送消息数: stats.sentMessages,
  接收消息数: stats.receivedMessages,
  失败消息数: stats.failedMessages,
  重连次数: stats.reconnectCount,
  连接时长: stats.connectionDuration + 'ms',
})
```

### 日志

所有 WebSocket 相关操作都会在控制台输出日志，前缀为：
- `[GlobalWebSocket]` - 全局服务日志
- `[WebSocketStore]` - Store 日志
- `[DeviceStatusStore]` - 设备状态日志
- `[useGlobalWebSocket]` - Hook 日志

## 示例场景

### 场景 1: 视频播放控制

```typescript
function VideoPlayer() {
  const canDragVideo = useDeviceStatusStore(selectCanDragVideo)
  
  return (
    <Video
      source={videoUrl}
      draggable={canDragVideo}  // 根据设备状态控制是否可拖拽
      {...otherProps}
    />
  )
}
```

### 场景 2: 答案显示控制

```typescript
function AnswerSection() {
  const canDisplayAnswer = useDeviceStatusStore(selectCanDisplayAnswer)
  
  if (!canDisplayAnswer) {
    return <Text>答案已隐藏</Text>
  }
  
  return <Text>{answer}</Text>
}
```

### 场景 3: 绑定状态检查

```typescript
function DeviceSettings() {
  const isBound = useDeviceStatusStore(selectIsBound)
  
  if (!isBound) {
    return (
      <View>
        <Text>设备未绑定，请先绑定设备</Text>
        <Button title="去绑定" onPress={() => router.push('/bind-parent')} />
      </View>
    )
  }
  
  return <SettingsForm />
}
```

## 故障排查

### 1. 连接失败

- 检查设备码和手机号是否正确
- 检查网络连接
- 查看控制台日志

### 2. 收不到消息

- 检查 WebSocket 连接状态
- 确认服务器已推送消息
- 查看消息处理逻辑

### 3. 状态未更新

- 检查 store 是否正确订阅
- 确认消息格式是否正确
- 查看设备状态 store 日志

## 注意事项

1. **不要在组件中手动创建 WebSocket 连接**，应使用全局服务
2. **不要直接修改设备状态 store**，状态由 WebSocket 消息自动更新
3. **监听状态变化时记得清理订阅**，避免内存泄漏
4. **发送消息前检查连接状态**，离线消息会自动排队

## 扩展

如果需要处理其他类型的 WebSocket 消息，在 `globalWebSocket.ts` 的 `handleMessage` 方法中添加新的消息类型处理：

```typescript
private handleMessage(message: WebSocketMessage): void {
  const { type, data } = message
  
  // 添加新的消息类型
  switch (type) {
    case 'deviceStatus':
      this.handleDeviceStatus(data)
      break
    
    case 'notification':  // 新增消息类型
      this.handleNotification(data)
      break
    
    // ... 其他消息类型
  }
}
```
