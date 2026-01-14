# React Native Image 组件在 Android 上的缓存机制分析

## 问题描述

在使用 `expo-router` 切换路由时，发现：
1. 组件没有被卸载（`unmountOnBlur: false`）
2. 没有额外的网络请求（接口未被调用）
3. 但 Image 组件对网络图片资源表现出明显的"再载痕迹"（重新加载的视觉效果）

## 核心发现

### 1. Android 上的缓存机制

React Native 的 Image 组件在 Android 上使用 **Fresco** 库来加载图片。Fresco 确实有自动缓存机制：

- **内存缓存**：已解码的 Bitmap 对象
- **磁盘缓存**：原始图片数据
- **未解码内存缓存**：压缩的图片数据

### 2. 路由冻结机制的影响

在 `src/app/(tabs)/_layout.tsx` 中配置了：

```typescript
freezeOnBlur: true,   // Tab离开时冻结组件，节省资源但保持状态
unmountOnBlur: false, // Tab离开时不卸载组件，完全保持状态
```

**关键问题**：当视图被冻结（freeze）和解冻（unfreeze）时：

1. **视图可见性变化**：冻结时视图可能变为不可见（`VISIBILITY_GONE` 或 `VISIBILITY_INVISIBLE`）
2. **Fresco 的内存管理**：为了节省内存，Fresco 可能会：
   - 释放已解码的 Bitmap（内存缓存）
   - 但保留磁盘缓存
3. **解冻时的行为**：当视图重新可见时：
   - Fresco 需要从磁盘缓存重新加载图片到内存
   - 这个过程会触发 `onLoadStart` 事件
   - 即使图片已经在磁盘缓存中，也需要解码过程
   - 解码过程可能产生"再载痕迹"（如淡入动画、占位符闪烁等）

### 3. 源码分析

从 `ReactImageView.kt` 的代码可以看到：

```kotlin
protected override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
    super.onSizeChanged(w, h, oldw, oldh)
    if (w > 0 && h > 0) {
      isDirty = isDirty || hasMultipleSources() || isTiled
      maybeUpdateView()  // 可能触发重新加载
    }
}
```

当视图尺寸变化或状态变化时，会调用 `maybeUpdateView()`，这可能触发图片的重新加载。

### 4. Fresco 的 DraweeView 生命周期

Fresco 的 `GenericDraweeView`（ReactImageView 的父类）在以下情况会重新加载图片：

- `onAttachedToWindow()`：视图附加到窗口时
- `onDetachedFromWindow()`：视图从窗口分离时
- 视图可见性变化：`VISIBLE` ↔ `INVISIBLE` / `GONE`

即使图片在磁盘缓存中，从磁盘加载到内存并解码的过程仍然需要时间，可能产生视觉上的"再载痕迹"。

## 解决方案

### 方案 1：使用 `cache: 'force-cache'` 属性

在 Image 组件的 source 中明确指定缓存策略：

```typescript
<Image
  source={{
    uri: imageUrl,
    cache: 'force-cache', // 强制使用缓存
  }}
  style={styles.image}
/>
```

**⚠️ 重要发现**：
- ❌ **Android 不支持**：根据 React Native 官方文档，`cache` 属性**仅支持 iOS**
- 📖 **官方文档标记**：文档中 `cache` 属性明确标注为 "ios" only
- 🔍 **源码中的情况**：虽然 Android 的 `ReactImageView.kt` 源码中有 `computeCacheControl()` 函数，但：
  - 可能实现不完整或存在 bug
  - 功能可能被禁用或未启用
  - **官方文档更准确，应该认为 Android 不支持**
- 📝 **iOS 的实现**：iOS 使用 `NSURLRequestCachePolicy` 来控制缓存策略
- ⚠️ **Android 的替代方案**：在 Android 上需要使用 `react-native-fast-image` 或本地文件缓存来实现类似功能

### 方案 2：使用 `react-native-fast-image`（最佳性能）

`react-native-fast-image` 提供了更好的缓存控制和性能：

```bash
npm install react-native-fast-image
```

```typescript
import FastImage from 'react-native-fast-image'

<FastImage
  source={{
    uri: imageUrl,
    priority: FastImage.priority.normal,
    cache: FastImage.cacheControl.immutable, // 永久缓存
  }}
  style={styles.image}
/>
```

### 方案 3：预加载图片到内存

在路由切换前预加载图片，确保图片在内存缓存中：

```typescript
// 在页面获得焦点时预加载
useFocusEffect(
  useCallback(() => {
    // 预加载关键图片
    Image.prefetch(imageUrl)
    return () => {}
  }, [imageUrl])
)
```

### 方案 4：调整路由配置（权衡方案）

