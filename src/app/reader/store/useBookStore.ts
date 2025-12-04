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
  isPaginated: boolean | undefined;
  pagesLength: number;
};

type Page = {
  id: string;
  order: string;
  content: string;
  chapterId: number; // 所属章节ID
};

type BookState = {
  bookId: number; // 书本ID
  bookCover: string; // 书本封面
  bookTitle: string; // 书本标题
  bookChapters: Chapter[]; // 书本章节
  bookReadProgress: number; // 从服务器获取的阅读进度（0-1）
  currentChapter: Chapter | null; // 当前阅读章节
  loadedChapters: Chapter[]; // 章节池：已加载的章节数组
  validationToken: string; // 校验码：用于防止异步操作污染状态
  validationCounter: number; // 校验码计数器
  setBookId: (bookId: number) => void;
  setBookCover: (cover: string) => void;
  setBookTitle: (title: string) => void;
  setBookChapters: (chapters: Chapter[]) => void;
  setBookReadProgress: (progress: number) => void;
  setCurrentChapter: (chapter: Chapter) => void;

  pages: Page[]; // 分页数据
  currentPageIndex: number; // 当前分页索引
  leftShowPageIndex: number; // 左书页展示分页索引
  rightShowPageIndex: number; // 右书页展示分页索引
  setPages: (pages: Page[]) => void;
  setCurrentPageIndex: (index: number) => void;
  setLeftShowPageIndex: (index: number) => void;
  setRightShowPageIndex: (index: number) => void;

  // 初始化书本详情，返回初始章节ID，根据阅读记录或第一章
  handleBookDetailInitialized: (bookId: number) => Promise<number>;
  // 加载章节内容
  loadChapterContent: (chapterId: number) => Promise<Chapter>;
  // 格式化章节内容
  formatChapterContent: (content: string) => string;
  // 页码化分页数据补齐为偶数个数
  paginatePages: (pages: string[], chapterId?: number) => Page[];
  // 将已加载章节池重置为仅包含 currentChapter
  resetLoadedChaptersToCurrent: () => void;
  // 初始化章节内容（设置 currentChapter 与章节池为 [currentChapter]）
  initializeChapterContent: (chapter: Chapter) => void;
  // 初始化章节分页相关数据
  initializeChapterPaginate: (pages: string[]) => void;
  // 向前扩容 pages
  prependPages: (chapter: Chapter, pages: string[], expectedToken?: string) => void;
  // 向后扩容 pages
  appendPages: (chapter: Chapter, pages: string[], expectedToken?: string) => void;
  // 翻到下一页
  turnNext: () => void;
  // 翻到上一页
  turnPrev: () => void;
  // 计算章节内阅读进度
  calculateChapterProgress: () => number | null;
};

const ensureEvenIndex = (index: number, listLength: number) => {
  if (listLength === 0) {
    return 0;
  }
  const maxEven = listLength % 2 === 0 ? listLength - 2 : listLength - 1;
  const clamped = Math.max(0, Math.min(index, Math.max(0, maxEven)));
  return clamped % 2 === 0 ? clamped : clamped - 1;
};

/**
 * 检测并提取 base64 图片
 * 如果内容只包含一个 base64 图片，返回 base64 字符串，否则返回 null
 */
const extractBase64Image = (content: string): string | null => {
  // 移除 script 和 style 标签
  const cleanedContent = content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  
  // 查找所有 img 标签
  const imgMatches = cleanedContent.match(/<img[^>]*>/gi);
  
  // 如果只有一个 img 标签
  if (imgMatches && imgMatches.length === 1) {
    const imgTag = imgMatches[0];
    
    // 提取 src 属性中的 base64 数据
    // 匹配 src="data:image/xxx;base64,xxxxx" 或 src='data:image/xxx;base64,xxxxx'
    // 使用非贪婪匹配，直到遇到引号结束
    const base64Match = imgTag.match(/src=["']data:image\/[^;]+;base64,([^"']+)["']/i);
    
    if (base64Match && base64Match[1]) {
      const base64String = base64Match[1];
      
      // 验证：移除这个 img 标签后，剩余内容应该基本为空（只包含空白字符和标签）
      const withoutImg = cleanedContent
        .replace(/<img[^>]*>/gi, "") // 移除 img 标签
        .replace(/<[^>]*>/g, "") // 移除所有其他 HTML 标签
        .replace(/\s+/g, " ") // 合并空白字符
        .trim();
      
      // 如果移除图片后内容为空或只有很少的文本，认为是纯图片章节
      // 允许一些标题文本（如"扉页"）和空白字符
      if (withoutImg.length < 50) {
        console.log(`📖 [EPUB阅读器] 🖼️ 检测到纯图片章节，base64 长度: ${base64String.length}`);
        return base64String;
      }
    }
  }
  
  return null;
};

