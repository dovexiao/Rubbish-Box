# 版本号统一管理指南

## 📋 版本号结构

### 版本号格式
```
major.minor.patch
1.0.0
```

### 版本号对应关系
| 文件 | 字段 | 说明 | 示例 |
|------|------|------|------|
| `app.json` | `expo.version` | 用户版本号 | `"1.0.0"` |
| `package.json` | `version` | 项目版本号 | `"1.0.0"` |
| `app.json` | `expo.android.versionCode` | Android版本代码 | `10000` |
| `app.json` | `expo.ios.buildNumber` | iOS构建号 | `"10000"` |

### 版本代码计算规则
```
versionCode = major * 10000 + minor * 100 + patch
1.0.0 → 10000
1.0.1 → 10001
1.1.0 → 10100
2.0.0 → 20000
```

## 🚀 使用方法

### 1. 查看当前版本
```bash
npm run version:show
```

### 2. 检查版本号一致性
```bash
npm run version:check
```

### 3. 同步版本号
```bash
npm run version:sync
```

### 4. 更新版本号

#### 补丁版本 (修复bug)
```bash
npm run version:patch
# 1.0.0 → 1.0.1
```

#### 次版本 (新功能)
```bash
npm run version:minor
# 1.0.0 → 1.1.0
```

#### 主版本 (重大更新)
```bash
npm run version:major
# 1.0.0 → 2.0.0
```

#### 设置特定版本
```bash
npm run version:set 1.2.3
# 设置为 1.2.3
```

## 🔄 版本号更新流程

### 热更新流程
```bash
# 1. 修改代码
# 2. 更新版本号
npm run version:patch

# 3. 发布热更新
npm run update:production -- "修复登录问题"
```

### 整包更新流程
```bash
# 1. 修改代码
# 2. 更新版本号
npm run version:major

# 3. 构建新版本
npm run build:android:prod

# 4. 发布到应用商店
```

## 📊 版本号管理最佳实践

### 1. 版本号规则
- **major**: 重大功能更新，不兼容的API修改
- **minor**: 新功能添加，向下兼容
- **patch**: bug修复，向下兼容

### 2. 更新策略
- **热更新**: 相同 major 版本内 (1.0.0 → 1.0.1, 1.1.0)
- **整包更新**: 不同 major 版本 (1.0.0 → 2.0.0)

### 3. 版本号检查
- 每次发布前运行 `npm run version:check`
- 确保所有版本号一致
- 使用 `npm run version:sync` 同步版本号

## 🎯 示例

### 版本发布历史
```
1.0.0 (versionCode: 10000) - 初始版本
1.0.1 (versionCode: 10001) - 热更新：修复bug
1.0.2 (versionCode: 10002) - 热更新：修复bug
1.1.0 (versionCode: 10100) - 热更新：新增功能
1.1.1 (versionCode: 10101) - 热更新：修复新功能bug
2.0.0 (versionCode: 20000) - 整包更新：重大更新
2.0.1 (versionCode: 20001) - 热更新：修复bug
2.1.0 (versionCode: 20100) - 热更新：新增功能
```

### 命令示例
```bash
# 查看当前版本
npm run version:show
# 输出: 用户版本号: 1.0.0, Android版本代码: 10000, iOS构建号: 10000

# 更新到补丁版本
npm run version:patch
# 输出: 用户版本号: 1.0.0 → 1.0.1, Android版本代码: 10000 → 10001

# 检查一致性
npm run version:check
# 输出: ✅ 版本号一致性检查通过!
```
