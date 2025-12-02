import {create} from 'zustand';
import {
  getBookDetail,
  getChapterDetail,
  updateReadingProgress,
  BookDetailResponse,
  ChapterDetailResponse,
} from '../../../services/reader';
import { showInfo, showError } from '../../../utils/toast';

type Chapter = {
  id: number;
  title: string;
  order: number;
  content: string;
};

type Page = {
  id: string;
  order: string;
  content: string;
};

type BookState = {
  bookId: number; // 书本ID
  bookTitle: string; // 书本标题
  bookChapters: Chapter[]; // 书本章节
  bookReadProgress: number; // 从服务器获取的阅读进度（0-1）
  currentChapter: Chapter | null; // 当前阅读章节
  setBookId: (bookId: number) => void;
  setBookTitle: (title: string) => void;
  setBookChapters: (chapters: Chapter[]) => void;
  setBookReadProgress: (progress: number) => void;
  setCurrentChapter: (chapter: Chapter) => void;

  // 初始化书本详情
  handleBookDetailInitialized: (bookId: number) => Promise<number>;
  // 加载章节内容
  loadChapterContent: (chapterId: number) => Promise<void>;
  // 格式化章节内容
  formatChapterContent: (content: string) => string;
  // 页码化分页数据补齐为偶数个数
  paginatePages: (pages: string[]) => Page[];

  pages: Page[]; // 分页数据
  currentPageIndex: number; // 当前分页索引
  leftShowPageIndex: number; // 左书页展示分页索引
  rightShowPageIndex: number; // 右书页展示分页索引
  setPages: (pages: string[]) => void; // 设置中心（初始）分页数据
  setCurrentPageIndex: (index: number) => void;
  setLeftShowPageIndex: () => void;
  setRightShowPageIndex: () => void;
  resetShowPageIndex: () => void;

  turnNext: () => void;
  turnPrev: () => void;
};

const ensureEvenIndex = (index: number, listLength: number) => {
  if (listLength === 0) {
    return 0;
  }
  const maxEven = listLength % 2 === 0 ? listLength - 2 : listLength - 1;
  const clamped = Math.max(0, Math.min(index, Math.max(0, maxEven)));
  return clamped % 2 === 0 ? clamped : clamped - 1;
};

