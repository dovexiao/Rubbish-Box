import { useState, useCallback, useRef } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { updateReadingProgress } from "../services/reader"

/**
 * 阅读进度管理Hook
 * 100%还原UniApp的进度保存和恢复功能
 */
export const useReadingProgress = (bookId: number) => {
  const [currentProgress, setCurrentProgress] = useState(0)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 更新进度（本地状态）
  const updateProgress = useCallback((progress: number) => {
    // 确保进度是有效数字
    if (isNaN(progress) || !isFinite(progress)) {
      console.warn("进度值无效，使用默认值0:", progress)
      progress = 0
    }
    const clampedProgress = Math.max(0, Math.min(100, progress))
    setCurrentProgress(clampedProgress)
  }, [])

  // 保存阅读进度到服务器
  const saveProgress = useCallback(
    async (chapterId?: number, progress?: number) => {
      if (!bookId) {
        console.warn("bookId无效，跳过保存进度")
        return
      }

      try {
        setIsAutoSaving(true)

        // 准备更新进度的参数
        let progressToSave = progress !== undefined ? progress : currentProgress
        const chapterIdToSave = chapterId !== undefined ? chapterId : 0

        // 确保进度值有效
        if (isNaN(progressToSave) || !isFinite(progressToSave)) {
          console.warn("进度值无效，使用默认值0:", progressToSave)
          progressToSave = 0
        }

        // 将进度从百分比(0-100)转换为小数(0-1)
        const normalizedProgress = Math.max(0, Math.min(1, progressToSave / 100))

        console.log("准备保存阅读进度:", {
          book_id: bookId,
          chapter_id: chapterIdToSave,
          progress: normalizedProgress,
          originalProgress: progressToSave,
        })

        // 使用新的API更新阅读进度
        await updateReadingProgress({
          book_id: bookId,
          chapter_id: chapterIdToSave,
          progress: normalizedProgress,
        })

        console.log("阅读进度保存成功")
      } catch (error) {
        console.error("保存阅读进度失败:", error)
      } finally {
        setIsAutoSaving(false)
      }
    },
    [bookId, currentProgress],
  )

  // 防抖保存进度
  const debouncedSaveProgress = useCallback(
    (chapterId?: number, progress?: number) => {
      // 清除之前的定时器
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }

      // 设置新的定时器
      saveTimerRef.current = setTimeout(() => {
        saveProgress(chapterId, progress)
      }, 2000) // 2秒后保存
    },
    [saveProgress],
  )

  // 立即保存进度（用于页面隐藏/卸载时）
  const saveProgressImmediately = useCallback(
    async (chapterId?: number, progress?: number) => {
      // 清除防抖定时器
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
        saveTimerRef.current = null
      }

      // 立即保存
      await saveProgress(chapterId, progress)
    },
    [saveProgress],
  )

  // 从本地存储加载进度
  const loadLocalProgress = useCallback(async (): Promise<number> => {
    try {
      const key = `reading_progress_${bookId}`
      const progressStr = await AsyncStorage.getItem(key)

      if (progressStr) {
        const progress = parseInt(progressStr, 10)
        if (!isNaN(progress) && isFinite(progress)) {
          setCurrentProgress(progress)
          return progress
        }
      }
    } catch (error) {
      console.error("加载本地进度失败:", error)
    }

    return 0
  }, [bookId])

  // 保存进度到本地存储
  const saveLocalProgress = useCallback(
    async (progress: number) => {
      try {
        // 确保进度值有效
        if (isNaN(progress) || !isFinite(progress)) {
          console.warn("本地保存进度值无效，跳过保存:", progress)
          return
        }

        const key = `reading_progress_${bookId}`
        await AsyncStorage.setItem(key, progress.toString())
      } catch (error) {
        console.error("保存本地进度失败:", error)
      }
    },
    [bookId],
  )

  // 更新进度并触发保存
  const updateAndSaveProgress = useCallback(
    (progress: number, chapterId?: number) => {
      updateProgress(progress)
      saveLocalProgress(progress)
      debouncedSaveProgress(chapterId, progress)
    },
    [updateProgress, saveLocalProgress, debouncedSaveProgress],
  )

  // 清理定时器
  const cleanup = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }
  }, [])

  return {
    // 进度状态
    currentProgress,
    isAutoSaving,

    // 进度操作
    updateProgress,
    updateAndSaveProgress,
    saveProgress,
    saveProgressImmediately,
    debouncedSaveProgress,

    // 本地存储
    loadLocalProgress,
    saveLocalProgress,

    // 清理
    cleanup,
  }
}

