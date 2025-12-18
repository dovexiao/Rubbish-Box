import { create } from 'zustand'
import { useLockScreenStore } from './lockScreenStore'

/**
 * 设备状态接口
 */
export interface DeviceStatus {
  /** 是否已绑定 */
  bound: boolean
  /** 是否允许拖拽视频 */
  dragVideo: boolean
  /** 是否显示答案 */
  displayAnswer: boolean
  /** 是否立即锁屏 */
  lockScreenNow: boolean
}

/**
 * 设备状态 Store 接口
 */
interface DeviceStatusStore {
  /** 设备状态 */
  status: DeviceStatus | null
  
  /** 是否已初始化（是否已收到服务器推送的状态） */
  isInitialized: boolean
  
  /** 最后更新时间 */
  lastUpdatedAt: number | null
  
  // Actions
  /** 设置设备状态 */
  setStatus: (status: DeviceStatus) => void
  
  /** 更新部分状态 */
  updateStatus: (status: Partial<DeviceStatus>) => void
  
  /** 重置状态 */
  reset: () => void
}

/**
 * 设备状态管理 Store
 * 用于存储从 WebSocket 接收的设备状态信息
 */
export const useDeviceStatusStore = create<DeviceStatusStore>((set) => ({
  // 初始状态
  status: null,
  isInitialized: false,
  lastUpdatedAt: null,
  
  // Actions
  setStatus: (status) => {
    console.log('[DeviceStatusStore] 设置设备状态:', status)
    
    // 同步锁屏状态
    if (status.lockScreenNow !== undefined) {
      useLockScreenStore.getState().setLocked(status.lockScreenNow)
      console.log('[DeviceStatusStore] 同步锁屏状态:', status.lockScreenNow)
    }
    
    set({
      status,
      isInitialized: true,
      lastUpdatedAt: Date.now(),
    })
  },
  
  updateStatus: (statusUpdate) => {
    set((state) => {
      const newStatus = state.status 
        ? { ...state.status, ...statusUpdate }
        : statusUpdate as DeviceStatus
      
      console.log('[DeviceStatusStore] 更新设备状态:', statusUpdate)
      
      // 同步锁屏状态（如果 lockScreenNow 字段有更新）
      if (statusUpdate.lockScreenNow !== undefined) {
        useLockScreenStore.getState().setLocked(statusUpdate.lockScreenNow)
        console.log('[DeviceStatusStore] 同步锁屏状态:', statusUpdate.lockScreenNow)
      }
      
      return {
        status: newStatus,
        isInitialized: true,
        lastUpdatedAt: Date.now(),
      }
    })
  },
  
  reset: () => {
    console.log('[DeviceStatusStore] 重置设备状态')
    set({
      status: null,
      isInitialized: false,
      lastUpdatedAt: null,
    })
  },
}))

/**
 * 选择器：是否已绑定
 */
export const selectIsBound = (state: DeviceStatusStore) => 
  state.status?.bound ?? false

/**
 * 选择器：是否允许拖拽视频
 */
export const selectCanDragVideo = (state: DeviceStatusStore) => 
  state.status?.dragVideo ?? false

/**
 * 选择器：是否显示答案
 */
export const selectCanDisplayAnswer = (state: DeviceStatusStore) => 
  state.status?.displayAnswer ?? false
