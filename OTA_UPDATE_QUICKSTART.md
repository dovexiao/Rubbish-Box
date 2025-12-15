# 🚀 OTA 热更新快速指南

## 一、什么是 OTA 更新？

**OTA（Over-The-Air）热更新 = 不用重新下载 APK，应用自动更新！**

✅ **可以更新：** JavaScript 代码、图片、样式  
❌ **不能更新：** 原生代码、新增 npm 包、app.json 配置

---

## 二、最常用的 3 个命令 ⭐⭐⭐

### 1️⃣ 发布生产环境更新（最常用）
```bash
npm run update:production "修复了登录bug"
```

### 2️⃣ 发布预览环境更新（内测用）
```bash
npm run update:preview "新增用户管理功能"
```

### 3️⃣ 发布开发环境更新（开发测试）
```bash
npm run update:development "测试新功能"
```

---

## 三、完整发布流程（5 步）

### 📝 **场景：修复了一个 bug**

```bash
# 1. 修改代码（你已经完成）
# 例如：修复了 src/app/login.tsx 的登录问题

# 2. 本地测试（确保没问题）
npm start

# 3. 更新版本号（可选但推荐）
npm run version:patch
# 1.0.1 → 1.0.2

# 4. 发布 OTA 更新 ⭐⭐⭐
npm run update:production "修复登录bug"

# 5. 等待 1-2 分钟，用户就能收到更新了！✅
```

---

## 四、用户如何收到更新？

### 自动更新（默认配置）
```
用户打开 App → 检测到更新 → 自动下载 → 下次启动生效
```

### 你的配置（app.config.js）
```javascript
updates: {
  url: "https://u.expo.dev/781589ef-0937-4906-a236-5deac80db17b",
  enabled: true,
  checkAutomatically: "ON_LOAD",  // 启动时自动检查
  fallbackToCacheTimeout: 0,
}
```

---

## 五、快速命令表

| 命令 | 说明 | 使用场景 |
|------|------|---------|
| `npm run update:production "描述"` | 发布生产环境 | **正式用户** |
| `npm run update:preview "描述"` | 发布预览环境 | **内部测试** |
| `npm run update:development "描述"` | 发布开发环境 | **开发调试** |
| `eas update:list` | 查看更新历史 | 查看发布记录 |
| `eas build:list` | 查看构建历史 | 查看 APK 构建 |

---

## 六、实战示例

### 示例 1：修复 bug
```bash
# 修改代码：src/app/login.tsx

# 发布更新
npm run update:production "修复登录页面验证码显示异常"

# 输出：
# ✅ Published an update
# Branch: production
# Runtime version: 1.0.1
# Message: 修复登录页面验证码显示异常
```

### 示例 2：优化性能
```bash
# 修改代码：src/app/(tabs)/index.tsx

# 更新版本号
npm run version:patch  # 1.0.1 → 1.0.2

# 发布更新
npm run update:production "优化首页加载速度，提升用户体验"
```

### 示例 3：新增小功能
```bash
# 修改代码：src/app/(tabs)/my.tsx

# 更新版本号
npm run version:minor  # 1.0.2 → 1.1.0

# 发布更新
npm run update:production "个人中心新增积分查询功能"
```

---

## 七、查看更新状态

### 查看最近的更新
```bash
eas update:list --branch production
```

**输出示例：**
```
┌────────────┬──────────┬─────────────┬────────────────────┐
│ ID         │ Branch   │ Runtime     │ Message            │
├────────────┼──────────┼─────────────┼────────────────────┤
│ abc123...  │ prod     │ 1.0.2       │ 修复登录bug        │
│ def456...  │ prod     │ 1.0.1       │ 优化性能          │
└────────────┴──────────┴─────────────┴────────────────────┘
```

### 查看用户使用情况（Expo 网站）
1. 访问：https://expo.dev/accounts/zhoudabo/projects/xhtx
2. 点击 "Updates" 标签
3. 查看下载统计、错误报告等

