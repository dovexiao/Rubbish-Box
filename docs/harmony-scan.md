# React Native 鸿蒙纯血版 (RNOH)：扫码功能 (Vision Camera) 从零接入与封装

在 React Native 中目前最先进的相机方案是 `react-native-vision-camera`，但要想在鸿蒙系统上做到完美填屏并具备企业级的扫码能力（条形码/二维码），我们需要将其与 HarmonyOS 的 `@kit.ScanKit` 和 `@kit.CameraKit` 进行深度整合封装。

以下是完整的从零实现思路与操作步骤：

---

## 阶段一：整体架构思路

1. **Android/iOS 端**：直接使用 `react-native-vision-camera`。
2. **Harmony 端依赖**：放弃官方包中的老旧识别代码，通过自建本地包 `@react-native-oh-tpl/react-native-vision-camera` 链接进工程。
3. **ArkTS 原生层视图封装**：定制其中的 `VisionCameraView.ets`，利用系统的 `<XComponent>` 作为相机推流画布，同时嵌入鸿蒙强大的官方图码扫描引擎 `@kit.ScanKit` 实现 `customScan` 能力。
4. **C/C++ 事件打通**：捕捉扫码引擎吐出的码字符串并构建包含 `value` 和 `type` 的事件体向上抛给前端的 `onCodeScanned` 事件。

---

## 阶段二：鸿蒙端环境准备（接入组件与权限申请）

相机对权限的要求极高。

1. **依赖导入**：
   在 `entry/oh-package.json5` 中，一定要使用绝对内联封装的方法引用源码，**切忌跨工程的通过 file 路径越界引用**。
   ```json5
   {
     dependencies: {
       '@react-native-ohos/react-native-vision-camera': 'file:./libs/vision_camera',
     },
   }
   ```
2. **清单权限申请**：
   在 `entry/src/main/module.json5` 的 `requestPermissions` 数组中添加：
   - `ohos.permission.CAMERA` （启动相机）
   - 用户权限提示描述文字。

---

## 阶段三：ArkTS 原生层图码识别封装

原生的 `VisionCameraView` 在推流上没有问题，核心封装点在于**扫码区域映射模块 (`ScanManager.ts`)**。

1. **引擎初始化绑定**：
   当传入的 props 中携带了 codeScanner，就在挂载时执行 `@kit.ScanKit.customScan.init()` 注入推流画面。
2. **致命踩坑修复 1 —— 识别模式转换：**
   由于 ScanKit 和 RN 侧枚举不对标，在指定要扫什么码（QR / 条码）时很容易出现映射错误（如 JS 端传了 `qr`，被引擎错误解读为去扫 `upc` 条码，从而产生**扫码毫无反应**的现象）。
   **修复解法**：在 `ScanManager.ts` 中初始化时，强制指定 `scanTypes: [scanCore.ScanType.ALL]`，兜住所有能解码的码类型。
3. **致命踩坑修复 2 —— UI 坐标系越界：**
   鸿蒙底层 ScanCore 接收的识别宽高点是`物理像素 (px)`，而相机组件视图获取出来的可能是`虚拟视口像素 (vp)`。如果不做转换，扫码框会直接冲出屏幕 3 倍远外，导致识别核心死机且发热。
   **修复解法**：传入引擎视图的时候包一层全局系统函数转换：
   ```typescript
   viewControl: {
      width: px2vp(this.viewWidth),
      height: px2vp(this.viewHeight)
   }
   ```

---

## 阶段四：C++ 层桥接通信 (Props 与生命周期)

与地图机制相同，相机是一个具备物理生命周期的 UI 组件（UIComponent）。

1. 必须在 C++ 内部通过 JSI 暴露相机的属性 `isActive: boolean`、`codeScannerOptions: Object`。
2. 配置事件回调 `onCodeScanned`。
3. 在 `VisionCameraView.ets` 拿到解析文本后，调用 `ctx.rnInstance.emitComponentEvent(this.tag, "onCodeScanned", {...})`。

---

## 阶段五：JS 侧多端适配器设计

鸿蒙端在渲染 `<Camera />` 前**必须手动拉取安全权限框** （鸿蒙对隐私更严格，在没给权限时强行使用 XComponent 调用系统相机相关底层会发证底层崩溃）。

```typescript
import {
  Camera as RNCamera,
  useCameraDevices,
} from 'react-native-vision-camera';

// 扫码功能页面封装
export const QRScanner = () => {
  const devices = useCameraDevices();
  const device = devices.back;
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    // 请求权限，鸿蒙下需要使用特定原生模块或依赖库进行二次确认
    requestCameraPermission().then(res => setHasPermission(res));
  }, []);

  if (!device || !hasPermission) return <Loading />;

  return (
    <RNCamera
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={true}
      codeScanner={{
        codeTypes: ['qr', 'ean-13'],
        onCodeScanned: codes => {
          console.log(`Scan Code Context: ${codes[0].value}`);
        },
      }}
    />
  );
};
```

---

## 阶段六：业务开发中的注意事项！

### 1. 严格遵守绝对物理隔离开发规范！

若你正在修改 `vision_camera` 本身的能力以支持鸿蒙，千万不能在 `oh-package.json5` 里去链接外部的相对路径 (`file:../../bokeapp/...`)。这会在鸿蒙的打包链 (`hvigor`) 层面引发路径寻址越权黑洞！必须将代码物理拷贝进 `boke_harmony/entry/libs/` 内。

### 2. Camera 实例安全销毁

扫码与地图类似，涉及到大硬件的开销。在 React Native 跳转卸载（Unmount）该扫码页大时候，或者 App 被推进后台时候，必须让属性 `isActive={false}`，或者在 `aboutToDisappear` (鸿蒙侧) 中停止扫描识别帧，释放 `customScan.release()`，否则相机将一直吃用手机电池及句柄，不仅会发烫，返回上级页面后再进一次也会变成**黑屏**。
