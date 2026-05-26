# React Native 鸿蒙原生：华为账号登录接入指南 (代码层)

本文档详细记录了在 React Native 鸿蒙项目（RNOH）中，从零开始实现拉起华为账号登录并获取 `AuthorizationCode` (AuthCode) 的全流程代码实现。

> **注意**：本文档专注于代码层面的实现，不包含华为开发者后台申请应用、配置 Client ID 等前置操作。请确保 `module.json5` 中已正确配置 `client_id`，且应用的包名与签名与华为云端一致。

---

## 阶段一：C++ 侧底层 TurboModule 桥接与注册

在 RNOH 架构中，一个自定义的 TurboModule 必须要有 C++ 层的声明和注册，否则 React Native 侧的 `NativeModules` 无法探测到它（会导致“模块未加载”的错误）。

### 1. 创建 TurboModule 声明与实现

在 `entry/src/main/cpp/` 目录下创建头文件与实现文件。

**`HarmonyAccountTurboModule.h`**

```cpp
#pragma once
#include "RNOH/ArkTSTurboModule.h"

namespace rnoh {
class HarmonyAccountTurboModule : public ArkTSTurboModule {
 public:
  HarmonyAccountTurboModule(const ArkTSTurboModule::Context ctx, const std::string name);
};
} // namespace rnoh
```

**`HarmonyAccountTurboModule.cpp`**

```cpp
#include "HarmonyAccountTurboModule.h"

namespace rnoh {
HarmonyAccountTurboModule::HarmonyAccountTurboModule(
    const ArkTSTurboModule::Context ctx,
    const std::string name)
    : ArkTSTurboModule(ctx, name) {
  methodMap_ = {
      // 声明对外暴露给 JS 的异步方法名，0 表示参数个数
      ARK_ASYNC_METHOD_METADATA(loginWithHuawei, 0),
  };
}
} // namespace rnoh
```

### 2. 创建 Package 工厂委托

在同目录下创建 Package 文件，将模块暴露给框架。

**`HarmonyAccountPackage.h`**

```cpp
#pragma once
#include <algorithm>
#include <array>
#include <memory>
#include <string>
#include "RNOH/Package.h"
#include "HarmonyAccountTurboModule.h"

namespace rnoh {
class HarmonyAccountTurboModuleFactoryDelegate : public TurboModuleFactoryDelegate {
 public:
  SharedTurboModule createTurboModule(Context ctx, const std::string &name) const override {
    if (isSupportedName(name)) {
      return std::make_shared<HarmonyAccountTurboModule>(ctx, name);
    }
    return nullptr;
  }
 private:
  bool isSupportedName(const std::string &name) const {
    static const std::array<std::string, 1> kSupportedNames = {
        "HarmonyAccountModule", // 暴露给 RN 的模块名
    };
    return std::find(kSupportedNames.begin(), kSupportedNames.end(), name) != kSupportedNames.end();
  }
};

class HarmonyAccountCppPackage : public Package {
 public:
  explicit HarmonyAccountCppPackage(Package::Context ctx) : Package(ctx) {}
  std::unique_ptr<TurboModuleFactoryDelegate> createTurboModuleFactoryDelegate() override {
    return std::make_unique<HarmonyAccountTurboModuleFactoryDelegate>();
  }
};
} // namespace rnoh
```

### 3. 在 PackageProvider 中注册模块

修改 `entry/src/main/cpp/PackageProvider.cpp`，将刚刚写的 Package 加入加载列表：

```cpp
#include "HarmonyAccountPackage.h" // 引入头文件

// 在 getPackages 方法中添加：
std::vector<std::shared_ptr<Package>> PackageProvider::getPackages(Package::Context ctx) {
    auto packages = std::vector<std::shared_ptr<Package>>{
        // ... 其他模块
        std::make_shared<HarmonyAccountCppPackage>(ctx), // 注册华为账号包
    };
    return packages;
}
```

### 4. 配置 CMake 编译配置

修改 `entry/src/main/cpp/CMakeLists.txt`，让编译器包含新文件：

```cmake
add_library(rnoh_app SHARED
        # ... 其他 cpp 文件
        "./HarmonyAccountTurboModule.cpp"
        "${RNOH_CPP_DIR}/RNOHAppNapiBridge.cpp"
)
```

---

## 阶段二：ArkTS 侧业务逻辑实现 (对接华为 SDK)

在 TypeScript 端通过 `@kit.AccountKit` 调起华为底部弹窗授权，并严格解析返回的数据。

### 1. 编写 TurboModule 实现类

在 `entry/src/main/ets/turboModules/` 创建对应的 ETS 文件。为了规避 ArkTS 强类型约束导致属性缺失编译报错，此处使用了安全的 JSON 解析映射：

**`HarmonyAccountTurboModule.ets`**

