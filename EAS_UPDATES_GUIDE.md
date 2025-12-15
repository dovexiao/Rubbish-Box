# EAS Updates 使用指南

## 🚀 云端构建 + 热更新完整流程

### 📱 1. 构建应用（云端）

#### 开发环境构建
```bash
# 开发环境（模拟器）
npm run build:android:sim

# 开发环境（真机）
npm run build:android:dev
```

#### 预览环境构建
```bash
# 预览环境
npm run build:android:preview
```

#### 生产环境构建
```bash
# 生产环境
npm run build:android:prod
```

### 🔄 2. 热更新操作

#### 发布更新到不同环境
```bash
# 发布到开发环境
npm run update:development "修复登录问题"

# 发布到预览环境
npm run update:preview "新增用户管理功能"

# 发布到生产环境
npm run update:production "优化性能，修复bug"
```

#### 手动更新命令
```bash
# 开发环境更新
eas update --branch development --message "你的更新描述"

# 预览环境更新
eas update --branch preview --message "你的更新描述"

# 生产环境更新
eas update --branch production --message "你的更新描述"
```

### 📋 3. 更新流程说明

#### 首次发布流程
1. **构建应用**: `npm run build:android:prod`
2. **下载APK**: 从 EAS 控制台下载
3. **安装应用**: 在设备上安装APK
4. **发布更新**: `npm run update:production "首次更新"`

#### 日常更新流程
1. **修改代码**: 修改你的 React Native 代码
2. **发布更新**: `npm run update:production "更新描述"`
3. **用户自动更新**: 应用会自动检测并下载更新

### 🌐 4. 网络请求配置

不同环境使用不同的服务器地址：

#### 开发环境
- **API地址**: `http://8.135.11.47:8000`
- **上传地址**: `http://8.135.11.47:8000/AppStart/Protected/image_upload/`

#### 生产环境
- **API地址**: `https://www.xiaohetx.cn`
- **上传地址**: `https://www.xiaohetx.cn/AppStart/Protected/image_upload/`

### 🔧 5. 更新管理

#### 在应用内检查更新
应用已经集成了 EAS Updates，会自动：
- 启动时检查更新
- 下载并安装更新
- 显示更新进度

#### 手动检查更新
用户可以在应用内手动触发更新检查。

### 📊 6. 更新状态查看

#### 查看更新历史
```bash
# 查看所有更新
eas update:list

# 查看特定分支的更新
eas update:list --branch production
```

#### 查看构建历史
```bash
# 查看所有构建
eas build:list

# 查看特定平台的构建
eas build:list --platform android
```

### ⚠️ 7. 注意事项

#### 热更新限制
- **只能更新 JavaScript 代码**
- **不能更新原生代码**（需要重新构建APK）
- **不能更新依赖包**（需要重新构建APK）

#### 需要重新构建的情况
- 添加新的原生依赖
- 修改 `app.json` 配置
- 修改 `eas.json` 配置
- 修改原生代码

#### 更新策略
- **开发环境**: 频繁更新，测试新功能
- **预览环境**: 稳定版本，内部测试
- **生产环境**: 稳定版本，正式发布

### 🎯 8. 最佳实践

#### 版本管理
- 使用语义化版本号
- 在更新描述中说明变更内容
- 定期清理旧的更新

#### 测试流程
1. 在开发环境测试
2. 发布到预览环境
3. 内部测试通过后发布到生产环境

#### 回滚策略
如果更新有问题，可以：
1. 发布修复更新
2. 或者重新构建APK（紧急情况）

### 📞 9. 常用命令总结

```bash
# 构建
npm run build:android:prod

# 更新
npm run update:production "更新描述"

# 查看状态
eas update:list
eas build:list
```

---

**提示**: 首次使用需要确保已经登录 EAS (`eas login`) 并且项目已正确配置。

