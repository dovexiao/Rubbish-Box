import { Platform, Alert, Linking, PermissionsAndroid } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Application from "expo-application"
import * as FileSystem from "expo-file-system"
import * as IntentLauncher from "expo-intent-launcher"
import RNFS from "react-native-fs"
import { checkAppUpdate } from "./appUpdateService"
import { useUpdateStore } from "../stores/updateStore"
import { easUpdateService } from "./easUpdateService"

// 动态导入expo-updates，处理可能不存在的情况
let Updates: any = null
try {
  Updates = require("expo-updates")
} catch (error) {
  console.warn("expo-updates not available:", error)
}

/**
 * 更新类型枚举
 */
export enum UpdateType {
  HOT = "hot",     // 热更新
  FULL = "full",   // 整包更新
}

/**
 * 更新级别枚举
 */
export enum UpdateLevel {
  PATCH = "patch",       // 补丁更新
  OPTIONAL = "optional", // 可选更新
  IMPORTANT = "important", // 重要更新
  CRITICAL = "critical",  // 关键更新
}

/**
 * 更新数据接口
 */
export interface UpdateData {
  version: string
  versionCode: number
  updateType: UpdateType
  updateLevel: UpdateLevel
  forceUpdate: boolean
  description: string
  downloadUrl: string
  fileSize?: number
  releaseNotes?: string[]
  nativePluginChanges?: NativePluginChange[]
  reason?: string
  wgtTag?: number
  autoInstall?: boolean
  downloadedSize?: number
}

/**
 * 原生插件变更接口
 */
export interface NativePluginChange {
  pluginName: string
  newVersion: string
  description: string
}

/**
 * 应用信息接口
 */
export interface AppInfo {
  appVersion: string
  versionCode: number
  deviceType: string
  platform: string
  buildNumber?: string
}

/**
 * 更新检测选项
 */
export interface UpdateCheckOptions {
  silent?: boolean
  forceCheck?: boolean
  source?: string
}

/**
 * 应用更新管理器
 * 支持热更新和整包更新
 * 适配React Native + Expo环境
 */
export class UpdateManager {
  private isChecking = false
  private isDownloading = false
  private downloadTask: any = null
  private updateStore: any = null

  constructor() {
    console.log("UpdateManager 初始化")
    // 获取updateStore实例
    this.updateStore = useUpdateStore.getState()
  }

  /**
   * 初始化更新管理器
   */
  async initialize(): Promise<void> {
    try {
      console.log("开始初始化更新管理器")
      
      // 初始化EAS更新服务
      await easUpdateService.initialize()
      
      // 检查Expo Updates状态
      if (Updates) {
        console.log("Expo Updates状态:")
        console.log("- isEnabled:", Updates.isEnabled)
        console.log("- runtimeVersion:", Updates.runtimeVersion)
        console.log("- updateId:", Updates.updateId)
        
        if (!Updates.isEnabled) {
          console.warn("⚠️ Expo Updates未启用，可能的原因:")
          console.warn("1. 当前运行在开发模式")
          console.warn("2. 未配置updates.url")
          console.warn("3. 未配置runtimeVersion")
          console.warn("4. 更新服务不可用")
        }
      } else {
        console.warn("⚠️ Expo Updates模块不可用")
      }
      
      // 检查是否有待处理的更新
      const pendingUpdate = await this.getPendingUpdate()
      if (pendingUpdate) {
        console.log("发现待处理更新:", pendingUpdate)
        // 可以在这里处理待更新逻辑
      }

      console.log("更新管理器初始化完成")
    } catch (error) {
      console.error("更新管理器初始化失败:", error)
      throw error
    }
  }

