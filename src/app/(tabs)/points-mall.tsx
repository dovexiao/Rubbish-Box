import { useState, useCallback, useEffect, useMemo } from "react"
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useFocusEffect, useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { InteractionManager } from "react-native"

import { StatusBar } from "../../components/StatusBar"
import { ProductDetailPopup, OrderConfirmPopup } from "../../components/points-mall"
import { createStyles, rpx } from "../../utils/rpxStyleSheet"
import {
  getPointsBalance,
  getMallList,
  type ProductItem,
  type PointsBalanceData,
  type ProductDetailResponse,
} from "../../services/pointsMall"

export default function PointsMallScreen() {
  const router = useRouter()
  const [pointsBalance, setPointsBalance] = useState<number>(0)
  const [products, setProducts] = useState<ProductItem[]>([])
  const [activeCategory, setActiveCategory] = useState(0)
  const [pageNum, setPageNum] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [showProductDetail, setShowProductDetail] = useState(false)
  const [showOrderConfirm, setShowOrderConfirm] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<ProductDetailResponse | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const pageSize = 18

  const categories = ["热点推荐", "积分可兑", "学习文具", "亲子娱乐"]

  // 预计算分类选项，避免重复创建
  const categoryOptions = useMemo(() => 
    categories.map((category, index) => ({ label: category, value: index })),
    [categories]
  )

  // 获取积分余额 - 优化版本
  const fetchPointsBalance = useCallback(async () => {
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
    if (loadingMore || !hasMore) return

    setLoadingMore(true)
    try {
      const res = await getMallList({
        page: pageNum.toString(),
        per_page: pageSize.toString(),
      })

      if (res.items && res.items.length > 0) {
        if (pageNum === 1) {
          setProducts(res.items)
        } else {
          setProducts((prev) => [...prev, ...res.items])
        }

        setPageNum((prev) => prev + 1)
        setHasMore(res.pagination.has_next)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error("获取商品列表失败:", error)
      Alert.alert("提示", "获取商品列表失败，请重试")
    } finally {
      setLoadingMore(false)
    }
  }, [pageNum, loadingMore, hasMore, pageSize])

  // 切换分类
  const switchCategory = useCallback(
    (index: number) => {
      console.log("切换分类:", index, categories[index])
      setActiveCategory(index)
      setProducts([])
      setPageNum(1)
      setHasMore(true)
      // 由于重置了pageNum，需要在下一次渲染时调用getProducts
      setTimeout(() => getProducts(), 0)
    },
    [categories],
  )

  // 跳转到积分明细
  const goToPointsDetail = useCallback(() => {
    router.push("/points-mall/points-detail")
  }, [router])

  // 显示商品详情
  const handleShowProductDetail = useCallback((id: number) => {
    setSelectedProductId(id)
    setShowProductDetail(true)
  }, [])

  // 关闭商品详情弹窗
  const handleCloseProductDetail = useCallback(() => {
    setShowProductDetail(false)
    setSelectedProductId(null)
    setCurrentProduct(null)
  }, [])

  // 确认商品详情，显示订单确认弹窗
  const handleProductDetailConfirm = useCallback((productData: ProductDetailResponse) => {
    setCurrentProduct(productData)
    setShowProductDetail(false)
    setShowOrderConfirm(true)
  }, [])

  // 关闭订单确认弹窗
  const handleCloseOrderConfirm = useCallback(() => {
    setShowOrderConfirm(false)
    setCurrentProduct(null)
  }, [])

  // 订单确认成功
  const handleOrderConfirmSuccess = useCallback(() => {
    // 刷新积分余额和商品列表
    fetchPointsBalance()
    setProducts([])
    setPageNum(1)
    setHasMore(true)
    setTimeout(() => getProducts(), 0)
  }, [fetchPointsBalance])

  // 加载更多商品
  const loadMoreProducts = useCallback(() => {
    if (hasMore && !loadingMore) {
      getProducts()
    }
  }, [hasMore, loadingMore, getProducts])

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

      {/* 顶部固定区域 */}
      <View style={styles.topSection}>
        {/* 顶部货币区域 */}
        <LinearGradient
            colors={['#E7B500', '#FFE7CD', '#F7F7F7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
        >
          <View style={styles.topCurrencySection}>
            {/* 456货币卡片 */}
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
          </View>
        </LinearGradient>

        {/* 分类导航 */}
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
      </View>

      {/* 加载状态 */}
      {!isInitialized && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1890ff" />
          <Text style={styles.loadingText}>正在加载商品...</Text>
        </View>
      )}

      {/* 商品网格列表 */}
      {isInitialized && (
        <ScrollView
        style={styles.productScroll}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent
          const paddingToBottom = 100
          if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
            loadMoreProducts()
          }
        }}
        scrollEventThrottle={400}
      >
        <View style={styles.productGrid}>
          {products.map((product, index) => (
            <TouchableOpacity
              key={`product-${product.id}-${index}`}
              style={styles.productItem}
              onPress={() => handleShowProductDetail(product.id)}
              activeOpacity={0.8}
            >
              {/* 商品图片区域 */}
              <Image
                source={{
                  uri: product.image || "/static/images/product-placeholder.png",
                }}
                style={styles.productImage}
                resizeMode="cover"
              />

              {/* 商品信息区域 */}
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
          ))}
        </View>

        {/* 加载状态 */}
        {loadingMore && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#666" />
            <Text style={styles.loadingText}>正在加载...</Text>
          </View>
        )}

        {/* 没有更多数据 */}
        {!hasMore && products.length > 0 && (
          <View style={styles.noMoreContainer}>
            <Text style={styles.noMoreText}>没有更多商品了</Text>
          </View>
        )}
        </ScrollView>
      )}

      {/* 商品详情弹窗 */}
      <ProductDetailPopup
        visible={showProductDetail}
        productId={selectedProductId}
        onClose={handleCloseProductDetail}
        onConfirm={handleProductDetailConfirm}
      />

      {/* 订单确认弹窗 */}
      <OrderConfirmPopup
        visible={showOrderConfirm}
        productData={currentProduct}
        onClose={handleCloseOrderConfirm}
        onConfirm={handleOrderConfirmSuccess}
      />
    </LinearGradient>
  )
}

const styles = createStyles({
  pageContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  topSection: {
    // paddingHorizontal: 29,
    flexShrink: 0,
  },
  topCurrencySection: {
    paddingTop: 45.3125,
    paddingLeft: 31.25,
    paddingBottom: 13.671875,
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
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 15.625,
    gap: 8,
    justifyContent: "center",
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
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    gap: 8,
  },
  loadingText: {
    fontSize: 8.6,
    color: "#666",
  },
  noMoreContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
  },
  noMoreText: {
    fontSize: 8.6,
    color: "#999",
  },
})
