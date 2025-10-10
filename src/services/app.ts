import { create } from "apisauce"

// API基础配置
const api = create({
  baseURL: "https://api.example.com", // 替换为实际API地址
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
})

// 请求拦截器
api.addRequestTransform((request) => {
  // 从存储获取token
  const token = ""
  if (token) {
    request.headers["Authorization"] = `Bearer ${token}`
  }
})

// 响应拦截器
api.addResponseTransform((response) => {
  if (!response.ok) {
    throw response
  }
})

// 最近学习视频接口
export const getLatestVideo = async () => {
  try {
    // 模拟数据
    return {
      type: 1,
      rsid: "video001",
      rsname: "数学基础课程",
      rspname: "小学数学",
      record_time: 300,
      cover_v: "/static/images/book-1.png",
      referer_img: "",
    }
  } catch (error) {
    console.error("获取最近学习视频失败:", error)
    throw error
  }
}

// 获取通知接口
export const getNotifications = async () => {
  try {
    // 模拟数据
    return {
      notifications: [
        { id: 1, title: "欢迎使用XHTX学习助手!" },
        { id: 2, title: "新功能上线: AI智能批改作业" },
        { id: 3, title: "坐姿监测功能已开启，保护孩子健康" },
      ],
    }
  } catch (error) {
    console.error("获取通知失败:", error)
    throw error
  }
}

// 获取排行榜接口
export const getHomeRanks = async () => {
  try {
    // 模拟数据
    return {
      ranking_list: [
        { ranking: 1, username: "张三", total_duration: 120, is_current_user: false },
        { ranking: 2, username: "李四", total_duration: 100, is_current_user: true },
        { ranking: 3, username: "王五", total_duration: 80, is_current_user: false },
      ],
      total_users: 100,
      current_user_ranking: 2,
    }
  } catch (error) {
    console.error("获取排行榜失败:", error)
    throw error
  }
}

// 保存用户坐姿数据
export interface SaveMointorDataParams {
  correct_sitting_posture_time: number
  head_tilt_time: number
  lowering_the_head_time: number
  shoulder_tilt_time: number
}

export const saveMointorData = async (params: SaveMointorDataParams) => {
  try {
    // 模拟API调用
    return { success: true }
  } catch (error) {
    console.error("保存坐姿数据失败:", error)
    throw error
  }
}
