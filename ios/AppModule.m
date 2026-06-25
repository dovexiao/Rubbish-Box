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

RCT_EXTERN_METHOD(triggerRecordingHaptic:(NSString *)type)

RCT_EXTERN_METHOD(triggerUIKitHaptic:(NSString *)type)

RCT_EXTERN_METHOD(triggerUIKitHapticWithSessionRelease:(NSString *)type)

RCT_EXTERN_METHOD(triggerRecordingTransitionHaptic:(NSString *)type)

RCT_EXTERN_METHOD(getAudioSessionDebugInfo:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

@end

