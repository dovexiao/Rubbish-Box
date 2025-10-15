import { View, Text, Image, ScrollView, TouchableOpacity, Dimensions } from "react-native"
import { Modal, Portal } from "react-native-paper"
import { useState, useEffect } from "react"
import { Ionicons } from "@expo/vector-icons"

import { createStyles, rpx } from "../../utils/rpxStyleSheet"
import { getProductDetail, type ProductDetailResponse } from "../../services/pointsMall"

interface ProductDetailPopupProps {
  visible: boolean
  productId: number | null
  onClose: () => void
  onConfirm: (productData: ProductDetailResponse) => void
}

/**
 * 商品详情弹窗组件
 * 100%还原UniApp项目 /src/pages/pointsMall/components/ProductDetailPopup.vue
 */
export function ProductDetailPopup({
  visible,
  productId,
  onClose,
  onConfirm,
}: ProductDetailPopupProps) {
  const [productDetail, setProductDetail] = useState<ProductDetailResponse | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // 加载商品详情
  useEffect(() => {
    if (productId && visible) {
      loadProductDetail()
    }
  }, [productId, visible])

  const loadProductDetail = async () => {
    if (!productId) return

    try {
      const res = await getProductDetail({
        product_id: productId.toString(),
      })
      if (res) {
        setProductDetail(res)
        setCurrentImageIndex(0)
      }
    } catch (error) {
      console.error("获取商品详情失败:", error)
    }
  }

  const handleClose = () => {
    setProductDetail(null)
    setCurrentImageIndex(0)
    onClose()
  }

  const handleBuy = () => {
    if (productDetail) {
      onConfirm(productDetail)
    }
  }

  if (!productDetail) return null

  const swiperImages = productDetail.detail_image || []

  return (
    <Portal>
      <Modal visible={visible} onDismiss={handleClose} contentContainerStyle={styles.modal}>
        <View style={styles.popup}>
          {/* 头部 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.backButton}>
              <Ionicons name="arrow-back" size={rpx(11.71875)} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>商品详情</Text>
          </View>

          {/* 内容区域 */}
          <ScrollView style={styles.content}>
            {/* 轮播图区域 */}
            <View style={styles.swiperContainer}>
              {swiperImages.length > 0 ? (
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScroll={(e) => {
                    const offsetX = e.nativeEvent.contentOffset.x
                    const index = Math.round(offsetX / (Dimensions.get("window").width * 0.6))
                    setCurrentImageIndex(index)
                  }}
                  scrollEventThrottle={16}
                >
                  {swiperImages.map((img, index) => (
                    <Image
                      key={index}
                      source={{ uri: img.url }}
                      style={styles.swiperImage}
                      resizeMode="contain"
                    />
                  ))}
                </ScrollView>
              ) : (
                <Image
                  source={{ uri: productDetail.main_image }}
                  style={styles.swiperImage}
                  resizeMode="contain"
                />
              )}
              {/* 指示器 */}
              {swiperImages.length > 1 && (
                <View style={styles.indicator}>
                  {swiperImages.map((_, index) => (
                    <View
                      key={index}
                      style={[styles.dot, currentImageIndex === index && styles.activeDot]}
                    />
                  ))}
                </View>
              )}
            </View>

            {/* 商品信息 */}
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{productDetail.name}</Text>
              <View style={styles.productPrice}>
                <Image
                  source={require("../../../assets/images/balance-icon.png")}
                  style={styles.balanceIcon}
                  resizeMode="contain"
                />
                <Text style={styles.currentPrice}>{productDetail.price}</Text>
              </View>
            </View>

            {/* 发货信息 */}
            <View style={styles.infoCard}>
              <View style={styles.detailRow}>
                <Text style={styles.rowLabel}>发货：</Text>
                <Text style={styles.rowValue}>{productDetail.shipping_address} | 邮费详情</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.rowLabel}>选择：</Text>
                <Text style={styles.rowValue}>共1组规格供选择</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.rowLabel}>保障：</Text>
                <Text style={styles.rowValue}>【用户须知】学分商城兑换/购买商城</Text>
              </View>
            </View>

            {/* 商品详情图 */}
            {productDetail.host_graph && productDetail.host_graph.length > 0 && (
              <View style={styles.detailImages}>
                {productDetail.host_graph.map((item, index) => (
                  <Image
                    key={index}
                    source={{ uri: item.url }}
                    style={styles.detailImage}
                    resizeMode="contain"
                  />
                ))}
              </View>
            )}
          </ScrollView>

          {/* 底部按钮 */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.confirmButton} onPress={handleBuy} activeOpacity={0.8}>
              <Text style={styles.confirmButtonText}>立即兑换</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Portal>
  )
}

const styles = createStyles({
  modal: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  popup: {
    backgroundColor: "#fff",
    borderRadius: 9.765625,
    width: 464.84375,
    height: 362.890625,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 31.8125,
    position: "relative",
    backgroundColor: "#fff",
  },
  backButton: {
    position: "absolute",
    left: 10,
    padding: 5,
  },
  headerTitle: {
    fontSize: 11.71875,
    fontWeight: "600",
    color: "#333",
  },
  content: {
    flex: 1,
    backgroundColor: "#eeeeee",
  },
  swiperContainer: {
    backgroundColor: "#eeeeee",
    height: 165.625,
    position: "relative",
  },
  swiperImage: {
    width: 164.0625,
    height: 164.0625,
    marginTop: 2.6875,
  },
  indicator: {
    position: "absolute",
    bottom: 9.375,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 7.0315,
    height: 7.0315,
    borderRadius: 3.51575,
    backgroundColor: "#eeeeee",
    marginHorizontal: 3.125,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.75,
    elevation: 2,
  },
  activeDot: {
    backgroundColor: "#ffffff",
  },
  productInfo: {
    paddingVertical: 14.84375,
    paddingHorizontal: 18.75,
    backgroundColor: "#fff",
  },
  productName: {
    fontSize: 11.71875,
    color: "rgba(0, 0, 0, 0.8)",
    marginBottom: 3,
  },
  productPrice: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  balanceIcon: {
    width: 20.3125,
    height: 20.3125,
  },
  currentPrice: {
    fontSize: 15.6265,
    paddingLeft: 2,
    fontWeight: "bold",
    color: "#2260FF",
  },
  infoCard: {
    paddingVertical: 10.9375,
    paddingHorizontal: 18.75,
    backgroundColor: "#fff",
    marginTop: 3.125,
  },
  detailRow: {
    flexDirection: "row",
    marginTop: 4.125,
  },
  rowLabel: {
    fontSize: 10.156,
    color: "#555",
  },
  rowValue: {
    fontSize: 10.156,
    color: "#555",
    paddingLeft: 4.125,
    flex: 1,
  },
  detailImages: {
    paddingVertical: 10.9375,
    paddingHorizontal: 18.75,
    backgroundColor: "#fff",
    marginTop: 3.125,
    alignItems: "center",
  },
  detailImage: {
    width: "100%",
    height: 200,
    marginBottom: 10,
  },
  footer: {
    backgroundColor: "#fff",
  },
  confirmButton: {
    backgroundColor: "#5C9DFF",
    height: 46.875,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 9.375,
  },
  confirmButtonText: {
    fontSize: 14.0625,
    fontWeight: "bold",
    color: "#fff",
  },
})
