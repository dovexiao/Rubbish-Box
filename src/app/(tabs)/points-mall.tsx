import { useState, useCallback, useEffect, useMemo, useRef } from "react"
import { View, Text, Image, ScrollView, FlatList, TouchableOpacity, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useFocusEffect, useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { InteractionManager } from "react-native"

import { StatusBar } from "../../components/StatusBar"
import { ProductDetailPopup, OrderConfirmPopup, CurrencyGuidePopup } from "../../components/points-mall"
import { createStyles, rpx } from "../../utils/rpxStyleSheet"
import { showError } from "../../utils/toast"
import { useUserStore } from "../../stores/userStore"
import {
  getPointsBalance,
  getMallList,
  type ProductItem,
  type PointsBalanceData,
  // type ProductDetailResponse,
} from "../../services/pointsMall"
import DailyCheckIn, { DailyCheckInRef } from "@/components/points-mall/DailyCheckIn"
import DailyCheckInOnAnswer from "@/components/points-mall/DailyCheckInonAnswer"
import CurrencyGuideFloatingButton from "@/components/points-mall/CurrencyGuideFloatingButton"
import CurrencyAmount from "@/components/points-mall/CurrencyAmount"
import MultiCategoryProductList from "@/components/points-mall/MultiCategoryProductList"
import DiscountedProductWindow from "@/components/points-mall/DiscountedProductWindow"
import NewProductDetailsPopup from "@/components/points-mall/NewProductDetailsPopup"

export default function PointsMallScreen() {
  const router = useRouter()
  // const [pointsBalance, setPointsBalance] = useState<number>(0)
  // const [products, setProducts] = useState<ProductItem[]>([])
  // const [activeCategory, setActiveCategory] = useState(0)
  // const [pageNum, setPageNum] = useState(1)
  // const [loadingMore, setLoadingMore] = useState(false)
  // const [hasMore, setHasMore] = useState(true)
  // const [showProductDetail, setShowProductDetail] = useState(false)
  // const [showOrderConfirm, setShowOrderConfirm] = useState(false)
  // // const [currentProduct, setCurrentProduct] = useState<ProductDetailResponse | null>(null)
  // const [isInitialized, setIsInitialized] = useState(false)
  // const pageSize = 18

  // 使用 ref 防止重复请求
  // const isLoadingRef = useRef(false)
  // const hasMoreRef = useRef(true)
  // const currentPageRef = useRef(1)

  // const categories = ["热点推荐", "积分可兑", "学习文具", "亲子娱乐"]

  // 预计算分类选项，避免重复创建
  // const categoryOptions = useMemo(() =>
  //   categories.map((category, index) => ({ label: category, value: index })),
  //   [categories]
  // )

  // 获取积分余额 - 优化版本
  // const fetchPointsBalance = useCallback(async () => {
  //   // 检查是否有token，没有则直接返回
  //   const token = useUserStore.getState().token
  //   if (!token) {
  //     console.log("未找到token，跳过积分余额获取")
  //     return
  //   }

  //   try {
  //     const res: PointsBalanceData = await getPointsBalance()
  //     if (res.points !== undefined) {
  //       setPointsBalance(res.points)
  //     }
  //   } catch (error) {
  //     console.error("获取积分余额失败:", error)
  //   }
  // }, [])

  // 获取商品列表
  // const getProducts = useCallback(async () => {
  //   // 使用 ref 进行严格的防重复检查
  //   if (isLoadingRef.current || !hasMoreRef.current) {
  //     console.log("🚫 阻止重复请求:", {
  //       isLoading: isLoadingRef.current,
  //       hasMore: hasMoreRef.current
  //     })
  //     return
  //   }

  //   // 检查是否有token，没有则直接返回
  //   const token = useUserStore.getState().token
  //   if (!token) {
  //     console.log("未找到token，跳过商品列表获取")
  //     return
  //   }

  //   // 立即标记为正在加载
  //   isLoadingRef.current = true
  //   setLoadingMore(true)

  //   const currentPage = currentPageRef.current
  //   console.log("📄 开始加载第", currentPage, "页")

  //   try {
  //     const res = await getMallList({
  //       page: currentPage.toString(),
  //       per_page: pageSize.toString(),
  //       category: activeCategory,
  //       redeemable_only: true,
  //     })

  //     console.log("✅ 第", currentPage, "页数据返回:", {
  //       itemsCount: res.items?.length || 0,
  //       hasNext: res.pagination.has_next,
  //       currentPage: res.pagination.current_page,
  //       totalPages: res.pagination.total_pages
  //     })

  //     if (res.items && res.items.length > 0) {
  //       if (currentPage === 1) {
  //         setProducts(res.items)
  //       } else {
  //         setProducts((prev) => [...prev, ...res.items])
  //       }

  //       // 更新 hasMore 状态
  //       const hasNext = res.pagination.has_next
  //       hasMoreRef.current = hasNext
  //       setHasMore(hasNext)

  //       // 只有当有下一页时才增加页码
  //       if (hasNext) {
  //         currentPageRef.current = currentPage + 1
  //         setPageNum(currentPage + 1)
  //         console.log("➡️ 页码更新为:", currentPage + 1)
  //       } else {
  //         console.log("🏁 已到达最后一页")
  //       }
  //     } else {
  //       hasMoreRef.current = false
  //       setHasMore(false)
  //       console.log("🏁 没有更多数据")
  //     }
  //   } catch (error) {
  //     console.error("❌ 获取商品列表失败:", error)
  //     showError("获取商品列表失败，请重试")
  //   } finally {
  //     isLoadingRef.current = false
  //     setLoadingMore(false)
  //   }
  // }, [pageSize])

  // 切换分类
  // const switchCategory = useCallback(
  //   (index: number) => {
  //     console.log("🔄 切换分类:", index, categories[index])
  //     setActiveCategory(index)
  //     setProducts([])

  //     // 重置所有分页相关状态和 ref
  //     setPageNum(1)
  //     setHasMore(true)
  //     currentPageRef.current = 1
  //     hasMoreRef.current = true
  //     isLoadingRef.current = false

  //     // 由于重置了pageNum，需要在下一次渲染时调用getProducts
  //     setTimeout(() => getProducts(), 0)
  //   },
  //   [categories, getProducts],
  // )

  // 跳转到积分明细
  // const goToPointsDetail = useCallback(() => {
  //   router.push("/points-mall/points-detail")
  // }, [router])

  // 跳转到兑换记录
  // const goToExchangeRecord = useCallback(() => {
  //   router.push("/points-mall/exchange-record")
  // }, [router])

  // 显示商品详情
  // const handleShowProductDetail = useCallback((id: number) => {
  //   setSelectedProductId(id)
  //   setShowProductDetail(true)
  // }, [])

  // 关闭商品详情弹窗
  // const handleCloseProductDetail = useCallback(() => {
  //   setShowProductDetail(false)
  //   setSelectedProductId(null)
  //   // setCurrentProduct(null)
  // }, [])

  // 确认商品详情，显示订单确认弹窗
  // const handleProductDetailConfirm = useCallback((productData: ProductDetailResponse) => {
  //   setCurrentProduct(productData)
  //   setShowProductDetail(false)
  //   setShowOrderConfirm(true)
  // }, [])

  // 关闭订单确认弹窗
  // const handleCloseOrderConfirm = useCallback(() => {
  //   setShowOrderConfirm(false)
  //   // setCurrentProduct(null)
  // }, [])

  // 订单确认成功
  // const handleOrderConfirmSuccess = useCallback(() => {
  //   // 刷新积分余额和商品列表
  //   fetchPointsBalance()
  //   setProducts([])

  //   // 重置所有分页相关状态和 ref
  //   setPageNum(1)
  //   setHasMore(true)
  //   currentPageRef.current = 1
  //   hasMoreRef.current = true
  //   isLoadingRef.current = false

  //   setTimeout(() => getProducts(), 0)
  // }, [fetchPointsBalance, getProducts])

  // 加载更多商品
  // const loadMoreProducts = useCallback(() => {
  //   // 使用 ref 进行检查，避免状态更新延迟导致的重复请求
  //   if (hasMoreRef.current && !isLoadingRef.current) {
  //     console.log("📜 触发加载更多")
  //     getProducts()
  //   } else {
  //     console.log("🚫 loadMoreProducts 阻止请求:", {
  //       hasMore: hasMoreRef.current,
  //       isLoading: isLoadingRef.current
  //     })
  //   }
  // }, [getProducts])

  // 初始化数据 - 使用InteractionManager优化
  // useEffect(() => {
  //   if (!isInitialized) {
  //     InteractionManager.runAfterInteractions(async () => {
  //       // 并行加载积分余额和商品列表
  //       await Promise.all([
  //         fetchPointsBalance(),
  //         getProducts()
  //       ])
  //       setIsInitialized(true)
  //     })
  //   }
  // }, [isInitialized, fetchPointsBalance, getProducts])

  // 页面显示时只加载积分余额（商品列表已预加载）
  // useFocusEffect(
  //   useCallback(() => {
  //     if (isInitialized) {
  //       // 只在需要时刷新积分余额
  //       fetchPointsBalance()
  //     }
  //   }, [isInitialized, fetchPointsBalance]),
  // )

  const [showDailyCheckInOnAnswer, setShowDailyCheckInOnAnswer] = useState(false);
  const [dailyCheckInPoints, setDailyCheckInPoints] = useState(0);
  const dailyCheckInRef = useRef<DailyCheckInRef>(null);
  const [showNewProductDetails, setShowNewProductDetails] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [showCurrencyGuide, setShowCurrencyGuide] = useState(false)
  
  // 控制滚动的手势切换
  const [scrollViewEnabled, setScrollViewEnabled] = useState(true)
  const scrollViewRef = useRef<ScrollView>(null)

  // 显示货币指南
  const handleShowCurrencyGuide = useCallback(() => {
    setShowCurrencyGuide(true)
  }, []);

  // 点击商品详情
  const handleClickProductDetails = useCallback((id: number) => {
    setSelectedProductId(id)
    setShowNewProductDetails(true)
  }, [])

  // 关闭商品详情弹窗
  const handleCloseNewProductDetails = useCallback(() => {
    setShowNewProductDetails(false)
  }, [])

  // 关闭货币指南
  const handleCloseCurrencyGuide = useCallback(() => {
    setShowCurrencyGuide(false)
  }, [])

  // 处理 ScrollView 滚动，判断是否到底部
  const handleScrollViewScroll = useCallback((event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent
    const scrollY = contentOffset.y
    const contentHeight = contentSize.height
    const scrollViewHeight = layoutMeasurement.height
    
    // 判断是否滑到底部（允许1px误差）
    const isAtBottom = scrollY + scrollViewHeight >= contentHeight - 1
    
    if (isAtBottom && scrollViewEnabled) {
      // 滑到底部，禁用 ScrollView，启用 FlatList
      setScrollViewEnabled(false)
    } else if (!isAtBottom && !scrollViewEnabled) {
      // 未到底部，启用 ScrollView，禁用 FlatList
      setScrollViewEnabled(true)
    }
  }, [scrollViewEnabled])

  // 处理 FlatList 滚动，判断是否到顶部
  const handleFlatListScroll = useCallback((event: any) => {
    const { contentOffset } = event.nativeEvent
    const scrollY = contentOffset.y
    
    // 判断是否滑到顶部（允许1px误差）
    if (scrollY <= 1 && !scrollViewEnabled) {
      // 滑到顶部，启用 ScrollView，禁用 FlatList
      setScrollViewEnabled(true)
    }
  }, [scrollViewEnabled])

  return (
    <LinearGradient
      colors={["#93abff", "#e4f4ff", "#ecf8ff", "#ffffff"]}
      locations={[-0.1128, 0.1494, 0.8474, 1.0586]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.pageContainer}
    >
      {/* 自定义状态栏 */}
      <StatusBar theme="dark" backgroundColor="transparent" translucent={true} />

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollViewEnabled}
        onScroll={handleScrollViewScroll}
        scrollEventThrottle={16}>
        <View style={styles.rowContainer}>
          {/* 每日打卡 */}
          <DailyCheckIn
            ref={dailyCheckInRef}
            containerStyle={styles.dailyCheckIn}
            onAnswer={(points: number) => {
              setShowDailyCheckInOnAnswer(true);
              setDailyCheckInPoints(points);
            }}
          />
          {/* 货币余额 */}
          <CurrencyAmount
            onPress={() => router.push("/points-mall/currency-record")}
            style={styles.currencyAmountContainer}
          />
          {/* 折扣商品窗口 */}
          <DiscountedProductWindow style={styles.discountedProductWindowContainer} />
        </View>

        {/* 积分多类商品列表 */}
        <MultiCategoryProductList
          style={styles.multiCategoryProductListContainer}
          onProductClick={handleClickProductDetails}
          scrollEnabled={!scrollViewEnabled}
          onScroll={handleFlatListScroll}
        />

        {/* 100高度占位 */}
        <View style={{ height: rpx(39.0625) }} />

        {/* 每日打卡答题弹窗 */}
        <DailyCheckInOnAnswer
          visible={showDailyCheckInOnAnswer}
          points={dailyCheckInPoints}
          onClose={() => {
            setShowDailyCheckInOnAnswer(false);
            // 重新加载打卡列表
            dailyCheckInRef.current?.loadWeekCheckInList();
          }}
        />

        {/* 货币指南浮动按钮 */}
        <CurrencyGuideFloatingButton
          onPress={handleShowCurrencyGuide}
          style={styles.currencyGuideFloatingButtonContainer}
        />

        {/* 货币指南弹窗 */}
        <CurrencyGuidePopup
          visible={showCurrencyGuide}
          onClose={handleCloseCurrencyGuide}
        />

        {/* 商品详情弹窗 */}
        <NewProductDetailsPopup
          // visible={true}
          visible={showNewProductDetails}
          productId={selectedProductId as number}
          onClose={handleCloseNewProductDetails}
        />
      </ScrollView>
    </LinearGradient>
  )
}

const styles = createStyles({
  pageContainer: {
    flex: 1,
    width: "100%" as const,
    height: "100%" as const,
  },
  scrollView: {
    // flex: 1,
    width: "100%" as const,
    height: "100%" as const,
  },
  currencyAmountContainer: {
    position: "absolute" as const,
    top: 45.703125, // 117
    left: 31.25, // 80
    // marginTop: 45.703125, // 117
    // marginLeft: 31.25, // 80
  },
  currencyGuideFloatingButtonContainer: {
    position: "absolute" as const,
    top: 234.375, // 600
    right: 18.359375, // 47
    zIndex: 1000,
  },
  dailyCheckIn: {
    position: "absolute" as const,
    top: 80.859375, // 207
    left: 31.25, // 80
  },
  multiCategoryProductListContainer: {
    // position: "absolute" as const,
    // top: 219.53125, // 562
    // left: 31.25, // 80
    marginLeft: 31.25, // 80
  },
  discountedProductWindowContainer: {
    position: "absolute" as const,
    top: 61.71875, // 158
    left: 318.75, // 816
  },
  rowContainer: {
    width: "100%" as const,
    height: 219.53125, // 562
  },
})