---

## 八、常见问题 FAQ

### Q1: 更新后用户多久能看到？
**A:** 用户下次启动 App 时会自动检测并下载更新（通常 1-5 分钟）

### Q2: 我修改了什么需要重新打包 APK？
**A:** 
- ❌ 修改 JavaScript 代码 → **OTA 更新即可**
- ❌ 修改图片、样式 → **OTA 更新即可**
- ✅ 新增 npm 包 → **需要重新构建 APK**
- ✅ 修改 app.json → **需要重新构建 APK**
- ✅ 修改原生代码（android/ios文件夹）→ **需要重新构建 APK**

### Q3: 如何回滚到上一个版本？
**A:** 
```bash
# 方法 1：发布一个修复版本（推荐）
npm run update:production "紧急修复，回滚到稳定版本"

# 方法 2：重新构建 APK（紧急情况）
npm run build:android:prod
```

### Q4: 为什么我的更新没生效？
**A:** 检查清单：
1. ✅ `runtimeVersion` 是否一致？ → 运行 `npm run version:check`
2. ✅ **Channel 和 Branch 是否关联？** → 运行 `eas channel:view production`
3. ✅ 网络是否正常？ → 检查 updates.url 是否可访问
4. ✅ 是否在正确的 branch？ → production 环境要用 production 分支
5. ✅ 用户是否重启了 App？ → 需要完全退出再打开

### Q5: 收不到更新？完整排查流程 ⭐⭐⭐
**步骤 1：检查 Channel 和 Branch 是否关联**
```bash
# 查看 production channel 状态
eas channel:view production
```

如果显示 `No branches are pointed to this channel`，说明需要关联：
```bash
# 关联 channel 和 branch
eas channel:edit production --branch production
```

**步骤 2：检查 RuntimeVersion 是否匹配**
```bash
# 查看当前配置
cat app.config.js | grep runtimeVersion
# 输出: runtimeVersion: "1.0.1"

# 查看最新构建
eas build:list --platform android --limit 1

# 查看最新更新
eas update:list --branch production --limit 1
```

确保三者的 RuntimeVersion 一致！

**步骤 3：验证设备网络**
```bash
# 通过 adb 测试设备是否能访问 Expo CDN
adb shell "ping -c 3 u.expo.dev"
```

**步骤 4：查看设备日志**
```bash
# 查看更新相关日志
adb logcat -d | grep "dev.expo.updates" | tail -20
```

**常见错误信息：**
- `No branches linked to the channel` → 执行步骤 1 关联 channel
- `No update available` → RuntimeVersion 不匹配，需要安装匹配的 APK
- `Network request failed` → 网络问题，检查设备网络连接

### Q6: OTA 更新消耗用户多少流量？
**A:** 通常 1-3MB（只更新变化的 JS bundle），比下载完整 APK（30-50MB）省很多！

---

## 九、使用技巧 💡

### 技巧 1：快速脚本（推荐）
```bash
# 使用快速更新脚本
./scripts/quick-update.sh prod "修复登录问题"

# 会提示确认，更安全
# 确认发布更新? (y/N): y
```

### 技巧 2：自动化流程
```bash
# 创建一个更新脚本 update.sh
#!/bin/bash
npm run version:patch
npm run update:production "$1"

# 使用
./update.sh "修复了XX问题"
```

### 技巧 3：更新描述规范
```bash
# 好的描述 ✅
npm run update:production "修复登录页面验证码显示异常"
npm run update:production "优化首页加载速度50%"
npm run update:production "新增积分查询功能"

# 不好的描述 ❌
npm run update:production "修复bug"
npm run update:production "更新"
npm run update:production "111"
```

---

## 十、最佳实践 🎯