如果性能不是主要问题，可以关闭冻结：

```typescript
screenOptions={{
  freezeOnBlur: false,  // 不冻结，保持图片在内存中
  unmountOnBlur: false,
}}
```

**缺点**：会增加内存占用。

### 方案 5：使用本地缓存文件（当前项目已实现）

项目中的 `src/utils/imageCache.ts` 已经实现了本地文件缓存：

```typescript
// 下载并缓存到本地文件系统
const cachedPath = await downloadAndCacheHomeBg(imageUrl)

// 使用本地文件路径而不是网络 URL
<Image source={{ uri: cachedPath }} />
```

**重要说明**：
- ✅ **避免网络请求**：图片已下载到本地，无需再次网络请求
- ❌ **仍然需要解码**：即使使用本地文件，Fresco 仍然需要：
  1. 从文件系统读取文件（I/O 操作）
  2. 解码图片数据为 Bitmap（CPU 操作）
  3. 如果内存缓存被释放，这个过程仍会产生加载时间
- 📝 **不是 base64**：实现是将网络图片下载保存为本地文件（`file://` URI），不是转换为 base64

**结论**：本地缓存可以避免网络延迟，但**无法完全避免解码过程**，特别是在视图冻结/解冻时内存缓存被释放的情况下。

## 根本原因总结

1. **Fresco 的内存管理策略**：为了节省内存，冻结的视图会释放内存缓存
2. **视图生命周期**：冻结/解冻会触发视图可见性变化，Fresco 会重新加载图片
3. **解码过程不可避免**：
   - 即使有磁盘缓存，从磁盘加载并解码 Bitmap 仍需要时间
   - **本地文件缓存也无法避免解码**：`imageCache.ts` 只是将网络图片保存为本地文件，Fresco 仍需要读取文件并解码
   - 这不是 base64 转换，而是文件系统缓存
4. **视觉反馈**：Fresco 的淡入动画和占位符机制会显示加载过程

## 关键问题解答

### Q1: 本地缓存工具（imageCache.ts）是否解决不了解码问题？

**答案：是的，解决不了本质的解码问题。**

- ✅ **能做的**：避免网络请求，将图片保存为本地文件（`file://` URI）
- ❌ **不能做的**：无法避免 Fresco 从文件系统读取并解码的过程
- 📝 **实现方式**：使用 `FileSystem.downloadAsync()` 下载图片到本地，返回本地文件路径，不是 base64

### Q2: Image 的 source 的 cache 属性只支持 iOS 吗？

**答案：根据官方文档，确实只支持 iOS。但源码中有相关实现。**

**官方文档的标记**：
- 📖 React Native 官方文档明确标记 `cache` 属性为 **iOS only**
- 📖 文档中 `cache` 属性旁边有 "ios" 标签

**源码中的情况**：
- 🔍 Android 的 `ReactImageView.kt` 源码中确实有 `computeCacheControl()` 函数
- 🔍 支持 `ImageCacheControl` 枚举（`DEFAULT`, `RELOAD`, `FORCE_CACHE`, `ONLY_IF_CACHED`）
- ❓ **但可能未完全实现或有问题**：虽然源码中有相关代码，但可能：
  1. 实现不完整，存在 bug
  2. 功能被禁用或未启用
  3. 文档更准确，实际不支持
  4. 在较新版本中才支持，但文档未更新

**建议**：
- ⚠️ **不要依赖 Android 上的 `cache` 属性**：既然官方文档标记为 iOS only，应该认为 Android 不支持
- ✅ **使用其他方案**：在 Android 上使用 `react-native-fast-image` 或本地文件缓存
- 🧪 **如需验证**：可以在 Android 设备上测试 `cache: 'force-cache'` 是否真的生效

## 推荐方案

对于当前项目，建议：

1. **iOS 平台**：在关键图片上使用 `cache: 'force-cache'`
2. **Android 平台**：
   - 使用 `react-native-fast-image` 替换关键路径的 Image 组件（推荐）
   - 或继续使用现有的本地文件缓存机制（`imageCache.ts`）
3. **跨平台方案**：使用条件渲染，iOS 使用原生 Image + cache，Android 使用 react-native-fast-image

## 验证方法

可以通过以下方式验证缓存是否生效：

```typescript
// 查询缓存状态
const cacheStatus = await Image.queryCache([imageUrl])
console.log('缓存状态:', cacheStatus) 
// 输出: { 'https://...': 'disk' | 'memory' | 'disk/memory' }
```

## 参考资料

- [React Native Image 文档](https://reactnative.dev/docs/image)
- [Fresco 文档](https://frescolib.org/)
- [react-native-fast-image](https://github.com/DylanVann/react-native-fast-image)

