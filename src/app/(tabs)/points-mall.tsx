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
  const [pointsBalance, setPointsBalance] = useState<number>(0)
  const [products, setProducts] = useState<ProductItem[]>([])
  const [activeCategory, setActiveCategory] = useState(0)
  const [pageNum, setPageNum] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [showProductDetail, setShowProductDetail] = useState(false)
  const [showOrderConfirm, setShowOrderConfirm] = useState(false)
  // const [currentProduct, setCurrentProduct] = useState<ProductDetailResponse | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [showCurrencyGuide, setShowCurrencyGuide] = useState(false)
  const pageSize = 18

  // 使用 ref 防止重复请求
  const isLoadingRef = useRef(false)
  const hasMoreRef = useRef(true)
  const currentPageRef = useRef(1)

  const categories = ["热点推荐", "积分可兑", "学习文具", "亲子娱乐"]

  // 预计算分类选项，避免重复创建
  const categoryOptions = useMemo(() =>
    categories.map((category, index) => ({ label: category, value: index })),
    [categories]
  )

  // 获取积分余额 - 优化版本
  const fetchPointsBalance = useCallback(async () => {
    // 检查是否有token，没有则直接返回
    const token = useUserStore.getState().token
    if (!token) {
      console.log("未找到token，跳过积分余额获取")
      return
    }

    try {
      const res: PointsBalanceData = await getPointsBalance()
      if (res.points !== undefined) {
        setPointsBalance(res.points)
      }
    } catch (error) {
      console.error("获取积分余额失败:", error)
    }
  }, [])

  // 获取商品列表
  const getProducts = useCallback(async () => {
    // 使用 ref 进行严格的防重复检查
    if (isLoadingRef.current || !hasMoreRef.current) {
      console.log("🚫 阻止重复请求:", {
        isLoading: isLoadingRef.current,
        hasMore: hasMoreRef.current
      })
      return
    }

    // 检查是否有token，没有则直接返回
    const token = useUserStore.getState().token
    if (!token) {
      console.log("未找到token，跳过商品列表获取")
      return
    }

    // 立即标记为正在加载
    isLoadingRef.current = true
    setLoadingMore(true)

    const currentPage = currentPageRef.current
    console.log("📄 开始加载第", currentPage, "页")

    try {
      const res = await getMallList({
        page: currentPage.toString(),
        per_page: pageSize.toString(),
        category: activeCategory,
        redeemable_only: true,
      })

      console.log("✅ 第", currentPage, "页数据返回:", {
        itemsCount: res.items?.length || 0,
        hasNext: res.pagination.has_next,
        currentPage: res.pagination.current_page,
        totalPages: res.pagination.total_pages
      })

      if (res.items && res.items.length > 0) {
        if (currentPage === 1) {
          setProducts(res.items)
        } else {
          setProducts((prev) => [...prev, ...res.items])
        }

        // 更新 hasMore 状态
        const hasNext = res.pagination.has_next
        hasMoreRef.current = hasNext
        setHasMore(hasNext)

        // 只有当有下一页时才增加页码
        if (hasNext) {
          currentPageRef.current = currentPage + 1
          setPageNum(currentPage + 1)
          console.log("➡️ 页码更新为:", currentPage + 1)
        } else {
          console.log("🏁 已到达最后一页")
        }
      } else {
        hasMoreRef.current = false
        setHasMore(false)
        console.log("🏁 没有更多数据")
      }
    } catch (error) {
      console.error("❌ 获取商品列表失败:", error)
      showError("获取商品列表失败，请重试")
    } finally {
      isLoadingRef.current = false
      setLoadingMore(false)
    }
  }, [pageSize])

  // 切换分类
  const switchCategory = useCallback(
    (index: number) => {
      console.log("🔄 切换分类:", index, categories[index])
      setActiveCategory(index)
      setProducts([])

      // 重置所有分页相关状态和 ref
      setPageNum(1)
      setHasMore(true)
      currentPageRef.current = 1
      hasMoreRef.current = true
      isLoadingRef.current = false

      // 由于重置了pageNum，需要在下一次渲染时调用getProducts
      setTimeout(() => getProducts(), 0)
    },
    [categories, getProducts],
  )

  // 跳转到积分明细
  const goToPointsDetail = useCallback(() => {
    router.push("/points-mall/points-detail")
  }, [router])

  // 跳转到兑换记录
  const goToExchangeRecord = useCallback(() => {
    router.push("/points-mall/exchange-record")
  }, [router])

  // 关闭货币指南
  const handleCloseCurrencyGuide = useCallback(() => {
    setShowCurrencyGuide(false)
  }, [])

  // 显示商品详情
  const handleShowProductDetail = useCallback((id: number) => {
    setSelectedProductId(id)
    setShowProductDetail(true)
  }, [])

  // 关闭商品详情弹窗
  const handleCloseProductDetail = useCallback(() => {
    setShowProductDetail(false)
    setSelectedProductId(null)
    // setCurrentProduct(null)
  }, [])

  // 确认商品详情，显示订单确认弹窗
  // const handleProductDetailConfirm = useCallback((productData: ProductDetailResponse) => {
  //   setCurrentProduct(productData)
  //   setShowProductDetail(false)
  //   setShowOrderConfirm(true)
  // }, [])

  // 关闭订单确认弹窗
  const handleCloseOrderConfirm = useCallback(() => {
    setShowOrderConfirm(false)
    // setCurrentProduct(null)
  }, [])

  // 订单确认成功
  const handleOrderConfirmSuccess = useCallback(() => {
    // 刷新积分余额和商品列表
    fetchPointsBalance()
    setProducts([])

    // 重置所有分页相关状态和 ref
    setPageNum(1)
    setHasMore(true)
    currentPageRef.current = 1
    hasMoreRef.current = true
    isLoadingRef.current = false

    setTimeout(() => getProducts(), 0)
  }, [fetchPointsBalance, getProducts])

  // 加载更多商品
  const loadMoreProducts = useCallback(() => {
    // 使用 ref 进行检查，避免状态更新延迟导致的重复请求
    if (hasMoreRef.current && !isLoadingRef.current) {
      console.log("📜 触发加载更多")
      getProducts()
    } else {
      console.log("🚫 loadMoreProducts 阻止请求:", {
        hasMore: hasMoreRef.current,
        isLoading: isLoadingRef.current
      })
    }
  }, [getProducts])

  // 初始化数据 - 使用InteractionManager优化
  useEffect(() => {
    if (!isInitialized) {
      InteractionManager.runAfterInteractions(async () => {
        // 并行加载积分余额和商品列表
        await Promise.all([
          fetchPointsBalance(),
          getProducts()
        ])
        setIsInitialized(true)
      })
    }
  }, [isInitialized, fetchPointsBalance, getProducts])

  // 页面显示时只加载积分余额（商品列表已预加载）
  useFocusEffect(
    useCallback(() => {
      if (isInitialized) {
        // 只在需要时刷新积分余额
        fetchPointsBalance()
      }
    }, [isInitialized, fetchPointsBalance]),
  )

  const [showDailyCheckInOnAnswer, setShowDailyCheckInOnAnswer] = useState(false);
  const [dailyCheckInPoints, setDailyCheckInPoints] = useState(0);
  const dailyCheckInRef = useRef<DailyCheckInRef>(null);
  const [showNewProductDetails, setShowNewProductDetails] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)

  // 显示货币指南
  const handleShowCurrencyGuide = useCallback(() => {
    setShowCurrencyGuide(true)
  }, []);

  // 点击商品详情
  const handleClickProductDetails = useCallback((id: number) => {
    setSelectedProductId(id)
    setShowNewProductDetails(true)
  }, [])
  
  const handleCloseNewProductDetails = useCallback(() => {
    setShowNewProductDetails(false)
  }, [])

  return (
    <LinearGradient
      colors={["#FFB991", "#FFECD5"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.pageContainer}
    >
      {/* 自定义状态栏 */}
      <StatusBar theme="dark" backgroundColor="transparent" translucent={true} />

      {/* 每日打卡 */}
      <DailyCheckIn
        ref={dailyCheckInRef}
        containerStyle={styles.dailyCheckIn}
        onAnswer={(points: number) => {
          setShowDailyCheckInOnAnswer(true);
          setDailyCheckInPoints(points);
        }}
      />

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

      {/* 货币余额 */}
      <CurrencyAmount
        onPress={() => router.push("/points-mall/currency-record")}
        style={styles.currencyAmountContainer}
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

      {/* 积分多类商品列表 */}
      <MultiCategoryProductList
        style={styles.multiCategoryProductListContainer}
        onProductClick={handleClickProductDetails}
      />

      {/* 商品详情弹窗 */}
      <NewProductDetailsPopup
        visible={true}
        // visible={showNewProductDetails}
        productId={selectedProductId as number}
        onClose={handleCloseNewProductDetails}
      />

      {/* 折扣商品窗口 */}
      <DiscountedProductWindow style={styles.discountedProductWindowContainer} />

      {/* 顶部固定区域 */}
      {/* <View style={styles.topSection}>
        <LinearGradient
            colors={['#E7B500', '#FFE7CD', '#F7F7F7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
        >
          <View style={styles.topCurrencySection}>
            <TouchableOpacity style={styles.currencyCard} onPress={goToPointsDetail}>
              <Image
                  source={require("../../../assets/images/coin.png")}
                  style={styles.coinIcon}
                  resizeMode="contain"
              />
              <Text style={styles.currencyAmount}>{pointsBalance || 0}</Text>
              <Text style={styles.currencyLabel}>货币</Text>
              <Ionicons name="chevron-forward" size={rpx(12)} color="rgba(255, 144, 0, 1)" style={styles.arrowIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.exchangeRecordBtn} onPress={goToExchangeRecord}>
              <Text style={styles.exchangeRecordText}>兑换记录</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
        <View style={styles.categorySection}>
          {categories.map((category, index) => (
            <TouchableOpacity
              key={`category-${index}`}
              style={[styles.categoryItem, activeCategory === index && styles.categoryItemActive]}
              onPress={() => switchCategory(index)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.categoryText, activeCategory === index && styles.categoryTextActive]}
              >
                {category}
              </Text>
              {activeCategory === index && <View style={styles.underline} />}
            </TouchableOpacity>
          ))}
        </View>
      </View> */}

      {/* 商品网格列表 */}
      {/* <FlatList
        data={products}
        keyExtractor={(item, index) => `product-${item.id}-${index}`}
        numColumns={6}
        style={styles.productScroll}
        contentContainerStyle={styles.productListContent}
        columnWrapperStyle={styles.productColumnWrapper}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={12}
        updateCellsBatchingPeriod={50}
        initialNumToRender={18}
        windowSize={5}
        onEndReached={loadMoreProducts}
        onEndReachedThreshold={0.5}
        renderItem={({ item: product }) => (
          <TouchableOpacity
            style={styles.productItem}
            onPress={() => handleShowProductDetail(product.id)}
            activeOpacity={0.8}
          >
            <Image
              source={{
                uri: product.image || "/static/images/product-placeholder.png",
              }}
              style={styles.productImage}
              resizeMode="cover"
            />
            <View style={styles.productInfoArea}>
              <Text style={styles.productName} numberOfLines={1}>
                {product.name}
              </Text>
              <View style={styles.priceRow}>
                <View style={styles.currentPriceSection}>
                  <Ionicons name="logo-usd" size={rpx(10)} color="#333" />
                  <Text style={styles.currentPrice}>{product.price}</Text>
                </View>
                <Text style={styles.originalPrice}>{product.original_points}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <>
            {loadingMore && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#666" />
                <Text style={styles.loadingText}>正在加载...</Text>
              </View>
            )}
            {!hasMore && products.length > 0 && (
              <View style={styles.noMoreContainer}>
                <Text style={styles.noMoreText}>没有更多商品了</Text>
              </View>
            )}
          </>
        }
      /> */}

      {/* 商品详情弹窗 */}
      {/* <ProductDetailPopup
        visible={showProductDetail}
        productId={selectedProductId}
        onClose={handleCloseProductDetail}
        onConfirm={handleProductDetailConfirm}
      /> */}

      {/* 订单确认弹窗 */}
      {/* <OrderConfirmPopup
        visible={showOrderConfirm}
        productData={currentProduct}
        onClose={handleCloseOrderConfirm}
        onConfirm={handleOrderConfirmSuccess}
      /> */}
    </LinearGradient>
  )
}

