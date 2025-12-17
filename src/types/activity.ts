/**
 * 用户活动追踪类型定义
 * 用于实时向服务器传输用户在各个模块的使用情况
 */

/**
 * 活动类型枚举
 */
export enum ActivityType {
  READING = 'reading',           // 阅读
  VIDEO = 'video',               // 同步课堂视频
  HOMEWORK = 'homework',         // 批改作业
  COMPOSITION = 'composition',   // 批改作文
  ERROR_BOOK = 'error_book'      // 错题本
}

/**
 * 活动状态枚举
 */
export enum ActivityStatus {
  ENTER = 'enter',       // 进入
  UPDATE = 'update',     // 更新（进度更新）
  EXIT = 'exit'          // 退出
}

/**
 * 基础活动数据结构
 */
export interface BaseActivity {
  type: ActivityType              // 活动类型
  status: ActivityStatus          // 活动状态
  timestamp: number               // 时间戳
  userId?: string                 // 用户ID（可选，从store获取）
  deviceCode?: string             // 设备码（可选，从store获取）
}

/**
 * 阅读活动数据
 */
export interface ReadingActivity extends BaseActivity {
  type: ActivityType.READING
  bookId: string                  // 书本ID
  bookName?: string               // 书本名称
  progress: number                // 阅读进度 (0-100)
  currentPage?: number            // 当前页码
  totalPages?: number             // 总页数
  chapterId?: string              // 章节ID
  chapterName?: string            // 章节名称
}

/**
 * 视频活动数据
 */
export interface VideoActivity extends BaseActivity {
  type: ActivityType.VIDEO
  videoId: string                 // 视频ID
  videoName?: string              // 视频名称
  progress: number                // 播放进度 (秒)
  duration?: number               // 视频总时长 (秒)
  progressPercent?: number        // 进度百分比 (0-100)
  courseId?: string               // 课程ID
  courseName?: string             // 课程名称
}

/**
 * 作业活动数据
 */
export interface HomeworkActivity extends BaseActivity {
  type: ActivityType.HOMEWORK
  homeworkId: string              // 作业ID
  homeworkName?: string           // 作业名称
  subject?: string                // 科目
  questionCount?: number          // 题目数量
}

/**
 * 作文活动数据
 */
export interface CompositionActivity extends BaseActivity {
  type: ActivityType.COMPOSITION
  compositionId: string           // 作文ID
  compositionName?: string        // 作文名称
  wordCount?: number              // 字数
}

/**
 * 错题本活动数据
 */
export interface ErrorBookActivity extends BaseActivity {
  type: ActivityType.ERROR_BOOK
  questionId?: string             // 题目ID（可选）
  subject?: string                // 科目（可选）
  difficulty?: string             // 难度（可选）
}

/**
 * 活动数据联合类型
 */
export type Activity = 
  | ReadingActivity 
  | VideoActivity 
  | HomeworkActivity 
  | CompositionActivity 
  | ErrorBookActivity

/**
 * 创建阅读活动的参数
 */
export interface CreateReadingActivityParams {
  bookId: string
  bookName?: string
  progress?: number
  currentPage?: number
  totalPages?: number
  chapterId?: string
  chapterName?: string
}

/**
 * 创建视频活动的参数
 */
export interface CreateVideoActivityParams {
  videoId: string
  videoName?: string
  progress?: number
  duration?: number
  courseId?: string
  courseName?: string
}

/**
 * 创建作业活动的参数
 */
export interface CreateHomeworkActivityParams {
  homeworkId: string
  homeworkName?: string
  subject?: string
  questionCount?: number
}

/**
 * 创建作文活动的参数
 */
export interface CreateCompositionActivityParams {
  compositionId: string
  compositionName?: string
  wordCount?: number
}

/**
 * 创建错题本活动的参数
 */
export interface CreateErrorBookActivityParams {
  questionId?: string
  subject?: string
  difficulty?: string
}

/**
 * 更新进度的参数
 */
export interface UpdateProgressParams {
  progress: number
  [key: string]: any  // 允许其他自定义字段
}

