import { post } from "./api"

/**
 * 同步课堂相关API服务
 * 100%还原UniApp项目 /src/service/classroom.ts
 */

// ==================== 类型定义 ====================

/** 科目列表请求参数 */
export interface SubjectListRequest {
  grade: string
  volume: string
}

/** 科目列表响应 */
export type SubjectListResponse = string[]

/** 版本列表请求参数 */
export interface VersionListRequest {
  grade: string
  volume: string
  subject: string
}

/** 版本列表响应 */
export type VersionListResponse = string[]

/** 课程资源请求参数 */
export interface CourseResourceRequest {
  grade: string
  semester: string
  subject: string
  version: string
  page: number
  page_size: number
}

/** 课程资源响应 */
export interface CourseResourceResponse {
  grouped_course_resources: GroupedCourseResource[]
  rspname: string
  introduction: string
  cover_v: string
  Referer_img: string
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
}

/** 分组课程资源 */
export interface GroupedCourseResource {
  group_index: number
  group_title: string
  lessons: Lesson[]
}

/** 课程 */
export interface Lesson {
  lesson_index: string
  course_name: string
  video_code: string
  duration: string
  record: string
  is_latest: boolean
}

/** 视频基本信息请求参数 */
export interface VideoBasicInfoRequest {
  video_code: string
}

/** 教师信息 */
export interface TeacherInfo {
  id: number
  name: string
  period: string
  grade: string
  subject: string
  education: string
  school: string
  introduction: string
}

/** 课程视频信息 */
export interface CourseVideo {
  rspid: string
  rsid: string
  catalog: string
  rsname: string
  imgurl: string
  rsindex: number
  rstime: number
  period: string
  teacher: string
  teacher_info: TeacherInfo
}

/** 视频信息响应 */
export interface CourseVideoInfoResponse {
  video_code: string
  album_code: string
  course_name: string
  video_url: string
  Referer_video: string
  Referer_img: string
  details_list: CourseVideo[]
}

/** 保存学习进度请求参数 */
export interface SaveStudyProgressRequest {
  video_code: string
  record: string
}

/** 保存学习进度响应 */
export interface SaveStudyProgressResponse {
  success: boolean
  message: string
}

// ==================== API方法 ====================

/**
 * 获取科目列表
 */
export async function getSubjectList(params: SubjectListRequest): Promise<SubjectListResponse> {
  return await post<SubjectListResponse>(
    "/AppStart/ProgramResources/query_grade_get_subject_list/",
    params
  )
}

/**
 * 获取版本列表
 */
export async function getVersionList(params: VersionListRequest): Promise<VersionListResponse> {
  return await post<VersionListResponse>(
    "/AppStart/ProgramResources/query_grade_get_subject_version_list/",
    params
  )
}

/**
 * 获取课程资源
 */
export async function getCourseResource(
  params: CourseResourceRequest
): Promise<CourseResourceResponse> {
  return await post<CourseResourceResponse>(
    "/AppStart/ProgramResources/conditional_query_course_resource/",
    params
  )
}

/**
 * 获取视频基本信息（播放链接）
 */
export async function getVideoBasicInfo(
  videoCode: string
): Promise<CourseVideoInfoResponse> {
  return await post<CourseVideoInfoResponse>(
    "/AppStart/ProgramResources/play_link_course_resource/",
    { video_code: videoCode }
  )
}

/**
 * 保存学习进度
 */
export async function saveStudyProgress(
  params: SaveStudyProgressRequest
): Promise<SaveStudyProgressResponse> {
  return await post<SaveStudyProgressResponse>(
    "/AppStart/ProgramResources/video_duration_recording/",
    params
  )
}

/**
 * 生成练习题
 */
export async function generatePracticeQuestions(params: {
  video_code: string
}): Promise<any> {
  return await post("/AppStart/ProgramResources/api_generate_practice_questions/", params)
}

