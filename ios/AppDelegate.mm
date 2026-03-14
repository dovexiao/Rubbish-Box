#import "AppDelegate.h"
#import <React/RCTLinkingManager.h>
#import <React/RCTBundleURLProvider.h>

// 可选引入微信 SDK，如果工程里存在 WechatOpenSDK
#if __has_include(<WechatOpenSDK/WXApi.h>)
#import <WechatOpenSDK/WXApi.h>
#define HAS_WECHAT_SDK 1
#else
#define HAS_WECHAT_SDK 0
#endif

@implementation AppDelegate

- (NSString *)getPathForDirectory:(NSSearchPathDirectory)directory
{
  NSArray *paths = NSSearchPathForDirectoriesInDomains(directory, NSUserDomainMask, YES);
  return [paths firstObject];
}

- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken{
   NSLog(@"ssss");
   NSMutableString *deviceTokenString = [NSMutableString string];
   const char *bytes = (const char *)deviceToken.bytes;
   NSInteger count = deviceToken.length;
   for (int i = 0; i < count; i++) {
       [deviceTokenString appendFormat:@"%02x", bytes[i]&0x000000FF];
   }
   NSLog(@"**发送给服务器的token字符串***:%@\n", deviceTokenString);
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"boklock";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  // 注册推送
  // [[UIApplication sharedApplication] registerForRemoteNotifications];

  // 注意：微信 SDK 的注册应该在 JS 层通过 react-native-wechat-lib 完成
  // 不要在 AppDelegate 中手动注册，避免冲突
  // react-native-wechat-lib 会在 JS 层调用 registerApp 时自动注册

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

// 添加一个方法来确认代理设置
- (void)applicationDidBecomeActive:(UIApplication *)application {
    UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
    center.delegate = self;
    NSLog(@"📱 [AppDelegate] 应用激活 (applicationDidBecomeActive)");
    
    // 通知 React Native 层应用已激活
    [[NSNotificationCenter defaultCenter] postNotificationName:@"AppDidBecomeActive" object:nil];
}

- (void)applicationWillResignActive:(UIApplication *)application {
    NSLog(@"📱 [AppDelegate] 应用即将进入非活动状态 (applicationWillResignActive)");
}

- (void)applicationDidEnterBackground:(UIApplication *)application {
    NSLog(@"📱 [AppDelegate] 应用进入后台 (applicationDidEnterBackground)");
    [[NSNotificationCenter defaultCenter] postNotificationName:@"AppDidEnterBackground" object:nil];
    [super applicationDidEnterBackground:application];
}

- (void)applicationWillEnterForeground:(UIApplication *)application {
    NSLog(@"📱 [AppDelegate] 应用即将进入前台 (applicationWillEnterForeground)");
    [[NSNotificationCenter defaultCenter] postNotificationName:@"AppWillEnterForeground" object:nil];
}

#pragma mark - UNUserNotificationCenterDelegate
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
       willPresentNotification:(UNNotification *)notification
         withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler {

    NSLog(@"前台收到通知: %@", notification.request.content.userInfo);

    // 解析通知数据
    NSDictionary *userInfo = notification.request.content.userInfo;
    NSString *pushDataString = userInfo[@"pushData"];
    if (pushDataString) {
        NSData *pushData = [pushDataString dataUsingEncoding:NSUTF8StringEncoding];
        NSDictionary *pushDataDict = [NSJSONSerialization JSONObjectWithData:pushData options:0 error:nil];
        NSString *type = pushDataDict[@"type"];

        // 如果是语音通知，强制播放声音
        if ([type isEqualToString:@"payVoiceNotice"]) {
            if (@available(iOS 14.0, *)) {
                completionHandler(UNNotificationPresentationOptionSound |
                                UNNotificationPresentationOptionBanner);
            } else {
                completionHandler(UNNotificationPresentationOptionSound |
                                UNNotificationPresentationOptionAlert);
            }
            return;
        }
    }

    // 其他类型的通知
    if (@available(iOS 14.0, *)) {
        completionHandler(UNNotificationPresentationOptionBanner |
                        UNNotificationPresentationOptionList);
    } else {
        completionHandler(UNNotificationPresentationOptionAlert);
    }
}

// 添加通知点击回调处理
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
didReceiveNotificationResponse:(UNNotificationResponse *)response
         withCompletionHandler:(void(^)(void))completionHandler {
    NSLog(@"通知被点击: %@", response.notification.request.content.userInfo);
    completionHandler();
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = self;
  NSLog(@"Bridge 初始化时的通知中心代理: %@", center.delegate);
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  NSLog(@"请求模式");
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  NSLog(@"文件模式");
  NSURL *jsBundleFile = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
  NSString *dirPath = [self getPathForDirectory:NSDocumentDirectory];
  NSString *bundlePath = [dirPath stringByAppendingString:@"/boklock/bundle/"];

  // 如果不存在版本文件，则直接使用默认的bundle，一般是新安装ipa的时候
  NSString *versionFile = [bundlePath stringByAppendingString:@"version"];
  NSFileManager *fileManager = [NSFileManager defaultManager];
  BOOL verFileExists = [fileManager fileExistsAtPath:versionFile];
  if (!verFileExists) {
    return jsBundleFile;
  }

  // 对比当前系统的bundle版本和远程下载的bundle版本，选用新的
  NSError *error;
  NSString *fileContent = [NSString stringWithContentsOfFile:versionFile encoding:NSUTF8StringEncoding error:&error];
  if (error) {
    return jsBundleFile;
  }
  NSArray *lines = [fileContent componentsSeparatedByString:@"\n"];
  NSString *bundleVersion = [lines objectAtIndex:0];
  NSString *customJsBundleFile = [bundlePath stringByAppendingString:@"main.jsbundle"];
  NSURL *customJsBundleUrl = [NSURL fileURLWithPath:customJsBundleFile];
  BOOL fileExists = [fileManager fileExistsAtPath:customJsBundleFile];
  if (fileExists) {
    // 有增量包，则使用增量包
    NSString *deployVersion = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"DEPLOY_VERSION"];
    long long longDeployVersion = [deployVersion longLongValue];
    long long longBundleVersion = [bundleVersion longLongValue];
    if ([deployVersion longLongValue] < [bundleVersion longLongValue]) {
      return customJsBundleUrl;
    }
  }

  return jsBundleFile;
#endif
}

