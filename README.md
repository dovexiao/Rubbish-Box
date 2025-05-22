# Indra Lottery

## 环境(environment)

[开发环境搭建](https://www.reactnative.cn/docs/environment-setup)(如果打开不是 0.7.2 的版本,切换到 0.7.2)

[environment-setup](https://www.reactnative.cn/docs/environment-setup)(If it is not version 0.7.2, switch to 0.7.2)

### 1. 安装(install)

`npm i`

### 2. run for android

`npm run android`

or

`npm run start` and then enter `a` in the terminal.

### 3. run for web

`npm run start:web`

```
   删除node_modules/react-native-reanimated/lib/module/reanimated2/animation/index.js中,对WithDecayConfig的引入
   这个问题或许会在后续版本中修复(新版本已经解决了这个问题,但请不要升级)
   Delete the introduction of WithDecayConfig in ./node_modules/react-native-reanimated/lib/module/reanimated2/animation/index.js
   This problem may be fixed in subsequent versions(this problem has already fixed, but do not update)

   部分支付是h5,使用了webview,为了避免深度链接被拦截,需要修改node_modules/react-native-webview/lib/WebViewShared.js,去掉Linking.canOpenURL的验证
   Part of the payment is h5 and uses webview. In order to avoid deep links being intercepted, node_modules/react-native-webview/lib/WebViewShared.js needs to be modified to remove the verification of Linking.canOpenURL.
```

## 开发流程(Development Process)

### 1. 目录结构(Directory Structure)

```
组件目录结构,下面列举的名称全部用小写+中线分隔,比如:lottery-list.tsx,lottery-detail.tsx,lottery.serviec.ts,参考规范文档
{pageName}Dir
   - index.ts // 默认导出,可选
   - {pageName}.tsx // 主入口,避免用index.tsx,会导致多个页面联合调试时难以寻找
   - {modulename}.serviec.ts // 管理这个页面下的请求,如果是简单的单页,只有一两个请求,可以省略.
   - {modulename}.type.ts // 管理这个页面下的类型,如果是简单的单页,只有一两个类型,可以省略.
   - {childPage}Dir // 相关子页面文件夹,如果子页面只存在一个,比如简单的list+detial组合,可以不创建这个子目录,直接放在{pageName}Dir/{childPage}.tsx
      - {childPage}.tsx

Component directory structure, the names listed below are all separated by lowercase + middle line, such as: lottery-list.tsx, lottery-detail.tsx, lottery.serviec.ts, refer to the specification document
{pageName}Dir
   - index.ts // default export, optional
   - {pageName}.tsx // Main entry, avoid using index.tsx, it will make it difficult to find when multiple pages are jointly debugged
   - {modulename}.serviec.ts // Manage the requests under this page. If it is a simple single page, there are only one or two requests, which can be omitted.
   - {modulename}.type.ts // Manage the types under this page. If it is a simple single page, there are only one or two types, which can be omitted.
   - {childPage}Dir // The relevant subpage folder, if there is only one subpage, such as a simple list+detial combination, you can not create this subdirectory, and put it directly in {pageName}Dir/{childPage}.tsx
      - {childPage}.tsx
```

### 2. 调试(debug)

调试时除了`npm run android`,同时也要`npm run start:web`,避免 web 端的异常

In addition to `npm run android` when debugging, `npm run start:web` is also required to avoid exceptions on the web side

### 3. 其他(若没有特殊说明,即两端均需验证)

### 3. Others (if not specified, verification is required on both ends)

使用 image 加载本地图片时,如果图片比较大,需要加载前显示一个灰色背景,使用@rneui/themed 的 image,其他情况,比如 icon,使用 react-naitve 中的 image,不然会闪一下灰色.
对于一些特殊功能,rn 和 web 端使用的库不同,编译 web 端时会导致报错,可以在 config-overrides.js 中进行 web 编译排除,谨记在代码中做好平台区分,不要在 web 端加载被排除的库或组件.
基础组件中尽量避免依赖 GlobalStore.

When loading local images using the image component, if the image is relatively large, it is necessary to display a gray background before loading. For this purpose, use the @rneui/themed image. In other cases, such as icons, use the image component from react-native. Otherwise, there might be a brief flash of gray.
For some special functionalities, different libraries are used for React Native (RN) and the web. Compiling for the web may result in errors, and you can exclude web compilation in config-overrides.js. Remember to differentiate between platforms in your code and avoid loading excluded libraries or components on the web platform.
Try to avoid relying on GlobalStore in basic components.

使用 FlatList 时,如果需要调用 scrollToIndex,必须同时设置 onScrollToIndexFailed 或 getItemLayout 其中之一;如果无法确定宽高,可以使用 scrollToOffset.
When using FlatList, if you need to call scrollToIndex, you must set one of onScrollToIndexFailed or getItemLayout at the same time; if the width and height cannot be determined, you can use scrollToOffset.

如果变更了 app.tsx,需要检查如下内容是否正常 1.热更新是否能正常检测(仅 Android) 2.推送是否正常初始化(仅 Android) 3.客服是否正常初始化(仅 Android) 4.广告弹窗是否正常弹出
If app.tsx has been modified, please check the following items to ensure everything is functioning correctly:
1.Confirm if hot updates can be detected successfully (Android only).
2.Ensure push notifications are initialized correctly (Android only).
3.Confirm that customer support is initialized correctly (Android only).
4.Check if the advertisement pop-ups are appearing as expected.

### 4. 热更新

1.全局安装 appcenter

```shell
npm install --location=global appcenter-cli
```

2.  登录 appcenter

```shell
 appcenter login
```

3.  查看 app 列表

```shell
appcenter apps list
```

4.  设置成当前 app

```shell
appcenter apps set-current <appName>
```

5.  发布热更新 （uat/pro)

`运行 upgrade:android:uat / upgrade:android:pro` 命令行-t 指向版本代表 android 中的版本号指向，不设置代表所有版本都更新

6.  注意事项

项目如有新增原生代码无法通过热更新更新手机代码，必须打包发版本。

`1) 项目需要更新原生代码，版本号需要自增。先打包 后运行热更新命令`

`2) 项目不需要更新原生代码，直接运行热更新命令`

`3) 热更新发布命令后的-t参数 需要与 APP versionName 保持一致，目前为3.1.0`

### 5. 修改打包密钥

修改 android 打包密钥，直接替换 android/app 下的 my-upload-key.keystore 即可，并修改 android/gradle.properties 下配置

### 6. 修改 android 包名设置

将 adnroid/app/build.gradle 中的 applicationId 修改，如有必要请修改 src 下的目录路径、推荐使用 androidStudio 修改，会修改文件中的路径，修改后运行成功即可

### 7. 其他

所有配置项都可在 js 中配置好即可、如推送、埋点、客服；谷歌服务需要在 android/app 目录下导入 google-services.com 文件
