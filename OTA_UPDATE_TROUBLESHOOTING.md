# OTA 更新收不到？问题诊断指南

## 🔍 你的问题诊断

### 问题现象
✅ OTA 更新发布成功  
❌ App 收不到更新

### 根本原因
**RuntimeVersion 不匹配！**

```
你的 APK 安装版本：
- Runtime Version: 1.0.0  ❌（旧版本）
- Build ID: 040d140b-0287-494b-9892-ceadee6b5ef5

你发布的 OTA 更新：
- Runtime Version: 1.0.1  ✅（新版本）
- Update ID: b29c9444-1eb3-4ab5-9166-9e243696b8fb

❌ 版本不匹配 → 无法接收更新！
```

---

## 💡 解决方案（3 种方法）

### 方案 1：重新安装最新 APK（推荐）⭐⭐⭐⭐⭐

**原因：** 你已经构建了 Runtime Version 1.0.1 的 APK

**步骤：**
```bash
# 1. 下载最新 APK
# Build ID: 44df43e6-8092-4c81-91cf-048e3addfe83
# Runtime Version: 1.0.1 ✅

URL: https://expo.dev/artifacts/eas/9vgyeQJUKVGopdngsxwkEt.apk

# 2. 卸载旧版 App
# 3. 安装新 APK
# 4. 打开 App，会自动收到更新！✅
```

---

### 方案 2：发布兼容旧版本的更新（临时方案）⭐⭐⭐

**原因：** 让旧版本（1.0.0）用户也能收到更新

**问题：** 这只是临时方案，不建议长期使用

```bash
# 1. 临时修改 app.config.js
# 将 runtimeVersion 改回 1.0.0

# 2. 发布针对 1.0.0 的更新
npm run update:production "兼容旧版本的更新"

# 3. 旧版本用户能收到更新了
# 但新版本（1.0.1）用户反而收不到了 ❌
```

**不推荐原因：** 会造成版本混乱

---

### 方案 3：通知用户升级（长期方案）⭐⭐⭐⭐

**适用场景：** 已经有用户在使用旧版本

**步骤：**
```bash
# 1. 保持当前配置（runtimeVersion: 1.0.1）

# 2. 在 App 内添加版本检测
# 如果检测到 runtimeVersion < 1.0.1，提示用户下载新版本

# 3. 提供下载链接
https://expo.dev/artifacts/eas/9vgyeQJUKVGopdngsxwkEt.apk
```

---

## 📊 RuntimeVersion 工作原理

### 什么是 RuntimeVersion？
**RuntimeVersion 决定了哪些 App 可以接收哪些更新**

```
App (Runtime 1.0.0) → 只能接收 Runtime 1.0.0 的更新
App (Runtime 1.0.1) → 只能接收 Runtime 1.0.1 的更新
App (Runtime 1.0.0) + OTA (Runtime 1.0.1) = ❌ 不匹配，收不到
App (Runtime 1.0.1) + OTA (Runtime 1.0.1) = ✅ 匹配，能收到
```

### 为什么要这样设计？
**保护 App 不会因为不兼容的更新而崩溃**

例如：
- App 构建时用的是 expo-camera@12.0.0
- OTA 更新用的是 expo-camera@13.0.0
- 如果没有 RuntimeVersion 保护，更新后 App 会崩溃！

---

## ✅ 正确的版本管理流程

### 场景 1：修复 JavaScript Bug（不改原生代码）
```bash
# 1. 修改 JS 代码
# 2. 直接发布 OTA 更新
npm run update:production "修复XX问题"

# ✅ 用户自动收到更新，无需重新安装
```

### 场景 2：添加新功能（改了原生代码或依赖）
```bash
# 1. 修改代码 + 添加原生依赖
npm install expo-some-new-package

# 2. 更新版本号
npm run version:minor  # 1.0.1 → 1.1.0

# 3. 重新构建 APK（RuntimeVersion 自动变为 1.1.0）
npm run build:android:prod

# 4. 发布新 APK 给用户安装

# 5. 之后可以对 1.1.0 版本发布 OTA 更新
npm run update:production "优化新功能"
```

