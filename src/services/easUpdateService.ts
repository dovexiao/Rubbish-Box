import * as Updates from "expo-updates"
import { Platform, Alert } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Application from "expo-application"

/**
 * EAS更新服务
 * 基于Expo Updates和EAS Build的更新管理
 */
export class EASUpdateService {
  private isChecking = false
  private isDownloading = false

  constructor() {
    console.log("EASUpdateService 初始化")
  }

  /**
   * 初始化EAS更新服务
   */
  async initialize(): Promise<void> {
    try {
      console.log("开始初始化EAS更新服务")
      
      // 检查Updates是否可用
      if (!Updates.isEnabled) {
        console.warn("⚠️ Expo Updates未启用")
        console.warn("可能的原因:")
        console.warn("1. 当前运行在开发模式")
        console.warn("2. 未配置updates.url")
        console.warn("3. 未配置runtimeVersion")
        return
      }

      console.log("Expo Updates状态:")
      console.log("- isEnabled:", Updates.isEnabled)
      console.log("- runtimeVersion:", Updates.runtimeVersion)
      console.log("- updateId:", Updates.updateId)
      console.log("- channel:", Updates.channel)

      // 检查是否有待处理的更新
      const pendingUpdate = await this.getPendingUpdate()
      if (pendingUpdate) {
        console.log("发现待处理更新:", pendingUpdate)
      }

      console.log("EAS更新服务初始化完成")
    } catch (error) {
      console.error("EAS更新服务初始化失败:", error)
      throw error
    }
  }

  /**
   * 检查EAS更新
   */
  async checkForUpdates(options: {
    silent?: boolean
    forceCheck?: boolean
    source?: string
  } = {}): Promise<void> {
    const { silent = true, forceCheck = false, source = "auto" } = options

    if (this.isChecking && !forceCheck) {
      console.log("正在检测中，跳过重复检测")
      return
    }

    if (!Updates.isEnabled) {
      console.log("Expo Updates未启用，跳过更新检测")
      if (!silent) {
        this.showToast("更新功能不可用", "warning")
      }
      return
    }

    // 注意：开发构建中EAS Updates会失败，但这里不阻止调用
    // 让调用方决定是否使用EAS Updates

    this.isChecking = true

    try {
      console.log(`开始检测EAS更新，来源: ${source}`)

      // 检查是否有可用更新
      const updateCheckResult = await Updates.checkForUpdateAsync()
      
      if (updateCheckResult.isAvailable) {
        console.log("发现可用更新")
        console.log("- manifest:", updateCheckResult.manifest)
        
        const updateData = this.convertManifestToUpdateData(updateCheckResult.manifest)
        await this.handleUpdateAvailable(updateData, silent)
      } else {
        console.log("没有可用更新")
        if (!silent) {
          this.showToast("已是最新版本", "success")
        }
      }

      // 更新最后检测时间
      await AsyncStorage.setItem("last_eas_update_check", Date.now().toString())
    } catch (error) {
      console.error("检测EAS更新失败:", error)
      if (!silent) {
        this.showToast("检查更新失败", "error")
      }
    } finally {
      this.isChecking = false
    }
  }

  /**
   * 下载并安装更新
   */
  async downloadAndInstallUpdate(updateData: any, silent: boolean = false): Promise<void> {
    if (this.isDownloading) {
      console.log("正在下载中，跳过重复下载")
      return
    }

    if (!Updates.isEnabled) {
      throw new Error("Expo Updates未启用")
    }

    this.isDownloading = true

    try {
      if (!silent) {
        this.showToast("更新中...", "info")
      }

      console.log("开始下载EAS更新")

      // 下载更新
      const fetchResult = await Updates.fetchUpdateAsync()
      
      if (fetchResult.isNew) {
        console.log("更新下载完成，准备重启")
        
        // 清理待更新标记
        await AsyncStorage.removeItem("pending_eas_update")
        await AsyncStorage.removeItem("has_pending_eas_update")

        if (!silent) {
          this.showToast("更新成功，应用将重启", "success")
        }
        
        // 重启应用以应用更新
        await Updates.reloadAsync()
      } else {
        console.log("没有新的更新可用")
        if (!silent) {
          this.showToast("已是最新版本", "success")
        }
      }
    } catch (error) {
      console.error("EAS更新失败:", error)
      if (!silent) {
        this.showToast("更新失败", "error")
      }
      throw error
    } finally {
      this.isDownloading = false
    }
  }

  /**
   * 手动检查更新
   */
  async manualCheckForUpdates(): Promise<void> {
    try {
      console.log("手动检查EAS更新")
      
      await this.checkForUpdates({
        silent: false,
        forceCheck: true,
        source: "manual",
      })
    } catch (error) {
      console.error("手动EAS更新检测失败:", error)
    }
  }