  /**
   * 检测更新
   */
  async checkForUpdates(options: UpdateCheckOptions = {}): Promise<void> {
    const { silent = true, forceCheck = false, source = "auto" } = options

    if (this.isChecking && !forceCheck) {
      console.log("正在检测中，跳过重复检测")
      return
    }

    this.isChecking = true

    try {
      console.log(`开始检测更新，来源: ${source}`)

      // 步骤1：优先检测整包更新（通过服务端API）
      console.log("步骤1: 检测整包更新（APK）")
      const appInfo = await this.getCurrentAppInfo()
      console.log("当前应用信息:", appInfo)

      try {
        const updateResponse = await this.requestUpdateCheck(appInfo)
        
        if (updateResponse.code === 200 && updateResponse.data.设备上needUpdate) {
          console.log("发现整包更新，优先处理整包更新")
          const updateData = this.convertApiResponseToUpdateData(updateResponse.data)
          
          // 如果是整包更新，直接处理，不再检测 OTA
          if (updateData.updateType === UpdateType.FULL) {
            await this.handleUpdateAvailable(updateData, silent)
            // 更新最后检测时间
            await AsyncStorage.setItem("last_update_check", Date.now().toString())
            return
          }
        }
      } catch (apiError) {
        console.warn("整包更新检测失败，将继续检测 OTA 更新:", apiError)
      }

      // 步骤2：如果没有整包更新，检测 EAS OTA 更新（仅在生产构建中）
      if (Updates && Updates.isEnabled && !__DEV__) {
        console.log("步骤2: 检测 EAS OTA 更新")
        await easUpdateService.checkForUpdates({
          silent,
          forceCheck,
          source,
        })
      } else if (!silent) {
        console.log("没有可用更新")
        this.showNoUpdateMessage()
      }

      // 更新最后检测时间
      await AsyncStorage.setItem("last_update_check", Date.now().toString())
    } catch (error) {
      console.error("检测更新失败:", error)
      if (!silent) {
        this.showToast("检查更新失败", "error")
      }
    } finally {
      this.isChecking = false
    }
  }

  /**
   * 获取当前应用信息
   */
  private async getCurrentAppInfo(): Promise<AppInfo> {
    try {
      const appVersion = Application.nativeApplicationVersion || "1.0.0"
      const versionCode = Application.nativeBuildVersion || "1"
      const platform = Platform.OS
      const deviceType = Platform.select({
        ios: "iOS",
        android: "Android",
        web: "Web",
        default: "Unknown"
      }) || "Unknown"

      return {
        appVersion,
        versionCode: parseInt(versionCode),
        deviceType,
        platform,
        buildNumber: versionCode,
      }
    } catch (error) {
      console.error("获取应用信息失败:", error)
      throw error
    }
  }

  /**
   * 转换API响应为UpdateData格式
   */
  private convertApiResponseToUpdateData(apiResponse: any): UpdateData {
    // 将updateNotes字符串转换为数组
    const releaseNotes = apiResponse.updateNotes 
      ? apiResponse.updateNotes.split('\n').filter((note: string) => note.trim())
      : []

    return {
      version: apiResponse.newVersion,
      versionCode: apiResponse.newVersionCode,
      updateType: apiResponse.updateType === 'hot' ? UpdateType.HOT : UpdateType.FULL,
      updateLevel: this.determineUpdateLevel(apiResponse),
      forceUpdate: apiResponse.forceUpdate,
      description: apiResponse.updateNotes || "应用更新",
      downloadUrl: apiResponse.downloadUrl,
      fileSize: apiResponse.fileSize,
      releaseNotes: releaseNotes,
      nativePluginChanges: apiResponse.nativePluginChanges || [],
      reason: apiResponse.forceUpdate ? "强制更新" : undefined,
      autoInstall: !apiResponse.forceUpdate,
    }
  }

  /**
   * 根据API响应确定更新级别
   */
  private determineUpdateLevel(apiResponse: any): UpdateLevel {
    if (apiResponse.forceUpdate) {
      return UpdateLevel.CRITICAL
    }
    
    if (apiResponse.nativePluginChanges && apiResponse.nativePluginChanges.length > 0) {
      return UpdateLevel.IMPORTANT
    }
    
    if (apiResponse.updateType === 'full') {
      return UpdateLevel.OPTIONAL
    }
    
    return UpdateLevel.PATCH
  }
  private async requestUpdateCheck(appInfo: AppInfo): Promise<any> {
    try {
      // 调用更新检测API
      const response = await checkAppUpdate({
        appVersion: appInfo.appVersion,
        versionCode: appInfo.versionCode,
        nativePlugins: {
          // 这里可以添加已安装的原生插件信息
          'react-native-gesture-handler': '2.24.0',
          'react-native-reanimated': '3.17.4',
          'expo-updates': '0.28.17',
        },
      })

      return {
        code: 200,
        message: "成功",
        data: response,
        error: null,
      }
    } catch (error) {
      console.error("检查更新API调用失败:", error)
      throw error
    }
  }

  /**
   * 处理可用更新
   */
  private async handleUpdateAvailable(updateData: UpdateData, silent: boolean): Promise<void> {
    const { updateType, forceUpdate, nativePluginChanges } = updateData

    console.log(`发现${updateType === UpdateType.FULL ? "整包" : "热"}更新, 强制: ${forceUpdate}`)

    // 检查是否有原生插件变更
    if (nativePluginChanges && nativePluginChanges.length > 0) {
      console.log("发现原生插件变更:", nativePluginChanges)
      // 有原生插件变更时，必须使用整包更新
      updateData.updateType = UpdateType.FULL
      updateData.reason = "原生插件更新"
    }

    // 存储更新信息
    await AsyncStorage.setItem("pending_update", JSON.stringify({
      ...updateData,
      detectedTime: Date.now(),
    }))

    // 根据更新类型决定处理方式
    if (updateData.updateType === UpdateType.FULL) {
      await this.handleFullUpdate(updateData, silent, forceUpdate)
    } else if (updateData.updateType === UpdateType.HOT) {
      await this.handleHotUpdate(updateData, silent, forceUpdate)
    }

    // 触发更新检测完成事件
    this.emitUpdateCheckCompleted(true, updateData)
  }