export const useBookStore = create<BookState>((set, get) => ({
  bookId: -1,
  bookTitle: '',
  bookChapters: [],
  bookReadProgress: 0,
  currentChapter: null,
  setBookId: (bookId: number) => set({ bookId: bookId }),
  setBookTitle: (title) => set({ bookTitle: title }),
  setBookChapters: (chapters) => set({ bookChapters: chapters }),
  setBookReadProgress: (progress) => set({ bookReadProgress: progress }),
  setCurrentChapter: (chapter) => set({ currentChapter: chapter }),

  handleBookDetailInitialized: async (bookId: number) => {
    try {
      set({ bookId: bookId });
      const bookDetail: BookDetailResponse = await getBookDetail(bookId);
    
      set({
        bookTitle: bookDetail.title ?? '',
        bookChapters: bookDetail.chapters.map((chapter: any) => ({
          id: chapter?.id ?? 0,
          title: chapter?.title ?? '',
          order: chapter?.order ?? 0,
          content: chapter?.content ?? '',
        })),
      })

      if (bookDetail.reading_history && bookDetail.chapters && bookDetail.chapters?.length > 0) {
        const lastChapterId = bookDetail.reading_history.chapter;
        const lastProgress = bookDetail.reading_history.progress || 0 // 0-1 的小数
        const lastChapter = bookDetail.chapters.find((chapter: any) => chapter.id === lastChapterId)
    
        console.log(`📖 [EPUB阅读器] 📚 恢复阅读记录:`, {
          chapterId: lastChapterId,
          chapterTitle: lastChapter?.title,
          progress: lastProgress,
          progressPercent: Math.round(lastProgress * 100) + '%',
        })

        if (lastChapter) {
          console.log(`📖 [EPUB阅读器] 📚 恢复阅读记录成功: 章节存在`);
          set({
            bookReadProgress: lastProgress,
            currentChapter: {
              id: lastChapter?.id ?? 0,
              title: lastChapter?.title ?? '',
              order: lastChapter?.order ?? 0,
              content: lastChapter?.content ?? '',
            },
          })
          return lastChapterId;
        } else {
          console.log(`📖 [EPUB阅读器] 📚 恢复阅读记录失败: 阅读章节不存在，从第一章开始`, {
            chapterId: lastChapterId,
          })
          set({
            bookReadProgress: 0,
            currentChapter: {
              id: bookDetail.chapters[0]?.id ?? 0,
              title: bookDetail.chapters[0]?.title ?? '',
              order: bookDetail.chapters[0]?.order ?? 0,
              content: bookDetail.chapters[0]?.content ?? '',
            },
          })
          return bookDetail.chapters[0]?.id ?? -1;
        }
      } else if (bookDetail.chapters && bookDetail.chapters?.length > 0) {
        console.log(`📖 [EPUB阅读器] 📚 没有阅读记录，从第一章开始`);
        set({
          bookReadProgress: 0,
          currentChapter: {
            id: bookDetail.chapters[0]?.id ?? 0,
            title: bookDetail.chapters[0]?.title ?? '',
            order: bookDetail.chapters[0]?.order ?? 0,
            content: bookDetail.chapters[0]?.content ?? '',
          },
        })
        return bookDetail.chapters[0]?.id ?? -1;
      }
      return -1;
    } catch (error: unknown) {
      throw error;
    }
  },

  loadChapterContent: async (chapterId: number) => {
    try {
      console.log(`📖 [EPUB阅读器] 🔄 开始加载章节内容，chapterId: ${chapterId}`)

      console.log(`📖 [EPUB阅读器] 🌐 从服务器获取章节内容`)
      const chapterDetail: ChapterDetailResponse = await getChapterDetail(chapterId);

      if (!chapterDetail || !chapterDetail.content) {
        throw new Error("章节内容为空")
      }

      // 处理HTML内容，提取纯文本
      let processedContent = chapterDetail.content
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "") // 移除script标签
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "") // 移除style标签
        .replace(/<img[^>]*>/gi, "[图片]") // 替换图片为占位符
        .replace(/<br\s*\/?>/gi, "\n") // br标签转换为换行
        .replace(/<\/p>/gi, "\n\n") // p标签结束转换为双换行
        .replace(/<[^>]*>/g, "") // 移除所有其他HTML标签
        .replace(/&#13;/g, "\n") // 替换HTML实体
        .replace(/&nbsp;/g, " ") // 替换空格实体
        .replace(/&lt;/g, "<") // 替换小于号实体
        .replace(/&gt;/g, ">") // 替换大于号实体
        .replace(/&amp;/g, "&") // 替换&实体
        .replace(/\n\s*\n\s*\n/g, "\n\n") // 合并多余的换行
        .trim()

      // 如果处理后内容为空，使用原始内容
      if (!processedContent) {
        processedContent = `第${chapterDetail.order}章 ${chapterDetail.title}\n\n章节内容加载中...`
      }

      console.log(
        `📖 [EPUB阅读器] ✅ 章节内容获取成功，处理后长度: ${processedContent.length} 字符`,
      )
      
      set({
        currentChapter: {
          id: chapterId,
          title: chapterDetail.title ?? '',
          order: chapterDetail.order ?? 0,
          content: processedContent,
        },
      })
    } catch (error: unknown) {
      throw error;
    }
  },

  formatChapterContent: (content: string): string => {
    const isHtml =
      content.includes("<!DOCTYPE html") || content.includes("<html") || content.includes("<body")

    let textContent = content

    if (isHtml) {
      const bodyMatch = content.match(/<body[^>]*>([\s\S]*)<\/body>/i)
      if (bodyMatch && bodyMatch[1]) {
        textContent = bodyMatch[1]
      }

      textContent = textContent
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
    }

    return textContent
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\n\s*\n/g, "\n")
      .replace(/^\s+|\s+$/g, "")
  },

  paginatePages: (pages: string[]): Page[] => {
    const paginatedPages = pages.map((page, index) => ({
      id: `page${get().currentChapter?.id ?? ''}-${index}`,
      order: String(index+1).padStart(2, '0'), // 页码格式化, 两位数, 不足补0
      content: page,
    }));
    if (paginatedPages.length % 2 !== 0) {
      paginatedPages.push({
        id: `page${get().currentChapter?.id ?? ''}-${paginatedPages.length}`,
        order: String(paginatedPages.length+1).padStart(2, '0'), // 页码格式化, 两位数, 不足补0
        content: '',
      });
    }
    return paginatedPages;
  },

  pages: [],
  currentPageIndex: -1,
  leftShowPageIndex: -1,
  rightShowPageIndex: -1,
  setPages: (pages: string[]) => {
    set({ pages: get().paginatePages(pages) });
    const targetPageIndex = Math.ceil(get().bookReadProgress * pages.length) - 1;
    const clampedIndex = Math.max(0, Math.min(targetPageIndex, pages.length - 1));
    const evenPageIndex = clampedIndex % 2 === 0 ? clampedIndex : clampedIndex - 1 // 双页模式，确保是偶数序列（左页）
    set({ currentPageIndex: evenPageIndex, leftShowPageIndex: evenPageIndex, rightShowPageIndex: evenPageIndex + 1 });
  },
  setCurrentPageIndex: (index: number) => set({ currentPageIndex: index }),
  setLeftShowPageIndex: () => set({ leftShowPageIndex: get().leftShowPageIndex - 2 }),
  setRightShowPageIndex: () => set({ rightShowPageIndex: get().rightShowPageIndex + 2 }),
  resetShowPageIndex: () => set({ leftShowPageIndex: get().currentPageIndex, rightShowPageIndex: get().currentPageIndex + 1 }),
  
  turnNext: () =>
    set(state => {
      // const next = ensureEvenIndex(state.currentPageIndex + 2, state.pages.length);
      const next = state.currentPageIndex + 2;
      return {currentPageIndex: next, leftShowPageIndex: next, rightShowPageIndex: next + 1};
    }),
  turnPrev: () =>
    set(state => {
      // const prev = ensureEvenIndex(state.currentPageIndex - 2, state.pages.length);
      const prev = state.currentPageIndex - 2;
      return {currentPageIndex: prev, leftShowPageIndex: prev, rightShowPageIndex: prev + 1};
    }),
}));