AppUpdateDialog 组件已迁移自 Taro 版本，用于展示应用更新弹窗。

使用方式：
- 在顶层 App.tsx 中挂载 <AppUpdateDialogHost />；
- 在任意位置调用 showAppUpdateDialog({ ... }) 触发更新弹窗；
- 通过 onConfirm / onSkip 控制实际更新与跳过逻辑。