  /**
   * 处理整包更新
   */
  private async handleFullUpdate(updateData: UpdateData, silent: boolean, forceUpdate: boolean): Promise<void> {
    const { updateLevel, reason } = updateData

    // 强制更新或重要更新不允许跳过
    if (forceUpdate || updateLevel === UpdateLevel.CRITICAL) {
      console.log("强制整包更新:", reason)
      this.emitShowFullUpdateDialog(updateData, false)
      return
    }

    if (silent && updateLevel !== UpdateLevel.IMPORTANT) {
      // 静默模式下非重要更新，显示红点提醒
      this.showUpdateBadge()
      await AsyncStorage.setItem("has_pending_update", "true")
      return
    }

    // 显示整包更新对话框
    this.emitShowFullUpdateDialog(updateData, updateLevel === UpdateLevel.OPTIONAL)
  }

  /**
   * 处理热更新
   */
  private async handleHotUpdate(updateData: UpdateData, silent: boolean, forceUpdate: boolean): Promise<void> {
    const { updateLevel, autoInstall } = updateData

    // 强制热更新
    if (forceUpdate) {
      console.log("强制热更新")
      await this.downloadAndInstallHotUpdate(updateData, false)
      return
    }

    // 自动静默热更新
    if (silent && (autoInstall || updateLevel === UpdateLevel.PATCH)) {
      console.log("开始静默热更新")
      await this.downloadAndInstallHotUpdate(updateData, true)
      return
    }

    // 显示热更新对话框
    this.emitShowHotUpdateDialog(updateData, updateLevel === UpdateLevel.OPTIONAL)
  }

