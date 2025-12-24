# Expo 调试模式 - ADB 命令

## 打开 Expo 开发者菜单

### 方法1：使用菜单键（最常用）
```bash
adb shell input keyevent 82
```

### 方法2：使用菜单键代码
```bash
adb shell input keyevent KEYCODE_MENU
```

### 方法3：组合命令（打开菜单并等待）
```bash
adb shell input keyevent 82 && sleep 1
```

## 开发者菜单选项

打开菜单后，可以使用以下命令：

### 重新加载应用
```bash
adb shell input text "r"
```

### 打开调试器
```bash
adb shell input text "d"
```

### 显示性能监控
```bash
adb shell input text "p"
```

### 切换元素检查器
```bash
adb shell input text "i"
```

## 网络端口转发

确保 Expo 开发服务器可以访问：

```bash
# 转发 Metro bundler 端口
adb reverse tcp:8081 tcp:8081

# 转发 Expo 开发服务器端口
adb reverse tcp:19000 tcp:19000
adb reverse tcp:19001 tcp:19001

# 或者使用项目中的快捷命令
npm run adb
```

## 查看日志

### Expo 相关日志
```bash
adb logcat | grep -i expo
```

### React Native 日志
```bash
adb logcat | grep -i "ReactNativeJS"
```

### 所有日志
```bash
adb logcat
```

### 清除日志并重新开始
```bash
adb logcat -c && adb logcat
```

## 查看元素尺寸

### 使用调试工具组件

在需要查看尺寸的元素上添加 `onLayout` 处理：

```typescript
import { createElementLayoutHandler } from '@/components/DebugTools'

// 在组件中使用
<View onLayout={createElementLayoutHandler('容器名称')}>
  {/* 你的内容 */}
</View>
```

### 手动添加 onLayout

```typescript
<View
  onLayout={(event) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    console.log('元素尺寸:', {
      '位置': `(${x}, ${y})`,
      '尺寸': `${width} × ${height}`,
      '面积': width * height,
    });
  }}
>
  {/* 你的内容 */}
</View>
```

## 快速调试流程

1. **打开开发者菜单**
   ```bash
   adb shell input keyevent 82
   ```

2. **打开元素检查器**
   - 在开发者菜单中选择 "Toggle Element Inspector"
   - 或使用命令：`adb shell input text "i"`

3. **查看元素尺寸**
   - 点击屏幕上的元素
   - 查看控制台输出的尺寸信息
   - 或使用 DebugTools 组件的"元素"功能

4. **查看日志**
   ```bash
   adb logcat | grep -i "元素尺寸"
   ```

## 常用调试命令组合

### 完整调试流程
```bash
# 1. 转发端口
adb reverse tcp:8081 tcp:8081 && adb reverse tcp:19000 tcp:19000

# 2. 打开开发者菜单
adb shell input keyevent 82

# 3. 查看日志
adb logcat | grep -i expo
```

### 重启应用并查看日志
```bash
adb shell am force-stop com.xhtx.app && \
adb shell am start -n com.xhtx.app/.MainActivity && \
adb logcat | grep -i expo
```

## 注意事项

1. **确保设备已连接**
   ```bash
   adb devices
   ```

2. **确保应用在开发模式**
   - 使用 `expo start --dev-client` 启动
   - 或使用 `npm run debug`

3. **元素检查器仅在开发模式可用**
   - 生产环境不会显示调试工具

4. **性能影响**
   - 调试工具会略微影响性能
   - 生产环境会自动禁用

