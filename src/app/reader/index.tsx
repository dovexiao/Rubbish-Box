import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native"
import { NavBar } from "../../components/NavBar"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"

import { StatusBar } from "../../components/StatusBar"
import { createStyles, rpx } from "../../utils/rpxStyleSheet"
import {
  getBookList,
  getBook,
  getBooksList,
  getRecommendBooks,
  getBookCategories,
  getBookDetail,
  getChapterDetail,
  updateReadingProgress,
  BookItem,
  BookListParams,
  RecommendData,
  CategoryData,
  BookDetailResponse,
  ChapterDetailResponse,
  UpdateProgressParams,
} from "../../services/reader"
import { SERVER_BASE_URL } from "../../config/env"
import { Images } from "../../constants/Assets"

/**
 * 小褐阅读 - 书籍列表页面
 * 100%还原UniApp reader/index.vue功能
 */
export default function ReaderIndex() {
  const router = useRouter()

  // 主要状态：推荐 or 分类
  const [currentTab, setCurrentTab] = useState<"recommend" | "category">("recommend")

  // 推荐内容状态
  const [recommendData, setRecommendData] = useState<RecommendData | null>(null)
  const [recommendLoading, setRecommendLoading] = useState(true)

  // 分类页面状态
  const [books, setBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  // 筛选状态（仅分类页面使用）
  const [activeSort, setActiveSort] = useState(0)
  const [activeCategory, setActiveCategory] = useState(0)
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [categoryNames, setCategoryNames] = useState<string[]>(["类型"])

  // 分页状态
  const [pageNum, setPageNum] = useState(1)
  const [pageSize] = useState(20)

  // 筛选选项
  const sorts = ["综合", "热门", "最新"]

  // 获取书籍封面图片
  const getBookCover = useCallback((book: any) => {
    if (book.cover_url) {
      if (book.cover_url.startsWith("/")) {
        return `${SERVER_BASE_URL}${book.cover_url}`
      }
      return book.cover_url
    } else if (book.cover_image && book.cover_image !== null) {
      if (book.cover_image.startsWith("/")) {
        return `${SERVER_BASE_URL}${book.cover_image}`
      }
      return book.cover_image
    }
    return Images.book1
  }, [])

  // 处理书籍点击
  const handleBookClick = useCallback(
    async (book: any) => {
      console.log(`📚 [阅读器] 用户点击书籍:`, {
        bookId: book.id,
        title: book.title,
      })

      if (!book.id) {
        console.log(`📚 [阅读器] ❌ 书籍信息不完整，缺少ID`)
        Alert.alert("提示", "书籍信息不完整")
        return
      }

      try {
        setLoading(true)

        // 直接跳转到epub页面，传递书籍ID
        router.push({
          pathname: "/reader/epub" as any,
          params: {
            bookId: book.id.toString(),
          },
        })
      } catch (error) {
        console.error("📚 [阅读器] ❌ 开始阅读失败:", error)
        Alert.alert("提示", "开始阅读失败，请重试")
      } finally {
        setLoading(false)
      }
    },
    [router],
  )

  // 获取分类列表
  const getCategories = useCallback(async () => {
    try {
      const response = await getBookCategories()
      console.log("📚 [API] 分类列表处理前:", response)

      // 修复：response 是整个响应，我们需要的是 response.data
      const categoryList = response || []

      const allCategories = [{ id: 0, name: "类型", book_count: 0 }, ...categoryList]
      setCategories(allCategories)
      setCategoryNames(allCategories.map((cat) => cat.name))

      console.log("📚 [API] 分类列表处理后:", allCategories)
    } catch (error) {
      console.error("获取分类列表失败:", error)
      setCategories([{ id: 0, name: "类型", book_count: 0 }])
      setCategoryNames(["类型"])
    }
  }, [])

  // 获取推荐书籍
  const getRecommendations = useCallback(async () => {
    try {
      setRecommendLoading(true)
      const data = await getRecommendBooks()
      setRecommendData(data)
      console.log("📚 [API] 推荐数据:", data)
    } catch (error) {
      console.error("获取推荐书籍失败:", error)
    } finally {
      setRecommendLoading(false)
    }
  }, [])

  // 获取书籍列表（仅分类页面使用）
  const getBooks = useCallback(
    async (isRefresh = false) => {
      if (loading && !isRefresh) return

      try {
        setLoading(true)

        const params: BookListParams = {
          page: isRefresh ? 1 : pageNum,
          page_size: pageSize,
          category_id: activeCategory === 0 ? undefined : categories[activeCategory]?.id,
        }

        console.log("📚 [API] 请求书籍列表参数:", params)
        const response = await getBooksList(params)
        console.log("📚 [API] 书籍列表响应:", response)

        if (isRefresh) {
          setBooks(response.results || [])
          setPageNum(2)
        } else {
          setBooks((prev) => [...prev, ...(response.results || [])])
          setPageNum((prev) => prev + 1)
        }

        setHasMore(response.total > response.page * response.page_size)
      } catch (error) {
        console.error("获取书籍列表失败:", error)
        Alert.alert("提示", "获取书籍失败，请重试")
      } finally {
        setLoading(false)
        setInitialLoading(false)
        setRefreshing(false)
      }
    },
    [loading, pageNum, pageSize, activeCategory, categories],
  )

  // 重置书籍列表
  const resetBookList = useCallback(() => {
    setBooks([])
    setPageNum(1)
    setHasMore(true)
  }, [])

  // 切换主标签
  const handleTabChange = useCallback(
    (tab: "recommend" | "category") => {
      setCurrentTab(tab)
      if (tab === "category" && books.length === 0) {
        // 第一次切换到分类页面时加载数据
        setTimeout(() => getBooks(true), 100)
      }
    },
    [books.length, getBooks],
  )

  // 排序切换处理
  const handleSortChange = useCallback(
    (idx: number) => {
      setActiveSort(idx)
      resetBookList()
      setTimeout(() => getBooks(true), 100)
    },
    [resetBookList, getBooks],
  )

  // 分类切换处理
  const handleCategoryChange = useCallback(
    (idx: number) => {
      setActiveCategory(idx)
      resetBookList()
      setTimeout(() => getBooks(true), 100)
    },
    [resetBookList, getBooks],
  )

  // 下拉刷新
  const onRefresh = useCallback(() => {
    setRefreshing(true)
    if (currentTab === "recommend") {
      getRecommendations()
    } else {
      resetBookList()
      setTimeout(() => getBooks(true), 100)
    }
  }, [currentTab, resetBookList, getBooks, getRecommendations])

  // 加载更多
  const loadMore = useCallback(() => {
    if (!loading && hasMore && currentTab === "category") {
      getBooks()
    }
  }, [loading, hasMore, getBooks, currentTab])

  // 渲染推荐书籍项
  const renderRecommendItem = useCallback(
    (book: any, index: number) => (
      <TouchableOpacity
        key={`${book.id}_${index}`}
        style={styles.recommendBookCard}
        onPress={() => handleBookClick(book)}
        activeOpacity={0.8}
      >
        <Image
          source={
            typeof getBookCover(book) === "string"
              ? { uri: getBookCover(book) as string }
              : getBookCover(book)
          }
          style={styles.recommendBookCover}
          resizeMode="cover"
        />
        <Text style={styles.recommendBookTitle} numberOfLines={1}>
          {book.title}
        </Text>
        <Text style={styles.recommendBookAuthor} numberOfLines={1}>
          {book.authors?.map((a: any) => a.name).join(", ") || ""}
        </Text>
        <Text style={styles.recommendBookCategory} numberOfLines={1}>
          连环漫画
        </Text>
      </TouchableOpacity>
    ),
    [getBookCover, handleBookClick],
  )

  // 渲染本周推荐
  const renderWeekHot = useCallback(() => {
    if (!recommendData?.week_hot || recommendData.week_hot.length === 0) return null

    const book = recommendData.week_hot[0]
    if (!book) return null

    return (
      <View style={styles.weekHotSection}>
        <TouchableOpacity
          style={styles.weekHotCard}
          onPress={() => handleBookClick(book)}
          activeOpacity={0.8}
        >
          <Image
            source={
              typeof getBookCover(book) === "string"
                ? { uri: getBookCover(book) as string }
                : getBookCover(book)
            }
            style={styles.weekHotCover}
            resizeMode="cover"
          />
          <View style={styles.weekHotInfo}>
            <Text style={styles.weekHotTitle} numberOfLines={2}>
              {book.title}
            </Text>
            <Text style={styles.weekHotDesc} numberOfLines={3}>
              故事围绕经典角色特展开，它因贪吃被带入超的时代广场...
            </Text>
            <View style={styles.badgeContainer}>
              <View style={styles.hotBadge}>
                <Text style={styles.hotBadgeText}>热门推荐</Text>
              </View>
              <View style={styles.classicBadge}>
                <Text style={styles.classicBadgeText}>经典绘本</Text>
              </View>
            </View>
          </View>
          <View style={styles.weekHotLabel}>
            <Text style={styles.weekHotLabelText}>本周必读</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }, [recommendData, getBookCover, handleBookClick])

  // 渲染经典书单推荐
  const renderClassicSection = useCallback(() => {
    if (!recommendData?.classic || recommendData.classic.length === 0) return null

    return (
      <View style={styles.recommendSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="star" size={rpx(16)} color="#FFD700" />
            <Text style={styles.sectionTitle}>经典书单推荐</Text>
          </View>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.recommendScroll}
        >
          {recommendData.classic.slice(0, 4).map((book, index) => renderRecommendItem(book, index))}
        </ScrollView>
      </View>
    )
  }, [recommendData, renderRecommendItem])

  // 渲染推荐页面
  const renderRecommendPage = useCallback(() => {
    if (recommendLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>加载推荐内容...</Text>
        </View>
      )
    }

    return (
      <ScrollView
        style={styles.recommendContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {renderWeekHot()}
        {renderClassicSection()}
      </ScrollView>
    )
  }, [recommendLoading, refreshing, onRefresh, renderWeekHot, renderClassicSection])

  // 渲染分类书籍项
  const renderBookItem = useCallback(
    ({ item }: { item: any }) => (
      <View style={styles.bookItemContainer}>
        <TouchableOpacity
          style={styles.bookItem}
          onPress={() => handleBookClick(item)}
          activeOpacity={0.8}
        >
          <Image
            source={
              typeof getBookCover(item) === "string"
                ? { uri: getBookCover(item) as string }
                : getBookCover(item)
            }
            style={styles.bookCover}
            resizeMode="cover"
          />
          <View style={styles.bookInfo}>
            <Text style={styles.bookTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.bookAuthor} numberOfLines={1}>
              {item.authors?.map((a: any) => a.name).join(", ") || ""}
            </Text>
            <Text style={styles.bookDesc} numberOfLines={2}>
              发动理科思维，破解案件真相
            </Text>
            <Text style={styles.bookCategory}>经典文学</Text>
          </View>
        </TouchableOpacity>
      </View>
    ),
    [getBookCover, handleBookClick],
  )

  // 渲染筛选按钮
  const renderFilterButton = useCallback(
    (items: string[], activeIndex: number, onPress: (index: number) => void, style: any) => (
      <View style={styles.filterRow}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[style, activeIndex === index && styles.filterButtonActive]}
            onPress={() => onPress(index)}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeIndex === index && styles.filterButtonTextActive,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    ),
    [],
  )

  // 网格布局的书籍项渲染
  const renderGridBookItem = useCallback(
    ({ item }: { item: any }) => (
      <TouchableOpacity
        style={styles.gridBookItem}
        onPress={() => handleBookClick(item)}
        activeOpacity={0.8}
      >
        <Image
          source={
            typeof getBookCover(item) === "string"
              ? { uri: getBookCover(item) as string }
              : getBookCover(item)
          }
          style={styles.gridBookCover}
          resizeMode="cover"
        />
        <Text style={styles.gridBookTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.gridBookAuthor} numberOfLines={1}>
          {item.authors?.map((a: any) => a.name).join(", ") || ""}
        </Text>
        <Text style={styles.gridBookCategory} numberOfLines={1}>
          {item.category || "经典文学"}
        </Text>
      </TouchableOpacity>
    ),
    [getBookCover, handleBookClick],
  )

  // 渲染分类页面
  const renderCategoryPage = useCallback(() => {
    return (
      <View style={styles.categoryPageContainer}>
        {/* 筛选条件 */}
        <View style={styles.filters}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {renderFilterButton(sorts, activeSort, handleSortChange, styles.sortButton)}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {renderFilterButton(
              categoryNames,
              activeCategory,
              handleCategoryChange,
              styles.categoryButton,
            )}
          </ScrollView>
        </View>

        {/* 书籍网格 */}
        <FlatList
          data={books}
          renderItem={renderGridBookItem}
          keyExtractor={(item, index) => `${item.id}_${index}`}
          numColumns={4}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContainer}
          onRefresh={onRefresh}
          refreshing={refreshing}
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() =>
            initialLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>加载中...</Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="book-outline" size={rpx(64)} color="#ccc" />
                <Text style={styles.emptyText}>暂无书籍内容</Text>
              </View>
            )
          }
        />
      </View>
    )
  }, [
    books,
    sorts,
    activeSort,
    handleSortChange,
    categoryNames,
    activeCategory,
    handleCategoryChange,
    renderFilterButton,
    renderGridBookItem,
    onRefresh,
    refreshing,
    loadMore,
    initialLoading,
  ])

  // 页面初始化
  useEffect(() => {
    getCategories()
    getRecommendations()
  }, [])

  return (
    <LinearGradient
      colors={["#93abff", "#e4f4ff", "#cdedff", "#ffffff"]}
      locations={[-0.1128, 0.1494, 0.8474, 1.0586]}
      style={styles.container}
    >
      <StatusBar />
      <NavBar title="小褐阅读" leftArrow onBackPress={() => router.navigate("/(tabs)/study")} />

      {/* 内容区域 */}
      <View style={styles.contentContainer}>
        {/* 左侧导航 */}
        <View style={styles.sideNav}>
          <TouchableOpacity
            style={[styles.navButton, currentTab === "recommend" && styles.activeNavButton]}
            onPress={() => handleTabChange("recommend")}
          >
            <Ionicons
              name="thumbs-up"
              size={rpx(24)}
              color={currentTab === "recommend" ? "#007AFF" : "#999"}
            />
            <Text style={[styles.navText, currentTab === "recommend" && styles.activeNavText]}>
              推荐
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, currentTab === "category" && styles.activeNavButton]}
            onPress={() => handleTabChange("category")}
          >
            <Ionicons
              name="grid"
              size={rpx(24)}
              color={currentTab === "category" ? "#007AFF" : "#999"}
            />
            <Text style={[styles.navText, currentTab === "category" && styles.activeNavText]}>
              分类
            </Text>
          </TouchableOpacity>
        </View>

        {/* 主内容区 */}
        <View style={styles.mainContent}>
          {currentTab === "recommend" ? renderRecommendPage() : renderCategoryPage()}
        </View>
      </View>
    </LinearGradient>
  )
}