  /**
   * 下载并安装热更新
   */
  private async downloadAndInstallHotUpdate(updateData: UpdateData, silent: boolean = false): Promise<void> {
    try {
      if (!silent) {
        this.showToast("更新中...", "info")
      }

      console.log("开始下载热更新包:", updateData.downloadUrl)

      // 检查expo-updates是否可用且启用
      if (Updates && Updates.isEnabled) {
        try {
          console.log("使用Expo Updates进行热更新")
          
          // 检查是否有可用更新
          const updateCheckResult = await Updates.checkForUpdateAsync()
          
          if (updateCheckResult.isAvailable) {
            console.log("发现可用更新，开始下载")
            
            // 下载更新
            const fetchResult = await Updates.fetchUpdateAsync()
            
            if (fetchResult.isNew) {
              console.log("更新下载完成，准备重启")
              
              // 清理待更新标记
              await AsyncStorage.removeItem("pending_update")
              await AsyncStorage.removeItem("has_pending_update")

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
          } else {
            console.log("没有可用的热更新")
            if (!silent) {
              this.showToast("已是最新版本", "success")
            }
          }
        } catch (error) {
          console.error("Expo热更新失败:", error)
          throw error
        }
      } else {
        console.log("Expo Updates未启用或不可用")
        console.log("isEnabled:", Updates?.isEnabled)
        console.log("Updates available:", !!Updates)
        
        if (!silent) {
          this.showToast("热更新功能不可用", "warning")
        }
        
        // 对于不支持热更新的环境，可以尝试整包更新
        if (updateData.downloadUrl) {
          console.log("尝试整包更新作为备选方案")
          await this.downloadAndInstallFullUpdate(updateData)
        }
      }
    } catch (error) {
      console.error("热更新失败:", error)
      if (!silent) {
        this.showToast("更新失败", "error")
      }
      throw error
    }
  }

  /**
   * 下载并安装整包更新
   */
  private async downloadAndInstallFullUpdate(updateData: UpdateData): Promise<void> {
    try {
      console.log("开始整包更新:", updateData.downloadUrl)

      if (Platform.OS === "ios") {
        // iOS跳转到App Store
        await Linking.openURL(updateData.downloadUrl)
      } else if (Platform.OS === "android") {
        // Android下载APK并安装
        await this.downloadAndInstallApk(updateData)
      } else {
        // Web环境直接打开下载链接
        await Linking.openURL(updateData.downloadUrl)
      }
    } catch (error) {
      console.error("整包更新失败:", error)
      throw error
    }
  }

  /**
   * 下载并安装APK - 优先使用react-native-blob-util，失败时回退到expo-file-system
   */
  private async downloadAndInstallApk(updateData: UpdateData): Promise<void> {
    try {
      console.log("开始下载APK:", updateData.downloadUrl)
      
      // 请求存储权限
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: '存储权限',
            message: '需要存储权限来下载和安装应用更新',
            buttonNeutral: '稍后询问',
            buttonNegative: '取消',
            buttonPositive: '确定',
          }
        )
        
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          throw new Error('存储权限被拒绝')
        }
      }
      
      // 优先使用expo-file-system下载
      console.log("使用expo-file-system下载")
      await this.downloadWithFileSystem(updateData)
      
    } catch (error) {
      console.error("APK下载安装失败:", error)
      
      // 如果自动安装失败，提供手动安装选项
      Alert.alert(
        "自动安装失败",
        "是否要手动下载安装？",
        [
          {
            text: "取消",
            style: "cancel"
          },
          {
            text: "手动下载",
            onPress: () => {
              Linking.openURL(updateData.downloadUrl)
            }
          }
        ]
      )
      
      throw error
    }
  }


  /**
   * 使用expo-file-system下载
   */
  private async downloadWithFileSystem(updateData: UpdateData): Promise<void> {
    // 使用 expo-file-system 下载
    const downloadDir = FileSystem.documentDirectory + 'downloads/'
    const fileName = `app_update_${updateData.version}.apk`
    const fileUri = downloadDir + fileName
    
    console.log("APK下载路径:", fileUri)
    
    // 确保下载目录存在
    await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true })
    
    // 检查并删除已存在的文件
    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri)
      if (fileInfo.exists) {
        console.log("删除已存在的APK文件")
        await FileSystem.deleteAsync(fileUri)
      }
    } catch (error) {
      // 文件不存在，忽略错误
    }
    
    // 尝试获取文件大小
    let totalSize = updateData.fileSize || 0
    if (!totalSize) {
      try {
        console.log("尝试从服务器获取文件大小...")
        const headResponse = await fetch(updateData.downloadUrl, { method: 'HEAD' })
        const contentLength = headResponse.headers.get('content-length')
        if (contentLength) {
          totalSize = parseInt(contentLength, 10)
          console.log("从服务器获取文件大小:", totalSize, "bytes")
        }
      } catch (error) {
        console.warn("无法获取文件大小:", error)
      }
    }
    
    // 设置初始进度状态
    this.updateDownloadProgress(0, 0, totalSize)
    
    console.log("开始下载APK...")
    
    // 使用 FileSystem.createDownloadResumable 实现带进度的下载
    const callback = (downloadProgress: any) => {
      const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite
      const percent = Math.round(progress * 100)
      console.log(`下载进度: ${percent}% (${downloadProgress.totalBytesWritten}/${downloadProgress.totalBytesExpectedToWrite} bytes)`)
      this.updateDownloadProgress(percent, downloadProgress.totalBytesWritten, downloadProgress.totalBytesExpectedToWrite)
    }

    const downloadResumable = FileSystem.createDownloadResumable(
      updateData.downloadUrl,
      fileUri,
      {},
      callback
    )

    try {
      const result = await downloadResumable.downloadAsync()
      
      if (!result) {
        throw new Error("下载被取消")
      }
      
      console.log("APK下载完成:", result.uri)
      
      // 获取实际文件大小
      try {
        const fileInfo = await FileSystem.getInfoAsync(result.uri)
        if (fileInfo.exists && fileInfo.size) {
          const actualSize = fileInfo.size
          console.log("实际下载文件大小:", actualSize, "bytes")
          
          // 设置最终进度
          this.updateDownloadProgress(100, actualSize, actualSize)
        }
      } catch (error) {
        console.warn("无法获取下载文件大小:", error)
      }
      
      // 安装APK
      await this.installApkOptimized(result.uri)
      
    } catch (error) {
      console.error("下载过程中出错:", error)
      throw error
    }
  }

  /**
   * 优化的APK安装方法
   */
  private async installApkOptimized(apkUri: string): Promise<void> {
    try {
      console.log("开始安装APK:", apkUri)
      
      if (Platform.OS !== 'android') {
        throw new Error('当前平台不支持APK安装')
      }

      // 方法1: 使用 IntentLauncher（推荐，支持 Android 7.0+）
      try {
        console.log("尝试使用 IntentLauncher 安装")
        const contentUri = await FileSystem.getContentUriAsync(apkUri)
        
        await IntentLauncher.startActivityAsync('android.intent.action.INSTALL_PACKAGE', {
          data: contentUri,
          flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
        })
        
        console.log("IntentLauncher 安装成功")
        
        Alert.alert(
          "安装提示", 
          "系统安装器已打开，请在安装器中点击'安装'按钮完成更新\n\n安装完成后请重启应用",
          [
            {
              text: "确定",
              onPress: async () => {
                console.log("用户确认安装，设置安装标记")
                await AsyncStorage.setItem("apk_install_pending", "true")
                await AsyncStorage.setItem("install_start_time", Date.now().toString())
              }
            }
          ]
        )
        
        return
      } catch (intentError) {
        console.log("IntentLauncher 安装失败，尝试其他方案:", intentError)
      }

      // 方法2: 使用 FileSystem.getContentUriAsync + Linking
      try {
        console.log("尝试使用 ContentUri + Linking 安装")
        const contentUri = await FileSystem.getContentUriAsync(apkUri)
        await Linking.openURL(contentUri)
        
        console.log("ContentUri + Linking 安装成功")
        
        
        return
      } catch (contentError) {
        console.log("ContentUri + Linking 安装失败:", contentError)
      }

      // 方法3: 直接使用 Linking
      try {
        console.log("尝试直接使用 Linking 安装")
        await Linking.openURL(apkUri)
        
        console.log("直接 Linking 安装成功")
        
        Alert.alert(
          "安装提示", 
          "系统安装器已打开，请在安装器中点击'安装'按钮完成更新",
          [{ text: "确定" }]
        )
        
        return
      } catch (linkError) {
        console.log("直接 Linking 安装失败:", linkError)
      }

      // 所有方法都失败，提示用户手动安装
      throw new Error('自动安装失败，请手动安装下载的APK文件')
      
    } catch (error) {
      console.error("APK安装失败:", error)
      
      // 提供手动安装选项
      Alert.alert(
        "安装失败",
        "自动安装失败，请手动完成安装：\n1. 打开文件管理器\n2. 找到下载的APK文件\n3. 点击安装",
        [
          {
            text: "打开文件位置",
            onPress: () => this.openFileLocation(apkUri)
          },
          { text: "取消", style: "cancel" }
        ]
      )
      
      throw error
    }
  }

  /**
   * 打开文件所在位置
   */
  private async openFileLocation(fileUri: string): Promise<void> {
    try {
      console.log("打开文件位置:", fileUri)
      
      // 移除 file:// 前缀，使用原生路径
      const nativePath = fileUri.replace('file://', '')
      const directoryPath = nativePath.substring(0, nativePath.lastIndexOf('/'))
      
      // 尝试使用不同的方式打开目录
      const fileManagerUris = [
        `file://${directoryPath}`,
        `content://com.android.externalstorage.documents/document/primary%3ADownload`,
        `content://com.android.documentsui/document/primary%3ADownload`,
      ]
      
      for (const uri of fileManagerUris) {
        try {
          await Linking.openURL(uri)
          console.log("成功打开文件管理器:", uri)
          return
        } catch (error) {
          console.log("打开文件管理器失败:", uri, error)
        }
      }
      
      Alert.alert('提示', '请手动在文件管理器的下载目录中查找APK文件')
      
    } catch (error) {
      console.error("打开文件位置失败:", error)
      Alert.alert('提示', '请手动在文件管理器的下载目录中查找APK文件')
    }
  }

  /**
   * 安装APK文件（保留原方法作为备用）
   */
  private async installApk(apkPath: string): Promise<void> {
    try {
      console.log("开始安装APK:", apkPath)
      
      if (Platform.OS === 'android') {
        // 检查文件是否存在
        const fileExists = await RNFS.exists(apkPath)
        if (!fileExists) {
          throw new Error('APK文件不存在')
        }
        
        // 获取文件名
        const fileName = apkPath.split('/').pop() || 'app_update.apk'
        
        // 方案1: 使用系统安装器直接安装
        try {
          await this.installApkWithSystemInstaller(apkPath)
          console.log("系统安装器安装成功")
          return
        } catch (systemError) {
          console.log("系统安装器安装失败，尝试其他方案:", systemError)
        }
        
        // 方案2: 使用ContentProvider方式
        try {
          await this.installApkWithContentProvider(apkPath)
          console.log("ContentProvider安装成功")
          return
        } catch (contentError) {
          console.log("ContentProvider安装失败:", contentError)
        }
        
        // 方案3: 打开文件管理器让用户手动安装
        await this.openFileManager(apkPath, fileName)
        
      } else {
        throw new Error('当前平台不支持APK安装')
      }
      
    } catch (error) {
      console.error("APK安装失败:", error)
      
      // 如果所有方案都失败，提供手动安装选项
      Alert.alert(
        "自动安装失败",
        "请手动安装下载的APK文件",
        [
          {
            text: "确定",
            onPress: () => {
              console.log("APK文件路径:", apkPath)
            }
          }
        ]
      )
      
      throw error
    }
  }

  /**
   * 使用系统安装器安装APK
   */
  private async installApkWithSystemInstaller(apkPath: string): Promise<void> {
    try {
      console.log("使用FileProvider安装APK")
      
      // 方案1: 使用FileProvider方式
      try {
        const fileProviderUri = await this.getFileProviderUri(apkPath)
        if (fileProviderUri) {
          await this.installApkWithFileProvider(fileProviderUri, apkPath)
          return
        }
      } catch (fileProviderError) {
        console.log("FileProvider安装失败:", fileProviderError)
      }
      
      // 方案2: 复制到应用内部目录并使用FileProvider
      try {
        const internalPath = await this.copyApkToInternalStorage(apkPath)
        const internalFileProviderUri = await this.getFileProviderUri(internalPath)
        if (internalFileProviderUri) {
          await this.installApkWithFileProvider(internalFileProviderUri, internalPath)
          return
        }
      } catch (internalError) {
        console.log("内部存储FileProvider安装失败:", internalError)
      }
      
      // 方案3: 打开文件管理器让用户手动安装
      const fileName = apkPath.split('/').pop() || 'app_update.apk'
      await this.openFileManager(apkPath, fileName)
      
    } catch (error) {
      console.error("所有安装方式都失败:", error)
      throw error
    }
  }

  /**
   * 获取FileProvider URI
   */
  private async getFileProviderUri(apkPath: string): Promise<string | null> {
    try {
      // 检查文件是否存在
      const fileExists = await RNFS.exists(apkPath)
      if (!fileExists) {
        console.log("文件不存在:", apkPath)
        return null
      }
      
      // 手动构建FileProvider URI
      // 格式: content://com.xhtx.app.fileprovider/external_files/Download/app_update_1.2.2.apk
      const fileName = apkPath.split('/').pop() || 'app_update.apk'
      
      // 判断文件路径类型
      let uriPath = ''
      if (apkPath.includes('/storage/emulated/0/Download/')) {
        // 外部下载目录
        uriPath = `downloads/${fileName}`
      } else if (apkPath.includes('/data/user/0/com.xhtx.app/files/')) {
        // 应用内部文件
        const relativePath = apkPath.split('/files/')[1] || ''
        uriPath = `files/${relativePath}`
      } else {
        console.log("无法识别的文件路径:", apkPath)
        return null
      }
      
      const fileProviderUri = `content://com.xhtx.app.fileprovider/${uriPath}`
      console.log("构建FileProvider URI:", fileProviderUri)
      return fileProviderUri
      
    } catch (error) {
      console.error("构建FileProvider URI失败:", error)
      return null
    }
  }

  /**
   * 复制APK到应用内部存储
   */
  private async copyApkToInternalStorage(apkPath: string): Promise<string> {
    const appDir = `${RNFS.DocumentDirectoryPath}/downloads`
    await RNFS.mkdir(appDir)
    
    const fileName = apkPath.split('/').pop() || 'app_update.apk'
    const internalPath = `${appDir}/${fileName}`
    
    await RNFS.copyFile(apkPath, internalPath)
    console.log("APK已复制到内部存储:", internalPath)
    
    return internalPath
  }

  /**
   * 使用FileProvider安装APK
   */
  private async installApkWithFileProvider(fileProviderUri: string, apkPath: string): Promise<void> {
    try {
      console.log("使用FileProvider URI安装APK:", fileProviderUri)
      console.log("APK文件路径:", apkPath)
      
      // 检查文件是否存在
      const fileExists = await RNFS.exists(apkPath)
      console.log("文件是否存在:", fileExists)
      
      if (!fileExists) {
        throw new Error('APK文件不存在')
      }
      
      // 获取文件信息
      const fileStats = await RNFS.stat(apkPath)
      console.log("文件大小:", fileStats.size, "bytes")
      
      // 使用content URI打开安装器
      console.log("尝试打开系统安装器...")
      await Linking.openURL(fileProviderUri)
      
      console.log("FileProvider安装器已打开")
      
      // 等待一下，看看是否有错误
      setTimeout(() => {
        console.log("安装器打开后的状态检查")
      }, 1000)
      
      Alert.alert(
        "安装提示", 
        "系统安装器已打开，请在安装器中点击'安装'按钮完成更新\n\n安装完成后请重启应用",
        [
          {
            text: "确定",
            onPress: async () => {
              console.log("用户确认安装，设置安装标记")
              // 设置安装标记，避免重复提示
              await AsyncStorage.setItem("apk_install_pending", "true")
              await AsyncStorage.setItem("install_start_time", Date.now().toString())
            }
          }
        ]
      )
      
    } catch (error) {
      console.error("FileProvider安装失败:", error)
      
      // 如果FileProvider失败，尝试其他方案
      console.log("FileProvider失败，尝试直接打开文件...")
      try {
        await Linking.openURL(`file://${apkPath}`)
        console.log("直接文件URI打开成功")
      } catch (directError) {
        console.error("直接文件URI也失败:", directError)
        throw directError
      }
    }
  }

  /**
   * 使用ContentProvider方式安装APK
   */
  private async installApkWithContentProvider(apkPath: string): Promise<void> {
    try {
      // 复制到应用内部目录
      const appDir = `${RNFS.DocumentDirectoryPath}/downloads`
      await RNFS.mkdir(appDir)
      
      const fileName = apkPath.split('/').pop() || 'app_update.apk'
      const internalPath = `${appDir}/${fileName}`
      
      await RNFS.copyFile(apkPath, internalPath)
      console.log("APK已复制到内部目录:", internalPath)
      
      // 使用内部路径打开
      const internalUri = `file://${internalPath}`
      await Linking.openURL(internalUri)
      
      Alert.alert(
        "安装提示", 
        "请在系统安装器中点击'安装'按钮完成更新",
        [
          {
            text: "确定",
            onPress: () => {
              console.log("用户确认安装")
            }
          }
        ]
      )
      
    } catch (error) {
      console.error("ContentProvider安装失败:", error)
      throw error
    }
  }

  /**
   * 打开文件管理器让用户手动安装
   */
  private async openFileManager(apkPath: string, fileName: string): Promise<void> {
    try {
      console.log("打开文件管理器")
      
      // 尝试打开下载目录
      const downloadDir = RNFS.DownloadDirectoryPath
      
      // 使用不同的方式打开文件管理器
      const fileManagerUris = [
        `content://com.android.externalstorage.documents/document/primary%3ADownload`,
        `file://${downloadDir}`,
        `content://com.android.documentsui/document/primary%3ADownload`,
      ]
      
      for (const uri of fileManagerUris) {
        try {
          await Linking.openURL(uri)
          console.log("成功打开文件管理器:", uri)
          break
        } catch (error) {
          console.log("打开文件管理器失败:", uri, error)
        }
      }
      
      Alert.alert(
        "安装提示",
        `APK已下载完成！\n\n文件位置: ${downloadDir}\n文件名: ${fileName}\n\n请在文件管理器中找到该文件并点击安装`,
        [
          {
            text: "确定",
            onPress: () => {
              console.log("用户确认手动安装")
            }
          }
        ]
      )
      
    } catch (error) {
      console.error("打开文件管理器失败:", error)
      throw error
    }
  }

  /**
   * 应用进入前台时检查更新
   */
  async checkForUpdatesOnShow(): Promise<void> {
    try {
      console.log("应用进入前台，检查更新")
      
      // 检查是否正在安装APK
      const installPending = await AsyncStorage.getItem("apk_install_pending")
      const installStartTime = await AsyncStorage.getItem("install_start_time")
      
      if (installPending === "true" && installStartTime) {
        const startTime = parseInt(installStartTime)
        const timeDiff = Date.now() - startTime
        
        // 如果安装开始时间超过5分钟，清除标记
        if (timeDiff > 5 * 60 * 1000) {
          await AsyncStorage.removeItem("apk_install_pending")
          await AsyncStorage.removeItem("install_start_time")
          console.log("安装标记已超时，清除标记")
        } else {
          console.log("APK安装进行中，跳过更新检测")
          return
        }
      }
      
      // 检查是否在提醒时间内
      const nextRemindTime = await AsyncStorage.getItem("next_update_remind_time")
      if (nextRemindTime && Date.now() < parseInt(nextRemindTime)) {
        console.log("在提醒时间内，跳过更新检测")
        return
      }

      // 使用统一的检查流程：先整包，后EAS（修复旧版本逻辑）
      await this.checkForUpdates({
        silent: true,
        source: "app_show",
      })
    } catch (error) {
      console.error("前台更新检测失败:", error)
    }
  }

  /**
   * 手动检查更新
   */
  async manualCheckForUpdates(): Promise<void> {
    try {
      console.log("手动检查更新")
      
      // 使用统一的检查流程：先整包，后EAS
      await this.checkForUpdates({
        silent: false,
        forceCheck: true,
        source: "manual",
      })

    } catch (error) {
      console.error("手动更新检测失败:", error)
      this.showToast("检查更新失败", "error")
    }
  }

  /**
   * 显示无更新提示
   */
  private showNoUpdateMessage(): void {
    this.showToast("已是最新版本", "success")
  }

  /**
   * 显示更新红点提醒
   */
  private showUpdateBadge(): void {
    try {
      // 在React Native中，可以通过状态管理来显示红点
      console.log("显示更新红点提醒")
      // 这里可以触发全局状态更新，在TabBar上显示红点
    } catch (error) {
      console.warn("显示红点失败:", error)
    }
  }

  /**
   * 取消下载
   */
  cancelDownload(): void {
    if (this.downloadTask) {
      this.downloadTask.abort()
      this.downloadTask = null
      this.isDownloading = false
      console.log("下载已取消")
    }
  }

  /**
   * 获取待更新信息
   */
  async getPendingUpdate(): Promise<UpdateData | null> {
    try {
      const pendingUpdateStr = await AsyncStorage.getItem("pending_update")
      return pendingUpdateStr ? JSON.parse(pendingUpdateStr) : null
    } catch (error) {
      console.error("获取待更新信息失败:", error)
      return null
    }
  }

  /**
   * 获取EAS更新状态
   */
  getEASUpdateStatus(): {
    isEnabled: boolean
    runtimeVersion: string | null
    updateId: string | null
    channel: string | null
  } {
    return easUpdateService.getUpdateStatus()
  }

  /**
   * 清理更新缓存
   */
  async clearUpdateCache(): Promise<void> {
    try {
      // 清理传统更新缓存
      await AsyncStorage.removeItem("pending_update")
      await AsyncStorage.removeItem("has_pending_update")
      await AsyncStorage.removeItem("last_update_check")
      
      // 清理EAS更新缓存
      await easUpdateService.clearUpdateCache()
      
      console.log("更新缓存已清理")
    } catch (error) {
      console.error("清理更新缓存失败:", error)
    }
  }

  /**
   * 设置更新提醒
   */
  async setUpdateReminder(hours: number): Promise<void> {
    try {
      const nextRemindTime = Date.now() + hours * 60 * 60 * 1000
      await AsyncStorage.setItem("next_update_remind_time", nextRemindTime.toString())
      this.showToast(`已设置${hours}小时后提醒`, "info")
    } catch (error) {
      console.error("设置更新提醒失败:", error)
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
   * 格式化文件大小
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * 显示下载进度对话框
   */
  private showDownloadProgress(version: string, fileSize: string): void {
    // 这里可以显示一个自定义的进度对话框
    // 暂时使用简单的Toast
    this.showToast(`开始下载版本 ${version}，大小: ${fileSize}`, "info")
  }

  /**
   * 更新下载进度
   */
  private updateDownloadProgress(percent: number, downloaded: number, total: number): void {
    const downloadedText = this.formatFileSize(downloaded)
    const totalText = this.formatFileSize(total)
    console.log(`下载进度: ${percent}% (${downloadedText}/${totalText})`)
    
    // 更新状态存储，供UpdateDialog使用
    this.updateStore.setDownloadProgress({
      progress: percent,
      downloadedSize: downloaded,
      totalSize: total,
      isUpdating: true
    })
  }

  /**
   * 隐藏下载进度对话框
   */
  private hideDownloadProgress(): void {
    console.log("下载完成，隐藏进度对话框")
    
    // 重置下载进度状态
    this.updateStore.setDownloadProgress({
      progress: 0,
      downloadedSize: 0,
      totalSize: 0,
      isUpdating: false
    })
  }

  /**
   * 触发更新检测完成事件
   */
  private emitUpdateCheckCompleted(hasUpdate: boolean, updateData?: UpdateData): void {
    // 这里可以通过事件总线或状态管理来通知其他组件
    console.log("更新检测完成:", { hasUpdate, updateData })
  }

  /**
   * 触发显示整包更新对话框事件
   */
  private emitShowFullUpdateDialog(updateData: UpdateData, canSkip: boolean): void {
    console.log("显示整包更新对话框:", { updateData, canSkip })
    // 使用状态管理显示更新对话框
    useUpdateStore.getState().showUpdateDialogAction(updateData, canSkip)
  }

  /**
   * 触发显示热更新对话框事件
   */
  private emitShowHotUpdateDialog(updateData: UpdateData, canSkip: boolean): void {
    console.log("显示热更新对话框:", { updateData, canSkip })
    // 使用状态管理显示更新对话框
    useUpdateStore.getState().showUpdateDialogAction(updateData, canSkip)
  }
}

// 导出单例实例
export const updateManager = new UpdateManager()
export default updateManager
