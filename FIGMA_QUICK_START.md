# Figma 集成快速指南

## 🎯 推荐方案（按简单程度排序）

### ⭐ 方案1: Figma Dev Mode（最简单，零配置）

**无需安装任何工具，直接在Figma中查看样式！**

#### 使用步骤：
1. 打开 Figma 设计文件
2. 点击右上角 **"Dev Mode"** 按钮（或按 `Shift + D`）
3. 选择任意设计元素
4. 右侧面板自动显示：
   - ✅ 颜色值（HEX, RGB, RGBA）
   - ✅ 字体大小、行高、字重
   - ✅ 间距、边距、内边距
   - ✅ 圆角、阴影、边框
   - ✅ 可以直接复制 CSS/React Native 代码

#### 优点：
- 🚀 零配置，开箱即用
- 💰 完全免费
- 📋 支持复制代码片段
- 🎨 实时查看所有样式值

---

### 方案2: VS Code 插件（在编辑器中查看）

#### 安装步骤：
1. 打开 VS Code
2. 按 `Cmd/Ctrl + Shift + X` 打开扩展市场
3. 搜索 **"Figma"**（官方插件）
4. 点击安装
5. 登录 Figma 账号
6. 在编辑器中打开 Figma 文件链接

#### 优点：
- 📝 在代码编辑器中直接查看设计
- 🔗 无需切换窗口
- 💻 支持同步设计令牌

---

### 方案3: Figma 插件导出设计令牌

#### 推荐插件：
- **Figma Tokens** - 导出设计令牌为 JSON
- **Design Tokens** - 导出颜色、字体等
- **Style Dictionary** - 转换为多平台代码

#### 使用步骤：
1. 在 Figma 中打开插件市场
2. 搜索并安装 "Figma Tokens"
3. 选择要导出的样式（颜色、字体等）
4. 导出为 JSON 文件
5. 在项目中引入 JSON 文件

#### 示例代码：
```typescript
// src/constants/figma-tokens.ts
import figmaTokens from './figma-tokens.json';

export const colors = figmaTokens.colors;
export const typography = figmaTokens.typography;
export const spacing = figmaTokens.spacing;
```

---

### 方案4: 浏览器书签工具（最轻量）

#### 创建书签：
1. 在浏览器中创建新书签
2. 名称：`查看Figma样式`
3. URL：`javascript:(function(){window.open('https://www.figma.com/file/YOUR_FILE_ID','_blank');})();`
4. 点击书签即可快速打开 Figma 文件

---

### 方案5: 简单的API工具（需要Token）

如果需要自动化同步，可以使用 Figma API：

#### 获取 Token：
1. 登录 Figma
2. 访问：https://www.figma.com/settings
3. 生成 Personal Access Token

#### 使用示例：
```bash
# 设置环境变量
export FIGMA_TOKEN=your_token
export FIGMA_FILE_KEY=your_file_key

# 运行同步脚本（需要先创建）
npm run figma:sync
```

---

## 🚀 快速开始（推荐）

### 对于日常开发：
**直接使用 Figma Dev Mode**（方案1）

1. 打开设计文件
2. 点击 "Dev Mode"
3. 选择元素查看样式
4. 复制需要的值到代码中

### 对于团队协作：
**使用 Figma Tokens 插件**（方案3）

1. 安装插件
2. 导出设计令牌
3. 在项目中引入使用

---

## 📚 相关资源

- [Figma Dev Mode 文档](https://help.figma.com/hc/en-us/articles/360055204534)
- [VS Code Figma 插件](https://marketplace.visualstudio.com/items?itemName=Figma.figma-vscode-extension)
- [Figma API 文档](https://www.figma.com/developers/api)
- [Figma Tokens 插件](https://www.figma.com/community/plugin/888356646278934516)

---

## 💡 最佳实践

1. **设计文件命名规范**：使用清晰的图层和组件命名
2. **使用设计令牌**：颜色、字体、间距统一管理
3. **定期同步**：设计更新后及时同步到代码
4. **版本控制**：设计令牌文件纳入 Git 管理

---

## ❓ 常见问题

**Q: 哪种方案最适合我？**
A: 如果只是偶尔查看样式，用 Dev Mode（方案1）。如果需要自动化同步，用插件导出（方案3）。

**Q: 需要安装什么吗？**
A: Dev Mode 不需要安装任何东西，直接在 Figma 网页版使用。

**Q: 可以自动同步吗？**
A: 可以，使用 Figma API 或插件导出工具可以实现自动化。

