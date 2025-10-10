/**
 * 学习相关API服务
 * 对应UniApp项目中的学习模块接口
 */

import { get, post } from './api'

/**
 * 学习数据接口
 */
export interface StudyData {
  totalTime: number        // 总学习时长(分钟)
  todayTime: number       // 今日学习时长(分钟)
  weekTime: number        // 本周学习时长(分钟)
  completedTasks: number  // 完成任务数
}

/**
 * 课程信息接口
 */
export interface Course {
  id: number
  title: string
  teacher: string
  students: number
  image: string
  progress: number
  description?: string
  duration?: number
  difficulty?: string
}

/**
 * 学习任务接口
 */
export interface StudyTask {
  id: number
  title: string
  type: string
  status: 'pending' | 'in_progress' | 'completed'
  deadline?: string
  progress: number
}

/**
 * 学习服务类
 */
export class StudyService {
  /**
   * 获取学习统计数据
   */
  static async getStudyStats(): Promise<StudyData> {
    try {
      const response = await get<StudyData>('/study/stats')
      return response
    } catch (error) {
      console.error('获取学习统计失败:', error)
      // 返回模拟数据
      return {
        totalTime: 1250,
        todayTime: 45,
        weekTime: 320,
        completedTasks: 8
      }
    }
  }

  /**
   * 获取推荐课程列表
   */
  static async getRecommendCourses(): Promise<Course[]> {
    try {
      const response = await get<Course[]>('/study/courses/recommend')
      return response
    } catch (error) {
      console.error('获取推荐课程失败:', error)
      // 返回模拟数据
      return [
        {
          id: 1,
          title: "数学基础训练",
          teacher: "张老师",
          students: 1234,
          image: "",
          progress: 75,
          description: "针对小学数学基础知识的系统训练",
          duration: 120,
          difficulty: "初级"
        },
        {
          id: 2,
          title: "语文阅读理解",
          teacher: "李老师",
          students: 987,
          image: "",
          progress: 60,
          description: "提升阅读理解能力的专项训练",
          duration: 90,
          difficulty: "中级"
        },
        {
          id: 3,
          title: "英语口语练习",
          teacher: "王老师",
          students: 756,
          image: "",
          progress: 45,
          description: "日常英语口语表达训练",
          duration: 60,
          difficulty: "初级"
        }
      ]
    }
  }

  /**
   * 获取学习任务列表
   */
  static async getStudyTasks(): Promise<StudyTask[]> {
    try {
      const response = await get<StudyTask[]>('/study/tasks')
      return response
    } catch (error) {
      console.error('获取学习任务失败:', error)
      return []
    }
  }

  /**
   * 开始学习任务
   */
  static async startTask(taskId: number): Promise<boolean> {
    try {
      await post('/study/tasks/start', { taskId })
      return true
    } catch (error) {
      console.error('开始学习任务失败:', error)
      return false
    }
  }

  /**
   * 完成学习任务
   */
  static async completeTask(taskId: number, result: any): Promise<boolean> {
    try {
      await post('/study/tasks/complete', { taskId, result })
      return true
    } catch (error) {
      console.error('完成学习任务失败:', error)
      return false
    }
  }

  /**
   * 获取课程详情
   */
  static async getCourseDetail(courseId: number): Promise<Course | null> {
    try {
      const response = await get<Course>(`/study/courses/${courseId}`)
      return response
    } catch (error) {
      console.error('获取课程详情失败:', error)
      return null
    }
  }

  /**
   * 加入课程
   */
  static async joinCourse(courseId: number): Promise<boolean> {
    try {
      await post('/study/courses/join', { courseId })
      return true
    } catch (error) {
      console.error('加入课程失败:', error)
      return false
    }
  }

  /**
   * 更新学习进度
   */
  static async updateProgress(courseId: number, progress: number): Promise<boolean> {
    try {
      await post('/study/progress/update', { courseId, progress })
      return true
    } catch (error) {
      console.error('更新学习进度失败:', error)
      return false
    }
  }

  /**
   * 获取学习报告
   */
  static async getStudyReport(timeRange: 'week' | 'month' | 'year' = 'week'): Promise<any> {
    try {
      const response = await get(`/study/report?range=${timeRange}`)
      return response
    } catch (error) {
      console.error('获取学习报告失败:', error)
      return null
    }
  }
}

export default StudyService
