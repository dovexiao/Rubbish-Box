# 将解码后的图片数据保存在 JS 层的方案分析

## 问题背景

当图片被解码后（Android 的 Bitmap，iOS 的 UIImage），这些是原生层的对象。如果能在 JS 层保存解码后的数据，就可以：
- 避免视图冻结/解冻时的重新解码
- 实现真正的"零延迟"图片显示
- 完全控制缓存策略

## 核心挑战

1. **原生对象无法直接传递到 JS 层**：Bitmap/UIImage 是原生对象，无法通过 Bridge 传递
2. **内存限制**：解码后的图片数据很大（例如 1920x1080 的图片，RGBA 格式约 8MB）
3. **性能问题**：JS 层处理大量二进制数据性能较差
4. **序列化开销**：需要将原生对象转换为 JS 可用的格式

## 可行方案分析

### 方案 1：Base64 编码（可行但不推荐）

**原理**：将解码后的 Bitmap 转换为 Base64 字符串，保存在 JS 层

```typescript
// 原生模块示例（伪代码）
// Android
Bitmap bitmap = ...; // 解码后的图片
ByteArrayOutputStream stream = new ByteArrayOutputStream();
bitmap.compress(Bitmap.CompressFormat.JPEG, 100, stream);
byte[] byteArray = stream.toByteArray();
String base64 = Base64.encodeToString(byteArray, Base64.DEFAULT);

// 返回给 JS
promise.resolve(base64);
```

**JS 层使用**：
```typescript
// 保存 base64
const base64Cache = new Map<string, string>();
base64Cache.set(imageUrl, base64String);

// 使用
<Image source={{ uri: `data:image/jpeg;base64,${base64String}` }} />
```

**优点**：
- ✅ 实现简单，无需额外依赖
- ✅ 可以直接在 JS 层使用（data URI）
- ✅ 可以保存在 AsyncStorage 或内存中

**缺点**：
- ❌ **体积增大 33%**：Base64 编码会使数据体积增加约 33%
- ❌ **内存占用大**：1920x1080 的图片，Base64 字符串约 10-11MB
- ❌ **性能问题**：
  - 编码/解码需要 CPU 时间
  - JS 字符串操作大字符串性能差
  - 可能导致 JS 线程阻塞
- ❌ **仍然需要解码**：使用 data URI 时，Image 组件仍需要解码 Base64
- ❌ **不适合大图片**：对于大图片，可能导致内存溢出

**适用场景**：
- 小图片（< 500KB）
- 临时缓存
- 需要跨平台一致性

---

### 方案 2：原生模块桥接 + 文件系统（推荐）

**原理**：在原生层解码后，将 Bitmap 保存为压缩格式（JPEG/PNG）到文件系统，JS 层只保存文件路径

```typescript
// 原生模块接口
interface ImageCacheModule {
  // 解码并缓存图片
  decodeAndCache(uri: string): Promise<string>; // 返回本地文件路径
  
  // 检查缓存是否存在
  hasCache(uri: string): Promise<boolean>;
  
  // 获取缓存路径
  getCachePath(uri: string): Promise<string | null>;
}
```

**实现流程**：
1. 首次加载：网络图片 → 原生层解码 → 保存为本地文件 → 返回文件路径
2. 后续使用：直接使用本地文件路径，无需重新解码（如果文件存在）

**优点**：
- ✅ **避免重复解码**：文件已存在时，Fresco 可能使用缓存
- ✅ **内存占用小**：JS 层只保存路径（字符串）
- ✅ **性能好**：文件 I/O 比 Base64 编码/解码快
- ✅ **可持久化**：文件可以跨应用重启保存

**缺点**：
- ⚠️ **仍然可能重新解码**：如果 Fresco 的内存缓存被释放，仍需要从文件读取并解码
- ⚠️ **需要原生开发**：需要编写原生模块代码
- ⚠️ **文件管理**：需要管理缓存文件的清理

**适用场景**：
- 当前项目已部分实现（`imageCache.ts`）
- 需要持久化缓存
- 大图片场景

---

### 方案 3：JSI（JavaScript Interface）- 新架构（最佳性能）

**原理**：使用 React Native 新架构的 JSI，直接在原生层和 JS 层之间共享内存

```cpp
// C++ JSI 模块（伪代码）
class ImageCacheJSI : public jsi::HostObject {
  jsi::Value get(jsi::Runtime &rt, const jsi::PropNameID &name) override {
    if (name.utf8(rt) == "getCachedBitmap") {
      return jsi::Function::createFromHostFunction(
        rt, jsi::PropNameID::forAscii(rt, "getCachedBitmap"), 1,
        [](jsi::Runtime &rt, const jsi::Value &thisVal, 
           const jsi::Value *args, size_t count) {
          // 直接从原生层获取 Bitmap，无需序列化
          // 返回可以直接用于渲染的对象
        });
    }
  }
};
```

**优点**：
- ✅ **零拷贝**：原生对象可以直接暴露给 JS，无需序列化
- ✅ **性能最佳**：避免了 Bridge 的序列化开销
- ✅ **内存共享**：可以在原生层和 JS 层之间共享内存

