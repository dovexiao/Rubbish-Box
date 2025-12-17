import { create } from 'zustand'
import { Activity, ActivityStatus } from '../types/activity'
import { globalWebSocket } from '../services/globalWebSocket'
import { getDeviceCode } from '../utils/deviceInfo'
import { useUserStore } from './userStore'
import { MessageType } from '../types/websocket'

/**
 * 活动追踪 Store 状态接口
 */
interface ActivityState {
  // 当前活动数据
  currentActivity: Activity | null
  
  // 活动历史（用于调试和数据补发）
  activityHistory: Activity[]
  
  // 最大历史记录数
  maxHistorySize: number
  
  // 自动发送开关
  autoSend: boolean
  
  // 操作方法
  setActivity: (activity: Activity) => void
  updateActivity: (updates: Partial<Activity>) => void
  clearActivity: () => void
  sendActivity: (activity?: Activity) => boolean
  setAutoSend: (enabled: boolean) => void
  
  // 便捷方法
  updateProgress: (progress: number, additionalData?: Record<string, any>) => void
  exitCurrentActivity: () => void
}

/**
 * 活动追踪 Store
 * 
 * 功能：
 * 1. 管理当前用户活动数据
 * 2. 自动通过 WebSocket 发送活动数据
 * 3. 维护活动历史记录
 */
export const useActivityStore = create<ActivityState>((set, get) => ({
  currentActivity: null,
  activityHistory: [],
  maxHistorySize: 50, // 最多保存50条历史记录
  autoSend: true, // 默认开启自动发送
  
  /**
   * 设置当前活动
   * @param activity 活动数据
   */
  setActivity: (activity) => {
    // 补充用户ID和设备码
    const userStore = useUserStore.getState()
    const userId = userStore.user?.user_id
    const deviceCodePromise = getDeviceCode()
    
    deviceCodePromise.then((deviceCode) => {
      const enrichedActivity: Activity = {
        ...activity,
        userId: userId || activity.userId,
        deviceCode: deviceCode || activity.deviceCode,
        timestamp: activity.timestamp || Date.now(),
      }
      
      set((state) => {
        // 添加到历史记录
        const newHistory = [enrichedActivity, ...state.activityHistory].slice(0, state.maxHistorySize)
        
        return {
          currentActivity: enrichedActivity,
          activityHistory: newHistory,
        }
      })
      
      // 如果开启了自动发送，立即发送
      if (get().autoSend) {
        get().sendActivity(enrichedActivity)
      }
      
      console.log('📊 [ActivityStore] 活动已设置:', enrichedActivity)
    })
  },
  
  /**
   * 更新当前活动
   * @param updates 要更新的字段
   */
  updateActivity: (updates) => {
    const { currentActivity } = get()
    if (!currentActivity) {
      console.warn('📊 [ActivityStore] 没有当前活动，无法更新')
      return
    }
    
    const updatedActivity = {
      ...currentActivity,
      ...updates,
      timestamp: Date.now(), // 更新时间戳
      status: updates.status || ActivityStatus.UPDATE, // 默认为更新状态
    } as Activity
    
    set({ currentActivity: updatedActivity })
    
    // 如果开启了自动发送，立即发送
    if (get().autoSend) {
      get().sendActivity(updatedActivity)
    }
    
    console.log('📊 [ActivityStore] 活动已更新:', updatedActivity)
  },
  
  /**
   * 清除当前活动
   */
  clearActivity: () => {
    set({ currentActivity: null })
    console.log('📊 [ActivityStore] 活动已清除')
  },
  
  /**
   * 发送活动数据到服务器
   * @param activity 要发送的活动数据（可选，默认发送当前活动）
   * @returns 是否发送成功
   */
  sendActivity: (activity) => {
    const activityToSend = activity || get().currentActivity
    
    if (!activityToSend) {
      console.warn('📊 [ActivityStore] 没有活动数据可发送')
      return false
    }
    
    try {
      // 发送活动数据，指定 type 为 USER_ACTIVITY
      // WebSocketManager 会自动包装成 { type: "user_activity", timestamp, data } 格式
      const success = globalWebSocket.send(activityToSend, MessageType.USER_ACTIVITY)
      
      if (success) {
        console.log('📊 [ActivityStore] 活动数据已发送:', activityToSend)
      } else {
        console.warn('📊 [ActivityStore] 活动数据发送失败（可能已加入队列）')
      }
      
      return success
    } catch (error) {
      console.error('📊 [ActivityStore] 发送活动数据时出错:', error)
      return false
    }
  },
  
  /**
   * 设置自动发送开关
   * @param enabled 是否启用自动发送
   */
  setAutoSend: (enabled) => {
    set({ autoSend: enabled })
    console.log('📊 [ActivityStore] 自动发送已', enabled ? '启用' : '禁用')
  },
  
  /**
   * 更新进度（便捷方法）
   * @param progress 进度值
   * @param additionalData 额外的数据
   */
  updateProgress: (progress, additionalData = {}) => {
    const { currentActivity } = get()
    if (!currentActivity) {
      console.warn('📊 [ActivityStore] 没有当前活动，无法更新进度')
      return
    }
    
    // 根据活动类型更新不同的字段
    const updates: any = {
      ...additionalData,
      timestamp: Date.now(),
      status: ActivityStatus.UPDATE,
    }
    
    if (currentActivity.type === 'reading') {
      updates.progress = progress
    } else if (currentActivity.type === 'video') {
      updates.progress = progress
      if (currentActivity.duration) {
        updates.progressPercent = Math.round((progress / currentActivity.duration) * 100)
      }
    }
    
    get().updateActivity(updates)
  },
  
  /**
   * 退出当前活动（便捷方法）
   */
  exitCurrentActivity: () => {
    const { currentActivity } = get()
    if (!currentActivity) {
      console.warn('📊 [ActivityStore] 没有当前活动')
      return
    }
    
    // 发送退出状态
    get().updateActivity({
      status: ActivityStatus.EXIT,
      timestamp: Date.now(),
    })
    
    // 清除当前活动
    setTimeout(() => {
      get().clearActivity()
    }, 1000) // 延迟清除，确保退出消息已发送
  },
}))

/**
 * 导出便捷的访问方法
 */
export const activityStore = {
  getState: () => useActivityStore.getState(),
  setState: useActivityStore.setState,
  subscribe: useActivityStore.subscribe,
}