### ✅ 推荐做法
1. **每次更新前运行** `npm run version:check`
2. **使用语义化版本号** major.minor.patch
3. **写清楚更新描述** 方便追踪问题
4. **先发 preview 测试** 确认无误再发 production
5. **更新后验证** 确保功能正常

### ❌ 避免做法
1. ❌ 不检查版本一致性直接发布
2. ❌ 更新描述写得太随意
3. ❌ 直接在 production 测试新功能
4. ❌ 修改原生代码后用 OTA 更新
5. ❌ 忘记更新版本号

---

## 十一、一键更新命令（推荐收藏）⭐

### 日常开发：修复 bug
```bash
npm run version:patch && npm run update:production "修复XX问题"
```

### 新增功能
```bash
npm run version:minor && npm run update:production "新增XX功能"
```

### 紧急修复
```bash
npm run update:production "紧急修复XX问题" --non-interactive
```

---

## 十二、监控和统计

### Expo 网站查看统计
```
https://expo.dev/accounts/zhoudabo/projects/xhtx/updates
```

**可以看到：**
- 📊 下载量统计
- 📱 用户设备分布
- ⚠️ 错误报告
- 📈 更新成功率

---

## 十三、完整测试流程 🧪

### 第一次使用 OTA 更新？按这个流程走！

**1️⃣ 初始化配置（只需做一次）**
```bash
# 关联 production channel 和 branch
eas channel:edit production --branch production

# 关联 preview channel 和 branch（可选）
eas channel:edit preview --branch preview
```

**2️⃣ 构建并安装 APK**
```bash
# 构建生产环境 APK（云端构建，推荐）
npm run build:android:prod

# 等待构建完成（约 10-15 分钟）
# 下载 APK 并安装到测试设备
```

**3️⃣ 修改代码并发布 OTA 更新**
```bash
# 修改任意 JS 文件，例如在首页添加一行 console.log
# src/app/(tabs)/index.tsx
console.log("测试 OTA 更新功能")

# 发布更新
npm run update:production "测试 OTA 更新功能"
```

**4️⃣ 验证更新**
```bash
# 方法 1：在设备上完全退出并重启 App
# 方法 2：通过 adb 查看日志
adb logcat -d | grep "dev.expo.updates" | grep -i "download\|available"
```

**5️⃣ 确认更新成功**
- ✅ 重启 App 后看到新的 console.log
- ✅ 日志显示 `update available` 和 `downloading`
- ✅ 功能正常运行

---

## 🎉 总结

### 最常用的命令（背下来）：
```bash
# 1. 发布更新
npm run update:production "更新描述"

# 2. 查看更新历史
eas update:list --branch production

# 3. 检查版本一致性
npm run version:check

# 4. 检查 channel 状态
eas channel:view production

# 5. 关联 channel 和 branch（首次必做）
eas channel:edit production --branch production
```

### 记住 4 个原则：
1. ✅ JavaScript 改动 → OTA 更新
2. ✅ 原生改动 → 重新构建 APK
3. ✅ 发布前先测试 → preview 环境
4. ✅ **首次使用必须关联 channel 和 branch**

### 故障排查优先级：
1. 🔴 **最高优先级**：检查 channel 和 branch 是否关联
2. 🟠 **高优先级**：检查 RuntimeVersion 是否匹配
3. 🟡 **中优先级**：检查网络连接
4. 🟢 **低优先级**：检查设备是否重启

---

## 🔧 快速故障排查命令

```bash
# 一键检查所有配置
echo "=== 检查 RuntimeVersion ===" && \
cat app.config.js | grep runtimeVersion && \
echo "\n=== 检查 Channel 关联 ===" && \
eas channel:view production && \
echo "\n=== 检查最新更新 ===" && \
eas update:list --branch production --limit 1
```

---

**现在就试试吧！** 🚀

```bash
# 首次使用：先关联 channel
eas channel:edit production --branch production

# 然后发布你的第一个 OTA 更新
npm run update:production "测试 OTA 更新功能"
```

