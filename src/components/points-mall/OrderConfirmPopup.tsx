import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native"
import { Modal, Portal, Snackbar } from "react-native-paper"
import { useState, useEffect } from "react"
import { Ionicons } from "@expo/vector-icons"

import { createStyles, rpx } from "../../utils/rpxStyleSheet"
import {
  getAddressList,
  exchangeProduct,
  type ProductDetailResponse,
  type AddressItem,
} from "../../services/pointsMall"
import { useUserStore } from "../../stores/userStore"
import { AddressListPopup } from "./AddressListPopup"
import { AddAddressPopup } from "./AddAddressPopup"
import { EditAddressPopup } from "./EditAddressPopup"

interface OrderConfirmPopupProps {
  visible: boolean
  productData: ProductDetailResponse | null
  onClose: () => void
  onConfirm: () => void
}

/**
 * 订单确认弹窗组件
 * 100%还原UniApp项目 /src/pages/pointsMall/components/OrderConfirmPopup.vue
 */
export function OrderConfirmPopup({
  visible,
  productData,
  onClose,
  onConfirm,
}: OrderConfirmPopupProps) {
  const userStore = useUserStore()
  const [selectedAddress, setSelectedAddress] = useState<AddressItem | null>(null)
  const [showAddressListPopup, setShowAddressListPopup] = useState(false)
  const [showAddAddressPopup, setShowAddAddressPopup] = useState(false)
  const [showEditAddressPopup, setShowEditAddressPopup] = useState(false)
  const [editAddressData, setEditAddressData] = useState<AddressItem | null>(null)
  const [snackbarVisible, setSnackbarVisible] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")
  const [snackbarType, setSnackbarType] = useState<"success" | "error" | "info">("info")

  // 加载地址列表
  useEffect(() => {
    if (visible) {
      loadAddressList()
    }
  }, [visible])

  // 显示 Snackbar 提示
  const showSnackbar = (message: string, type: "success" | "error" | "info" = "info") => {
    setSnackbarMessage(message)
    setSnackbarType(type)
    setSnackbarVisible(true)
  }

  const loadAddressList = async () => {
    try {
      const result = await getAddressList()
      if (result && result.length > 0) {
        setSelectedAddress(result[0])
      } else {
        setSelectedAddress(null)
      }
    } catch (error) {
      console.error("获取地址列表失败:", error)
      setSelectedAddress(null)
    }
  }

  const handleClose = () => {
    onClose()
  }

  // 处理地址选择
  const handleAddressSelect = (address: AddressItem) => {
    setSelectedAddress(address)
    setShowAddressListPopup(false)
  }

  // 处理新增地址成功
  const handleAddAddressSuccess = () => {
    setShowAddAddressPopup(false)
    loadAddressList() // 重新加载地址列表
  }

  // 处理编辑地址成功
  const handleEditAddressSuccess = () => {
    setShowEditAddressPopup(false)
    setEditAddressData(null)
    loadAddressList() // 重新加载地址列表
  }

  // 点击选择地址区域
  const handleAddressCardClick = () => {
    if (selectedAddress) {
      // 有地址，打开地址列表
      setShowAddressListPopup(true)
    } else {
      // 没有地址，直接打开新增地址弹窗
      setShowAddAddressPopup(true)
    }
  }

  const confirmExchange = async () => {
    if (!productData) {
      showSnackbar("商品信息缺失", "error")
      return
    }

    if (!selectedAddress) {
      showSnackbar("请选择收货地址", "info")
      return
    }

    try {
      await exchangeProduct({
        product_id: productData.id.toString(),
        address_id: selectedAddress.id.toString(),
      })

      // 刷新用户信息
      await userStore.getUserInfo()

      showSnackbar("兑换成功", "success")
      setTimeout(() => {
        handleClose()
        onConfirm()
      }, 1500)
    } catch (error: any) {
      // API层已经通过showError显示了错误，这里不再重复显示
      console.error("兑换失败:", error)
      // 只需要记录错误日志即可
    }
  }

  if (!productData) return null

  return (
    <Portal>
      <Modal visible={visible} onDismiss={handleClose} contentContainerStyle={styles.modal}>
        <View style={styles.popup}>
          {/* 头部 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.backButton}>
              <Ionicons name="arrow-back" size={rpx(11.71875)} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>确认订单</Text>
          </View>

          {/* 内容区域 */}
          <ScrollView style={styles.content}>
            {/* 收货地址 */}
            <TouchableOpacity
              style={styles.addressCard}
              onPress={handleAddressCardClick}
              activeOpacity={0.7}
            >
              <View style={styles.addressInfo}>
                <Ionicons
                  name="location"
                  size={rpx(14.0625)}
                  color="rgba(0, 0, 0, 0.4)"
                  style={styles.locationIcon}
                />
                <View style={styles.addressText}>
                  {selectedAddress ? (
                    <>
                      <Text style={styles.consigneeInfo}>收货地址：</Text>
                      <Text style={styles.consigneeInfo}>
                        {selectedAddress.receiver_name}，{selectedAddress.phone}，
                      </Text>
                      <Text style={styles.detailAddress} numberOfLines={2}>
                        {selectedAddress.province_text}
                        {selectedAddress.city_text}
                        {selectedAddress.district_text}
                        {selectedAddress.detail_address}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.consigneeInfo}>请填写收货地址</Text>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={rpx(11.71875)} color="rgba(0, 0, 0, 0.7)" />
            </TouchableOpacity>

            {/* 商品信息 */}
            <View style={styles.productCard}>
              <View style={styles.productItem}>
                <Image
                  source={{ uri: productData.main_image }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
                <View style={styles.productDetails}>
                  <Text style={styles.productName}>{productData.name}</Text>
                  <Text style={styles.productQuantity}>共一件</Text>
                  <View style={styles.shippingTag}>
                    <Text style={styles.shippingText}>大陆地区免运费</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 价格总计 */}
            <View style={styles.priceCard}>
              <View style={styles.priceRow}>
                <View style={styles.priceLeft}>
                  <Text style={styles.priceLabel}>商品总价</Text>
                  <Text style={styles.quantityText}>共1件</Text>
                </View>
                <View style={styles.priceRight}>
                  <View style={styles.pointsValue}>
                    <Image
                      source={require("../../../assets/images/balance-icon.png")}
                      style={styles.balanceIcon}
                      resizeMode="contain"
                    />
                    <Text style={styles.pointsText}>{productData.price}</Text>
                  </View>
                  <Text style={styles.currencyValue}>¥ 0</Text>
                </View>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>合计</Text>
                <View style={styles.totalRight}>
                  <Image
                    source={require("../../../assets/images/balance-icon.png")}
                    style={styles.balanceIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.totalPoints}>{productData.price}</Text>
                </View>
              </View>
            </View>

            {/* 温馨提示 */}
            <View style={styles.tipSection}>
              <Text style={styles.tipTitle}>温馨提示</Text>
              <Text style={styles.tipContent}>
                点击确认兑换，表示您已阅读并同意
                <Text style={styles.linkText}>《兑换及退换货须知》</Text>
                ，兑换后我们会根据须知内容处理您反馈的兑换问题
              </Text>
            </View>
          </ScrollView>

          {/* 底部按钮 */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={confirmExchange}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>确认兑换</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 地址列表弹窗 */}
      <AddressListPopup
        visible={showAddressListPopup}
        onClose={() => setShowAddressListPopup(false)}
        onSelect={handleAddressSelect}
      />

      {/* 新增地址弹窗 */}
      <AddAddressPopup
        visible={showAddAddressPopup}
        onClose={() => setShowAddAddressPopup(false)}
        onSuccess={handleAddAddressSuccess}
      />

      {/* 编辑地址弹窗 */}
      <EditAddressPopup
        visible={showEditAddressPopup}
        addressData={editAddressData}
        onClose={() => {
          setShowEditAddressPopup(false)
          setEditAddressData(null)
        }}
        onSuccess={handleEditAddressSuccess}
      />

      {/* Snackbar 提示 */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: "关闭",
          onPress: () => setSnackbarVisible(false),
        }}
        style={{
          backgroundColor:
            snackbarType === "success" ? "#52C41A" : snackbarType === "error" ? "#FF4D4F" : "#4891FF",
        }}
      >
        {snackbarMessage}
      </Snackbar>
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
    backgroundColor: "#eee",
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
  },
  addressCard: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 17.1875,
    height: 49.21875,
    marginTop: 3.125,
  },
  addressInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  locationIcon: {
    marginTop: 2,
  },
  addressText: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    flexWrap: "wrap",
  },
  consigneeInfo: {
    fontSize: 11.71875,
    color: "#000",
    paddingLeft: 3.125,
  },
  detailAddress: {
    fontSize: 11.71875,
    color: "#000",
    maxWidth: 203,
  },
  productCard: {
    backgroundColor: "#fff",
    marginTop: 3.125,
    paddingHorizontal: 17.1875,
    paddingVertical: 6.25,
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  productImage: {
    width: 109.375,
    height: 109.375,
    borderRadius: 3.9,
  },
  productDetails: {
    paddingLeft: 17.1875,
    flex: 1,
  },
  productName: {
    fontSize: 13.28125,
    color: "rgba(0, 0, 0, 0.8)",
    paddingTop: 3.125,
  },
  productQuantity: {
    fontSize: 11.71875,
    color: "rgba(0, 0, 0, 0.45)",
    paddingTop: 3.125,
  },
  shippingTag: {
    marginTop: 33.9,
    paddingHorizontal: 1,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 1.953,
    alignSelf: "flex-start",
  },
  shippingText: {
    fontSize: 9.765625,
    color: "rgba(0, 0, 0, 0.5)",
  },
  priceCard: {
    backgroundColor: "#fff",
    marginTop: 3.125,
    paddingHorizontal: 17.1875,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13.28,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
  },
  priceLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 15.625,
    color: "#000",
  },
  quantityText: {
    fontSize: 11.71875,
    color: "rgba(0, 0, 0, 0.45)",
    paddingLeft: 3.125,
  },
  priceRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  pointsValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceIcon: {
    width: 20.3125,
    height: 20.3125,
    marginLeft: 3.125,
  },
  pointsText: {
    fontSize: 15.6325,
    paddingLeft: 3.125,
    color: "#000",
  },
  currencyValue: {
    fontSize: 15.6325,
    paddingLeft: 23.4375,
    color: "#000",
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingVertical: 13.28,
  },
  totalLabel: {
    fontSize: 15.6325,
    fontWeight: "bold",
    color: "#000",
  },
  totalRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  totalPoints: {
    fontSize: 15.6325,
    fontWeight: "bold",
    color: "#2260FF",
    paddingLeft: 3.125,
  },
  tipSection: {
    marginTop: 6.125,
    paddingHorizontal: 17.1875,
  },
  tipTitle: {
    fontSize: 11.71875,
    color: "rgba(0, 0, 0, 0.55)",
    paddingTop: 4,
  },
  tipContent: {
    fontSize: 11.71875,
    color: "rgba(0, 0, 0, 0.4)",
    paddingTop: 2,
    lineHeight: 16,
  },
  linkText: {
    color: "#106efd",
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
