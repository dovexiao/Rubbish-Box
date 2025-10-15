# React Native 布局宽度问题解决方案

## 问题现象
- 样式设置了 `width: 400px`，但实际渲染宽度却是 `1066.57px`
- `overflow: "hidden"` 不生效
- 元素被意外拉伸，超出预期尺寸

## 根本原因
1. **Flexbox 默认行为**：`flex: 1` 或其他 flex 属性覆盖了固定宽度
2. **父容器约束**：父容器没有正确限制子元素的宽度
3. **React Native 布局算法**：在某些情况下会忽略固定宽度
4. **缺少必要的 flex 属性**：只设置 `flexShrink: 0` 不够，还需要 `flexGrow: 0`

## 解决方案

### 方案1：完整的 flex 属性设置
```typescript
const styles = StyleSheet.create({
  container: {
    width: 156.25, // 会被 createStyles 自动转换为 rpx
    minWidth: 156.25, // 最小宽度
    maxWidth: 156.25, // 最大宽度，强制限制
    height: "100%",
    flexShrink: 0, // 防止收缩
    flexGrow: 0, // 防止拉伸
    flexBasis: 156.25, // 设置基础宽度
    backgroundColor: "transparent",
    overflow: "hidden",
  },
})
```

### 方案2：使用 rpx 函数（推荐）
```typescript
import { rpx } from "../../utils/rpxStyleSheet"

const styles = StyleSheet.create({
  container: {
    width: rpx(156.25), // 明确使用 rpx 函数
    height: "100%",
    flexShrink: 0,
    flexGrow: 0,
    flexBasis: rpx(156.25),
    backgroundColor: "transparent",
    overflow: "hidden",
  },
})
```

### 方案3：父容器约束
```typescript
const styles = StyleSheet.create({
  parentContainer: {
    flexDirection: "row",
    gap: rpx(15), // 使用 rpx 确保间距正确
    maxWidth: "100%", // 限制父容器宽度
    overflow: "hidden", // 隐藏超出部分
  },
  childContainer: {
    width: rpx(156.25),
    flexShrink: 0,
    flexGrow: 0,
  },
})
```

## 关键要点
1. **必须同时设置** `flexShrink: 0` 和 `flexGrow: 0`
2. **使用 `maxWidth` 和 `minWidth`** 作为额外约束
3. **父容器也要设置约束**，如 `maxWidth: "100%"`
4. **优先使用 `rpx()` 函数** 而不是依赖 `createStyles` 的自动转换
5. **在 flex 布局中**，`flexBasis` 比 `width` 优先级更高

## 调试技巧
- 使用 React Native 开发者工具检查实际渲染尺寸
- 对比样式设置值与实际渲染值
- 检查父容器的 flex 属性是否影响子元素
- 使用 `backgroundColor` 临时标记元素边界进行调试

## 实际案例：错题本左侧科目列表
```typescript
// 问题：宽度设置为 156.25rpx，但实际显示 1066.57px
// 解决：添加完整的 flex 约束

subjectList: {
  width: rpx(156.25), // 明确使用 rpx 函数
  minWidth: rpx(156.25), // 最小宽度
  maxWidth: rpx(156.25), // 最大宽度，强制限制
  height: "100%",
  flexShrink: 0, // 防止收缩
  flexGrow: 0, // 防止拉伸
  flexBasis: rpx(156.25), // 设置基础宽度
  backgroundColor: "transparent",
  overflow: "hidden",
},
```

## 相关文件
- `/src/utils/rpxStyleSheet.ts` - rpx 转换函数
- `/src/utils/rpx.ts` - 独立的 rpx 工具函数
- `/src/app/ai/error-book/index.tsx` - 实际应用案例