const styles = createStyles({
  pageContainer: {
    flex: 1,
    width: "100%" as const,
    height: "100%" as const,
  },
  currencyAmountContainer: {
    position: "absolute" as const,
    top: 45.703125, // 117
    left: 31.25, // 80
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
    position: "absolute" as const,
    top: 219.53125, // 562
    left: 31.25, // 80
  },
  discountedProductWindowContainer: {
    position: "absolute" as const,
    top: 61.71875, // 158
    left: 318.75, // 816
  },
  topSection: {
    // paddingHorizontal: 29,
    flexShrink: 0,
  },
  topCurrencySection: {
    paddingTop: 45.3125,
    paddingLeft: 31.25,
    paddingRight: 31.25,
    paddingBottom: 13.671875,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  currencyCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 4,
    backgroundColor: "rgba(255, 250, 236, 0.75)",
    shadow: "0px -11px 14px 0px rgba(255, 197, 89, 0.25)",
    // borderWidth: 1,
    // borderColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  coinIcon: {
    width: 16.3125,
    height: 16.3125,
  },
  currencyAmount: {
    fontSize: 9.375,
    color: "rgba(255, 144, 0, 1)",
    fontWeight: "500",
    marginLeft: 4,
  },
  currencyLabel: {
    fontSize: 8.6,
    color: "rgba(255, 144, 0, 1)",
    marginLeft: 2,
  },
  arrowIcon: {
    marginLeft: 4,
  },
  exchangeRecordBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 8,
  },
  exchangeRecordText: {
    fontSize: 8.6,
    color: "#FF9000",
    fontWeight: "500",
  },
  categorySection: {
    flexDirection: "row",
    paddingVertical: 8,
  },
  categoryItem: {
    position: "relative",
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 1,
  },
  categoryItemActive: {},
  categoryText: {
    fontSize: 6.375,
    color: "#666",
  },
  categoryTextActive: {
    color: "#333",
    fontWeight: "600",
  },
  underline: {
    position: "absolute",
    bottom: 0,
    width: 30,
    height: 3,
    backgroundColor: "#333",
    borderRadius: 2,
    marginTop: 4,
  },
  productScroll: {
    flex: 1,
  },
  productListContent: {
    paddingHorizontal: 15.625,
    paddingBottom: 20,
  },
  productColumnWrapper: {
    justifyContent: "center" as const,
    gap: 8,
    marginBottom: 8,
  },
  productItem: {
    width: 109,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 4,
    overflow: "hidden",
  },
  productImage: {
    width: 109,
    height: 109,
  },
  productInfoArea: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "rgba(128, 128, 128, 0.1)",
  },
  productName: {
    fontSize: 8.6,
    color: "#333",
    marginBottom: 6,
    lineHeight: 10.32,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  currentPriceSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  currentPrice: {
    fontSize: 9.375,
    color: "#333",
    fontWeight: "500",
    marginLeft: 2,
  },
  originalPrice: {
    fontSize: 8.6,
    color: "#999",
    textDecorationLine: "line-through",
  },
  loadingContainer: {
    flexDirection: "row" as const,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingVertical: 12,
    gap: 8,
  },
  loadingText: {
    fontSize: 8.6,
    color: "#666",
  },
  noMoreContainer: {
    flexDirection: "row" as const,
    justifyContent: "center",
    alignItems: "center" as const,
    paddingVertical: 12,
  },
  noMoreText: {
    fontSize: 8.6,
    color: "#999",
  },
  currencyGuideButton: {
    position: "absolute" as const,
    top: 105,
    right: 20,
  },
  currencyGuideIconWrapper: {
    width: 60.9375,
    height: 71.09375,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 2,
  },
  currencyGuideIcon: {
    width: 60.9375,
    height: 71.09375,
  },
  currencyGuideText: {
    fontSize: 7,
    color: "#FF9000",
    fontWeight: "500" as const,
  },
})
