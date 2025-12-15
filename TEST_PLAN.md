# 坐姿检测逻辑测试方案

## 📋 测试目标

1. ✅ 检测是不是每10秒累加一次
2. ✅ 能否达到10分钟奖励
3. ✅ 能否达到1小时上报数据
4. ✅ 这几个逻辑相互之间是否独立

---

## 🚀 快速测试（修改时间常量）

### **方法1：修改Native层常量（推荐）**

临时修改 `PostureMonitorService.kt` 的时间常量以加快测试：

```kotlin
// 原始值（生产环境）
private const val DETECTION_INTERVAL_SECONDS = 10 // Native每10秒检测一次
private const val REWARD_INTERVAL_SECONDS = 10 * 60 // 10分钟 = 600秒
private const val HOUR_IN_SECONDS = 60 * 60 // 1小时 = 3600秒

// 测试值（快速测试）
private const val DETECTION_INTERVAL_SECONDS = 10 // 保持10秒
private const val REWARD_INTERVAL_SECONDS = 30 // 测试：30秒奖励一次
private const val HOUR_IN_SECONDS = 60 // 测试：60秒上报一次
```

**修改后的测试时间：**
- 10秒检测 → 保持不变
- 10分钟奖励 → **30秒**（3次检测）
- 1小时上报 → **60秒**（6次检测）

---

## 📝 测试步骤

### **测试1：检测频率（10秒累加一次）**

**预期结果：**
- 每10秒，Native日志输出一次：`📊 累计时间: total=10s, reward=10s, status=good`
- 第2次：`total=20s, reward=20s`
- 第3次：`total=30s, reward=30s`

**验证命令：**
```bash
adb logcat | grep "PostureMonitorService.*累计时间"
```

**预期日志：**
```
PostureMonitorService: 📊 累计时间: total=10s, reward=10s, status=good
PostureMonitorService: 📊 累计时间: total=20s, reward=20s, status=good
PostureMonitorService: 📊 累计时间: total=30s, reward=30s, status=good
```

---

### **测试2：10分钟奖励逻辑（测试：30秒）**

**预期结果：**
- 累计30秒后（第3次检测），触发奖励
- Native日志：`✅ 达到10分钟奖励阈值: 30秒`
- Native日志：`🎉 发送奖励通知到 JS`
- JS日志：`🎉 Native触发奖励: 恭喜！累计学习10分钟，获得积分奖励！`
- 前端显示Toast：`🎉 太棒了！累计学习 10 分钟，获得 1 积分`
- **奖励计时器重置为0，开始新一轮**

**验证命令：**
```bash
adb logcat | grep -E "奖励|Reward"
```

**预期日志：**
```
PostureMonitorService: ✅ 达到10分钟奖励阈值: 30秒
PostureMonitorService: 🎉 发送奖励通知到 JS
ReactNativeJS: 🎉 Native触发奖励: 恭喜！累计学习10分钟，获得积分奖励！
```

**继续观察：**
- 30秒后，再次触发奖励（第二轮）
- 60秒后，再次触发奖励（第三轮）

---

### **测试3：1小时上报逻辑（测试：60秒）**

**预期结果：**
- 累计60秒后（第6次检测），触发1小时上报
- Native日志：`⏰ 达到1小时阈值，上报数据并重置`
- Native日志：`📊 发送坐姿数据到 JS: status=good, type=updateTime`
- JS日志：`⏰ Native触发1小时上报`
- JS日志：`✅ 学习时长上报成功`
- **统计数据重置为0，开始新一轮**

**验证命令：**
```bash
adb logcat | grep -E "1小时|updateTime|上报"
```

**预期日志：**
```
PostureMonitorService: ⏰ 达到1小时阈值，上报数据并重置
PostureMonitorService: 📊 发送坐姿数据到 JS: status=good, type=updateTime, reward=30, total=60
ReactNativeJS: ⏰ Native触发1小时上报: {正确坐姿: 60秒, ...}
ReactNativeJS: ✅ 学习时长上报成功
```

---

### **测试4：逻辑独立性**

**测试场景A：奖励逻辑独立（30秒一次）**
- 第1次奖励：30秒时触发
- 第2次奖励：60秒时触发
- 第3次奖励：90秒时触发
- 验证：**奖励计时器不受1小时上报影响**

**测试场景B：上报逻辑独立（60秒一次）**
- 第1次上报：60秒时触发
- 第2次上报：120秒时触发
- 验证：**上报后统计重置，但奖励计时器继续累加**

**关键验证点：**
```
时间轴：
0s   -------------------- 开始
10s  检测1次: total=10s, reward=10s
20s  检测2次: total=20s, reward=20s
30s  检测3次: total=30s, reward=30s → ✅ 触发奖励1，reward重置为0
40s  检测4次: total=40s, reward=10s
50s  检测5次: total=50s, reward=20s
60s  检测6次: total=60s, reward=30s → ⏰ 触发上报，total重置为0，reward再次触发奖励2，重置为0
70s  检测7次: total=10s, reward=10s（新一轮）
```

**预期日志：**
```
30s: ✅ 奖励阈值达到（奖励计时器=30s → 重置为0）
60s: ⏰ 1小时阈值达到（统计数据=60s → 重置为0）
60s: ✅ 奖励阈值达到（奖励计时器=30s → 重置为0）
90s: ✅ 奖励阈值达到（奖励计时器=30s → 重置为0）
```

---

## 🔍 完整测试日志查看

```bash
# 查看所有坐姿相关日志
adb logcat | grep -E "PostureMonitorService|坐姿|奖励|上报"

# 只看关键节点
adb logcat | grep -E "累计时间|奖励阈值|1小时阈值"
```

---

## ✅ 测试通过标准

1. **检测频率：** 每10秒日志输出一次，时间累加正确
2. **奖励逻辑：** 每30秒（测试）触发一次，Toast显示正确，计时器重置
3. **上报逻辑：** 每60秒（测试）触发一次，接口调用成功，统计重置
4. **逻辑独立性：** 
   - 奖励计时器独立运行，不受上报重置影响
   - 上报重置统计数据，但奖励计时器继续累加
   - 两个逻辑互不干扰

---

## 🔄 恢复生产环境

测试完成后，**务必**将常量改回生产值：

```kotlin
private const val DETECTION_INTERVAL_SECONDS = 10 // Native每10秒检测一次
private const val REWARD_INTERVAL_SECONDS = 10 * 60 // 10分钟 = 600秒
private const val HOUR_IN_SECONDS = 60 * 60 // 1小时 = 3600秒
```

---

## 📱 打包测试

```bash
# 1. 修改时间常量（测试值）
# 2. 重新编译Native代码
cd android && ./gradlew assembleDebug

# 3. 安装到设备
adb install -r app/build/outputs/apk/debug/app-debug.apk

# 4. 启动应用并查看日志
adb logcat -c && adb logcat | grep -E "PostureMonitorService|ReactNativeJS"
```

---

## 🐛 常见问题

**Q: 日志显示时间没有累加？**
A: 检查相机是否成功启动，确认AI检测是否正常运行

**Q: 奖励没有触发？**
A: 检查Native常量是否修改正确，确认 `rewardAccumulatedSeconds >= REWARD_INTERVAL_SECONDS`

**Q: 上报没有触发？**
A: 检查 `totalSeconds >= HOUR_IN_SECONDS` 条件，确认接口是否可用

**Q: Toast没有显示？**
A: 检查JS层事件监听是否正常，确认 `postureMonitorEmitter` 是否正确注册