  /**
   * 应用进入前台时检查更新
   */
  async checkForUpdatesOnShow(): Promise<void> {
    try {
      console.log("应用进入前台，检查EAS更新")
      
      // 检查是否在提醒时间内
      const nextRemindTime = await AsyncStorage.getItem("next_eas_update_remind_time")
      if (nextRemindTime && Date.now() < parseInt(nextRemindTime)) {
        console.log("在提醒时间内，跳过EAS更新检测")
        return
      }

      await this.checkForUpdates({
        silent: true,
        source: "app_show",
      })
    } catch (error) {
      console.error("前台EAS更新检测失败:", error)
    }
  }

  /**
   * 将manifest转换为UpdateData格式
   */
  private convertManifestToUpdateData(manifest: any): any {
    const currentVersion = Application.nativeApplicationVersion || "1.0.0"
    const currentVersionCode = Application.nativeBuildVersion || "1"
    
    // 从manifest中提取版本信息
    const newVersion = manifest.version || currentVersion
    const newVersionCode = manifest.versionCode || parseInt(currentVersionCode) + 1

    return {
      version: newVersion,
      versionCode: newVersionCode,
      updateType: "hot", // EAS更新通常是热更新
      updateLevel: "optional",
      forceUpdate: false,
      description: manifest.description || "应用更新",
      downloadUrl: "", // EAS更新不需要下载URL
      fileSize: manifest.bundleSize || 0,
      releaseNotes: manifest.releaseNotes || [],
      autoInstall: true,
      manifest: manifest,
    }
  }

  /**
   * 处理可用更新
   */
  private async handleUpdateAvailable(updateData: any, silent: boolean): Promise<void> {
    console.log("发现EAS更新:", updateData)

    // 存储更新信息
    await AsyncStorage.setItem("pending_eas_update", JSON.stringify({
      ...updateData,
      detectedTime: Date.now(),
    }))

    // 根据静默模式决定处理方式
    if (silent) {
      // 静默模式下自动下载安装
      await this.downloadAndInstallUpdate(updateData, true)
    } else {
      // 非静默模式下显示更新对话框
      this.emitShowUpdateDialog(updateData, true)
    }
  }

  /**
   * 获取待更新信息
   */
  async getPendingUpdate(): Promise<any | null> {
    try {
      const pendingUpdateStr = await AsyncStorage.getItem("pending_eas_update")
      return pendingUpdateStr ? JSON.parse(pendingUpdateStr) : null
    } catch (error) {
      console.error("获取待EAS更新信息失败:", error)
      return null
    }
  }

  /**
   * 清理更新缓存
   */
  async clearUpdateCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem("pending_eas_update")
      await AsyncStorage.removeItem("has_pending_eas_update")
      await AsyncStorage.removeItem("last_eas_update_check")
      console.log("EAS更新缓存已清理")
    } catch (error) {
      console.error("清理EAS更新缓存失败:", error)
    }
  }

  /**
   * 设置更新提醒
   */
  async setUpdateReminder(hours: number): Promise<void> {
    try {
      const nextRemindTime = Date.now() + hours * 60 * 60 * 1000
      await AsyncStorage.setItem("next_eas_update_remind_time", nextRemindTime.toString())
      this.showToast(`已设置${hours}小时后提醒`, "info")
    } catch (error) {
      console.error("设置EAS更新提醒失败:", error)
    }
  }

  /**
   * 获取当前更新状态
   */
  getUpdateStatus(): {
    isEnabled: boolean
    runtimeVersion: string | null
    updateId: string | null
    channel: string | null
  } {
    return {
      isEnabled: Updates.isEnabled,
      runtimeVersion: Updates.runtimeVersion,
      updateId: Updates.updateId,
      channel: Updates.channel,
    }
  }

  /**
   * 显示Toast消息
   */
  private showToast(message: string, type: "error" | "success" | "warning" | "info" = "info"): void {
    if (Platform.OS === "android") {
      // Android使用ToastAndroid
      const ToastAndroid = require("react-native").ToastAndroid
      if (type === "error") {
        ToastAndroid.show(message, ToastAndroid.LONG)
      } else {
        ToastAndroid.show(message, ToastAndroid.SHORT)
      }
    } else {
      // iOS使用Alert
      Alert.alert(
        type === "error" ? "错误" : type === "success" ? "成功" : type === "warning" ? "警告" : "提示",
        message,
        [{ text: "确定" }]
      )
    }
  }

  /**
   * 触发显示更新对话框事件
   */
  private emitShowUpdateDialog(updateData: any, canSkip: boolean): void {
    console.log("显示EAS更新对话框:", { updateData, canSkip })
    // 这里可以通过事件总线或状态管理来通知其他组件
    // 暂时使用Alert显示
    Alert.alert(
      "发现新版本",
      `版本 ${updateData.version}\n\n${updateData.description}`,
      [
        {
          text: canSkip ? "稍后" : "取消",
          style: canSkip ? "cancel" : "cancel",
          onPress: () => {
            if (canSkip) {
              this.setUpdateReminder(24) // 24小时后提醒
            }
          }
        },
        {
          text: "立即更新",
          onPress: () => {
            this.downloadAndInstallUpdate(updateData, false)
          }
        }
      ]
    )
  }
}

// 导出单例实例
export const easUpdateService = new EASUpdateService()
export default easUpdateService
