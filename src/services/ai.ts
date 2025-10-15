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

// ==================== 错题本相关接口 ====================

/**
 * 错题本数据响应类型
 */
export interface CorrectionRecordResponse {
  data: CorrectionRecordItem[]
}

export interface CorrectionRecordItem {
  /** 所有的已订正错题 */
  corrected_count: number
  /** 本周已订正的错题 */
  corrected_count_this_week: number
  /** 总错题次数 */
  incorrect_count: number
  /** 本周所有的错题 */
  incorrect_count_this_week: number
  /** 科目 */
  subject: string
  /** 本周未订正的错题 */
  this_week_uncorrected_count: number
  /** 高频错题列表 */
  top_error_questions: TopErrorQuestion[]
}

export interface TopErrorQuestion {
  /** 高频错题字段 */
  question_text: string
}

/**
 * 获取错题本数据
 */
export async function getCorrectionRecordResponse(): Promise<CorrectionRecordResponse> {
  return await post<CorrectionRecordResponse>("/AppStart/Protected/new_correction_record/", {})
}

/**
 * 错题列表查询参数
 */
export interface SubjectQuestionsParams {
  /** 学科名称 */
  subject: string
  /** 查询本周的数据true开启false关闭，默认关闭 */
  this_week_only?: boolean
  /** 倒序desc 正序asc */
  order_by_error_count?: string
  /** 查询是否订正：all/correct/unCorrect */
  is_corrected?: string
}

/**
 * 错题列表响应
 */
export interface SubjectQuestionsResponse {
  /** 总共有多少道题目 */
  count: number
  /** 学科 */
  subject: string
  /** 错题列表 */
  wrong_questions: WrongQuestion[]
}

/**
 * 错题详情
 */
export interface WrongQuestion {
  /** 正确选项 */
  correct_answer: string
  /** 解析 */
  explanation: string
  /** 题目的id */
  id: number
  /** 选项 - 支持多种格式：字符串数组、对象数组、或键值对对象 */
  options: string[] | QuestionOption[] | Record<string, string>
  /** 题目序号 */
  question_index: number | string
  /** 题目 */
  question_text: string
  /** 类型"课后练习来的题目"，"错题本转换" */
  question_type: string
  /** 学生答案 */
  student_answer: string
  /** 创建时间 */
  created_at: string
  /** 错误次数 */
  error_count: number
  /** 是否订正 */
  is_corrected?: string
}

/**
 * 题目选项
 */
export interface QuestionOption {
  /** 选项字母 A/B/C/D */
  letter: string
  /** 选项内容 */
  text: string
}

/**
 * 获取某个学科错题列表
 */
export async function getSubjectQuestions(
  params: SubjectQuestionsParams,
): Promise<SubjectQuestionsResponse> {
  return await post<SubjectQuestionsResponse>(
    "/AppStart/Protected/query_questionRecord_details/",
    params,
  )
}

/**
 * 错题拍照识别参数
 */
export interface WrongTransferSelectionParams {
  /** 图片UUID */
  imguuid: string
}

/**
 * 错题拍照识别返回数据
 */
export interface WrongTransferSelectionResponse {
  /** 识别出的错题列表 */
  questions: WrongQuestion[]
  /** 缓存ID */
  cache_id: string
}

/**
 * 错题拍照确认参数
 */
export interface WrongTransferConfirmParams {
  /** 图片UUID/批次ID */
  batch_id: string
  /** 选中的题目索引数组 */
  selected_indices: number[]
  /** 缓存ID */
  cache_id: string
}

/**
 * 错题拍照识别
 */
export async function getWrongTransferSelection(
  params: WrongTransferSelectionParams,
): Promise<WrongTransferSelectionResponse> {
  return await post<WrongTransferSelectionResponse>(
    "/AppStart/Protected/wrong_question_conversion/",
    params,
  )
}

/**
 * 错题拍照确认提交
 */
export async function confirmWrongTransfer(params: WrongTransferConfirmParams): Promise<any> {
  return await post("/AppStart/Protected/save_converted_question/", params)
}

/**
 * 举一反三参数
 */
export interface QuestionsMoreParams {
  /** 错题id */
  question_id: string
  /** 错题类型 */
  question_type: string
}

/**
 * 举一反三响应
 */
export interface QuestionsMoreResponse {
  /** 原始内容 */
  ai_response: string
  /** 题目数据 */
  data: {
    /** 题目总列表 */
    questions: any[]
    /** 科目 */
    subject: string
    /** 总共多少道题目 */
    total_questions: number
  }
  graded_at: string
  success: boolean
}

/**
 * 获取举一反三列表
 */
export async function getQuestionsMore(params: QuestionsMoreParams): Promise<QuestionsMoreResponse> {
  return await post<QuestionsMoreResponse>(
    "/AppStart/Protected/wrong_question_one_to_more/",
    params,
  )
}

/**
 * 获取课程练习题
 */
export async function getCourseQuestions(params: {
  video_code: string
}): Promise<QuestionsMoreResponse> {
  return await post<QuestionsMoreResponse>(
    "/AppStart/ProgramResources/query_practice_questionSet/",
    params,
  )
}

/**
 * 获取错题详情
 */
export async function getQuestionDetails(params: {
  question_id: string
  question_type: string
}): Promise<any> {
  return await post("/AppStart/Protected/wrong_question_details/", params)
}

/**
 * 作文收录记录分组
 */
export interface CompositionRecordDatum {
  /** 该月的记录列表 */
  records?: CompositionRecord[]
  /** 年月 */
  year_month?: string
}

/**
 * 作文收录单条记录
 */
export interface CompositionRecord {
  batch_id?: string
  /** 作文类型 */
  composition_type?: string
  /** 作文原始图片，多张的话只会取第一张 */
  cover_image?: string
  /** 那一天进行批改的时间 */
  created_at?: string
  /** id传入作文详情进行查询 */
  id?: number
  /** 分数 */
  rating?: string
}

/**
 * 获取作文收录记录列表
 */
export async function getCompositionCorrectionRecordList(): Promise<CompositionRecordDatum[]> {
  return await post<CompositionRecordDatum[]>(
    "/AppStart/Protected/composition_correction_record_list/",
    {},
  )
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
        timeout: 180000, // 180秒超时
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
