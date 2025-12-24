import { get, post } from "./api"
import { SERVER_BASE_URL } from "../config/env"

// 书籍列表参数
export interface BookListParams {
  page: number
  page_size: number
  category_id?: number
  sort?: string
}

// 书籍列表响应
export interface BookListResponse {
  count: number
  next: string | null
  previous: string | null
  results: BookItem[]
  page: number
  page_size: number
  total: number
}

// 书籍项
export interface BookItem {
  id: number
  title: string
  authors: Author[]
  cover_url: string
  description: string
  category: string
  tags: string[]
  created_at: string
}

// 作者信息
export interface Author {
  id: number
  name: string
}

// 分类数据
export interface CategoryData {
  id: number
  name: string
  book_count: number
}

// 推荐数据
export interface RecommendData {
  week_hot: WeekHot[]
  classic: Classic[]
  hot: Hot[]
  new_book: NewBook[]
  science: Science[]
}

export interface Classic {
  id: number
  title: string
  cover_url: string
  introduction?: string
  description?: string
  authors: ClassicAuthor[]
  categories: Category[]
}

export interface ClassicAuthor {
  id: number
  name: string
}

export interface Hot {
  id: number
  title: string
  cover_url: string
  introduction?: string
  description?: string
  authors: HotAuthor[]
  categories: Category[]
  view_count: number
}

export interface HotAuthor {
  id: number
  name: string
}

export interface NewBook {
  id: number
  title: string
  cover_url: string
  introduction?: string
  description?: string
  authors: NewBookAuthor[]
  categories: Category[]
  view_count: number
}

export interface NewBookAuthor {
  id: number
  name: string
}

export interface Science {
  id: number
  title: string
  cover_url: string
  introduction?: string
  description?: string
  authors: ScienceAuthor[]
  categories: Category[]
  view_count: number
}

export interface ScienceAuthor {
  id: number
  name: string
}

export interface Category {
  id: number
  name: string
}

export interface WeekHot {
  id: number
  title: string
  cover_url: string
  introduction: string
  description?: string
  categories: Category[]
  authors: WeekHotAuthor[]
}

export interface WeekHotAuthor {
  id: number
  name: string
}

// 书籍详情接口
export interface BookDetailResponse {
  authors: DataAuthor[]
  categories: string[]
  chapters: Chapter[]
  cover_url: string
  created_at: string
  description: null
  id: number
  reading_history: ReadingHistory
  title: string
  [property: string]: any
}

export interface DataAuthor {
  id?: number
  name?: string
  [property: string]: any
}

export interface Chapter {
  /**
   * 将此id传入获取单张内容即可获得该章节对应的文字内容，此列表也可以展示图书
   */
  id: number
  order: number
  title: string
  [property: string]: any
}

/**
 * 阅读历史
 */
export interface ReadingHistory {
  /**
   * 作者相关的内容，暂时无用
   */
  book: Book
  /**
   * 章节id
   */
  chapter: number
  /**
   * 章节名称
   */
  chapter_title: string
  id: number
  last_read_at: string
  /**
   * 具体读到那个地方
   */
  progress: number
  [property: string]: any
}

/**
 * 作者相关的内容，暂时无用
 */
export interface Book {
  authors: BookAuthor[]
  cover_url: string
  created_at: string
  description: null
  id: number
  title: string
  [property: string]: any
}

export interface BookAuthor {
  id?: number
  name?: string
  [property: string]: any
}

// 章节详情接口
export interface ChapterDetailResponse {
  content: string
  id: number
  order: number
  title: string
  [property: string]: any
}

// 更新阅读进度接口
export interface UpdateProgressParams {
  book_id: number
  chapter_id: number
  progress: number // 阅读进度 (0-1)
}

export interface UpdateProgressResponse {
  success: boolean
  message: string
  progress: number
  read_time: number
}

/**
 * 获取书籍列表
 * @param params 请求参数
 * @returns 书籍列表
 */
export async function getBooksList(params: BookListParams): Promise<BookListResponse> {
  try {
    console.log("📚 [API] 请求书籍列表参数:", params)

    const response = await post("/AppStart/books/books/list/", params)
    // console.log("📚 [API] 书籍列表响应:", response)

    return response
  } catch (error) {
    console.error("获取书籍列表失败:", error)
    throw error
  }
}

/**
 * 获取推荐书籍
 * @returns 推荐书籍数据
 */
export async function getRecommendBooks(): Promise<RecommendData> {
  try {
    const response = await post("/AppStart/books/books/recommend/", {})
    // console.log("📚 [API] 推荐书籍响应:", response)

    return response
  } catch (error) {
    console.error("获取推荐书籍失败:", error)
    throw error
  }
}

/**
 * 获取书籍分类
 * @returns 分类列表
 */
export async function getBookCategories(): Promise<CategoryData[]> {
  try {
    const response = await post("/AppStart/books/books/category/", {})
    // console.log("📚 [API] 书籍分类列表响应:", response)

    return response
  } catch (error) {
    console.error("获取书籍分类失败:", error)
    throw error
  }
}

/**
 * 获取单章内容
 * @param chapterId 章节ID
 * @returns 章节详情信息
 */
export async function getChapterDetail(chapterId: string | number): Promise<ChapterDetailResponse> {
  try {
    // console.log(`📚 [API] 获取章节详情: ${chapterId}`)

    const response = await post("/AppStart/books/chapters/details_detail/", {
      chapter_id: chapterId,
    })
    // console.log("📚 [API] 章节详情响应:", response)

    return response
  } catch (error) {
    console.error("获取章节详情失败:", error)
    throw error
  }
}

/**
 * 更新阅读进度
 * @param params 更新进度参数
 * @returns 更新结果
 */
export async function updateReadingProgress(
  params: UpdateProgressParams,
): Promise<UpdateProgressResponse> {
  try {
    console.log(`📚 [API] 更新阅读进度:`, params)

    const response = await post("/AppStart/books/reading-history/update_progress/", params)
    // console.log("📚 [API] 更新阅读进度响应:", response)

    return response.data
  } catch (error) {
    console.error("更新阅读进度失败:", error)
    throw error
  }
}

/**
 * 兼容旧版API - 获取书籍列表
 * @deprecated 使用 getBooksList 代替
 */
export async function getBookList(params: any = {}): Promise<any> {
  try {
    // 调用新API并转换响应格式
    const response = await getBooksList({
      page: params.page || 1,
      page_size: params.pageSize || 20,
      category_id: params.category_id,
      sort: params.sort,
    })

    // 转换为旧格式
    return {
      books: response.results,
      total: response.total,
      page: response.page,
    }
  } catch (error) {
    console.error("获取书籍列表失败:", error)
    throw error
  }
}

/**
 * 获取书籍详情
 * @param bookId 书籍ID
 * @returns 书籍详情信息
 */
export async function getBookDetail(bookId: string | number): Promise<BookDetailResponse> {
  try {
    console.log(`📚 [API] 获取书籍详情: ${bookId}`)

    const response = await post("/AppStart/books/books/detail/", {
      book_id: bookId,
    })
    // console.log("📚 [API] 书籍详情响应:", response)

    // 返回数据在 response.data.data 中
    return response
  } catch (error) {
    console.error("获取书籍详情失败:", error)
    throw error
  }
}
