import { post } from "./api"

/**
 * 个人中心相关API服务
 * 100%还原UniApp项目 /src/service/my.ts
 */

// ==================== 类型定义 ====================

/**
 * 勋章列表项
 */
export interface MedalList {
  /** 下载链接 */
  image_url: string
  /** 是否解锁 */
  is_unlocked: boolean
  /** 勋章对应的名称 */
  name: string
  /** 这个勋章对应的段位 */
  rank_required: string
  /** 这个勋章对应的等级 */
  required_level: number
}

/**
 * 勋章数据响应
 */
export interface BadgeResponse {
  /** 这个用户当前的学段 */
  current_rank: string
  /** 段位等级 */
  current_rank_level: number
  /** 详情列表 */
  medal_list: MedalList[]
  /** 一共多少个勋章 */
  total_medals: number
  /** 这个用户没有解锁的数量 */
  unlocked_count: number
}

/**
 * 今日错题数据
 */
export interface TodayQuestionData {
  /** 今日总错题数 */
  total_wrong_questions: number
  /** 今日已订正数 */
  total_corrected_questions: number
}

/**
 * 每日学习数据
 */
export interface DailyStudyData {
  /** 日期 */
  date: string
  /** 学习时长（分钟） */
  duration: number
}

/**
 * 学习数据响应
 */
export interface StudyDataResponse {
  /** 今日错题数据 */
  todayQuestions?: {
    total: number
    correct: number
  }
  /** 每日学习数据 */
  daily_data?: DailyStudyData[]
}

// ==================== API接口 ====================

/**
 * 获取用户勋章数据
 */
export async function getUserBadges(): Promise<BadgeResponse> {
  return await post<BadgeResponse>("/AppStart/Medal/get_medal_images/", {})
}

/**
 * 获取用户学习数据（最近7天）
 */
export async function getUserStudyData(): Promise<StudyDataResponse> {
  return await post<StudyDataResponse>(
    "/AppStart/UserInformation/get_last_seven_days_study_duration/",
    {},
  )
}

/**
 * 获取今日错题数据
 */
export async function getUserTodayQuestionData(): Promise<TodayQuestionData> {
  return await post<TodayQuestionData>(
    "/AppStart/TodayErrorQuestions/get_today_error_questions_stats/",
    {},
  )
}


