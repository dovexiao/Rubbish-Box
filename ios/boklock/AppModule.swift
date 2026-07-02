import Foundation
import React
import UIKit
import AVFoundation

@objc(AppModule)
class AppModule: NSObject, RCTBridgeModule {

  private let heavyImpact = UIImpactFeedbackGenerator(style: .heavy)
  private let lightImpact = UIImpactFeedbackGenerator(style: .light)
  private let mediumImpact = UIImpactFeedbackGenerator(style: .medium)
  private let selectionGen = UISelectionFeedbackGenerator()
  private let notificationGen = UINotificationFeedbackGenerator()

  override init() {
    super.init()
    let warmUp = { [weak self] in
      self?.heavyImpact.prepare()
      self?.lightImpact.prepare()
      self?.mediumImpact.prepare()
      self?.selectionGen.prepare()
      self?.notificationGen.prepare()
    }
    if Thread.isMainThread {
      warmUp()
    } else {
      DispatchQueue.main.async(execute: warmUp)
    }
  }

  @objc static func requiresMainQueueSetup() -> Bool {
    return true
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
      resolve(destPath)
    } catch {
      reject("ERROR", "Failed to unzip: \(error.localizedDescription)", error)
    }
  }
  
  @objc
  func installApk(_ apkPath: String) {
    print("installApk called on iOS - this should not happen")
  }

  @objc
  func getAudioSessionDebugInfo(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    let session = AVAudioSession.sharedInstance()
    resolve([
      "categoryOptions": session.categoryOptions.rawValue,
      "mode": session.mode.rawValue,
      "category": session.category.rawValue,
    ])
  }

  private func recordingSessionOptions() -> AVAudioSession.CategoryOptions {
    var options: AVAudioSession.CategoryOptions = [.defaultToSpeaker, .allowBluetooth]
    if #available(iOS 13.0, *) {
      options.insert(AVAudioSession.CategoryOptions(rawValue: 128))
    }
    return options
  }

  private func playHeavyImpact() {
    heavyImpact.prepare()
    if #available(iOS 13.0, *) {
      heavyImpact.impactOccurred(intensity: 1.0)
    } else {
      heavyImpact.impactOccurred()
    }
  }

  private func playUIKitHaptic(_ feedbackType: String) {
    switch feedbackType {
    case "warning":
      notificationGen.prepare()
      notificationGen.notificationOccurred(.warning)
    case "success":
      notificationGen.prepare()
      notificationGen.notificationOccurred(.success)
    case "light":
      lightImpact.prepare()
      lightImpact.impactOccurred()
    case "heavy":
      playHeavyImpact()
    case "selection":
      selectionGen.prepare()
      selectionGen.selectionChanged()
    default:
      playHeavyImpact()
    }
  }

  @objc
  func triggerUIKitHaptic(_ type: NSString) {
    let feedbackType = type as String
    if Thread.isMainThread {
      playUIKitHaptic(feedbackType)
    } else {
      DispatchQueue.main.async { [weak self] in
        self?.playUIKitHaptic(feedbackType)
      }
    }
  }

  /// 短暂释放 AVAudioSession 再触发触觉（pause 录音后调用）
  @objc
  func triggerUIKitHapticWithSessionRelease(_ type: NSString) {
    let feedbackType = type as String
    let work = { [weak self] in
      guard let self = self else { return }
      let session = AVAudioSession.sharedInstance()
      let options = self.recordingSessionOptions()
      try? session.setActive(false, options: .notifyOthersOnDeactivation)
      self.playUIKitHaptic(feedbackType)
      try? session.setCategory(.playAndRecord, mode: .default, options: options)
      try? session.setActive(true)
    }
    if Thread.isMainThread {
      work()
    } else {
      DispatchQueue.main.sync(execute: work)
    }
  }

  /// 录音中边界切换：释放 session 后触发 heavy 冲击
  @objc
  func triggerRecordingTransitionHaptic(_ type: NSString) {
    let work = { [weak self] in
      guard let self = self else { return }
      let session = AVAudioSession.sharedInstance()
      let options = self.recordingSessionOptions()
      try? session.setActive(false, options: .notifyOthersOnDeactivation)
      self.playHeavyImpact()
      try? session.setCategory(.playAndRecord, mode: .default, options: options)
      try? session.setActive(true)
    }
    if Thread.isMainThread {
      work()
    } else {
      DispatchQueue.main.sync(execute: work)
    }
  }

  @objc
  func triggerRecordingHaptic(_ type: NSString) {
    triggerUIKitHaptic(type)
  }
}
