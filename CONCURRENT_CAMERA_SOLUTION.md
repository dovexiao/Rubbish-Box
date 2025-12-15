# 智能相机并发检测解决方案

## 问题背景

在 Android 14 设备上，相机资源被占用导致应用出现黑屏或崩溃。应用有两个功能会使用相机：
- **坐姿检测**（后台服务，使用前置摄像头）
- **AI批改**（前台相机，使用后置摄像头）

在 Android 14 上，相机并发访问受到更严格的限制，导致两个功能无法同时使用相机。

## 解决方案概述

实现了一套**智能相机并发检测机制**，根据设备的实际能力动态决定是否需要停止坐姿检测服务：

1. **自动检测**：应用启动时自动检测设备是否支持并发相机访问
2. **智能决策**：
   - ✅ **支持并发**：坐姿检测继续运行，无需停止，用户体验最佳
   - ⚠️ **不支持并发**：智能停止坐姿检测，使用完毕后自动恢复
3. **完善的错误处理**：包含重试机制（最多3次）和友好的用户提示

## 技术实现

### 1. Native侧 - Android (Kotlin)

#### 修改文件：`android/app/src/main/java/com/xhtx/app/posture/PostureMonitorModule.kt`

添加了两个新方法：

```kotlin
/**
 * 设置相机是否被其他应用占用（用于避免并发冲突）
 */
@ReactMethod
fun setCameraInUseByOtherApp(inUse: Boolean)

/**
 * 检测设备是否支持并发相机访问
 * 返回对象：{ supported: boolean, cameraCount: number, concurrentSets: number, canUseConcurrently: boolean }
 */
@ReactMethod
fun checkConcurrentCameraSupport(promise: Promise)
```

**检测逻辑：**
- 使用 `CameraManager.cameraIdList` 获取相机数量
- 使用反射调用 `getConcurrentCameraIds()` (API 29+) 检测并发支持
- 综合判断：相机数量 >= 2 且 concurrentSets > 0 → 支持并发

### 2. React Native侧 - TypeScript

#### 修改文件：`src/modules/PostureMonitorModule.ts`

添加了接口定义和导出函数：

```typescript
// 并发相机支持检测结果
export interface ConcurrentCameraSupport {
  supported: boolean;           // 设备是否支持并发相机
  canUseConcurrently: boolean;  // 实际是否可以并发使用（综合判断）
  cameraCount: number;          // 设备相机数量
  concurrentSets: number;       // 并发相机集合数量
}

export async function checkConcurrentCameraSupport(): Promise<ConcurrentCameraSupport>
export function setCameraInUseByOtherApp(inUse: boolean): void
```

#### 修改文件：`src/app/ai/camera.tsx` 和 `src/app/ai/error-book/camera.tsx`

**关键改进：**

1. **组件挂载时检测并发支持：**
```typescript
useEffect(() => {
  const detectConcurrentSupport = async () => {
    const result = await checkConcurrentCameraSupport()
    setSupportsConcurrentCamera(result.canUseConcurrently)
    
    if (result.canUseConcurrently) {
      console.log('✅ 设备支持并发相机，AI批改时坐姿检测可继续运行')
    } else {
      console.log('⚠️ 设备不支持并发相机，AI批改时需停止坐姿检测')
    }
  }
  
  detectConcurrentSupport()
}, [])
```

2. **页面焦点时的智能处理：**
```typescript
useFocusEffect(
  useCallback(() => {
    const handlePostureServiceAndCamera = async () => {
      if (supportsConcurrentCamera) {
        // ✅ 支持并发：无需停止坐姿检测，只需通知服务
        console.log('✅ 设备支持并发相机，坐姿检测继续运行')
        setCameraInUseByOtherApp(true)
        await new Promise(resolve => setTimeout(resolve, 300))
      } else {
        // ⚠️ 不支持并发：必须停止坐姿检测
        if (wasRunning) {
          console.log('⏸️ 设备不支持并发，暂停坐姿检测服务以释放相机')
          await stopPostureMonitorService()
        }
        await new Promise(resolve => setTimeout(resolve, 800))
      }
      
      setCameraKey((prev) => prev + 1) // 强制重新挂载CameraView
    }
    
    handlePostureServiceAndCamera()
    
    return () => {
      if (supportsConcurrentCamera) {
        // ✅ 支持并发：只需清除占用标记
        setCameraInUseByOtherApp(false)
      } else {
        // ⚠️ 不支持并发：恢复坐姿检测服务
        if (postureServiceWasRunning) {
          setTimeout(() => {
            startPostureMonitorService().catch(console.error)
          }, 800)
        }
      }
    }
  }, [postureServiceWasRunning, supportsConcurrentCamera, router])
)
```