const styles = createStyles({
  container: {
    flex: 1,
    width: "100%" as const,
    height: "100%" as const,
  },
  contentContainer: {
    flex: 1,
    flexDirection: "row" as const,
  },
  // 左侧导航样式
  sideNav: {
    width: rpx(80),
    backgroundColor: "rgba(255,255,255,0.5)",
    paddingVertical: 20,
    alignItems: "center" as const,
  },
  navButton: {
    alignItems: "center" as const,
    paddingVertical: 15,
    width: "100%" as const,
  },
  activeNavButton: {
    backgroundColor: "rgba(0,122,255,0.1)",
  },
  navText: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
  },
  activeNavText: {
    color: "#007AFF",
    fontWeight: "600" as const,
  },
  mainContent: {
    flex: 1,
  },
  // 推荐页面样式
  recommendContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  weekHotSection: {
    marginBottom: 20,
  },
  weekHotCard: {
    flexDirection: "row" as const,
    backgroundColor: "rgba(255, 193, 7, 0.8)",
    borderRadius: 12,
    padding: 15,
    position: "relative" as const,
  },
  weekHotCover: {
    width: 100,
    height: 140,
    borderRadius: 8,
  },
  weekHotInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "space-between" as const,
  },
  weekHotTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#333",
    marginBottom: 8,
  },
  weekHotDesc: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 15,
  },
  weekHotLabel: {
    position: "absolute" as const,
    top: 10,
    right: 10,
    backgroundColor: "#FF6B35",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  weekHotLabelText: {
    fontSize: 12,
    color: "#FFF",
    fontWeight: "bold" as const,
  },
  badgeContainer: {
    flexDirection: "row" as const,
    gap: 10,
  },
  hotBadge: {
    backgroundColor: "#FF5722",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  hotBadgeText: {
    fontSize: 10,
    color: "#FFF",
  },
  classicBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  classicBadgeText: {
    fontSize: 10,
    color: "#FFF",
  },
  recommendSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: 15,
  },
  sectionTitleContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: "#333",
  },
  recommendScroll: {
    flexDirection: "row" as const,
  },
  recommendBookCard: {
    width: 120,
    marginRight: 15,
  },
  recommendBookCover: {
    width: 120,
    height: 160,
    borderRadius: 8,
    marginBottom: 8,
  },
  recommendBookTitle: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#333",
    marginBottom: 4,
  },
  recommendBookAuthor: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  recommendBookCategory: {
    fontSize: 10,
    color: "#999",
  },
  // 分类页面样式
  categoryPageContainer: {
    flex: 1,
  },
  filters: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  filterScroll: {
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: "row" as const,
    gap: 10,
  },
  categoryLabel: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    marginTop: 10,
    paddingHorizontal: 20,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
    marginHorizontal: 5,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
    marginHorizontal: 5,
  },
  filterButtonActive: {
    backgroundColor: "#2196F3",
  },
  filterButtonText: {
    fontSize: 12,
    color: "#666",
  },
  filterButtonTextActive: {
    color: "#FFF",
  },
  // 网格布局
  gridContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  gridRow: {
    justifyContent: "space-between" as const,
    paddingHorizontal: 10,
  },
  gridBookItem: {
    width: "22%" as const, // 一行4个，留一点间距
    marginBottom: 20,
    alignItems: "center" as const,
  },
  gridBookCover: {
    width: "100%" as const,
    aspectRatio: 0.75,
    borderRadius: 8,
    marginBottom: 8,
  },
  gridBookTitle: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#333",
    textAlign: "center" as const,
    marginBottom: 4,
    width: "100%" as const,
  },
  gridBookAuthor: {
    fontSize: 12,
    color: "#666",
    textAlign: "center" as const,
    marginBottom: 2,
    width: "100%" as const,
  },
  gridBookCategory: {
    fontSize: 10,
    color: "#4CAF50",
    backgroundColor: "#E8F5E8",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: "center" as const,
  },
  // 列表布局（保留原来的样式以备不时之需）
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  bookItemContainer: {
    marginBottom: 15,
  },
  bookItem: {
    flexDirection: "row" as const,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 12,
    padding: 12,
  },
  bookCover: {
    width: 80,
    height: 120,
    borderRadius: 6,
  },
  bookInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between" as const,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#333",
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  bookDesc: {
    fontSize: 12,
    color: "#999",
    lineHeight: 18,
    marginBottom: 8,
  },
  bookCategory: {
    fontSize: 10,
    color: "#4CAF50",
    backgroundColor: "#E8F5E8",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: "flex-start" as const,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 14,
    color: "#999",
    marginTop: 10,
  },
  emptyContainer: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    marginTop: 16,
  },
})
