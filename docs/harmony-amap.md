# React Native 鸿蒙纯血版 (RNOH)：高德地图从零接入与封装指南

在 React Native 项目中，Android 和 iOS 通常使用开源库 eact-native-amap3d 来实现高德地图。但该库并未官方适配 HarmonyOS NEXT。因此，为了在鸿蒙端实现同一套 React 代码运行地图，我们需要**在鸿蒙原生层封装高德官方的 Harmony SDK，并通过 RNOH (C++ & JSI) 将其桥接给 React Native**。

以下是完整的从零实现思路与操作步骤：

---

## 阶段一：整体架构思路

1. **Android/iOS 端**：继续保持原样，使用 eact-native-amap3d。
2. **Harmony 端依赖**：放弃 eact-native-amap3d，改为引入**高德地图官方提供的 Harmony 纯血原生 SDK**（各种 .har 包）。
3. **ArkTS 原生封装**：在鸿蒙主工程（entry/src/main/ets）中，编写一个自定义 ArkUI 组件来挂载高德 SDK 的 MapViewComponent。
4. **C++ 桥接通信**：编写自定义指令和 JSIBinder，让 JS 里的属性（如中心经纬度）能够传递给 ArkTS 端。
5. **JS 跨平台适配层**：在工程中编写一个基于 IS_HARMONY 标志位的“适配器 (Adapter)”。JS 业务代码不再直接从第三方库引包，而是从适配器引包。适配器会自动判断当前系统，路由到对应的具体实现。

---

## 阶段二：鸿蒙端环境准备（引入原生 SDK）

由于纯血鸿蒙的高德 SDK 目前未上架公共 npm，我们需要手动下载其提供的 .har 本地包。
1. 将下载的 @amap/amap_lbs_map3d.har、@amap/amap_lbs_common.har 等放到鸿蒙工程的 oh_modules 目录下。
2. 在 entry/oh-package.json5 的 dependencies 中显式引入：
   `json5
   {
     "dependencies": {
       "@amap/amap_lbs_map3d": "file:./libs/amap_lbs_map3d.har",
       "@amap/amap_lbs_common": "file:./libs/amap_lbs_common.har"
     }
   }
   `
3. 执行 ohpm install 安装好原生的高德 SDK 依赖。

---

## 阶段三：ArkTS 原生层视图封装

在鸿蒙壳子的目录 entry/src/main/ets/components 中创建 HarmonyAmapView.ets。

**核心要做的事：**
1. **处理隐私合规**：高德地图强制要求配置隐私协议同意状态，否则崩溃。必须在加载地图前调用 MapsInitializer.updatePrivacyShow() 和 updatePrivacyAgree()，建议使用静态变量保证 App 生命周期内只执行一次。
2. **初始化配置**：通过传进来的 piKey 初始化 MapsInitializer.setApiKey()。
3. **包裹原生视图**：使用 RNOH 提供的标准壳子 RNViewBase 包裹高德自带的 MapViewComponent，以接受 React 生命周期管理。
4. **延迟渲染**：使用 @State 控制地图真正的显示（等待 API Key 配置和隐私政策认证完成后，再将地图 UI visibility 设为 Visible）。

---

## 阶段四：C++ 层桥接（打通 React 通信）

ArkTS 层写好的地图，JS 并不知道。我们需要使用 C++ 向 JS 层暴露这个组件。

在 entry/src/main/cpp/ 下编写打包文件（如 HarmonyAmapPackage.h）：
1. **定义属性通信 (Props)**：重写 createNativeProps，向引擎声明你需要接受哪些 JS 参数，比如 piKey (string)、center (object)、zoomLevel (number)。
2. **定义事件通信 (Events)**：重写 createDirectEventTypes，向引擎声明你会向外抛出哪些事件，例如 	opMapLoaded 映射到 JS 的 onMapLoaded。
3. **注册为标准组件**：在 Package 中注册绑定这个组件，**切记不要画蛇添足返回 CustomNodeComponentInstance**，必须使用引擎默认的标准 ViewComponent 实例机制，否则会导致渲染时出现空指针 (SIGSEGV) 底层崩溃。
4. 最后在 PackageProvider.cpp 注入 HarmonyAmapCppPackage。

---

## 阶段五：JS 侧多端适配器设计 (Adapter 模式)

这是保证一套代码三端运行的关键。不要在所有页面的顶部去写混乱的 Platform.OS === 'ohos'。

在 JS src/utils/amap3d-adapter.ts 下进行拦截：
1. **加载原生鸿蒙地图**：如果 IS_HARMONY 且功能开启，则使用 equireNativeComponent('HarmonyAmapView') 引入我们第四步写的桥接对象。
2. **加载原生 Android/iOS 地图**：在这个 JS 适配器中使用 	ry...catch 引包：
   `	ypescript
   try {
      cachedModule = require('react-native-amap3d')
   } catch {
      // 如果没有这个包，兜底使用下面的 Shim
   }
   `
3. **白板占位兜底 (Shim)**：写一个不具备任何地图功能、但是包含相同 Prop 方法定义的“假”组件（map3d-shim.tsx）。万一所在平台无法加载地图 SDK（比如未配置、被剥离），返回此白板可以避免全局 React 组件树直接红屏崩溃。

---

## 阶段六：业务开发中的注意事项！

完成上述链路后，你在业务代码（如 deviceAddress 页）里就可以像平常一样写 <MapView>。
但必须遵循两大**防崩溃、防白屏特种规范**：

### 1. 强制声明绝对宽高 (解决白屏)
原生组件 (Native Component) 在 RN 的 Flex 布局系统中没有默认边界。如果不给它赋予 style={{ flex: 1, width: '100%', height: '100%' }}，它的宽高就会是 **0x0**，表现出来的就是组件背景上一片空白。

### 2. 避免条件渲染暴力卸载 (解决闪退)
**❌ 错误做法：**
`	sx
{ locationReady ? <MapView /> : <Loading /> }
`
React 卸载 DOM 是极快的，但鸿蒙底层的地图引擎在后台还在渲染 3D 瓦片和加载图片。组件被暴力抽毁后，底层异步线程返回时必定触发空指针异常导致宿主 App 崩溃。

**✅ 正确做法 (常驻 DOM 方案)：**
一直渲染 <MapView> 不退出，使用一个具有绝对定位（position: 'absolute', zIndex: 99）并填充背景色的 <View> 直接覆盖在它上面充当遮罩。当就绪时，隐藏遮罩即可。