### 场景 3：同时支持多个 RuntimeVersion（不推荐）
```bash
# 不推荐！会造成维护困难

# 如果你有 1.0.0 和 1.0.1 两个版本的用户：
# 需要分别发布两次更新：

# 针对 1.0.0
# 修改 app.config.js runtimeVersion: "1.0.0"
npm run update:production "针对1.0.0的更新"

# 针对 1.0.1
# 修改 app.config.js runtimeVersion: "1.0.1"
npm run update:production "针对1.0.1的更新"

# 太麻烦了！不推荐！
```

---

## 🔧 快速诊断工具

### 检查你的配置
```bash
# 1. 查看当前配置的 RuntimeVersion
cat app.config.js | grep runtimeVersion
# 输出: runtimeVersion: "1.0.1"

# 2. 查看最近的构建
eas build:list --platform android --limit 3

# 3. 查看最近的更新
eas update:list --branch production --limit 3
```

### 对比版本
```
构建历史：
ID: 44df43e6... | Runtime: 1.0.1 | 最新 ✅
ID: 040d140b... | Runtime: 1.0.0 | 旧版 ❌
ID: 16f5e0a9... | Runtime: 1.0.0 | 更旧 ❌

更新历史：
Update: b29c9444... | Runtime: 1.0.1 | "修复登录bug" ✅

✅ 如果你安装的是 44df43e6... 这个构建，能收到更新
❌ 如果你安装的是 040d140b... 这个构建，收不到更新
```

---

## 🎯 你的解决步骤（立即执行）

### 第一步：下载最新 APK
```
https://expo.dev/artifacts/eas/9vgyeQJUKVGopdngsxwkEt.apk
```

### 第二步：卸载旧版 App
```
长按 App 图标 → 卸载
```

### 第三步：安装新 APK
```
安装下载的 APK
```

### 第四步：打开 App
```
App 会自动检测更新
下载更新（1-3MB）
重启 App 后生效 ✅
```

---

## 🚨 常见错误和解决方案

### 错误 1：HTTP 404
```
curl https://u.expo.dev/xxx/api/manifest
HTTP 404

原因：RuntimeVersion 不匹配
解决：安装匹配的 APK
```

### 错误 2：更新一直不生效
```
原因：
1. 网络问题（国内访问 Expo CDN 较慢）
2. RuntimeVersion 不匹配
3. App 没有完全退出重启

解决：
1. 检查网络，切换 WiFi/4G 重试
2. 确认 RuntimeVersion 匹配
3. 完全退出 App（清理后台）再重新打开
```

### 错误 3：国内访问慢
```
Expo CDN 在国外，国内访问可能较慢

解决方案：
1. 使用 VPN（开发测试阶段）
2. 部署自己的更新服务器（生产环境）
3. 使用 CodePush 等国内 CDN
```

---

## 📝 最佳实践

### ✅ 推荐做法
1. **统一 RuntimeVersion**：同一时期只维护一个版本
2. **构建前检查**：`npm run version:check`
3. **记录版本**：每次构建记录 Build ID 和 RuntimeVersion
4. **测试更新**：发布前在测试设备验证
5. **通知用户**：大版本升级提示用户下载新 APK

### ❌ 避免做法
1. ❌ 频繁修改 RuntimeVersion
2. ❌ 同时支持多个 RuntimeVersion
3. ❌ 不记录构建信息
4. ❌ 不测试直接发布生产环境
5. ❌ 原生代码改动后还用 OTA 更新

---

## 🎓 总结

### 记住三点：
1. **RuntimeVersion 必须匹配** App 和 OTA 更新
2. **改原生代码** = 必须重新构建 APK
3. **改 JS 代码** = 可以使用 OTA 更新

### 你现在的问题：
```
App 安装的版本：Runtime 1.0.0 ❌
OTA 更新的版本：Runtime 1.0.1 ✅
→ 不匹配 → 收不到更新

解决方案：
下载并安装 Runtime 1.0.1 的 APK ✅
```

---

**立即下载最新 APK：**
```
https://expo.dev/artifacts/eas/9vgyeQJUKVGopdngsxwkEt.apk
```

**安装后就能收到 OTA 更新了！** 🎉



