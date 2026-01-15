import { useState, useEffect, useCallback, useMemo } from "react"
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  InteractionManager,
  Pressable,
} from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"

import { StatusBar } from "../../components/StatusBar"
import { showWarning, showError } from "../../utils/toast"
import { createStyles, rpx } from "../../utils/rpxStyleSheet"
import {
  getBooksList,
  getRecommendBooks,
  getBookCategories,
  BookListParams,
  RecommendData,
  CategoryData,
} from "../../services/reader"
import { SERVER_BASE_URL } from "../../config/env"
import { Images } from "../../constants/Assets"
import { useParallelPreload } from "../../hooks/usePagePreload"
import { useThrottle } from "../../hooks/useThrottle"

// 导航图标图片
const NAV_IMAGES = {
  recommend: require("../../../assets/images/reader-tab-recommend.png"),
  recommendActive: require("../../../assets/images/reader-tab-recommend-active.png"),
  category: require("../../../assets/images/reader-tab-class.png"),
  categoryActive: require("../../../assets/images/reader-tab-class-active.png"),
  weekHotIcon: require("../../../assets/images/reader-recommend-week.png"),
  readerRecommend: require("../../../assets/images/reader-recommend.png"),
  mustRead: require("../../../assets/images/must-read-week.png"),
  readerRinkNew: require("../../../assets/images/reader-rank-new.png"),
  readerRinkScience: require("../../../assets/images/reader-rank-science.png"),
  readerRinkHot: require("../../../assets/images/reader-rank-hot.png"),
}

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
  const [categoryLoading, setCategoryLoading] = useState(false) // 分类切换加载状态
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
  // const sorts = ["综合", "热门", "最新"]

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
      // console.log(`📚 [阅读器] 用户点击书籍:`, {
      //   bookId: book.id,
      //   title: book.title,
      // })

      if (!book.id) {
        console.log(`📚 [阅读器] ❌ 书籍信息不完整，缺少ID`)
        showWarning("书籍信息不完整")
        return
      }

      try {
        setLoading(true)

        // 直接跳转到epub页面，传递书籍ID
        router.push({
          // pathname: "/reader/epub" as any,
          pathname: "/reader/epub-new" as any,
          params: {
            bookId: book.id.toString(),
          },
        })
      } catch (error) {
        console.error("📚 [阅读器] ❌ 开始阅读失败:", error)
        showError("开始阅读失败，请重试")
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
      // console.log("📚 [API] 分类列表处理前:", response)

      // 修复：response 是整个响应，我们需要的是 response.data
      const categoryList = response || []

      const allCategories = [{ id: 0, name: "类型", book_count: 0 }, ...categoryList]
      setCategories(allCategories)
      setCategoryNames(allCategories.map((cat) => cat.name))

      // console.log("📚 [API] 分类列表处理后:", allCategories)
      return allCategories
    } catch (error) {
      console.error("获取分类列表失败:", error)
      setCategories([{ id: 0, name: "类型", book_count: 0 }])
      setCategoryNames(["类型"])
      throw error
    }
  }, [])

  // 获取推荐书籍
  const getRecommendations = useCallback(async () => {
    try {
      setRecommendLoading(true)
      const data = await getRecommendBooks()
      setRecommendData(data)
      // console.log("📚 [API] 推荐数据:", data)
      return data
    } catch (error) {
      console.error("获取推荐书籍失败:", error)
      throw error
    } finally {
      setRecommendLoading(false)
      setRefreshing(false)
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

        // console.log("📚 [API] 请求书籍列表参数:", params)
        const response = await getBooksList(params)
        // console.log("📚 [API] 书籍列表响应:", response)

        // response.results = response.results.slice(0, 5)

        // 补齐到4的倍数
        const padToMultipleOf4 = (arr: any[]) => {
          if (!arr || arr.length === 0) return []
          const remainder = arr.length % 4
          if (remainder === 0) return arr
          const paddingCount = 4 - remainder
          return [...arr, ...Array(paddingCount).fill(null)]
        }

        const paddedResults = padToMultipleOf4(response.results || [])

        if (isRefresh) {
          setBooks(paddedResults)
          setPageNum(2)
        } else {
          setBooks((prev) => {
            // 移除之前的占位项，然后添加新数据并补齐
            const prevWithoutPlaceholders = prev.filter(item => item !== null)
            const newList = [...prevWithoutPlaceholders, ...(response.results || [])]
            return padToMultipleOf4(newList)
          })
          setPageNum((prev) => prev + 1)
        }

        setHasMore(response.total > response.page * response.page_size)
      } catch (error) {
        console.error("获取书籍列表失败:", error)
        showError("获取失败，请重试")
      } finally {
        setLoading(false)
        if (isRefresh) {
          setCategoryLoading(false) // 分类切换加载完成
        }
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
        // 使用 InteractionManager 延迟加载，确保UI先响应
        InteractionManager.runAfterInteractions(() => {
          getBooks(true)
        })
      }
    },
    [books.length, getBooks],
  )

  // 排序切换处理
  const handleSortChange = useCallback(
    (idx: number) => {
      setActiveSort(idx)
      resetBookList()
      InteractionManager.runAfterInteractions(() => {
        getBooks(true)
      })
    },
    [resetBookList, getBooks],
  )

  // 分类切换处理
  const handleCategoryChange = useCallback(
    (idx: number) => {
      setActiveCategory(idx)
      setCategoryLoading(true) // 开始分类切换加载
      resetBookList()
      InteractionManager.runAfterInteractions(() => {
        getBooks(true)
      })
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
          {book.title || ""}
        </Text>
        <View style={styles.recommendBookTags}>
          <Text style={styles.recommendBookTag}> {book.categories.map((category: any) => category.name).join(", ")}</Text>
        </View>
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
        {/* 本周必读标签 */}
        <Image
          source={NAV_IMAGES.mustRead}
          style={styles.weekHotMustRead}
          resizeMode="contain"
        />
        <TouchableOpacity
          style={styles.weekHotCard}
          onPress={() => handleBookClick(book)}
          activeOpacity={0.8}
        >
          {/* 背景装饰图案 */}
          <Image
            source={
              typeof getBookCover(book) === "string"
                ? { uri: getBookCover(book) as string }
                : getBookCover(book)
            }
            style={styles.weekHotBackground}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["#FFCA43", "#FFCA43", "rgba(255, 255, 255, 0)"]}
            style={styles.weekHotcolorBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
          {/* 标题在卡片内部 */}
          <Image
            source={NAV_IMAGES.weekHotIcon}
            style={styles.weekHotIcon}
            resizeMode="contain"
          />
          {/* 主要内容 */}
          <View style={styles.weekHotContent}>
            <View style={styles.weekHotLeft}>
              <Image
                source={
                  typeof getBookCover(book) === "string"
                    ? { uri: getBookCover(book) as string }
                    : getBookCover(book)
                }
                style={styles.weekHotCover}
                resizeMode="cover"
              />
            </View>
            <View style={styles.weekHotRight}>
              <Text style={styles.weekHotTitle} numberOfLines={2} ellipsizeMode="tail">
                {book.title}
              </Text>
              <Text style={styles.weekHotDesc} numberOfLines={2} ellipsizeMode="tail">
                {book.introduction}
              </Text>
              <View style={styles.badgeContainer}>
                {[...book.categories].map((category: any) => (
                  <View key={category.id} style={styles.hotBadge}>
                    <Text style={styles.hotBadgeText}>
                      {category.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    )
  }, [recommendData, getBookCover, handleBookClick])

  // 渲染经典书单推荐
  const renderClassicSection = useCallback(() => {
    if (!recommendData?.classic || recommendData.classic.length === 0) return null

    return (
      <View style={styles.classicSection}>
        <LinearGradient
          colors={['#c2d9fb54', '#0468ff54']}
          locations={[0.6877, 1.0219]}
          start={{ x: 1, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={styles.classicCard}
        >
          {/* 标题在卡片内部 */}
          <Image
            source={NAV_IMAGES.readerRecommend}
            style={styles.classicTitle}
            resizeMode="contain"
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.recommendScroll}
            contentContainerStyle={styles.recommendScrollContent}
          >
            {recommendData.classic.slice(0, 4).map((book, index) => renderRecommendItem(book, index))}
          </ScrollView>
        </LinearGradient>
      </View>
    )
  }, [recommendData, renderRecommendItem])

  // 渲染三个榜单卡片
  const renderRankingCards = useCallback(() => {
    if (!recommendData) return null

    const rankings = [
      {
        title: "新书榜",
        color: "#B6E3FF",
        books: recommendData.new_book || [],
        iconUrl: NAV_IMAGES.readerRinkNew,
        iconStyle: { opacity: 0.3 }
      },
      {
        title: "科普榜",
        color: "#DAFFDA",
        books: recommendData.science || [],
        iconUrl: NAV_IMAGES.readerRinkScience,
        iconStyle: { opacity: 0.3 }
      },
      {
        title: "热度榜",
        color: "#F1BBFF",
        books: recommendData.hot || [],
        iconUrl: NAV_IMAGES.readerRinkHot,
        iconStyle: { opacity: 0.3 }
      }
    ]

    return (
      <View style={styles.rankingSection}>
        {rankings.map((ranking, index) => (
          <View key={index} style={[styles.rankingCard, { backgroundColor: ranking.color }]}>
            <Image
              source={ranking.iconUrl}
              style={styles.rankingTitleIcon}
              resizeMode="contain"
            />
            {/* 标题区域，带背景水印 */}
            <View style={styles.rankingTitleContainer}>
              <Text style={styles.rankingTitle}>{ranking.title}</Text>
            </View>

            {/* 书籍列表 */}
            <View style={styles.rankingBookList}>
              {ranking.books.slice(0, 3).map((book, bookIndex) => (
                <TouchableOpacity
                  key={book.id}
                  style={styles.rankingBookItem}
                  onPress={() => handleBookClick(book)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.rankingBookNumber}>{bookIndex + 1}</Text>
                  <Image
                    source={
                      typeof getBookCover(book) === "string"
                        ? { uri: getBookCover(book) as string }
                        : getBookCover(book)
                    }
                    style={styles.rankingBookCover}
                    resizeMode="cover"
                  />
                  <View style={styles.rankingBookInfo}>
                    <View>
                      <Text style={styles.rankingBookTitle} numberOfLines={1}>
                        {book.title}
                      </Text>
                      <Text style={styles.rankingBookDesc} numberOfLines={2}>
                        {book.introduction || "暂无简介"}
                      </Text>
                    </View>
                    <View style={styles.rankingBookStats}>
                      <Ionicons name="flame" size={rpx(6.15625)} color="#FF5722" />
                      <Text style={styles.rankingBookViews}>{book.view_count}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>
    )
  }, [recommendData, getBookCover, handleBookClick])

  const renderEducateSection = useCallback(() => { }, [])

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
        style={styles.recommendScrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.recommendContainer}>
          {/* 本周必读和经典书单推荐在同一行 */}
          <View style={styles.topSection}>
            <View style={styles.weekHotContainer}>
              {renderWeekHot()}
            </View>
            <View style={styles.classicContainer}>
              {renderClassicSection()}
            </View>
          </View>
          {renderRankingCards()}
          <View style={{ height: rpx(7.8125) }} />
        </View>
      </ScrollView>
    )
  }, [recommendLoading, refreshing, onRefresh, renderWeekHot, renderClassicSection, renderRankingCards])

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
    ({ item }: { item: any }) => {
      // 如果是占位项（null），返回空 View 占位
      if (item === null) {
        return <View style={styles.gridBookItem} />
      }

      return (
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
          <View style={styles.gridBookInfo}>
            <View>
              <Text style={styles.gridBookTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.gridBookAuthor} numberOfLines={2} ellipsizeMode="tail">
                {item.introduction || ""}
              </Text>
            </View>
            <View style={styles.gridBookCategories}>
              {item.categories?.map((category: any) => (
                <View key={category.id} style={styles.gridBookCategory}>
                  <Text style={styles.gridBookCategoryText}>{category.name}</Text>
                </View>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      )
    },
    [getBookCover, handleBookClick],
  )

  // 渲染分类页面
  const renderCategoryPage = useCallback(() => {
    return (
      <View style={styles.categoryPageContainer}>
        {/* 筛选条件 */}
        <View style={styles.filters}>
          {/* <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {renderFilterButton(sorts, activeSort, handleSortChange, styles.sortButton)}
          </ScrollView> */}

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
          keyExtractor={(item, index) => item?.id ? `${item.id}_${index}` : `placeholder_${index}`}
          numColumns={4}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContainer}
          onRefresh={onRefresh}
          refreshing={refreshing}
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() =>
            initialLoading || categoryLoading ? (
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
    // sorts,
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
    categoryLoading,
  ])

  // 节流处理搜索跳转
  const handleSearchPress = useThrottle(() => {
    router.push("/reader/search")
  }, 500)

  // 使用并行预加载Hook - 立即显示页面，然后异步加载数据
  const { data: preloadData, loading: preloadLoading } = useParallelPreload({
    categories: getCategories,
    recommendations: getRecommendations,
    initialBooks: () => books.length === 0 ? getBooks(true) : Promise.resolve()
  }, [])

  // 当预加载数据完成后，更新状态
  useEffect(() => {
    if (preloadData?.recommendations && typeof preloadData.recommendations !== 'function') {
      setRecommendData(preloadData.recommendations as RecommendData)
      setRecommendLoading(false)
    }
  }, [preloadData])

  // 处理按键返回
  const handleBackPress = useCallback(() => {
    if (router.canGoBack?.()) {
      router.back()
    } else {
      router.replace("/(tabs)/study")
    }
  }, [])

  return (
    <LinearGradient
      colors={["#93abff", "#e4f4ff", "#cdedff", "#ffffff"]}
      locations={[-0.1128, 0.1494, 0.8474, 1.0586]}
      style={styles.container}
    >
      <StatusBar />

      {/* 顶部栏：返回按钮 + 搜索框 */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={rpx(31.25)} color="#1E90FF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.7}
          onPress={handleSearchPress}
        >
          <Ionicons name="search" size={rpx(19.53125)} color="#999" />
          <Text style={styles.searchPlaceholder}>搜索书名、作者</Text>
        </TouchableOpacity>
      </View>

      {/* 内容区域 */}
      <View style={styles.contentContainer}>
        {/* 左侧导航 */}
        <View style={styles.sideNav}>
          <Pressable
            style={({ pressed }) => [
              styles.navButton,
              currentTab === "recommend" && styles.activeNavButton,
              pressed && styles.navButtonPressed
            ]}
            onPress={() => handleTabChange("recommend")}
          >
            <Image
              source={currentTab === "recommend" ? NAV_IMAGES.recommendActive : NAV_IMAGES.recommend}
              style={styles.navIcon}
              resizeMode="contain"
            />
            <Text style={[styles.navText, currentTab === "recommend" && styles.activeNavText]}>
              推荐
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.navButton,
              currentTab === "category" && styles.activeNavButton,
              pressed && styles.navButtonPressed
            ]}
            onPress={() => handleTabChange("category")}
          >
            <Image
              source={currentTab === "category" ? NAV_IMAGES.categoryActive : NAV_IMAGES.category}
              style={styles.navIcon}
              resizeMode="contain"
            />
            <Text style={[styles.navText, currentTab === "category" && styles.activeNavText]}>
              分类
            </Text>
          </Pressable>
        </View>

        {/* 主内容区 */}
        <View style={styles.mainContent}>
          {useMemo(() => {
            return currentTab === "recommend" ? renderRecommendPage() : renderCategoryPage()
          }, [currentTab, renderRecommendPage, renderCategoryPage])}
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
  // 顶部栏：返回 + 搜索
  topBar: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingTop: 42,
    paddingLeft: 20,
    paddingBottom: 12,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    borderRadius: 10,
    paddingVertical: 6,
    marginRight: 48,
    paddingLeft: 10,
    backgroundColor: "#fff",
  },
  searchPlaceholder: {
    fontSize: 14,
    paddingLeft: 5,
    color: "#999",
    marginLeft: 8,
  },
  contentContainer: {
    flex: 1,
    flexDirection: "row" as const,
    paddingLeft: 31.25,
    paddingRight: 31.25,
  },
  // 左侧导航样式
  sideNav: {
    alignItems: "center" as const,
    paddingTop: 30,
  },
  navButton: {
    alignItems: "center" as const,
    paddingVertical: 15,
    width: "100%" as const,
  },
  navIcon: {
    width: 35.9375,
    height: 35.9375,
    marginBottom: 5,
  },
  activeNavButton: {
    // backgroundColor: "rgba(0,122,255,0.1)",
  },
  navButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  navText: {
    fontSize: 12.5,
    color: "#999",
    marginTop: 5,
  },
  activeNavText: {
    color: "#000000",
    fontWeight: "600" as const,
  },
  mainContent: {
    flex: 1,
    // paddingBottom: 20,
  },
  // 推荐页面样式
  recommendScrollView: {
    flex: 1,
    paddingTop: 8,
  },
  recommendContainer: {
    flex: 1,
    paddingHorizontal: 15,
    gap: 18.359375, // 47
  },
  // 顶部区域：本周必读和经典书单推荐在同一行
  topSection: {
    flexDirection: "row" as const,
    // marginBottom: 20,
    gap: 13.28125, // 34
    alignItems: "flex-start" as const,
  },
  weekHotContainer: {
    flex: 1, // 本周推荐和经典书单推荐各占50%
  },
  classicContainer: {
    flex: 1, // 本周推荐和经典书单推荐各占50%
  },
  weekHotSection: {
    marginBottom: 0,
  },
  weekHotMustRead: {
    position: "absolute" as const,
    top: -7.8125,
    right: 6,
    width: 30.078125,
    height: 33.203125,
    zIndex: 1,
  },
  weekHotCard: {
    borderRadius: 7.8125,
    position: "relative" as const,
    height: 132.8125,
    overflow: "hidden" as const,
  },
  weekHotIcon: {
    position: "absolute" as const,
    top: 6.25,
    left: 10.9375,
    right: 0,
    bottom: 0,
    width: 78.125,
    height: 22.65625,
    zIndex: 1,
  },
  weekHotCardTitle: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: "#333",
    marginBottom: 10,
    textAlign: "left" as const,
  },
  weekHotBackground: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    opacity: 0.8,
  },
  weekHotcolorBackground: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 48.046875,
    bottom: 0,
    zIndex: 0,
  },
  weekHotContent: {
    flexDirection: "row" as const,
    marginTop: 35.546875,
    marginLeft: 16.40625,
    alignItems: "flex-start" as const,
    zIndex: 1,
  },
  weekHotLeft: {
    width: 66.40625,
    height: 85.9375,
    borderRadius: 3.9,
    overflow: "hidden" as const,
  },
  weekHotCover: {
    width: "100%" as const,
    height: "100%" as const,
  },
  weekHotRight: {
    width: 91.796875 as const,
    marginLeft: 17.1875,
  },
  weekHotTitle: {
    fontSize: 10.15625,
    lineHeight: 12.5,
    marginBottom: 3.90625,
    fontWeight: "bold" as const,
    color: "#705001",
  },
  weekHotDesc: {
    fontSize: 7.03125,
    color: "#7050018C",
    marginBottom: 7.8125,
  },
  badgeContainer: {
    flexDirection: "row" as const,
    width: "100%" as const,
    height: 17.1875,
    flexWrap: "wrap" as const,
    gap: 10.546875,
    overflow: "hidden" as const,
  },
  hotBadge: {
    backgroundColor: "rgba(0, 0, 0, 0.13)",
    borderRadius: 3.90625,
    paddingHorizontal: 4.6875,
    paddingVertical: 3.125,
  },
  hotBadgeText: {
    fontSize: 7.8125,
    color: "#FFFFFF",
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
  classicSection: {
    marginBottom: 0,
  },
  classicCard: {
    borderRadius: 7.8125,
    paddingTop: 4.8,
    paddingBottom: 4.8,
    paddingLeft: 10.9375,
    paddingRight: 10.9375,
    height: 133.59375,
    overflow: "hidden" as const,
  },
  classicTitleContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 10,
    gap: 5,
  },
  classicTitle: {
    width: 100,
    height: 25,
    position: "absolute" as const,
    top: -2,
    left: 0,
  },
  recommendScroll: {
    flexDirection: "row" as const,
  },
  recommendScrollContent: {
    paddingRight: 15,
  },
  recommendBookCard: {
    marginTop: 18.75,
    marginRight: 18.75,
    width: 56.25,
    alignItems: "flex-start" as const,
  },
  recommendBookCover: {
    width: 56.25,
    height: 73.4375,
    borderRadius: 3.2,
  },
  recommendBookTitle: {
    fontSize: 7.8125,
    fontWeight: "bold" as const,
    color: "#000000",
    marginBottom: 2,
    textAlign: "left" as const,
  },
  recommendBookTags: {
    flexDirection: "row" as const,
    gap: 4,
    flexWrap: "wrap" as const,
    justifyContent: "flex-start" as const,
  },
  recommendBookTag: {
    fontSize: 7.03125,
    color: "#00000099",
    backgroundColor: "#2734A70F",
    paddingVertical: 1.5625, // 4
    paddingHorizontal: 3.125, // 8
    borderRadius: 4,
  },
  // 榜单卡片样式
  rankingSection: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    // marginTop: 10,
    // paddingHorizontal: 5,
    gap: 16.40625, // 42
  },
  rankingCard: {
    flex: 1,
    borderRadius: 7.8125,
    overflow: "hidden" as const,
  },
  rankingTitleContainer: {
    position: "relative" as const,
    marginLeft: 11.328125,
    alignItems: "flex-start" as const,
    marginVertical: 8.203125, // 21
  },
  rankingTitle: {
    fontSize: 12.5,
    fontWeight: "bold" as const,
    color: "#333",
  },
  rankingTitleIcon: {
    width: 62.5, // 160
    height: 31.25, // 80
    position: "absolute" as const,
    top: 3.125, // 8
    left: 39.0625, // 120
  },
  rankingBookList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 7.8125,
    paddingLeft: 18.75,
    paddingRight: 18.75,
    paddingTop: 12.5,
    paddingBottom: 12.5,
  },
  rankingBookItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 7.8125,
  },
  rankingBookNumber: {
    fontSize: 10.15625,
    fontWeight: "bold" as const,
    color: "#000000",
    marginRight: 8.6,
  },
  rankingBookCover: {
    width: 46.875,
    height: 67.1875,
    borderRadius: 4,
  },
  rankingBookInfo: {
    marginLeft: 9.375,
    flex: 1,
    height: 67.1875,
    justifyContent: "space-between" as const,
  },
  rankingBookTitle: {
    fontSize: 9.375,
    fontWeight: "600" as const,
    color: "#000000",
    marginBottom: 2,
  },
  rankingBookDesc: {
    fontSize: 7.03125,
    color: "#1D1D1D8C",
    marginBottom: 2,

  },
  rankingBookStats: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  rankingBookViews: {
    fontSize: 7.03125,
    color: "#1D1D1D8C",
    marginLeft: 2,
  },
  // 分类页面样式
  categoryPageContainer: {
    flex: 1,
  },
  filters: {
    paddingHorizontal: 20,
    // paddingVertical: 10,
  },
  filterScroll: {
    marginBottom: 12.8,
  },
  filterRow: {
    flexDirection: "row" as const,
    gap: 10,
  },
  categoryLabel: {
    fontSize: 10.15625,
    color: "#81A2CC",
    marginBottom: 8,
    marginTop: 10,
    paddingHorizontal: 20,
  },
  sortButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 11.8175,
    backgroundColor: "#D6EBF7",
  },
  categoryButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 11.8175,
    backgroundColor: "#D6EBF7",
  },
  filterButtonActive: {
    backgroundColor: "#CFECFF",
  },
  filterButtonText: {
    fontSize: 12,
    color: "#81A2CC",
  },
  filterButtonTextActive: {
    color: "#1571FC",
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
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  gridBookCover: {
    width: 65.625,
    height: 85.9375,
    borderRadius: 4,
  },
  gridBookInfo: {
    marginLeft: 6.25,
    height: 85.9375,
    flex: 1, // 占用剩余空间
    justifyContent: "space-between" as const,
  },
  gridBookTitle: {
    fontSize: 10.15625,
    fontWeight: "bold" as const,
    color: "#000000",
    textAlign: "left" as const,
  },
  gridBookAuthor: {
    fontSize: 7.8125,
    color: "#1D1D1D8C",
    textAlign: "left" as const,
    marginBottom: 2,
    flexShrink: 1, // 允许收缩
  },
  gridBookCategories: {
    flexDirection: "row" as const,
    gap: 3.90625,
    flexWrap: "wrap" as const,
    justifyContent: "flex-start" as const,
  },
  gridBookCategory: {
    backgroundColor: "#2734A70F",
    paddingHorizontal: 3.125,
    paddingVertical: 3.125,
    borderRadius: 3.90625,
  },
  gridBookCategoryText: {
    fontSize: 8.59375,
    color: "#00000060",
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