/**
 * 生成校验码（方案四：混合方案）
 * 格式: timestamp-chapterId-counter-random
 * 使用36进制缩短长度，包含时间戳、章节ID、计数器和随机数
 */
const generateValidationToken = (
  currentChapterId: number | null,
  counter: number
): string => {
  const timestamp = Date.now().toString(36); // 时间戳转36进制（更短）
  const random = Math.random().toString(36).substring(2, 11); // 9位随机字符串
  const chapterId = currentChapterId?.toString(36) || '0'; // 章节ID转36进制
  const counterStr = counter.toString(36); // 计数器转36进制
  
  // 格式: timestamp-chapterId-counter-random
  return `${timestamp}-${chapterId}-${counterStr}-${random}`;
};

const useBookStore = create<BookState>((set, get) => ({
  bookId: -1,
  bookCover: '',
  bookTitle: '',
  bookChapters: [],
  bookReadProgress: 0,
  currentChapter: null,
  loadedChapters: [],
  validationToken: '', // 初始值为空
  validationCounter: 0, // 初始值为0
  setBookId: (bookId: number) => set({ bookId: bookId }),
  setBookCover: (cover: string) => set({ bookCover: cover }),
  setBookTitle: (title) => set({ bookTitle: title }),
  setBookChapters: (chapters) => set({ bookChapters: chapters }),
  setBookReadProgress: (progress) => set({ bookReadProgress: progress }),
  setCurrentChapter: (chapter) => set({ currentChapter: chapter }),

  pages: [],
  currentPageIndex: -1,
  leftShowPageIndex: -1,
  rightShowPageIndex: -1,
  setPages: (pages: Page[]) => set({ pages: pages }),
  setCurrentPageIndex: (index: number) => set({ currentPageIndex: index }),
  setLeftShowPageIndex: (index: number) => set({ leftShowPageIndex: index }),
  setRightShowPageIndex: (index: number) => set({ rightShowPageIndex: index }),

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
          isPaginated: undefined,
          pagesLength: 0,
        })),
        bookCover: bookDetail.cover_url ?? '',
      })

      console.log(`📖 [EPUB阅读器] 📚 书本详情初始化成功:`, {
        bookId: bookId,
        bookTitle: bookDetail.title ?? '',
        bookChapters: bookDetail.chapters,
        readingHistory: bookDetail.reading_history,
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
          const restoredChapter: Chapter = {
            id: lastChapter?.id ?? 0,
            title: lastChapter?.title ?? '',
            order: lastChapter?.order ?? 0,
            content: lastChapter?.content ?? '',
            isPaginated: false,
            pagesLength: 0,
          };
          set({
            bookReadProgress: lastProgress,
            currentChapter: restoredChapter,
          });
          return lastChapterId;
        } else {
          console.log(`📖 [EPUB阅读器] 📚 恢复阅读记录失败: 阅读章节不存在，从第一章开始`, {
            chapterId: lastChapterId,
          })
          const firstChapter: Chapter = {
            id: bookDetail.chapters[0]?.id ?? 0,
            title: bookDetail.chapters[0]?.title ?? '',
            order: bookDetail.chapters[0]?.order ?? 0,
            content: bookDetail.chapters[0]?.content ?? '',
            isPaginated: false,
            pagesLength: 0,
          };
          set({
            bookReadProgress: 0,
            currentChapter: firstChapter,
          });
          return bookDetail.chapters[0]?.id ?? -1;
        }
      } else if (bookDetail.chapters && bookDetail.chapters?.length > 0) {
        console.log(`📖 [EPUB阅读器] 📚 没有阅读记录，从第一章开始`);
        const firstChapter: Chapter = {
          id: bookDetail.chapters[0]?.id ?? 0,
          title: bookDetail.chapters[0]?.title ?? '',
          order: bookDetail.chapters[0]?.order ?? 0,
          content: bookDetail.chapters[0]?.content ?? '',
          isPaginated: false,
          pagesLength: 0,
        };
        set({
          bookReadProgress: 0,
          currentChapter: firstChapter,
        });
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

      // 检查是否只包含一个 base64 图片
      const base64Image = extractBase64Image(chapterDetail.content);
      
      if (base64Image) {
        console.log(`📖 [EPUB阅读器] 🖼️ 检测到纯图片章节，提取 base64 图片`);
        
        // 返回特殊处理的 chapter，content 为 base64 字符串
        const newChapter: Chapter = {
          id: chapterId,
          title: chapterDetail.title ?? '',
          order: chapterDetail.order ?? 0,
          content: base64Image, // 直接使用 base64 字符串
          isPaginated: false,
          pagesLength: 0,
        };
        
        return newChapter;
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
      
      const newChapter: Chapter = {
        id: chapterId,
        title: chapterDetail.title ?? '',
        order: chapterDetail.order ?? 0,
        content: processedContent,
        isPaginated: false,
        pagesLength: 0,
      };
      
      return newChapter;
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

  paginatePages: (pages: string[], chapterId?: number): Page[] => {
    const targetChapterId = chapterId ?? get().currentChapter?.id ?? 0;
    const paginatedPages = pages.map((page, index) => ({
      id: `page${targetChapterId}-${index}`,
      order: String(index+1).padStart(2, '0'), // 页码格式化, 两位数, 不足补0
      content: page,
      chapterId: targetChapterId, // 所属章节ID
    }));
    if (paginatedPages.length % 2 !== 0) {
      paginatedPages.push({
        id: `page${targetChapterId}-${paginatedPages.length}`,
        order: String(paginatedPages.length+1).padStart(2, '0'), // 页码格式化, 两位数, 不足补0
        content: '',
        chapterId: targetChapterId, // 所属章节ID
      });
    }
    return paginatedPages;
  },

  resetLoadedChaptersToCurrent: () => {
    const current = get().currentChapter;
    const newCounter = get().validationCounter + 1;
    const newToken = generateValidationToken(current?.id ?? null, newCounter);
    
    if (current) {
      set({ 
        loadedChapters: [current], 
        currentChapter: {
          ...current,
          isPaginated: false,
        },
        validationToken: newToken, // 刷新校验码
        validationCounter: newCounter,
      });
      console.log(`📖 [EPUB阅读器] 📚 重置章节池为当前章节:`, {
        chapterId: current.id,
        chapterTitle: current.title,
        validationToken: newToken,
      });
    } else {
      set({ 
        loadedChapters: [],
        validationToken: newToken, // 刷新校验码
        validationCounter: newCounter,
      });
      console.log('📖 [EPUB阅读器] 📚 重置章节池为空: 当前无章节', {
        validationToken: newToken,
      });
    }
  },
  
  initializeChapterContent: (chapter: Chapter) => {
    const newCounter = get().validationCounter + 1;
    const newToken = generateValidationToken(chapter.id, newCounter);
    
    set({
      currentChapter: chapter,
      loadedChapters: [chapter],
      validationToken: newToken, // 刷新校验码
      validationCounter: newCounter,
    });
    console.log(`📖 [EPUB阅读器] 📚 初始化章节内容:`, {
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      validationToken: newToken,
    });
  },
  
  initializeChapterPaginate: (pages: string[]) => {
    set({ pages: get().paginatePages(pages), currentChapter: { ...(get().currentChapter as Chapter), isPaginated: true, pagesLength: pages.length } });
    const targetPageIndex = Math.ceil(get().bookReadProgress * pages.length) - 1;
    const clampedIndex = Math.max(0, Math.min(targetPageIndex, pages.length - 1));
    const evenPageIndex = clampedIndex % 2 === 0 ? clampedIndex : clampedIndex - 1; // 双页模式，确保当前页序列是偶数序列（左页）
    set({ currentPageIndex: evenPageIndex, leftShowPageIndex: evenPageIndex, rightShowPageIndex: evenPageIndex + 1 });
    console.log(`📖 [EPUB阅读器] 📚 初始化章节分页:`, {
      pages: pages,
      currentPageIndex: evenPageIndex,
      leftShowPageIndex: evenPageIndex,
      rightShowPageIndex: evenPageIndex + 1,
      currentChapter: { ...(get().currentChapter as Chapter), isPaginated: true, pagesLength: pages.length },
    });
  },

  prependPages: (chapter: Chapter, pages: string[], expectedToken?: string) => {
    // 如果提供了校验码，进行验证
    if (expectedToken !== undefined) {
      const currentToken = get().validationToken;
      if (expectedToken !== currentToken) {
        console.log('📖 [EPUB阅读器] ⚠️ 校验码不匹配，取消 prependPages:', {
          expectedToken,
          currentToken,
          chapterId: chapter.id,
        });
        return;
      }
    }
    
    const newPages = get().paginatePages(pages, chapter.id);
    const offset = newPages.length;
    set({ 
      pages: [...newPages, ...get().pages],
      loadedChapters: [{...chapter, isPaginated: true}, ...get().loadedChapters],
      currentPageIndex: get().currentPageIndex + offset,
      leftShowPageIndex: get().leftShowPageIndex + offset,
      rightShowPageIndex: get().rightShowPageIndex + offset,
    });
  },
  
  appendPages: (chapter: Chapter, pages: string[], expectedToken?: string) => {
    // 如果提供了校验码，进行验证
    if (expectedToken !== undefined) {
      const currentToken = get().validationToken;
      if (expectedToken !== currentToken) {
        console.log('📖 [EPUB阅读器] ⚠️ 校验码不匹配，取消 appendPages:', {
          expectedToken,
          currentToken,
          chapterId: chapter.id,
        });
        return;
      }
    }
    
    const newPages = get().paginatePages(pages, chapter.id);
    set({ 
      pages: [...get().pages, ...newPages],
      loadedChapters: [...get().loadedChapters, {...chapter, isPaginated: true}],
    });
  },

  turnNext: () => {
    const next = get().currentPageIndex + 2;
    // 通过 currentPageIndex 找到对应的 page，获取章节ID并更新 currentChapter
    if (next >= 0 && next < get().pages.length) {
      const nextPage = get().pages[next];
      if (nextPage && nextPage.chapterId) {
        // 从章节池中查找对应的章节
        const chapter = get().loadedChapters.find(ch => ch.id === nextPage.chapterId);
        if (chapter) {
          console.log(`📖 [EPUB阅读器] 📚 翻到下一章:`, {
            chapterId: chapter.id,
            chapterTitle: chapter.title,
            leftShowPageIndex: next,
            rightShowPageIndex: next + 1,
          })
          set({
            currentPageIndex: next,
            leftShowPageIndex: next,
            rightShowPageIndex: next + 1,
            currentChapter: chapter,
          });
        }
      }
    }
  },

  turnPrev: () => {
    const prev = get().currentPageIndex - 2;
    if (prev >= 0 && prev < get().pages.length) {
      const prevPage = get().pages[prev];
      if (prevPage && prevPage.chapterId) {
        const chapter = get().loadedChapters.find(ch => ch.id === prevPage.chapterId);
        if (chapter) {
          console.log(`📖 [EPUB阅读器] 📚 翻到上一章:`, {
            chapterId: chapter.id,
            chapterTitle: chapter.title,
            leftShowPageIndex: prev,
            rightShowPageIndex: prev + 1,
          })
          set({
            currentPageIndex: prev,
            leftShowPageIndex: prev,
            rightShowPageIndex: prev + 1,
            currentChapter: chapter,
          });
        }
      }
    }
  },

  calculateChapterProgress: () => {
    const state = get();
    const currentPageIndex = state.currentPageIndex;
    const pages = state.pages;
    const currentChapter = state.currentChapter;
    const setBookReadProgress = state.setBookReadProgress;

    // 检查必要数据是否存在
    if (currentPageIndex < 0 || currentPageIndex >= pages.length) {
      console.warn(`📖 [EPUB阅读器] ⚠️ 当前页索引无效: ${currentPageIndex}`);
      return null;
    }

    const currentPage = pages[currentPageIndex];
    if (!currentPage) {
      console.warn(`📖 [EPUB阅读器] ⚠️ 当前页不存在: ${currentPageIndex}`);
      return null;
    }

    // 解析 page.id 获取序列值
    // page.id 格式: page${chapterId}-${index}
    const idMatch = currentPage.id.match(/^page\d+-(\d+)$/);
    if (!idMatch) {
      console.warn(`📖 [EPUB阅读器] ⚠️ 无法解析 page.id: ${currentPage.id}`);
      return null;
    }

    const pageSequence = parseInt(idMatch[1], 10);
    
    // 获取 currentChapter 的快照
    if (!currentChapter) {
      console.warn(`📖 [EPUB阅读器] ⚠️ 当前章节不存在`);
      return null;
    }

    // 获取该章节的分页数量
    const pagesLength = currentChapter.pagesLength;
    if (!pagesLength || pagesLength <= 0) {
      console.warn(`📖 [EPUB阅读器] ⚠️ 当前章节分页数量无效: ${pagesLength}`);
      return null;
    }

    // 计算进度: (序列值 + 1) / 分页数量
    const progress = (pageSequence + 1) / pagesLength;
    
    // 确保进度在 0-1 范围内
    const clampedProgress = Math.max(0, Math.min(1, progress));

    // 同步更新 bookReadProgress
    setBookReadProgress(clampedProgress);

    console.log(`📖 [EPUB阅读器] 📊 章节内阅读进度计算:`, {
      currentPageIndex,
      pageId: currentPage.id,
      pageSequence,
      pagesLength,
      progress: clampedProgress,
      progressPercent: `${Math.round(clampedProgress * 100)}%`,
    });

    return clampedProgress * 100;
  },
}));

export default useBookStore;

export const {
  handleBookDetailInitialized,
  loadChapterContent,
  formatChapterContent,
  paginatePages,
  initializeChapterPaginate,
  initializeChapterContent,
  resetLoadedChaptersToCurrent,
  prependPages,
  appendPages,
  turnNext,
  turnPrev,
  calculateChapterProgress,
} = useBookStore.getState();

export { Chapter };