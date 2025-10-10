import { post, get } from "./api"
import { OCR_TIMEOUT } from "../config/api"

/**
 * AI相关服务
 * 包含OCR识别、题目批改、作文批改等功能
 */

// ==================== 类型定义 ====================

export interface AiOcrRequest {
  imguuid: string
  type: string
}

export interface AiOcrResponse {
  original_image: { id: number; url: string }
  cropped_list: Array<any>
  cache_key?: string
  select?: string
  ai_response?: any
}

export interface GradingResult {
  question_index: number
  question_text: string
  user_answer: string
  correct_answer: string
  status: string
  feedback: string
}

export interface QuestionData {
  original_image: { url: string }
  grading_results: GradingResult[]
  total_questions: number
  completed_questions: number
  is_streaming: boolean
}

export interface ScienceData {
  id?: number
  typeid?: number
  category?: string
  title: string
  content: string
}

export interface WhysListResponse {
  whys_list: ScienceData[]
  total_count: number
  generated_at: string
  source: string
}

// 作文批改响应类型（完整版）
export interface AiResponse {
  /** 作文基本信息 */
  basicInfo?: BasicInfo
  /** 作文是中文还是英文 */
  compositionLanguage?: string
  /** 作文标题 */
  compositionTitle?: string
  /** 鼓励性评语 */
  encouragement?: string
  /** 评分标准详情 */
  gradingCriteria?: GradingCriteria
  /** 改进建议 */
  improvementSuggestions?: ImprovementSuggestions
  /** 识别出的原始作文内容 */
  originalText?: string
  /** 整体评价 */
  overallReview?: OverallReview
  /** 总体评分(0-100) */
  overallScore?: number
  /** 润色后的作文 */
  polishedComposition?: string
  /** 句子点评数组 */
  sentenceReview?: SentenceReview[]
  [property: string]: any
}

/** 作文基本信息 */
export interface BasicInfo {
  /** 作文类型分类 */
  compositionType?: string
  /** 核心主题描述 */
  coreTheme?: string
  /** 评分理由概述 */
  gradingReason?: string
  /** 字数统计 */
  wordCount?: number
  [property: string]: any
}

/** 评分标准详情 */
export interface GradingCriteria {
  /** 中心突出 */
  centerFocus?: GradingItem
  /** 思想健康 */
  healthyThought?: GradingItem
  /** 语言流畅 */
  languageFluency?: GradingItem
  /** 结构严谨 */
  structureRigor?: GradingItem
  /** 书写规范 */
  writingStandard?: GradingItem
  [property: string]: any
}

/** 评分项 */
export interface GradingItem {
  /** 等级评分(A,B,C) */
  grade: string
  /** 百分比得分 */
  percentage: string
  /** 评分理由说明 */
  reason: string
  [property: string]: any
}

/** 改进建议 */
export interface ImprovementSuggestions {
  /** 细节增强建议 */
  detailEnhancement?: string
  /** 语言润色建议 */
  languagePolishing?: LanguagePolishing[]
  /** 结构优化建议 */
  structureOptimization?: string
  [property: string]: any
}

/** 语言润色项 */
export interface LanguagePolishing {
  /** 改进后的句子 */
  improvedSentence: string
  /** 原始句子 */
  originalSentence: string
  [property: string]: any
}

/** 整体评价 */
export interface OverallReview {
  /** 作文亮点 */
  highlights?: string
  /** 整体评价总结 */
  summary?: string
  /** 改进建议 */
  weaknesses?: string
  [property: string]: any
}

/** 句子点评 */
export interface SentenceReview {
  /** 句子优点 */
  advantages: string
  /** 改进建议 */
  improvements: string
  /** 原始句子内容 */
  originalSentence: string
  /** 句子序号 */
  sentenceIndex?: number
  [property: string]: any
}

export interface CompositionDetails {
  id: number
  ai_response: AiResponse
}

// ==================== API方法 ====================

/**
 * AI OCR识别
 * OCR处理耗时较长，使用特殊的超时配置
 */
export async function aiOcr(data: AiOcrRequest): Promise<AiOcrResponse> {
  const axios = require("axios").default
  const { API_BASE_URL } = require("../config/api")
  const { useUserStore } = require("../stores/userStore")
  const { getDeviceInfoForAPI } = require("../utils/deviceInfo")
  
  const userStore = useUserStore.getState()
  const token = userStore.token || ""
  const deviceInfo = await getDeviceInfoForAPI()

  console.log("🎯 开始OCR识别...")
  console.log("📦 imguuid:", data.imguuid)
  console.log("📝 type:", data.type)

  const response = await axios.post(
    `${API_BASE_URL}/AppStart/Protected/ai_ocr/`,
    {
      ...data,
      ...deviceInfo,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      timeout: OCR_TIMEOUT, // 使用专门的OCR超时时间
    }
  )

  console.log("✅ OCR识别完成:", response.data)

  if (response.data.code === 200 || response.data.code === 201) {
    return response.data.data
  } else {
    throw new Error(response.data.message || "OCR识别失败")
  }
}

/**
 * 获取题目批改结果
 */
export async function getQuestion(params: { cache_key: string }): Promise<QuestionData> {
  return await post<QuestionData>("/AppStart/Protected/question_query/", params)
}

/**
 * 获取作文批改详情
 */
export async function getCompositionCorrectionRecordDetails(params: {
  id: number
}): Promise<CompositionDetails> {
  return await get<CompositionDetails>(
    "/AppStart/Protected/composition_correction_record_details/",
    params,
  )
}

/**
 * 获取科普知识列表
 */
export async function getWhysList(): Promise<WhysListResponse> {
  return await post<WhysListResponse>("/AppStart/UserInformation/whys_list/", {})
}

/**
 * 上传图片
 * @param formData - 包含图片文件的FormData
 * @param batchId - 批次ID（多张照片使用同一个）
 */
export async function uploadImage(
  formData: FormData,
  batchId?: string,
): Promise<{ batch_id: string; image_id: string }> {
  try {
    // 使用axios直接上传，因为需要设置 multipart/form-data
    const axios = require("axios").default
    const { API_BASE_URL } = require("../config/api")
    const { useUserStore } = require("../stores/userStore")
    
    const userStore = useUserStore.getState()
    const token = userStore.token || "" // 直接从 userStore.token 获取

    console.log("📤 开始上传图片...")
    console.log("🔑 Token:", token ? token.substring(0, 20) + "..." : "无")
    console.log("📦 BatchId:", batchId || "首次上传")

    const response = await axios.post(
      `${API_BASE_URL}/AppStart/Protected/image_upload/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": token ? `Bearer ${token}` : "",
        },
        timeout: 30000, // 30秒超时
      },
    )

    console.log("✅ 上传响应:", response.data)

    // 返回 response.data.data（根据后端API格式）
    if (response.data.code === 200 || response.data.code === 201) {
      return response.data.data
    } else {
      throw new Error(response.data.message || "上传失败")
    }
  } catch (error: any) {
    console.error("❌ 上传图片失败:", error)
    console.error("📄 错误详情:", error.response?.data)
    throw error
  }
}
