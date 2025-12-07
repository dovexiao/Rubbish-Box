# 坐姿检测调试模式使用说明

## 快速使用

在任何地方调用启动服务时，传入 `true` 启用调试模式：

```typescript
import { startPostureMonitorService } from '@/modules/PostureMonitorModule'

// 启用调试模式
await startPostureMonitorService(true)

// 普通模式
await startPostureMonitorService(false)
```

## 调试浮窗功能

启用调试模式后，会在屏幕右上角显示一个浮窗，包含：

1. **实时相机画面**：显示当前检测的图像
2. **关键点标注**：17个人体关键点，用不同颜色表示置信度
   - 绿色：高置信度 (>0.7)
   - 黄色：中等置信度 (0.5-0.7)
   - 红色：低置信度 (<0.5)
3. **骨架连接**：显示人体骨架结构
4. **状态显示**：当前坐姿状态
   - ✅ 良好
   - ⚠️ 肩膀倾斜
   - ⚠️ 头部偏斜
   - ⚠️ 头部过低
   - ❌ 无人
   - 🔍 检测中

## 权限要求

需要 `SYSTEM_ALERT_WINDOW` 权限（悬浮窗权限），已在 AndroidManifest.xml 中声明。

## 注意事项

- 调试浮窗会占用额外资源，仅用于开发调试
- 生产环境请使用普通模式
- 浮窗会在服务停止时自动隐藏