3. **完善的错误处理和重试机制：**
```typescript
<CameraView
  onCameraReady={() => {
    console.log("✅ CameraView 就绪")
    retryCountRef.current = 0 // 重置重试计数
  }}
  onError={async (error: any) => {
    const errorMessage = (error?.nativeEvent?.message || error?.message || '').toLowerCase()
    
    if (retryCountRef.current < MAX_RETRY_COUNT &&
        (errorMessage.includes('unavailable') || 
         errorMessage.includes('in use') || 
         errorMessage.includes('max cameras'))) {
      retryCountRef.current++
      console.warn(`⚠️ 相机错误，尝试重试 (${retryCountRef.current}/${MAX_RETRY_COUNT})...`)
      
      // 如果设备不支持并发，确保服务已停止
      if (!supportsConcurrentCamera) {
        await stopPostureMonitorService()
      }
      
      // 延迟后重建相机
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS))
      setCameraKey((prev) => prev + 1)
    } else {
      showError("相机启动失败，请返回重试")
      router.back()
    }
  }}
/>
```

## 修改的文件列表

### Android Native层
- `android/app/src/main/java/com/xhtx/app/posture/PostureMonitorModule.kt`

### React Native层
- `src/modules/PostureMonitorModule.ts`
- `src/app/ai/camera.tsx`
- `src/app/ai/error-book/camera.tsx`

## 测试建议

### 测试场景1：支持并发的设备
1. 启动应用，开启坐姿检测
2. 进入AI批改相机页面
3. **预期结果**：
   - 日志显示 "✅ 设备支持并发相机，坐姿检测继续运行"
   - 坐姿检测服务继续运行
   - AI批改相机正常工作
   - 无需停止/恢复坐姿检测

### 测试场景2：不支持并发的设备（如当前Android 14设备）
1. 启动应用，开启坐姿检测
2. 进入AI批改相机页面
3. **预期结果**：
   - 日志显示 "⚠️ 设备不支持并发，暂停坐姿检测服务以释放相机"
   - 坐姿检测服务自动停止
   - AI批改相机正常工作
   - 退出AI批改页面后，坐姿检测服务自动恢复

### 测试场景3：相机错误重试
1. 进入AI批改相机页面
2. 如果相机加载失败（如仍被占用）
3. **预期结果**：
   - 自动重试最多3次
   - 每次重试前确保坐姿检测服务已停止
   - 如果3次都失败，显示友好提示并返回上一页

## 日志关键词

在 `adb logcat` 中搜索以下关键词来调试：

- `📷 相机并发支持检测` - 查看并发检测结果
- `CameraConcurrency` - 查看Native层的并发能力查询
- `✅ 设备支持并发相机` - 支持并发
- `⚠️ 设备不支持并发相机` - 不支持并发
- `⏸️ 暂停坐姿检测服务` - 停止坐姿检测
- `▶️ 恢复坐姿检测服务` - 恢复坐姿检测
- `⚠️ 相机错误，尝试重试` - 相机错误重试

## 优势

1. **智能化**：自动检测设备能力，无需手动配置
2. **最佳体验**：支持并发的设备上坐姿检测不会中断
3. **兼容性强**：不支持并发的设备上自动降级为串行模式
4. **健壮性**：完善的错误处理和重试机制
5. **可维护性**：日志详尽，便于调试和排查问题

## 下一步

1. **测试**：在实际设备上测试两种场景（支持/不支持并发）
2. **优化**：根据测试结果调整延迟时间和重试策略
3. **监控**：收集用户设备的并发支持情况统计

---

**日期**: 2025-01-11
**作者**: AI Assistant
**状态**: 已实施，待测试