// 处理 URL Scheme 跳转 (旧版微信跳转方式)
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  // 优先处理微信回调
  if ([url.scheme isEqualToString:@"wx5c90e0d5806a55c4"]) {
    // 发送通知给 RCTWeChat 处理（RCTWeChat 会监听这个通知）
    [[NSNotificationCenter defaultCenter] postNotificationName:@"RCTOpenURLNotification" object:nil userInfo:@{@"url": url.absoluteString}];
    return YES;
  }
  return [RCTLinkingManager application:application openURL:url options:options];
}

// 兼容旧版 iOS 的 URL 处理方法
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url sourceApplication:(NSString *)sourceApplication annotation:(id)annotation
{
  if ([url.scheme isEqualToString:@"wx5c90e0d5806a55c4"]) {
    [[NSNotificationCenter defaultCenter] postNotificationName:@"RCTOpenURLNotification" object:nil userInfo:@{@"url": url.absoluteString}];
    return YES;
  }
  return [RCTLinkingManager application:application openURL:url sourceApplication:sourceApplication annotation:annotation];
}

// 处理 Universal Links 跳转 (新版微信跳转方式)
- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity restorationHandler:(void(^)(NSArray<id<UIUserActivityRestoring>> * __nullable restorableObjects))restorationHandler
{
  // 如果集成了微信 SDK，则优先交给微信处理 Universal Link
#if HAS_WECHAT_SDK
  if ([WXApi handleOpenUniversalLink:userActivity delegate:nil]) {
    return YES;
  }
#endif
  return [RCTLinkingManager application:application continueUserActivity:userActivity restorationHandler:restorationHandler];
}

@end
