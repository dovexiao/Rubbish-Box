import { useCallback, useEffect, useRef } from 'react'
import { useActivityStore } from '../stores/activityStore'
import {
  ActivityType,
  ActivityStatus,
  CreateReadingActivityParams,
  CreateVideoActivityParams,
  CreateHomeworkActivityParams,
  CreateCompositionActivityParams,
  CreateErrorBookActivityParams,
} from '../types/activity'

/**
 * 节流函数
 * @param func 要节流的函数
 * @param delay 延迟时间（毫秒）
 */
function throttle<T extends (...args: any[]) => any>(func: T, delay: number): T {
  let lastCall = 0
  return ((...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      return func(...args)
    }
  }) as T
}

/**
 * 用户活动追踪 Hook
 * 
 * 提供便捷的 API 来追踪用户在各个模块的活动
 * 
 * @param options 配置选项
 * @returns 活动追踪方法
 * 
 * @example
 * ```typescript
 * const { startReading, updateReadingProgress, endReading } = useActivityTracking()
 * 
 * // 进入阅读页面
 * startReading({ bookId: '123', bookName: '语文课本' })
 * 
 * // 更新阅读进度
 * updateReadingProgress(50)
 * 
 * // 退出阅读页面
 * endReading()
 * ```
 */
export function useActivityTracking(options: {
  /** 进度更新节流时间（毫秒），默认 2000ms */
  throttleDelay?: number
  /** 是否在组件卸载时自动退出活动，默认 true */
  autoExitOnUnmount?: boolean
} = {}) {
  const { throttleDelay = 2000, autoExitOnUnmount = true } = options
  
  const { setActivity, updateActivity, updateProgress, exitCurrentActivity, clearActivity } = useActivityStore()
  
  // 使用 ref 存储节流函数，避免重复创建
  const throttledUpdateRef = useRef<((progress: number, additionalData?: Record<string, any>) => void) | null>(null)
  
  if (!throttledUpdateRef.current) {
    throttledUpdateRef.current = throttle(updateProgress, throttleDelay)
  }
  
  // 组件卸载时自动退出活动
  useEffect(() => {
    if (!autoExitOnUnmount) return
    
    return () => {
      exitCurrentActivity()
    }
  }, [autoExitOnUnmount, exitCurrentActivity])
  
  // ==================== 阅读相关 ====================
  
  /**
   * 开始阅读
   */
  const startReading = useCallback((params: CreateReadingActivityParams) => {
    setActivity({
      type: ActivityType.READING,
      status: ActivityStatus.ENTER,
      timestamp: Date.now(),
      bookId: params.bookId,
      bookName: params.bookName,
      progress: params.progress || 0,
      currentPage: params.currentPage,
      totalPages: params.totalPages,
      chapterId: params.chapterId,
      chapterName: params.chapterName,
    })
  }, [setActivity])
  
  /**
   * 更新阅读进度
   */
  const updateReadingProgress = useCallback((
    progress: number,
    additionalData?: { currentPage?: number; chapterId?: string; chapterName?: string }
  ) => {
    if (throttledUpdateRef.current) {
      throttledUpdateRef.current(progress, additionalData)
    }
  }, [])
  
  /**
   * 结束阅读
   */
  const endReading = useCallback(() => {
    exitCurrentActivity()
  }, [exitCurrentActivity])
  
  // ==================== 视频相关 ====================
  
  /**
   * 开始观看视频
   */
  const startVideo = useCallback((params: CreateVideoActivityParams) => {
    setActivity({
      type: ActivityType.VIDEO,
      status: ActivityStatus.ENTER,
      timestamp: Date.now(),
      videoId: params.videoId,
      videoName: params.videoName,
      progress: params.progress || 0,
      duration: params.duration,
      progressPercent: params.duration ? Math.round(((params.progress || 0) / params.duration) * 100) : 0,
      courseId: params.courseId,
      courseName: params.courseName,
    })
  }, [setActivity])
  
  /**
   * 更新视频进度
   */
  const updateVideoProgress = useCallback((progress: number, duration?: number) => {
    if (throttledUpdateRef.current) {
      const additionalData: any = {}
      if (duration) {
        additionalData.duration = duration
        additionalData.progressPercent = Math.round((progress / duration) * 100)
      }
      throttledUpdateRef.current(progress, additionalData)
    }
  }, [])
  
  /**
   * 结束观看视频
   */
  const endVideo = useCallback(() => {
    exitCurrentActivity()
  }, [exitCurrentActivity])
  
  // ==================== 作业相关 ====================
  
  /**
   * 开始批改作业
   */
  const startHomework = useCallback((params: CreateHomeworkActivityParams) => {
    setActivity({
      type: ActivityType.HOMEWORK,
      status: ActivityStatus.ENTER,
      timestamp: Date.now(),
      homeworkId: params.homeworkId,
      homeworkName: params.homeworkName,
      subject: params.subject,
      questionCount: params.questionCount,
    })
  }, [setActivity])
  
  /**
   * 结束批改作业
   */
  const endHomework = useCallback(() => {
    exitCurrentActivity()
  }, [exitCurrentActivity])
  
  // ==================== 作文相关 ====================
  
  /**
   * 开始批改作文
   */
  const startComposition = useCallback((params: CreateCompositionActivityParams) => {
    setActivity({
      type: ActivityType.COMPOSITION,
      status: ActivityStatus.ENTER,
      timestamp: Date.now(),
      compositionId: params.compositionId,
      compositionName: params.compositionName,
      wordCount: params.wordCount,
    })
  }, [setActivity])
  
  /**
   * 结束批改作文
   */
  const endComposition = useCallback(() => {
    exitCurrentActivity()
  }, [exitCurrentActivity])
  
  // ==================== 错题本相关 ====================
  
  /**
   * 开始错题本
   */
  const startErrorBook = useCallback((params?: CreateErrorBookActivityParams) => {
    setActivity({
      type: ActivityType.ERROR_BOOK,
      status: ActivityStatus.ENTER,
      timestamp: Date.now(),
      questionId: params?.questionId,
      subject: params?.subject,
      difficulty: params?.difficulty,
    })
  }, [setActivity])
  
  /**
   * 结束错题本
   */
  const endErrorBook = useCallback(() => {
    exitCurrentActivity()
  }, [exitCurrentActivity])
  
  // ==================== 通用方法 ====================
  
  /**
   * 手动更新活动（用于特殊场景）
   */
  const updateActivityManually = useCallback((updates: Record<string, any>) => {
    updateActivity(updates)
  }, [updateActivity])
  
  /**
   * 清除当前活动（不发送退出消息）
   */
  const clearCurrentActivity = useCallback(() => {
    clearActivity()
  }, [clearActivity])
  
  return {
    // 阅读
    startReading,
    updateReadingProgress,
    endReading,
    
    // 视频
    startVideo,
    updateVideoProgress,
    endVideo,
    
    // 作业
    startHomework,
    endHomework,
    
    // 作文
    startComposition,
    endComposition,
    
    // 错题本
    startErrorBook,
    endErrorBook,
    
    // 通用
    updateActivityManually,
    clearCurrentActivity,
  }
}

/**
 * 获取当前活动
 */
export function useCurrentActivity() {
  return useActivityStore((state) => state.currentActivity)
}

/**
 * 获取活动历史
 */
export function useActivityHistory() {
  return useActivityStore((state) => state.activityHistory)
}