**缺点**：
- ❌ **需要新架构**：React Native 0.68+ 且需要启用新架构
- ❌ **实现复杂**：需要 C++ 和 JSI 知识
- ❌ **兼容性**：旧版本不支持

**适用场景**：
- 新项目或已启用新架构
- 对性能要求极高
- 有 C++ 开发能力

---

### 方案 4：WebP/HEIC 等压缩格式（折中方案）

**原理**：在原生层将解码后的 Bitmap 重新编码为更高效的压缩格式（WebP），保存到文件系统

```typescript
// 原生模块
interface ImageCacheModule {
  // 解码并转换为 WebP 格式保存
  decodeToWebP(uri: string, quality: number): Promise<string>;
}
```

**优点**：
- ✅ **体积小**：WebP 比 JPEG 体积小 25-35%
- ✅ **质量好**：相同体积下质量更好
- ✅ **支持透明度**：比 JPEG 功能更全

**缺点**：
- ⚠️ **仍需解码**：使用 WebP 文件时仍需要解码
- ⚠️ **编码开销**：转换为 WebP 需要 CPU 时间
- ⚠️ **兼容性**：某些旧设备可能不支持

---

### 方案 5：Blob/ArrayBuffer（理论可行，实际受限）

**原理**：将 Bitmap 的像素数据转换为 ArrayBuffer，保存在 JS 层

```typescript
// 原生模块返回像素数据
const pixelData = await ImageCacheModule.getPixelData(uri);
// pixelData: ArrayBuffer，包含 RGBA 像素数据

// JS 层保存
const cache = new Map<string, ArrayBuffer>();
cache.set(uri, pixelData);
```

**优点**：
- ✅ **原始数据**：保存的是原始像素数据
- ✅ **可操作**：可以在 JS 层进行图像处理

**缺点**：
- ❌ **体积巨大**：1920x1080 RGBA = 8MB
- ❌ **无法直接使用**：ArrayBuffer 无法直接用于 Image 组件
- ❌ **仍需转换**：使用时需要转换回可用的格式
- ❌ **性能差**：JS 层处理大量二进制数据性能很差

**适用场景**：
- 需要图像处理
- 小图片
- 特殊用途

---

## 方案对比总结

| 方案 | 实现难度 | 性能 | 内存占用 | 是否避免解码 | 推荐度 |
|------|---------|------|----------|-------------|--------|
| Base64 | ⭐ 简单 | ⭐⭐ 较差 | ⭐⭐⭐ 很大 | ❌ 否 | ⭐⭐ |
| 原生模块+文件 | ⭐⭐ 中等 | ⭐⭐⭐ 较好 | ⭐⭐⭐ 小 | ⚠️ 部分 | ⭐⭐⭐⭐ |
| JSI | ⭐⭐⭐⭐ 困难 | ⭐⭐⭐⭐⭐ 最佳 | ⭐⭐⭐⭐ 中等 | ✅ 是 | ⭐⭐⭐⭐⭐ |
| WebP压缩 | ⭐⭐ 中等 | ⭐⭐⭐ 较好 | ⭐⭐⭐ 较小 | ❌ 否 | ⭐⭐⭐ |
| ArrayBuffer | ⭐⭐ 中等 | ⭐ 很差 | ⭐ 巨大 | ❌ 否 | ⭐ |

## 关键发现

### 1. 无法完全避免解码

**核心问题**：即使将解码后的数据保存在 JS 层，使用 Image 组件时仍然需要：
- 将数据传递给原生层
- 原生层重新解码（或使用缓存）

**唯一例外**：使用 JSI 新架构，可以直接共享原生对象，但实现复杂。

### 2. 最佳实践

对于当前项目（React Native 0.79.6）：

1. **短期方案**：继续使用 `imageCache.ts` 的本地文件缓存
   - 已实现，无需额外开发
   - 避免网络请求
   - 虽然仍可能解码，但文件 I/O 比网络请求快

2. **中期优化**：
   - 在页面获得焦点时预加载图片（`Image.prefetch`）
   - 使用 `react-native-fast-image` 替换关键路径
   - 考虑关闭 `freezeOnBlur`（如果内存允许）

3. **长期方案**（如果启用新架构）：
   - 使用 JSI 实现高性能图片缓存
   - 或等待 React Native 官方改进

### 3. 实际建议

**对于"再载痕迹"问题**：

最实用的解决方案是：
- ✅ **预加载**：在路由切换前预加载图片到内存
- ✅ **关闭冻结**：`freezeOnBlur: false`（如果内存允许）
- ✅ **使用 react-native-fast-image**：更好的内存管理

**不推荐**：
- ❌ Base64 方案：体积和性能问题
- ❌ ArrayBuffer 方案：内存占用太大
- ❌ 复杂的 JSI 方案：除非有特殊需求

## 结论

**理论上**：可以通过 Base64、原生模块、JSI 等方式将解码数据保存在 JS 层。

**实际上**：
1. **无法完全避免解码**：即使保存了数据，使用 Image 组件时仍需要解码
2. **性能权衡**：Base64 等方案会带来性能问题
3. **最佳方案**：使用本地文件缓存 + 预加载，这是性能和复杂度的最佳平衡

**最终建议**：接受"轻微的解码延迟"，通过预加载和优化路由配置来改善用户体验，而不是尝试在 JS 层保存解码数据。

