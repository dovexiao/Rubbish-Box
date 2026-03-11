# React Native 鸿蒙原生 (RNOH)：微信登录相关功能从零接入与封装（含踩坑记录）

在 React Native 项目中，针对 HarmonyOS NEXT，由于 ArkTS UI 线程的严格校验机制以及原生的各类限制，接入微信 SDK 时会遇到很多特有的坑（如 AnyThreadTurboModule 导致的异步回调死锁问题）。

以下是完整的从零实现思路、操作步骤与核心错误修复总结：

---

## 阶段一：架构思路与避坑指南

1. **Android/iOS 端**：继续使用社区库 eact-native-wechat-lib。
2. **Harmony 端依赖**：引入腾讯官方放出的鸿蒙客户端 SDK 包 @tencent/wechat_open_sdk。
3. **ArkTS 封装核心（UITurboModule）**：
   - **错误做法**：继承普通的 TurboModule / AnyThreadTurboModule。微信 API 涉及界面拉起（Ability 拉起），如果在任何线程执行会导致原生底层 UI 检测崩溃。
   - **正确做法**：必须继承 UITurboModule，强制使用主线程调用。
4. **JS Callback 安全储存结构**：
   - **错误做法**：试图利用 AppStorage.setOrCreate() 去存储 JS 层传递下来的 Promise.resolve 闭包，ArkUI 会直接报错 ttempt to assign value type: 'function'。
   - **正确做法**：使用纯 TypeScript 单例类（如 WeChatAuthContext）来跨模块传递上下文回调。
5. **App Linking / onCreate 同步**：除了配置 scheme，还必须要正确配置 Universal Links（App Linking）和 module.json5。

---

## 阶段二：鸿蒙端环境准备（导入官方 SDK）

1. 在 entry/oh-package.json5 中声明依赖：
   `json5
   {
     dependencies: {
       '@tencent/wechat_open_sdk': '1.0.16'
     }
   }
   `
2. **配置 URL Scheme 与 App Linking**：
   需要在 entry/src/main/module.json5 中的 skills 进行配置：
   `json5
   "skills": [
     {
       "entities": ["entity.system.home"],
       "actions": ["action.system.home"]
     },
     {
       "actions": ["ohos.want.action.viewData"],
       "entities": ["entity.system.browsable", "entity.system.default"],
       "uris": [
         {
           "scheme": "https",
           "host": "你的UniversalLink域名"
         },
         {
           "scheme": "你的微信AppID"
         }
       ],
       "domainVerify": true 
     }
   ]
   `

---

## 阶段三：规避 ArkTS 内存检查的纯 TS 容器管理器

在 entry/src/main/ets/utils/WeChatAuthContext.ets 中创建一个单例，用来保存 Promise 回调：

`	ypescript
export class WeChatAuthContext {
  private static instance: WeChatAuthContext;
  private resolveAuth: ((value: any) => void) | null = null;
  private rejectAuth: ((reason?: any) => void) | null = null;

  private constructor() {}

  public static getInstance(): WeChatAuthContext {
    if (!WeChatAuthContext.instance) {
      WeChatAuthContext.instance = new WeChatAuthContext();
    }
    return WeChatAuthContext.instance;
  }

  public setAuthCallbacks(resolve: (value: any) => void, reject: (reason?: any) => void) {
    this.resolveAuth = resolve;
    this.rejectAuth = reject;
  }

  public resolveAuthRequest(value: any) {
    if (this.resolveAuth) {
      this.resolveAuth(value);
      this.clearCallbacks();
    }
  }

  public clearCallbacks() {
    this.resolveAuth = null;
    this.rejectAuth = null;
  }
}
`

---

## 阶段四：构建主线程 UITurboModule 封装

创建 HarmonyWechatTurboModule.ets，**必须继承 UITurboModule**：

`	ypescript
import { UITurboModule } from '@rnoh/react-native-openharmony/ts';
import { WeChatAuthContext } from '../utils/WeChatAuthContext';
import * as wx from '@tencent/wechat_open_sdk';

export class HarmonyWechatTurboModule extends UITurboModule {
  public registerApp(appId: string, universalLink: string): Promise<boolean> {
    return new Promise((resolve) => {
      wx.WXApi.registerApp(this.ctx.uiAbilityContext, appId, (res) => {
        resolve(res);
      });
    });
  }

  public sendAuthRequest(scope: string, state: string): Promise<any> {
    return new Promise((resolve, reject) => {
      WeChatAuthContext.getInstance().setAuthCallbacks(resolve, reject);
      let req = new wx.SendAuthReq();
      req.scope = scope;
      req.state = state;
      wx.WXApi.sendReq(this.ctx.uiAbilityContext, req);
    });
  }
}
`

---

## 阶段五：在 EntryAbility 拦截返回结果

在 entry/src/main/ets/entryability/EntryAbility.ets 中，监听系统唤起的生命周期，将接收到的微信结果传递给 Context：

`	ypescript
import { WeChatAuthContext } from '../utils/WeChatAuthContext';
import * as wx from '@tencent/wechat_open_sdk';

export default class EntryAbility extends UIAbility {

  // 必须处理 onCreate（冷启动应用被拉起）
  onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
    wx.WXApi.handleWant(want, {
      onResp: (resp) => {
        if (resp instanceof wx.SendAuthResp) {
          WeChatAuthContext.getInstance().resolveAuthRequest({ code: resp.code });
        }
      },
      onReq: (req) => {}
    });
  }

  // 必须处理 onNewWant（热启动页面被唤醒）
  onNewWant(want: Want, launchParam: AbilityConstant.LaunchParam): void {
    wx.WXApi.handleWant(want, {
      onResp: (resp) => {
        if (resp instanceof wx.SendAuthResp) {
          WeChatAuthContext.getInstance().resolveAuthRequest({ code: resp.code });
        }
      },
      onReq: (req) => {}
    });
  }
}
`

---

## 阶段六：常见问题排查与修复记录

### 1. The turbo module callback is out of bounds
**原因**：继承了 TurboModule（本质是 AnyThreadTurboModule），而在鸿蒙上如果拉起其他 UIAbility 需要与 UI 交互，非主线程的 Native 库会脱离生命周期报错。
**解决**：替换为 UITurboModule 并调用 	his.ctx.uiAbilityContext。

### 2. attempt to assign value type: 'function' (AppStorage 崩溃)
**原因**：试图在 AppStorage 中缓存 (resolve, reject) => {}，但 ArkTS 严格限制了 State 管理不允许存储函数或非序列化闭包。
**解决**：用纯 TS 单例 WeChatAuthContext 存放变量进行桥接。
