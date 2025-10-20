# EAS Build 更新功能

本项目已集成EAS Build更新功能，支持通过Expo Updates进行热更新。

## 功能特性

- ✅ **EAS Updates集成**: 基于Expo Updates的官方更新服务
- ✅ **多渠道支持**: development、preview、production渠道
- ✅ **自动更新检测**: 应用启动时自动检查更新
- ✅ **手动更新检查**: 支持用户手动触发更新检查
- ✅ **静默更新**: 支持后台静默下载和安装
- ✅ **更新状态监控**: 实时获取更新状态和进度
- ✅ **兼容性**: 与现有更新系统完全兼容

## 配置说明

### 1. EAS项目配置

在 `app.config.ts` 中配置EAS项目ID：

```typescript
extra: {
  eas: {
    projectId: "your-actual-project-id" // 替换为实际的EAS项目ID
  }
}
```

获取项目ID：
```bash
eas project:info
```

### 2. 更新渠道配置

在 `eas.json` 中已配置三个更新渠道：

- **development**: 开发环境更新
- **preview**: 预览环境更新  
- **production**: 生产环境更新

### 3. 运行时版本策略

使用 `appVersion` 策略，基于应用版本号进行更新管理。

## 使用方法

### 1. 初始化更新服务

```typescript
import { updateManager } from './src/services/updateManager'

// 在应用启动时初始化
await updateManager.initialize()
```

### 2. 检查更新

```typescript
// 自动检查更新（静默）
await updateManager.checkForUpdates()

// 手动检查更新
await updateManager.manualCheckForUpdates()

// 应用进入前台时检查
await updateManager.checkForUpdatesOnShow()
```

### 3. 获取更新状态

```typescript
// 获取EAS更新状态
const status = updateManager.getEASUpdateStatus()
console.log('更新状态:', status)
```

### 4. 直接使用EAS更新服务

```typescript
import { easUpdateService } from './src/services/easUpdateService'

// 检查EAS更新
await easUpdateService.checkForUpdates()

// 手动检查更新
await easUpdateService.manualCheckForUpdates()

// 获取更新状态
const status = easUpdateService.getUpdateStatus()
```

## 构建和发布

### 1. 构建应用

```bash
# 开发版本
npm run build:android:dev
npm run build:ios:dev

# 预览版本
npm run build:android:preview
npm run build:ios:preview

# 生产版本
npm run build:android:prod
npm run build:ios:prod
```

### 2. 发布更新

```bash
# 发布到开发渠道
eas update --channel development

# 发布到预览渠道
eas update --channel preview

# 发布到生产渠道
eas update --channel production
```

### 3. 发布更新（带消息）

```bash
eas update --channel production --message "修复了已知问题，提升了应用稳定性"
```

## 测试流程

### 1. 运行测试脚本

```bash
chmod +x scripts/test-eas-update.sh
./scripts/test-eas-update.sh
```

### 2. 手动测试步骤

1. **构建应用**：
   ```bash
   npm run build:android:dev
   ```

2. **安装应用**：
   将生成的APK安装到设备上

3. **修改代码**：
   对应用进行一些修改（如修改UI文本）

4. **发布更新**：
   ```bash
   eas update --channel development
   ```

5. **测试更新**：
   在应用中手动检查更新，验证更新是否生效

### 3. 验证更新

- 检查控制台日志确认更新检测
- 验证更新内容是否正确应用
- 确认应用重启后更新生效

## 更新策略

### 1. 自动更新

- **应用启动时**: 自动检查更新
- **静默下载**: 后台下载更新包
- **自动安装**: 下载完成后自动重启应用

### 2. 手动更新

- **用户触发**: 用户手动检查更新
- **确认安装**: 显示更新对话框供用户选择
- **立即更新**: 用户确认后立即下载安装

### 3. 更新提醒

- **红点提醒**: 有更新时显示红点
- **延迟提醒**: 用户可选择稍后提醒
- **强制更新**: 重要更新可设置为强制

## 故障排除

### 1. 更新不可用

**可能原因**：
- 未登录EAS账户
- 项目ID配置错误
- 网络连接问题

**解决方案**：
```bash
# 登录EAS
eas login

# 检查项目信息
eas project:info

# 检查网络连接
ping updates.expo.dev
```

### 2. 更新检测失败

**可能原因**：
- Expo Updates未启用
- 运行时版本不匹配
- 渠道配置错误

**解决方案**：
- 检查 `app.config.ts` 中的 `updates` 配置
- 确认 `runtimeVersion` 策略设置
- 验证 `eas.json` 中的渠道配置

### 3. 更新安装失败

**可能原因**：
- 设备存储空间不足
- 网络中断
- 应用权限问题

**解决方案**：
- 清理设备存储空间
- 检查网络连接
- 重新安装应用

## API参考

### EASUpdateService

```typescript
class EASUpdateService {
  // 初始化服务
  initialize(): Promise<void>
  
  // 检查更新
  checkForUpdates(options?: {
    silent?: boolean
    forceCheck?: boolean
    source?: string
  }): Promise<void>
  
  // 下载并安装更新
  downloadAndInstallUpdate(updateData: any, silent?: boolean): Promise<void>
  
  // 手动检查更新
  manualCheckForUpdates(): Promise<void>
  
  // 应用进入前台时检查
  checkForUpdatesOnShow(): Promise<void>
  
  // 获取更新状态
  getUpdateStatus(): {
    isEnabled: boolean
    runtimeVersion: string | null
    updateId: string | null
    channel: string | null
    releaseChannel: string | null
  }
  
  // 清理更新缓存
  clearUpdateCache(): Promise<void>
  
  // 设置更新提醒
  setUpdateReminder(hours: number): Promise<void>
}
```

### UpdateManager

```typescript
class UpdateManager {
  // 初始化管理器
  initialize(): Promise<void>
  
  // 检查更新（优先使用EAS）
  checkForUpdates(options?: UpdateCheckOptions): Promise<void>
  
  // 手动检查更新
  manualCheckForUpdates(): Promise<void>
  
  // 应用进入前台时检查
  checkForUpdatesOnShow(): Promise<void>
  
  // 获取EAS更新状态
  getEASUpdateStatus(): UpdateStatus
  
  // 清理更新缓存
  clearUpdateCache(): Promise<void>
}
```

## 注意事项

1. **开发环境**: 在开发环境中Expo Updates通常不可用，会回退到传统更新方式
2. **网络要求**: 更新需要网络连接，建议在WiFi环境下进行
3. **存储空间**: 确保设备有足够的存储空间下载更新包
4. **版本兼容**: 确保更新包的运行时版本与当前应用兼容
5. **测试验证**: 在生产环境发布前，务必在测试环境验证更新功能

## 相关文档

- [Expo Updates文档](https://docs.expo.dev/versions/latest/sdk/updates/)
- [EAS Update文档](https://docs.expo.dev/eas-update/introduction/)
- [EAS Build文档](https://docs.expo.dev/build/introduction/)
- [运行时版本策略](https://docs.expo.dev/eas-update/runtime-versions/)

