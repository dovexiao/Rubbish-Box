# 版本管理脚本升级说明

## 🎉 升级完成！

版本管理脚本已升级，现在**自动同步 `android/app/build.gradle`**！

## ✨ 新增功能

### 1. 自动同步 build.gradle
现在所有版本号命令都会自动同步 `android/app/build.gradle` 文件：
- ✅ `npm run version:patch`
- ✅ `npm run version:minor`
- ✅ `npm run version:major`
- ✅ `npm run version:set 1.2.3`
- ✅ `npm run version:sync`

### 2. 增强的版本检查
`npm run version:check` 现在会检查 7 个配置文件：
1. ✅ app.json (version)
2. ✅ package.json (version)
3. ✅ app.json (android.versionCode)
4. ✅ app.json (ios.buildNumber)
5. ✅ app.config.js (runtimeVersion)
6. ✅ **android/app/build.gradle (versionCode)** ← 新增
7. ✅ **android/app/build.gradle (versionName)** ← 新增

### 3. 完整的版本信息显示
`npm run version:show` 现在显示所有配置：
```bash
📋 当前版本信息:
📱 用户版本号: 1.0.1
🤖 Android版本代码: 10001
🍎 iOS构建号: 10001
📦 项目版本号: 1.0.1
⚙️  App.config.js runtimeVersion: 1.0.1
🔧 build.gradle versionCode: 10001      ← 新增
🔧 build.gradle versionName: 1.0.1       ← 新增
```

## 🚀 使用方法

### 场景1：更新版本号（最常用）
```bash
# 修复bug，版本号 +0.0.1
npm run version:patch
# 自动更新所有 7 个配置文件！

# 新增功能，版本号 +0.1.0
npm run version:minor

# 重大更新，版本号 +1.0.0
npm run version:major
```

### 场景2：检查版本一致性
```bash
npm run version:check
# 检查所有 7 个配置文件是否一致
```

### 场景3：版本不一致时同步
```bash
npm run version:sync
# 以 app.json 为准，同步所有配置文件
```

## ✅ 验证升级成功

运行以下命令验证：
```bash
npm run version:check
```

应该看到：
```
✅ 版本号一致性检查通过!
```

## 🔄 工作流程（推荐）

### 开发新功能
```bash
# 1. 开发代码
# 2. 测试通过

# 3. 更新版本号
npm run version:minor

# 4. 构建APK
npm run build:android:prod

# 5. 提交代码
git add .
git commit -m "feat: 新功能 v1.1.0"
git push
```

### 修复bug
```bash
# 1. 修复代码
# 2. 测试通过

# 3. 更新版本号
npm run version:patch

# 4. 发布热更新
npm run update:production -- "修复XX问题"

# 5. 提交代码
git add .
git commit -m "fix: 修复XX问题 v1.0.2"
git push
```

## 🎯 核心优势

### 之前的问题 ❌
```
1. 手动修改 app.json → 1.0.1
2. 手动修改 package.json → 1.0.1
3. 手动修改 app.config.js → 1.0.1
4. 手动修改 android/app/build.gradle → 1.0.1  ← 容易忘记！
5. 手动计算 versionCode → 10001
6. 可能漏改某个文件 → EAS构建版本号不对！
```

### 现在的解决方案 ✅
```bash
npm run version:patch
# 自动更新所有 7 个配置文件！
# 自动计算 versionCode！
# 永远不会遗漏！
```

## 🔧 技术细节

### 自动更新的文件
| 文件 | 更新字段 | 计算方式 |
|------|---------|---------|
| `app.json` | `expo.version` | 用户指定 |
| `app.json` | `expo.android.versionCode` | `major*10000 + minor*100 + patch` |
| `app.json` | `expo.ios.buildNumber` | 与 versionCode 相同 |
| `package.json` | `version` | 与 expo.version 相同 |
| `app.config.js` | `runtimeVersion` | 与 expo.version 相同 |
| `android/app/build.gradle` | `versionCode` | 与 expo.android.versionCode 相同 |
| `android/app/build.gradle` | `versionName` | 与 expo.version 相同 |

### 版本代码计算示例
```
1.0.0 → 10000
1.0.1 → 10001
1.1.0 → 10100
2.0.0 → 20000
```

## 📝 更新日志

### 2025-10-22 - v2.0.0
- ✨ 新增：自动同步 `android/app/build.gradle`
- ✨ 新增：检查 build.gradle 版本一致性
- ✨ 新增：显示 build.gradle 版本信息
- 🐛 修复：EAS构建时版本号不一致的问题

## 💡 提示

1. **每次发版前运行**: `npm run version:check`
2. **如果版本不一致**: `npm run version:sync`
3. **更新版本后提交**: `git add . && git commit -m "chore: bump version to x.x.x"`

## ❓ FAQ

### Q: 为什么要同步 build.gradle？
A: EAS Build 在构建 Android APK 时，实际读取的是 `build.gradle` 而不是 `app.json`，所以必须保持一致。

### Q: 如果我手动改了某个文件怎么办？
A: 运行 `npm run version:sync` 会以 `app.json` 为准，重新同步所有文件。

### Q: 版本号冲突怎么办？
A: 先运行 `npm run version:check` 查看哪些文件不一致，然后用 `npm run version:sync` 同步。

## 🎓 最佳实践

1. ✅ **永远不要手动修改版本号** - 使用 npm scripts
2. ✅ **每次构建前检查** - `npm run version:check`
3. ✅ **版本号遵循语义化** - major.minor.patch
4. ✅ **提交前确认** - 确保所有文件已同步
5. ✅ **版本号与 Git tag 对应** - `git tag v1.0.1`

---

**现在你再也不用手动修改版本号了！** 🎉



