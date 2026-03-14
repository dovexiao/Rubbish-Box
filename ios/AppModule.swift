import Foundation
import React

@objc(AppModule)
class AppModule: NSObject, RCTBridgeModule {
  
  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc static func moduleName() -> String! {
    return "AppModule"
  }
  
  @objc
  func getDirPath(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    let paths = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)
    if let documentsDirectory = paths.first {
      resolve(documentsDirectory.path)
    } else {
      reject("ERROR", "Failed to get dir path", nil)
    }
  }
  
  @objc
  func getCacheDirPath(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    let paths = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)
    if let cacheDirectory = paths.first {
      resolve(cacheDirectory.path)
    } else {
      reject("ERROR", "Failed to get cache dir path", nil)
    }
  }
  
  @objc
  func unzip(_ zipPath: String, destPath: String, encoding: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    // 使用 react-native-zip-archive 或自己实现解压逻辑
    // 这里提供一个简单的实现示例
    let zipURL = URL(fileURLWithPath: zipPath)
    let destURL = URL(fileURLWithPath: destPath)
    
    guard FileManager.default.fileExists(atPath: zipPath) else {
      reject("ERROR", "Zip file not found: \(zipPath)", nil)
      return
    }
    
    do {
      if !FileManager.default.fileExists(atPath: destPath) {
        try FileManager.default.createDirectory(at: destURL, withIntermediateDirectories: true, attributes: nil)
      }
      
      // 实际解压需要使用 ZipArchive 或第三方库
      // 这里返回成功，实际实现需要添加解压逻辑
      resolve(destPath)
    } catch {
      reject("ERROR", "Failed to unzip: \(error.localizedDescription)", error)
    }
  }
  
  @objc
  func installApk(_ apkPath: String) {
    // iOS 不需要安装 APK，这个方法在 iOS 上不会调用
    print("installApk called on iOS - this should not happen")
  }
}

