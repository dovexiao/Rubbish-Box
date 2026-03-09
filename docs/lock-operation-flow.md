# 地锁操作与动图展示流程（RN）

本文基于当前仓库代码，梳理“点击升/降锁 → 发起操作 → 轮询结果 → 播放动图 → 结束后刷新详情并切静图”的完整链路，方便后续维护与排查问题。

## 相关文件

- 首页（单个设备）：[index.tsx](file:///c:/Users/rookie/Desktop/xinqiang/bokeapp/src/pages/index/index.tsx)
- 首页（组合设备）：[multiple/index.tsx](file:///c:/Users/rookie/Desktop/xinqiang/bokeapp/src/pages/multiple/index.tsx)
- 操作面板（按钮、轮询等）：[Content/index.tsx](file:///c:/Users/rookie/Desktop/xinqiang/bokeapp/src/components/Content/index.tsx)
- 设备动图/静图展示：[LockVisual/index.tsx](file:///c:/Users/rookie/Desktop/xinqiang/bokeapp/src/components/LockVisual/index.tsx)
- 锁详情接口：[`getLockInfo`](file:///c:/Users/rookie/Desktop/xinqiang/bokeapp/src/services/device.ts)
- 操作接口/轮询接口：[`operateLock/getOperateResult/getGroupOperateResult`](file:///c:/Users/rookie/Desktop/xinqiang/bokeapp/src/services/device.ts)

## 核心状态与职责划分

### 页面（Index / Multiple）负责

- `detail`：锁详情（接口返回的原始数据）
- `currentDeviceStatus`：静图状态（由 `detail.powerType/coverStatus/fallStatus` 推导）
- `deviceStatus`：动图开关集合（例如 `falling/rising/openCovering` 等），用于控制 LockVisual 是否渲染 GIF
- `gifNonce`：动图 URL nonce，确保同一个 GIF 能重复播放（绕开缓存）
- `optioning`：操作中标记，主要用于按钮禁用（由 Content 触发事件后写入）

### Content 组件负责

- 响应用户点击“升锁/降锁/开盖”等按钮
- 调用 `operateLock` 发起操作
- 调用 `getOperateResult/getGroupOperateResult` 轮询操作结果
- 通过 `eventCenter.trigger(...)` 通知页面开始/结束动画、禁用/恢复按钮

### LockVisual 组件负责

- 根据 `deviceStatus` 决定是否播放 GIF
- 如果没有任何 GIF 需要展示，则根据 `currentDeviceStatus` 展示对应的静态图

LockVisual 的关键逻辑：

- `anyGifShowing === true` 时，不渲染静图，只渲染 GIF
- `anyGifShowing === false` 时，根据 `lockStatus(currentDeviceStatus)` 渲染静图

见：[LockVisual/index.tsx](file:///c:/Users/rookie/Desktop/xinqiang/bokeapp/src/components/LockVisual/index.tsx#L34-L170)

## 事件总线（eventCenter）

页面会订阅两个事件（单设备/组合页都有同样逻辑）：

- `onAnimation`：开始播放某种动图（并启动 1830ms 的结束定时器）
- `onOptioned`：设置 `optioning`，用于禁用/恢复按钮

订阅位置：

- 单设备：[index.tsx](file:///c:/Users/rookie/Desktop/xinqiang/bokeapp/src/pages/index/index.tsx#L297-L314)
- 组合设备：[multiple/index.tsx](file:///c:/Users/rookie/Desktop/xinqiang/bokeapp/src/pages/multiple/index.tsx)

## 单次操作时序（升/降锁）

下面以“点击降锁”为例（升锁同理），从 UI 到最终静图切换的时序如下。

### 1) 用户点击按钮（Content）

- 如果 `optioning === true`：直接 return（防重复点击）
- 触发 `eventCenter.trigger('onOptioned', true)`：页面把按钮置为 disabled
- 调用 `operateLock(...)`：发起后端操作
- 调用 `loopLockStatus(...)`：开始轮询结果

见：[Content/index.tsx](file:///c:/Users/rookie/Desktop/xinqiang/bokeapp/src/components/Content/index.tsx)

### 2) 开始播放动图（页面）

Content 会在合适时机触发 `eventCenter.trigger('onAnimation', { type, value:true })`，页面收到后会：

- 清空其他动图标记，仅打开一个 `deviceStatus[type] = true`
- `gifNonce++` 强制 GIF 重新加载
- `setTimeout(1830ms)`：到点调用 `onAnimationEnd`，把动图标记清零

单设备逻辑见：[index.tsx](file:///c:/Users/rookie/Desktop/xinqiang/bokeapp/src/pages/index/index.tsx#L212-L288)

### 3) 轮询结果（Content）

`loopLockStatus` 每 1 秒请求一次：

- 单设备：`getOperateResult({ deviceNo, ot })`
- 组合设备：`getGroupOperateResult({ id, ot })`

轮询成功后停止：

- `stop()` 停止定时轮询
- 通常会 `hideLoading()`
- 后续的“动图结束 → 刷新详情 → 切静图”由页面负责

### 4) 动画期间预取详情（页面，1400ms）

为提高“动图结束那一帧就能显示最终静图”的命中率，页面在动画进行到约 1400ms 时会预取一次详情：

- `setTimeout(1400ms)` → 调用 `load(detailIdRef.current, { silent: true })`

对应代码（单设备）：

- [index.tsx:L273-L278](file:///c:/Users/rookie/Desktop/xinqiang/bokeapp/src/pages/index/index.tsx#L273-L278)

说明：

- 这个请求会更新 `detail` 和 `currentDeviceStatus`
- `silent: true` 不会打断页面主 loading（避免动画过程中闪屏）

### 5) 动画结束（1830ms）→ 切静图（页面）

到 1830ms，页面执行 `onAnimationEnd`：

- 清空 `deviceStatus`（此时 `anyGifShowing` 变为 false）
- `optioning=false`（按钮恢复可点）
- 如果已经触发过预取：不强制重复请求；否则兜底再调用一次 `load(...)`

此后 `LockVisual` 会从“渲染 GIF”切回“渲染静图”，静图由当前 `currentDeviceStatus` 决定。

## 排查清单

- 点击后按钮不再响应：检查 `optioning` 是否一直为 true（事件是否没触发恢复）
- 动图不播放：检查 `eventCenter.trigger('onAnimation', ...)` 是否触发 & 页面是否订阅成功
- 动图只播放一次：检查 `gifNonce` 是否在每次动画开始时递增
- 动图结束静图不对：检查 `load()` 是否在结束时刻前后成功更新了 `detail/currentDeviceStatus`
