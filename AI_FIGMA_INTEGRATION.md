# AI 助手 + Figma 集成方案

## 🎯 功能说明

这个方案让 AI 助手（我）能够：
- ✅ 直接查看您的 Figma 设计规范
- ✅ 在编写代码时参考设计样式
- ✅ 确保代码实现与设计保持一致
- ✅ 自动同步设计令牌

## 📁 文件结构

```
项目根目录/
├── .figma.config.json          # Figma 配置文件（您需要填写）
├── src/constants/
│   ├── figma-design-tokens.ts   # 设计令牌 TypeScript 定义
│   └── figma-design-spec.json   # AI 可读的设计规范（自动生成）
└── scripts/
    └── figma-to-ai.js          # 同步脚本
```

## 🚀 快速开始

### 步骤1: 配置 Figma 信息

编辑 `.figma.config.json`：

```json
{
  "fileKey": "您的Figma文件ID",
  "fileUrl": "https://www.figma.com/file/xxx/design",
  "token": "您的Figma Personal Access Token（可选）",
  "designTokens": {
    "colors": {
      "primary": "#4891FF",
      "secondary": "#93abff"
    }
  }
}
```

**如何获取：**
- `fileKey`: Figma 文件 URL 中的文件 ID
- `fileUrl`: 完整的 Figma 文件链接
- `token`: https://www.figma.com/settings → Personal Access Tokens

### 步骤2: 同步设计规范

```bash
npm run figma:sync
```

这会：
1. 从 Figma API 获取设计文件（如果配置了 token）
2. 提取颜色、字体、间距等设计令牌
3. 生成 AI 可读的设计规范文件
4. 生成 TypeScript 类型定义

### 步骤3: 在代码中使用

```typescript
import { figmaDesignTokens, getColor, getSpacing } from '@/constants/figma-design-tokens';

// 使用颜色
const primaryColor = getColor('primary');

// 使用间距
const margin = getSpacing(2); // 16px (8 * 2)

// 使用组件样式
const buttonStyle = figmaDesignTokens.components.button;
```

## 🤖 AI 助手如何使用

当您让我编写代码时，我会：

1. **自动读取设计规范**
   - 查看 `src/constants/figma-design-spec.json`
   - 参考 `src/constants/figma-design-tokens.ts`

2. **使用设计令牌**
   ```typescript
   // 我会自动使用设计规范中的颜色
   const styles = createStyles({
     button: {
       backgroundColor: figmaDesignTokens.colors.primary,
       padding: getSpacing(2),
       borderRadius: figmaDesignTokens.components.button.borderRadius,
     }
   });
   ```

3. **确保设计一致性**
   - 所有颜色、字体、间距都从设计规范中获取
   - 组件尺寸与设计保持一致

## 💡 使用示例

### 示例1: 创建按钮组件

**您说：** "创建一个按钮组件，使用设计规范中的主色"

**我会：**
```typescript
import { figmaDesignTokens, getColor } from '@/constants/figma-design-tokens';

export function Button({ title, onPress }) {
  const styles = createStyles({
    button: {
      backgroundColor: getColor('primary'), // 使用设计规范中的主色
      height: figmaDesignTokens.components.button.height,
      borderRadius: figmaDesignTokens.components.button.borderRadius,
      paddingHorizontal: figmaDesignTokens.components.button.padding[1],
      paddingVertical: figmaDesignTokens.components.button.padding[0],
    }
  });
  
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
}
```

### 示例2: 更新设计规范

**您说：** "主色改成 #FF6B6B"

**我会：**
1. 更新 `.figma.config.json` 中的颜色
2. 运行 `npm run figma:sync` 同步
3. 所有使用该颜色的组件自动更新

## 🔄 工作流程

```
Figma 设计文件
    ↓
[配置 .figma.config.json]
    ↓
[npm run figma:sync]
    ↓
生成设计规范文件
    ↓
AI 助手读取设计规范
    ↓
编写符合设计的代码
```

## 📝 最佳实践

1. **定期同步**
   - 设计更新后运行 `npm run figma:sync`
   - 确保代码与设计保持一致

2. **使用设计令牌**
   - 不要硬编码颜色值
   - 使用 `getColor()` 和 `getSpacing()` 函数

3. **组件样式**
   - 参考 `figmaDesignTokens.components`
   - 保持组件尺寸与设计一致

4. **告诉 AI**
   - 在让我编写代码时，说"使用设计规范中的样式"
   - 我会自动参考设计令牌

## ❓ 常见问题

**Q: 必须配置 Figma Token 吗？**
A: 不是必须的。如果不配置，会使用 `.figma.config.json` 中的本地配置。

**Q: 如何让 AI 知道使用设计规范？**
A: 直接说"使用设计规范"或"参考 Figma 设计"，我会自动读取设计规范文件。

**Q: 设计更新后怎么办？**
A: 运行 `npm run figma:sync` 同步，然后告诉我"设计已更新"，我会重新读取。

**Q: 可以手动编辑设计规范吗？**
A: 可以，直接编辑 `src/constants/figma-design-tokens.ts` 或 `.figma.config.json`。

