# React Native 面试题集

## 📚 目录

- [React 基础](#react-基础)
- [React Native 核心](#react-native-核心)
- [项目相关技术](#项目相关技术)
- [性能优化](#性能优化)
- [实际场景题](#实际场景题)
- [架构设计](#架构设计)

---

## React 基础

### 1. React Hooks 相关

#### Q1: 请解释 `useState` 和 `useEffect` 的区别和使用场景？

**参考答案：**
- `useState`: 用于管理组件内部状态，返回状态值和更新函数
- `useEffect`: 用于处理副作用（数据获取、订阅、DOM操作等），在组件渲染后执行

**使用场景：**
```typescript
// useState - 管理本地状态
const [count, setCount] = useState(0)

// useEffect - 处理副作用
useEffect(() => {
  // 数据获取、订阅等
  fetchData()
  return () => {
    // 清理函数
  }
}, [dependencies])
```

#### Q2: 什么是 Hook 的依赖数组？如何正确设置依赖？

**参考答案：**
- 依赖数组决定 effect 何时重新执行
- 空数组 `[]`：只在组件挂载时执行一次
- 有依赖：依赖变化时重新执行
- 无依赖数组：每次渲染都执行

**常见错误：**
```typescript
// ❌ 错误：缺少依赖
useEffect(() => {
  fetchData(userId)
}, []) // userId 变化时不会重新获取

// ✅ 正确：包含所有依赖
useEffect(() => {
  fetchData(userId)
}, [userId])
```

#### Q3: `useCallback` 和 `useMemo` 的区别？什么时候使用？

**参考答案：**
- `useCallback`: 缓存函数，避免子组件不必要的重渲染
- `useMemo`: 缓存计算结果，避免重复计算

**使用场景：**
```typescript
// useCallback - 缓存函数
const handlePress = useCallback(() => {
  onItemPress(item.id)
}, [item.id, onItemPress])

// useMemo - 缓存计算结果
const expensiveValue = useMemo(() => {
  return heavyCalculation(data)
}, [data])
```

---

### 2. React 生命周期和渲染

#### Q4: React 18+ 中函数组件的生命周期如何对应？

**参考答案：**
```typescript
// 挂载阶段
useEffect(() => {
  // componentDidMount
  return () => {
    // componentWillUnmount
  }
}, [])

// 更新阶段
useEffect(() => {
  // componentDidUpdate
}, [dependencies])

// 渲染前
useLayoutEffect(() => {
  // 同步执行，在DOM更新前
}, [])
```

#### Q5: 什么是 React 的渲染优化？如何避免不必要的重渲染？

**参考答案：**
- 使用 `React.memo` 包装组件
- 使用 `useCallback` 和 `useMemo`
- 合理拆分组件，避免状态提升过多

```typescript
// React.memo - 浅比较 props
const MyComponent = React.memo(({ data }) => {
  return <View>{data}</View>
})

// useCallback - 缓存回调
const handlePress = useCallback(() => {
  // ...
}, [deps])
```

---

## React Native 核心

### 3. 组件和样式

#### Q6: React Native 中如何实现响应式布局？rpx 单位如何工作？

**参考答案：**
```typescript
// 项目中的 rpx 实现
import { rpx, createStyles } from '../utils/rpxStyleSheet'

const styles = createStyles({
  container: {
    width: rpx(750), // 设计稿宽度
    padding: rpx(20),
  }
})

// rpx 原理：基于设计稿宽度（750）和设备实际宽度进行比例换算
// rpx(750) = 设计稿宽度，在不同设备上自动适配
```

**关键点：**
- rpx 基于设计稿宽度进行等比缩放
- 使用 `createStyles` 统一处理样式转换
- 支持多设备配置（1920×1200, 1920×1080等）

#### Q7: FlatList 和 ScrollView 的区别？如何优化长列表性能？

**参考答案：**

| 特性 | FlatList | ScrollView |
|------|----------|------------|
| 渲染方式 | 虚拟化，只渲染可见项 | 一次性渲染所有子元素 |
| 性能 | 适合长列表 | 适合短列表 |
| 功能 | 内置分页、下拉刷新 | 需要手动实现 |

**优化技巧：**
```typescript
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  // 性能优化
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={5}
  // 分页
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
/>
```

---

### 4. 导航和路由

#### Q8: expo-router 文件系统路由的工作原理？

**参考答案：**
- 基于文件系统自动生成路由
- `(tabs)/` 表示路由组，不影响URL
- `_layout.tsx` 定义布局和路由守卫

**项目中的使用：**
```typescript
// app/(tabs)/index.tsx - 首页
// app/(auth)/login.tsx - 登录页
// app/_layout.tsx - 根布局

// 导航
router.push('/ai/speaking/practice')
router.replace({ pathname: '/ai/result', params: { id: '123' } })
```

#### Q9: 如何实现路由守卫和认证检查？

**参考答案：**
```typescript
// (auth)/_layout.tsx
export default function AuthLayout() {
  const { isLoggedIn } = useUserStore()
  const router = useRouter()
  
  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/login')
    }
  }, [isLoggedIn])
  
  return <Stack />
}
```

---

### 5. 状态管理

#### Q10: Zustand 相比 Redux 的优势？项目中如何使用？

**参考答案：**

**Zustand 优势：**
- 更简洁的API，无需 boilerplate
- 支持 TypeScript 类型推断
- 性能更好，按需订阅

**项目中的使用：**
```typescript
// stores/userStore.ts
interface UserState {
  user: User | null
  token: string | null
  isLoggedIn: boolean
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  token: null,
  isLoggedIn: false,
  setUser: (user) => set({ user, isLoggedIn: true }),
}))

// 组件中使用
const { user, setUser } = useUserStore()
```

---

## 项目相关技术

### 6. Expo 生态

#### Q11: Expo 和 React Native CLI 的区别？为什么选择 Expo？

**参考答案：**

| 特性 | Expo | React Native CLI |
|------|------|------------------|
| 开发体验 | 开箱即用，无需配置 | 需要手动配置原生代码 |
| 原生模块 | 通过 Expo Modules | 直接修改原生代码 |
| 构建 | EAS Build 云构建 | 本地构建 |
| 热更新 | Expo Updates | CodePush |

**项目选择 Expo 的原因：**
- 快速开发，丰富的 Expo SDK
- 统一的构建和部署流程
- 支持 OTA 热更新

#### Q12: 如何集成原生模块？项目中如何实现姿势检测？

**参考答案：**

**项目中的实现：**
```typescript
// 1. 创建原生模块
// android/app/src/main/java/.../PostureMonitorModule.kt
class PostureMonitorModule : ReactContextBaseJavaModule {
  @ReactMethod
  fun startMonitoring() {
    // 原生逻辑
  }
}

// 2. 创建 TypeScript 接口
// src/modules/PostureMonitorModule.ts
export interface NativePostureMonitor {
  startMonitoring(): Promise<void>
}

// 3. 在组件中使用
const { startMonitoring } = NativeModules.PostureMonitorModule
```

---

### 7. 样式系统

#### Q13: 项目中为什么使用自定义的 `createStyles` 而不是 `StyleSheet.create`？

**参考答案：**

**项目中的实现：**
```typescript
// utils/rpxStyleSheet.ts
export const createStyles = <T extends any>(styles: T): T => {
  const processedStyles = processStyles(styles)
  return StyleSheet.create(processedStyles) as T
}

// 优势：
// 1. 自动转换 rpx 单位
// 2. 支持多设备适配
// 3. 统一样式处理逻辑
// 4. 保持类型安全
```

**使用示例：**
```typescript
const styles = createStyles({
  container: {
    width: rpx(750), // 自动适配
    padding: rpx(20),
  }
})
```

---

### 8. 性能优化

#### Q14: 项目中如何优化流式内容渲染（如 AI 回答）？

**参考答案：**

**项目中的实现（loading.tsx）：**
```typescript
// 1. 使用打字机效果，逐字符显示
const [displayedText, setDisplayedText] = useState('')

useEffect(() => {
  const interval = setInterval(() => {
    setDisplayedText(prev => {
      const next = streamContent.substring(0, prev.length + 5)
      return next
    })
  }, 30) // 固定速度，不因内容长度变化
  
  return () => clearInterval(interval)
}, [streamContent])

// 2. 使用 WebView 渲染 Markdown，避免频繁重渲染
<WebView
  source={{ html: generateHTML(displayedText) }}
  // 防抖更新
  onMessage={debounce(handleUpdate, 100)}
/>

// 3. 优化 KaTeX 渲染频率
if (renderCount % 5 === 0 || text.includes('\\[')) {
  renderMathInElement(element)
}
```

**关键优化点：**
- 固定字符输出速度
- 防抖 WebView 更新
- 条件渲染 KaTeX

---

### 9. 音频和媒体

#### Q15: 项目中如何实现 TTS（文本转语音）？遇到网络问题如何解决？

**参考答案：**

**实现方案演进：**
```typescript
// 1. 最初使用 expo-speech（兼容性问题）
// 2. 尝试 Edge TTS（网络问题）
// 3. 最终使用 Google Translate TTS API

// services/ttsService.ts
export async function playTextToSpeech(text: string) {
  // 1. 检查缓存
  const cached = await getCachedAudio(text)
  if (cached) return playAudio(cached)
  
  // 2. 从 API 获取
  const audioUrl = `https://translate.google.com/translate_tts?...`
  const response = await fetch(audioUrl)
  const blob = await response.blob()
  
  // 3. 缓存并播放
  await cacheAudio(text, blob)
  await playAudio(blob)
}
```

**网络问题解决方案：**
- 实现本地缓存机制
- 添加超时和重试逻辑
- 提供降级方案（如使用系统 TTS）

---

## 性能优化

### 10. 渲染优化

#### Q16: 如何优化长列表的滚动性能？

**参考答案：**
```typescript
<FlatList
  data={items}
  renderItem={({ item }) => (
    <MemoizedItem item={item} />
  )}
  // 关键优化
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={5}
  initialNumToRender={10}
/>
```

#### Q17: 如何避免在滚动时触发不必要的重渲染？

**参考答案：**
```typescript
// 1. 使用 React.memo
const ListItem = React.memo(({ item }) => {
  return <View>{item.name}</View>
})

// 2. 使用 useCallback 缓存回调
const handlePress = useCallback((id: string) => {
  onItemPress(id)
}, [onItemPress])

// 3. 使用 InteractionManager 延迟非关键操作
InteractionManager.runAfterInteractions(() => {
  // 非关键操作
})
```

---

### 11. 内存优化

#### Q18: 如何处理图片加载和内存管理？

**参考答案：**
```typescript
// 1. 使用 expo-image 替代 Image
import { Image } from 'expo-image'

<Image
  source={{ uri: imageUrl }}
  cachePolicy="memory-disk" // 缓存策略
  contentFit="cover"
/>

// 2. 列表中使用缩略图
const thumbnailUrl = `${imageUrl}?w=200&h=200`

// 3. 及时清理
useEffect(() => {
  return () => {
    // 清理图片缓存
  }
}, [])
```

---

## 实际场景题

### 12. 项目实战

#### Q19: 如何实现一个支持多状态的页面（加载、空状态、错误、成功）？

**参考答案：**

**项目中的实现模式：**
```typescript
type PageState = 'loading' | 'empty' | 'error' | 'success'

export default function MyScreen() {
  const [state, setState] = useState<PageState>('loading')
  const [data, setData] = useState([])
  
  const fetchData = async () => {
    try {
      setState('loading')
      const result = await api.getData()
      
      if (result.length === 0) {
        setState('empty')
      } else {
        setData(result)
        setState('success')
      }
    } catch (error) {
      setState('error')
    }
  }
  
  const renderContent = () => {
    switch (state) {
      case 'loading': return <LoadingView />
      case 'empty': return <EmptyView />
      case 'error': return <ErrorView onRetry={fetchData} />
      case 'success': return <DataView data={data} />
    }
  }
  
  return <View>{renderContent()}</View>
}
```

#### Q20: 如何实现下拉刷新和上拉加载更多？

**参考答案：**
```typescript
const [refreshing, setRefreshing] = useState(false)
const [loadingMore, setLoadingMore] = useState(false)
const [page, setPage] = useState(1)

const onRefresh = async () => {
  setRefreshing(true)
  setPage(1)
  await fetchData(1)
  setRefreshing(false)
}

const onEndReached = async () => {
  if (loadingMore || !hasMore) return
  setLoadingMore(true)
  const nextPage = page + 1
  await fetchData(nextPage)
  setPage(nextPage)
  setLoadingMore(false)
}

<FlatList
  data={items}
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
  onEndReached={onEndReached}
  onEndReachedThreshold={0.5}
  ListFooterComponent={loadingMore ? <ActivityIndicator /> : null}
/>
```

---

### 13. 错误处理

#### Q21: 如何实现全局错误处理和用户友好的错误提示？

**参考答案：**

**项目中的实现：**
```typescript
// stores/toastStore.ts
export const useToastStore = create((set) => ({
  showToast: (message: string, type: 'success' | 'error') => {
    // 显示 Toast
  }
}))

// services/api.ts
try {
  const response = await api.getData()
  return response
} catch (error) {
  // 统一错误处理
  if (error.response?.status === 401) {
    // 跳转登录
    router.replace('/login')
  } else {
    // 显示错误提示
    useToastStore.getState().showToast(error.message, 'error')
  }
  throw error
}
```

---

## 架构设计

### 14. 项目架构

#### Q22: 项目的目录结构设计思路？为什么要这样组织？

**参考答案：**

```
src/
├── app/              # 页面（expo-router 文件系统路由）
│   ├── (tabs)/      # 路由组
│   └── _layout.tsx  # 布局
├── components/       # 可复用组件
├── services/         # API 服务层
├── stores/          # Zustand 状态管理
├── hooks/           # 自定义 Hooks
├── utils/           # 工具函数
└── constants/       # 常量（颜色、资源等）
```

**设计原则：**
- 按功能模块划分，而非按文件类型
- 服务层统一处理 API 调用
- 组件可复用，避免重复代码
- 工具函数集中管理

#### Q23: 如何实现设计系统与代码的同步（Figma 集成）？

**参考答案：**

**项目中的实现：**
```typescript
// 1. 配置文件
// .figma.config.json
{
  "fileKey": "...",
  "token": "...",
  "designTokens": { ... }
}

// 2. 同步脚本
// scripts/figma-to-ai.js
// 从 Figma API 获取设计令牌，生成 TypeScript 文件

// 3. 在代码中使用
import { figmaDesignTokens, getColor } from '@/constants/figma-design-tokens'

const styles = createStyles({
  button: {
    backgroundColor: getColor('primary'),
    padding: getSpacing(2),
  }
})
```

---

### 15. 测试和调试

#### Q24: 如何进行 React Native 应用的调试？

**参考答案：**

**调试工具：**
- React Native Debugger
- Flipper
- React DevTools
- Chrome DevTools（Web）

**调试技巧：**
```typescript
// 1. 使用 console.log（生产环境自动移除）
console.log('Debug info:', data)

// 2. 使用断点调试
debugger

// 3. 使用 React DevTools
// 检查组件状态和 props

// 4. 使用 Flipper
// 查看网络请求、日志、性能
```

---

## 🎯 总结

### 核心知识点

1. **React 基础**：Hooks、生命周期、性能优化
2. **React Native**：组件、样式、导航、性能
3. **项目技术栈**：Expo、Zustand、expo-router、自定义样式系统
4. **实战经验**：多状态管理、列表优化、错误处理

### 面试建议

1. **准备项目经验**：能详细说明项目中的技术选型和实现细节
2. **理解原理**：不仅会用，还要理解为什么这样设计
3. **性能意识**：关注性能优化和用户体验
4. **问题解决**：能说明遇到问题时的解决思路

---

**祝面试顺利！** 🚀

