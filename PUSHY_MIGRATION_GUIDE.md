# Pushy热更新迁移完成指南

## 概述
已完成从CodePush到Pushy的完整迁移，保留了原有的多包配置功能，支持使用一个appKey管理所有包和渠道。

## 主要变更

### 1. Android原生配置
- **MainApplication.java**: 移除了`CodePush`导入，改用`UpdateContext.getBundleUrl()`

### 2. React Native配置  
- **App.tsx**: 
  - 移除了所有CodePush相关逻辑
  - 添加了`UpdateProvider`和`UpdateManager`组件
  - 使用`useUpdate`钩子管理热更新
- **env.config.ts**: 移除了CodePush密钥配置

### 3. 新增文件
- **src/update.json**: Pushy配置文件，包含appKey
- **pushy-multi-release.js**: 多包热更新发布脚本

## 配置说明

### Pushy配置文件 (src/update.json)
```json
{
  "android": {
    "appKey": "pzyfXnB4qhPsH6JtPfW3_sI-"
  }
}
```

### 环境要求
1. 安装Pushy CLI:
   ```bash
   npm install -g react-native-update-cli
   ```

2. 登录Pushy账户:
   ```bash
   pushy login
   ```

## 使用方法

### 1. 生成多包热更新
运行多包热更新脚本:
```bash
npm run pushy:multi:release [版本号]
```

例如:
```bash
npm run pushy:multi:release 1.0.1
```

### 2. 单独上传热更新包
```bash
npm run pushy:upload
```

### 3. 发布热更新
```bash
npm run pushy:release
```

## 特性保留

### ✅ 多包配置
- 保留了原有的11个包配置
- 支持每个包的多渠道配置
- 自动为每个包/渠道组合生成独立的热更新包

### ✅ 环境变量分离
- env配置不会被打包到资源包中
- 每个包使用独立的.env文件
- 渠道配置动态注入到App.tsx

### ✅ 一个AppKey管理
- 使用单一appKey管理所有包和渠道
- 通过描述信息区分不同的包/渠道版本

## 热更新流程

1. **检查更新**: App启动时自动检查
2. **强制更新**: 显示弹窗，用户确认后重启应用
3. **静默更新**: 后台下载，询问用户是否重启
4. **版本切换**: 下载完成后切换到新版本

## 注意事项

1. **包结构**: 生成的bundle文件保存在`./bundles/[包名]/[渠道]/`目录
2. **版本管理**: 使用描述信息格式: `包名-渠道-版本号`
3. **错误处理**: 脚本会在失败时自动恢复App.tsx原始内容
4. **语音提示**: 支持macOS语音播报打包进度

## 迁移验证

### 检查要点
- [ ] Android应用可以正常启动
- [ ] 热更新检查功能正常
- [ ] 多包配置功能保持不变
- [ ] env配置不会被误打包
- [ ] Pushy平台可以接收热更新包

### 测试建议
1. 修改一个简单的文本内容
2. 运行`npm run pushy:multi:release`
3. 在Pushy平台查看上传的包
4. 发布热更新并测试应用更新

## 故障排除

### 常见问题
1. **Pushy CLI未安装**: 运行`npm install -g react-native-update-cli`
2. **未登录Pushy**: 运行`pushy login`
3. **Bundle生成失败**: 检查React Native环境和依赖
4. **上传失败**: 确认网络连接和Pushy账户权限

---

**迁移完成** ✅
现在您可以完全使用Pushy平台管理热更新，同时保留了原有的多包配置功能。