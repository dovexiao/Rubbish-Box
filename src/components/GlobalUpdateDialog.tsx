import React from "react"
import { Alert } from "react-native"
import { useUpdateStore } from "../stores/updateStore"
import { updateManager } from "../services/updateManager"
import { UpdateType, UpdateLevel } from "../services/updateManager"
import { UpdateDialog } from "./UpdateDialog"
import { useLockScreenStore } from "../stores/lockScreenStore"

/**
 * 全局更新对话框组件
 * 集成到应用的根布局中，自动显示更新提示
 */
export const GlobalUpdateDialog = React.memo(function GlobalUpdateDialog() {
  const {
    showUpdateDialog,
    updateData,
    canSkip,
    isDownloading,
    downloadProgress,
    downloadedSize,
    totalSize,
    hideUpdateDialogAction,
    setDownloadingAction,
    setDownloadProgressAction,
  } = useUpdateStore()

  // 处理热更新操作
  const handleConfirmHotUpdate = async () => {
    if (!updateData) return

    try {
      setDownloadingAction(true)
      setDownloadProgressAction(0)

      console.log("开始热更新:", updateData)
      await updateManager.downloadAndInstallHotUpdate(updateData, false)

      // 更新成功
      hideUpdateDialogAction()
      Alert.alert("更新成功", "应用将重启以应用更新", [
        {
          text: "确定",
          onPress: () => {
            console.log("应用重启")
          },
        },
      ])
    } catch (error) {
      console.error("热更新失败:", error)
      Alert.alert("更新失败", error.message || "更新过程中出现错误", [
        {
          text: "确定",
          onPress: () => {
            hideUpdateDialogAction()
          },
        },
      ])
    } finally {
      setDownloadingAction(false)
      setDownloadProgressAction(0)
    }
  }

  // 处理整包更新操作
  const handleConfirmFullUpdate = async () => {
    if (!updateData) return

    try {
      setDownloadingAction(true)
      // 设置初始进度和文件大小
      const fileSize = updateData.fileSize || 0
      const { setDownloadProgress } = useUpdateStore.getState()
      setDownloadProgress({
        progress: 0,
        downloadedSize: 0,
        totalSize: fileSize,
        isUpdating: true
      })

      console.log("开始整包更新:", updateData)
      await updateManager.downloadAndInstallFullUpdate(updateData)

      // 更新成功
      hideUpdateDialogAction()
      Alert.alert("更新成功", "应用将重启以应用更新", [
        {
          text: "确定",
          onPress: () => {
            console.log("应用重启")
          },
        },
      ])
    } catch (error) {
      console.error("整包更新失败:", error)
      Alert.alert("更新失败", error.message || "更新过程中出现错误", [
        {
          text: "确定",
          onPress: () => {
            hideUpdateDialogAction()
          },
        },
      ])
    } finally {
      setDownloadingAction(false)
      setDownloadProgressAction(0)
    }
  }

  // 处理跳过热更新
  const handleSkipHotUpdate = async () => {
    try {
      // 设置24小时后提醒
      await updateManager.setUpdateReminder(24)
      hideUpdateDialogAction()
    } catch (error) {
      console.error("设置提醒失败:", error)
      hideUpdateDialogAction()
    }
  }

  // 处理跳过整包更新
  const handleSkipFullUpdate = async () => {
    try {
      // 设置12小时后提醒
      await updateManager.setUpdateReminder(12)
      hideUpdateDialogAction()
    } catch (error) {
      console.error("设置提醒失败:", error)
      hideUpdateDialogAction()
    }
  }

  const locked = useLockScreenStore((state) => state.locked)

  if (!showUpdateDialog || !updateData) {
    return null
  }

  const isFullUpdate = updateData.updateType === UpdateType.FULL
  const isCriticalUpdate = updateData.updateLevel === UpdateLevel.CRITICAL
  const isForceUpdate = updateData.forceUpdate || isCriticalUpdate

  // 转换数据格式以适配新的UpdateDialog组件
  const updateDialogData = {
    newVersion: updateData.version,
    description: updateData.description,
    features: updateData.releaseNotes || [],
    nativePluginChanges: updateData.nativePluginChanges || [],
    downloadUrl: updateData.downloadUrl,
    fileSize: updateData.fileSize,
  }

  return (
    <UpdateDialog
      // 热更新相关
      hotUpdateVisible={!isFullUpdate && showUpdateDialog && !locked}
      hotUpdateData={!isFullUpdate ? updateDialogData : undefined}
      hotCanSkip={!isForceUpdate && canSkip}
      
      // 整包更新相关
      fullUpdateVisible={isFullUpdate && showUpdateDialog}
      fullUpdateData={isFullUpdate ? updateDialogData : undefined}
      fullCanSkip={!isForceUpdate && canSkip}
      
      // 下载进度
      downloadProgress={downloadProgress}
      downloadedSize={downloadedSize}
      totalSize={totalSize}
      isUpdating={isDownloading}
      
      // 回调函数
      onConfirmHotUpdate={handleConfirmHotUpdate}
      onConfirmFullUpdate={handleConfirmFullUpdate}
      onSkipHotUpdate={handleSkipHotUpdate}
      onSkipFullUpdate={handleSkipFullUpdate}
    />
  )
})

export default GlobalUpdateDialog
