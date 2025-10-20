import { create } from "zustand"
import { UpdateData } from "../services/updateManager"

/**
 * 更新状态接口
 */
interface UpdateState {
  // 更新对话框状态
  showUpdateDialog: boolean
  updateData: UpdateData | null
  canSkip: boolean
  
  // 更新进度状态
  isDownloading: boolean
  downloadProgress: number
  downloadedSize: number
  totalSize: number
  
  // 更新操作
  showUpdateDialogAction: (updateData: UpdateData, canSkip?: boolean) => void
  hideUpdateDialogAction: () => void
  setDownloadProgressAction: (progress: number) => void
  setDownloadingAction: (isDownloading: boolean) => void
  setDownloadProgress: (data: { progress: number; downloadedSize: number; totalSize: number; isUpdating: boolean }) => void
}

/**
 * 更新状态管理Store
 */
export const useUpdateStore = create<UpdateState>((set) => ({
  // 初始状态
  showUpdateDialog: false,
  updateData: null,
  canSkip: true,
  isDownloading: false,
  downloadProgress: 0,
  downloadedSize: 0,
  totalSize: 0,

  // 显示更新对话框
  showUpdateDialogAction: (updateData: UpdateData, canSkip: boolean = true) => {
    console.log("显示更新对话框:", { updateData, canSkip })
    set({
      showUpdateDialog: true,
      updateData,
      canSkip,
    })
  },

  // 隐藏更新对话框
  hideUpdateDialogAction: () => {
    console.log("隐藏更新对话框")
    set({
      showUpdateDialog: false,
      updateData: null,
      canSkip: true,
    })
  },

  // 设置下载进度
  setDownloadProgressAction: (progress: number) => {
    set({ downloadProgress: progress })
  },

  // 设置下载状态
  setDownloadingAction: (isDownloading: boolean) => {
    set({ isDownloading })
  },

  // 设置详细下载进度
  setDownloadProgress: (data: { progress: number; downloadedSize: number; totalSize: number; isUpdating: boolean }) => {
    set({
      downloadProgress: data.progress,
      downloadedSize: data.downloadedSize,
      totalSize: data.totalSize,
      isDownloading: data.isUpdating
    })
  },
}))

export default useUpdateStore