```typescript
import {
  UITurboModuleContext,
  UITurboModule,
} from '@rnoh/react-native-openharmony/ts';
import { authentication } from '@kit.AccountKit';
import { BusinessError } from '@kit.BasicServicesKit';

export class HarmonyAccountTurboModule extends UITurboModule {
  constructor(ctx: UITurboModuleContext) {
    super(ctx);
  }

  public async loginWithHuawei(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // 创建华为登录请求
        let authRequest =
          new authentication.HuaweiIDProvider().createLoginWithHuaweiIDRequest();
        authRequest.forceLogin = true;

        // 使用当前的 uiAbilityContext 调起拉权半屏
        let controller = new authentication.AuthenticationController(
          this.ctx.uiAbilityContext,
        );

        controller
          .executeRequest(authRequest)
          .then((response: authentication.AuthenticationResponse) => {
            let authCode: string = '';
            let responseStr = '';

            try {
              // 防弹解析法：将原始数据转为 JSON 字符串再解析，脱离 ArkTS 的强断言限制
              responseStr = JSON.stringify(response);
              let responseRecord = JSON.parse(responseStr) as Record<
                string,
                Object | string
              >;

              if (responseRecord['data']) {
                // 优先找 data 里的
                let dataRecord = responseRecord['data'] as Record<
                  string,
                  string
                >;
                if (dataRecord['authorizationCode']) {
                  authCode = dataRecord['authorizationCode'];
                }
              } else if (responseRecord['authorizationCode']) {
                // 否则找根目录的
                authCode = responseRecord['authorizationCode'] as string;
              } else {
                // 最后的标准解析兜底
                let credential =
                  response as authentication.LoginWithHuaweiIDCredential;
                if (credential.authorizationCode) {
                  authCode = credential.authorizationCode;
                }
              }
            } catch (e) {
              console.error('HM_ACCOUNT: parse error');
            }

            // 回调给 RN
            if (authCode) {
              resolve(authCode);
            } else {
              reject(
                new Error(
                  '未获取到 Authorization Code, 原始返回: ' + responseStr,
                ),
              );
            }
          })
          .catch((error: BusinessError) => {
            reject(new Error(error.message || 'Login failed'));
          });
      } catch (err) {
        // 捕获异常
        let errorMsg = 'Login failed';
        if (err && typeof err === 'object') {
          let errRecord = err as Record<string, string>;
          if (errRecord['message']) errorMsg = errRecord['message'];
        }
        reject(new Error(errorMsg));
      }
    });
  }
}
```

### 2. 导出 ArkTS 宏包

在 `entry/src/main/ets/packages/HarmonyAccountPackage.ets` 中匹配 C++ 的命名。

```typescript
import { UITurboModuleContext } from '@rnoh/react-native-openharmony/ts';
import { RNOHPackage } from '@rnoh/react-native-openharmony/ets';
import { HarmonyAccountTurboModule } from '../turboModules/HarmonyAccountTurboModule';

export class HarmonyAccountPackage extends RNOHPackage {
  override getUITurboModuleFactoryByNameMap() {
    const map = super.getUITurboModuleFactoryByNameMap();
    const factory = (ctx: UITurboModuleContext) =>
      new HarmonyAccountTurboModule(ctx);
    map.set('HarmonyAccountModule', factory); // 此名字必须与 C++ 声明一致
    return map;
  }
}
```

最后确保这文件在 `RNPackagesFactory.ets` 里被 new 出来。

---

## 阶段三：React Native (前端) 唤起功能

在前端代码（例如 Login 组件）中，通过 `NativeModules` 调用，为保证健壮性可添加 `TurboModuleRegistry` 兜底获取方案。

```typescript
import { NativeModules, TurboModuleRegistry, Platform } from 'react-native';

const handleHuaweiLogin = async () => {
  // 仅针对鸿蒙平台进行调用
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    try {
      // 兜底获取模块方式，防止单一获取失败
      let HarmonyAccountModule = NativeModules.HarmonyAccountModule;
      if (!HarmonyAccountModule) {
        const turboGet = (TurboModuleRegistry as any)?.get;
        if (typeof turboGet === 'function') {
          try {
            HarmonyAccountModule = turboGet('HarmonyAccountModule');
          } catch (e) {}
        }
      }

      if (HarmonyAccountModule && HarmonyAccountModule.loginWithHuawei) {
        // 执行异步调用
        const authCode = await HarmonyAccountModule.loginWithHuawei();
        console.log('====== 成功拿到华为 AuthCode ======', authCode);

        // 【业务流程】：拿到 authCode 之后传递给您的后端以便服务器向华为换取 AccessToken
      } else {
        console.error(
          '华为登录模块未加载，请检查原生的 C++ 和 PackageProvider',
        );
      }
    } catch (err: any) {
      console.log('====== 获取华为 AuthCode 失败 ======', err);
    }
  }
};
```

至此，通过 C++打通通道、ArkTS 规范化解析、JS 安全调用 三步完整串联，便能够在鸿蒙端顺利调起华为官方账号鉴权功能并获取到登录所需的 AuthCode。
