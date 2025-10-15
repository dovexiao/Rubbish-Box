import { create } from "zustand"

type PostureStatus =
  | "good"
  | "head_not_centered"
  | "head_not_up"
  | "shoulders_not_level"
  | "detecting"
  | "no_person"

interface RewardConfig {
  goodPostureCount: number // 正确坐姿时间阈值（秒）
  rewardPoints: number // 奖励积分
}

interface RewardNotificationData {
  message: string
  points: number
  duration?: number
}

interface PostureState {
  nowStatus: PostureStatus
  goodTime: number
  headTiltTime: number
  headDownTime: number
  shoulderTiltTime: number

  // 监测状态
  isMonitoring: boolean

  // 奖励配置
  rewardConfig: RewardConfig

  // 奖励通知状态
  showRewardModal: boolean
  rewardNotificationData: RewardNotificationData | null

  // 操作方法
  setStatus: (status: PostureStatus) => void
  incrementGoodTime: (seconds: number) => void
  incrementHeadTiltTime: (seconds: number) => void
  incrementHeadDownTime: (seconds: number) => void
  incrementShoulderTiltTime: (seconds: number) => void
  resetTimes: () => void

  // 监测控制
  startMonitoring: () => void
  stopMonitoring: () => void

  // 奖励配置
  setRewardConfig: (config: RewardConfig) => void

  // 奖励通知
  showRewardNotification: (data: RewardNotificationData) => void
  hideRewardNotification: () => void

  // 处理奖励事件
  handlePostureReward: () => Promise<boolean>

  // 更新统计数据
  updateDurations: (data: any) => void

  // 初始化坐姿监测
  initPoseMonitor: () => void
}

export const usePostureStore = create<PostureState>((set, get) => ({
  nowStatus: "detecting",
  goodTime: 0,
  headTiltTime: 0,
  headDownTime: 0,
  shoulderTiltTime: 0,

  // 监测状态
  isMonitoring: false,

  // 奖励配置
  rewardConfig: {
    goodPostureCount: 10 * 60, // 10分钟（600秒）
    rewardPoints: 1,
  },

  // 奖励通知状态
  showRewardModal: false,
  rewardNotificationData: null,

  setStatus: (status) => set({ nowStatus: status }),

  incrementGoodTime: (seconds) => set((state) => ({ goodTime: state.goodTime + seconds })),

  incrementHeadTiltTime: (seconds) =>
    set((state) => ({ headTiltTime: state.headTiltTime + seconds })),

  incrementHeadDownTime: (seconds) =>
    set((state) => ({ headDownTime: state.headDownTime + seconds })),

  incrementShoulderTiltTime: (seconds) =>
    set((state) => ({ shoulderTiltTime: state.shoulderTiltTime + seconds })),

  resetTimes: () =>
    set({
      goodTime: 0,
      headTiltTime: 0,
      headDownTime: 0,
      shoulderTiltTime: 0,
    }),

  // 监测控制
  startMonitoring: () => {
    console.log("开始坐姿监测")
    set({ isMonitoring: true })
  },

  stopMonitoring: () => {
    console.log("停止坐姿监测")
    set({ isMonitoring: false })
  },

  // 奖励配置
  setRewardConfig: (config) => {
    console.log("设置奖励配置:", config)
    set({ rewardConfig: config })
  },

  // 奖励通知
  showRewardNotification: (data) => {
    console.log("显示奖励通知:", data)
    set({
      showRewardModal: true,
      rewardNotificationData: data,
    })
  },

  hideRewardNotification: () => {
    console.log("隐藏奖励通知")
    set({
      showRewardModal: false,
      rewardNotificationData: null,
    })
  },

  // 处理奖励事件（100%还原UniApp逻辑）
  handlePostureReward: async (): Promise<boolean> => {
    try {
      console.log("处理坐姿奖励事件")

      // 这里应该调用积分添加接口
      // 暂时返回true，实际应该调用API
      // const success = await addPoints(get().rewardConfig.rewardPoints);
      const success = true // 模拟成功

      if (success) {
        console.log("积分添加成功")
        return true
      } else {
        console.error("积分添加失败")
        return false
      }
    } catch (error) {
      console.error("处理奖励失败:", error)
      return false
    }
  },

  // 更新统计数据（100%还原UniApp逻辑）
  updateDurations: (data: any) => {
    console.log("更新坐姿统计数据:", data)

    if (data.status) {
      // 根据状态更新对应的时间统计
      const state = get()
      switch (data.status) {
        case "good":
          set({ goodTime: state.goodTime + 1 })
          break
        case "head_tilted":
          set({ headTiltTime: state.headTiltTime + 1 })
          break
        case "head_not_up":
          set({ headDownTime: state.headDownTime + 1 })
          break
        case "shoulders_tilted":
          set({ shoulderTiltTime: state.shoulderTiltTime + 1 })
          break
      }
    }
  },

  // 初始化坐姿监测（100%还原UniApp逻辑）
  initPoseMonitor: () => {
    console.log("=== 初始化坐姿监测 ===")

    // 设置默认奖励配置
    const config = {
      goodPostureCount: 10 * 60, // 10分钟
      rewardPoints: 1,
    }

    get().setRewardConfig(config)
    console.log("坐姿监测初始化完成")
  },
}))
