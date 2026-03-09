# React Native 鸿蒙纯血版 (RNOH)：微信登录相关功能从零接入与封装

在 React Native 项目中，Android 和 iOS 通常使用 `react-native-wechat-lib` 来实现微信的登录、分享与支付。针对 HarmonyOS NEXT，原生微信 SDK 发生了很多改变。我们需要在鸿蒙端以 **TurboModule（非 UI 的异步方法模块）** 的形式接入腾讯官方提供的鸿蒙版 SDK，并桥接给前端使用。

以下是完整的从零实现思路与操作步骤：

---

## 阶段一：整体架构思路

1. **Android/iOS 端**：继续使用社区库 `react-native-wechat-lib`。
2. **Harmony 端依赖**：引入腾讯官方放出的鸿蒙客户端 SDK 包 `@tencent/wechat_open_sdk`。
3. **ArkTS 原生封装**：在鸿蒙主工程中创建 `HarmonyWechatTurboModule.ets`，对接原生 SDK 的 `Wechat.registerApp()` 与 `Wechat.sendAuthRequest()`。
4. **生命周期/回调链路**：微信授权会跳转到微信 App，授权完毕后通过 `onNewWant` 或深度链接拉起宿主 App，这里必须在拉起时截获 Code 传递给 RN 运行环境。
5. **JS 跨平台适配层**：定义一个 unified 的 JS 模块拦截调用，根据 `IS_HARMONY` 切换调用对应的原生实例。

---

## 阶段二：鸿蒙端环境准备（导入官方 SDK）

1. 在 `entry/oh-package.json5` 中声明依赖：
   ```json5
   {
     dependencies: {
       '@tencent/wechat_open_sdk': '1.0.16', // 或者指定当前具体版本/本地路径
     },
   }
   ```
2. **配置 URL Scheme 与权限**：
   需要在 `entry/src/main/module.json5` 中配置唤起自身 Ability 的 skills：
   ```json5
   "skills": [
     {
       "actions": ["action.system.home"],
       "entities": ["entity.system.home"],
       "uris": [
         {
           "scheme": "你的微信AppID", // 非常重要！微信认证完会通过这个 Scheme 切回 App
         }
       ]
     }
   ]
   ```

---

## 阶段三：ArkTS 原生层模块封装 (TurboModule)

因为微信登录不涉及渲染地图那样的视图，它属于纯函数化调用。

1. **构建 TurboModule 类**：
   在 `entry/src/main/ets/turboModules` 下创建 `HarmonyWechatTurboModule.ets` 继承 `TurboModule`。

   ```typescript
   export class HarmonyWechatTurboModule extends TurboModule {
     // 初始化注册
     public registerApp(
       appId: string,
       universalLink: string,
     ): Promise<boolean> {
       // 调用原生腾讯SDK初始化
     }

     // 发起登录请求
     public sendAuthRequest(scope: string, state: string): Promise<any> {
       return new Promise((resolve, reject) => {
         // 调用微信 SDK 的 auth 接口
         // 保存这个 Promise 的 resolve/reject，在收到微信回调时再触发
       });
     }
   }
   ```

2. **拦截微信的回调（关键上下文）**：
   在 `entry/src/main/ets/entryability/EntryAbility.ets` 中，监听系统唤起应用的操作。
   重写 `onNewWant(want: Want, launchParam: AbilityConstant.LaunchParam)` 和 `onCreate`。
   当检测到 `want.uri` 包含你的微信 AppID 路由时，使用微信 SDK 进行结果解析，然后把得到的 `code` 抛给 `HarmonyWechatTurboModule` 里的 Promise。

---

## 阶段四：C++ 层与 RNOH 环境桥接

TurboModule 也需要与 C++ 交互或在主工程注册：

1. 在 `entry/src/main/ets/RNPackagesFactory.ets` 里加载微信模块。
2. 配置 `createRNPackages`，在提供的 `TurboModulesFactory` 中判断名称为 `HarmonyWechat` 时，返回你在上面写的 `HarmonyWechatTurboModule` 类实例。

---

## 阶段五：JS 侧多端适配器设计 (Adapter 模式)

在 React Native 业务代码中创建一个统一的门面 `src/utils/wechat-adapter.ts`。

```typescript
import { NativeModules, Platform } from 'react-native';
import * as WeChatOfficial from 'react-native-wechat-lib';

// 判别如果系统时且已注册原生包
const IS_HARMONY = Platform.OS === 'harmony' || Platform.OS === 'ohos';
const HarmonyWechat = NativeModules.HarmonyWechat;

export const WechatAPI = {
  registerApp: async (appid: string, ext: string) => {
    if (IS_HARMONY && HarmonyWechat) {
      return await HarmonyWechat.registerApp(appid, ext);
    }
    return await WeChatOfficial.registerApp(appid, ext);
  },
  sendAuthRequest: async (scope: string, state: string) => {
    if (IS_HARMONY && HarmonyWechat) {
      return await HarmonyWechat.sendAuthRequest(scope, state);
    }
    return await WeChatOfficial.sendAuthRequest(scope, state);
  },
};
```

**凡是涉及到微信登录的业务点，统一引用 `WechatAPI`，即可实现多端兼容。**

---

## 阶段六：业务开发中的注意事项！

### 1. AppID 大小写与 Scheme 对应必须严丝合缝

微信极其依赖 `URL Scheme` 回调。如果您在微信开放平台上配置的鸿蒙 AppID 是 `wx1234567890`，那么 `module.json5` 的 uris 必须完全匹配这个值。配错哪怕一个字母，点击微信"同意登录"后应用也会直接消失或留着黑屏。

### 2. 回调状态重置管理

`sendAuthRequest` 拉起微信时，当前的鸿蒙宿主 App 会进入后台 (background)。这中间可能发生任何情况（如用户切出去看了个朋友圈然后手动划掉 App）。
如果回调触发或者没有触发，要在 `TurboModule` 中做好 Promise 的清空销毁保护，防止因为“未得到响应，且 Promise 一直挂起”导致的**内存泄露**或者**第二次调用登录无任何反应**。
