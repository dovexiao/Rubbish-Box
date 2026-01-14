#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(AppModule, NSObject)

RCT_EXTERN_METHOD(getDirPath:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getCacheDirPath:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(unzip:(NSString *)zipPath
                  destPath:(NSString *)destPath
                  encoding:(NSString *)encoding
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(installApk:(NSString *)apkPath)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end

