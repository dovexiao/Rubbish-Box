import { get, post } from "./api"
import { getDeviceCode } from "../utils/deviceInfo"

// 使用统一的API配置，无需单独配置拦截器

// 通知接口响应
export interface NotificationsResponse {
  generated_at: string
  notifications: Notification[]
  source: string
  /**
   * 全部的内容条数
   */
  total_count: number
}

export interface Notification {
  /**
   * 编号
   */
  id: number
  /**
   * 标题(内容)
   */
  title: string
}

// 排行榜响应接口
export interface RankResponse {
  /**
   * 当前用户排名(有学习记录才返回
   */
  current_user_ranking: number
  /**
   * 排行榜用户列表
   */
  ranking_list: RankingList[]
  /**
   * 总用户数
   */
  total_users: number
}

export interface RankingList {
  /**
   * 是否是当前用户
   */
  is_current_user: boolean
  /**
   * 用户排名
   */
  ranking: number
  /**
   * 总学习时长
   */
  total_duration: number
  /**
   * 用户名
   */
  username: string
}

// 最近学习视频接口
export const getLatestVideo = async () => {
  return await post("/AppStart/UserInformation/latest_video/")
}

// 获取通知接口
export const getNotifications = async (): Promise<NotificationsResponse> => {
  return await get("/AppStart/home/notifications")
}

// 获取排行榜接口
export const getHomeRanks = async (): Promise<RankResponse> => {
  return await post("/AppStart/UserRanking/home_ranking/")
}

// 保存用户坐姿数据
export interface SaveMointorDataParams {
  correct_sitting_posture_time: number
  head_tilt_time: number
  lowering_the_head_time: number
  shoulder_tilt_time: number
}

export const saveMointorData = async (params: SaveMointorDataParams) => {
  return await post("/AppStart/UserInformation/add_study_duration/", params)
}

// 添加积分接口（坐姿奖励）
export interface AddPointsParams {
  points: string // 积分数（字符串格式）
  devices: string // 设备唯一标识
}

export interface AddPointsResponse {
  success: boolean
  message?: string
  points?: number
}

/**
 * 添加积分接口
 * 100%还原 UniApp 逻辑
 */
export const addPoints = async (points: number): Promise<AddPointsResponse> => {
  try {
    // 获取设备唯一标识
    const deviceId = await getDeviceCode()
    
    console.log('📊 调用积分接口，设备ID:', deviceId, '积分:', points)
    
    const params: AddPointsParams = {
      points: points.toString(), // 转换为字符串
      devices: deviceId,
    }
    
    const response = await post<AddPointsResponse>('/AppStart/Protected/add_points/', params)
    
    console.log('✅ 积分接口调用成功:', response)
    
    return response
  } catch (error) {
    console.error('❌ 调用积分接口失败:', error)
    throw error
  }
}
