import React, { useCallback, useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native"
import { createStyles, rpx } from "../../utils/rpxStyleSheet"
import { LinearGradient } from "expo-linear-gradient"
import Ionicons from "@expo/vector-icons/build/Ionicons"
import { Images } from "../../constants/Assets"
import ConfirmDialog from "../common/ConfirmDialog"
import ImageWithPlaceholder from "../common/ImageWithPlaceholder"
import { useProductDetailStore } from "../../stores/points-mall/productDetailStore"
import { exchangeProduct } from "../../services/pointsMall"
import { showError, showSuccess } from "../../utils/toast"

/**
 * 确认订单信息视图组件
 */

interface OrderConfirmProps {
  onNext: () => void
  onSuccess?: () => void
}

const OrderConfirmView: React.FC<OrderConfirmProps> = ({ onNext, onSuccess }) => {
  const { productId, productName, price, mainImage, defaultAddress } = useProductDetailStore();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // 判断按钮是否禁用：当 productId 或 defaultAddress 为空时禁用
  const isDisabled = !productId || !defaultAddress;

  // 兑换商品
  const handleExchangeProduct = useCallback(async () => {
    if (!productId || !defaultAddress) {
      showError("请选择商品或收货地址");
      return;
    }

    try {
      await exchangeProduct({
        product_id: productId.toString(),
        address_id: defaultAddress.id.toString(),
      });
      showSuccess("兑换成功");
      onSuccess?.();
    } catch (error) {
      console.error("兑换商品失败:", error);
    }
  }, [productId, defaultAddress, onSuccess]);

  const handleConfirmExchange = useCallback(async () => {
    await handleExchangeProduct();
    setShowConfirmDialog(false);
  }, [handleExchangeProduct])

  const handleButtonPress = useCallback(() => {
    if (isDisabled) {
      return;
    }
    setShowConfirmDialog(true);
  }, [isDisabled])

  return (
    <>
      <View style={styles.headerContainer}>
        <Text style={styles.titleText}>确认订单</Text>
      </View>
      <View style={styles.container}>
        {/* 地址信息 */}
        <View style={styles.addressInfoCard}>
          <TouchableOpacity style={styles.addressInfoContent} onPress={onNext}>
            <Ionicons
              name="location"
              size={rpx(14.0625)}
              color="rgba(0, 0, 0, 0.4)"
              style={styles.addressInfoIcon}
            />
            {defaultAddress ? (
              <Text style={styles.addressInfoText}>{defaultAddress.receiver_name}，{defaultAddress.phone}，{defaultAddress.province}{defaultAddress.city}{defaultAddress.district}{defaultAddress.detail_address}</Text>
            ) : (
              <Text style={styles.addressInfoText}>请选择收货地址</Text>
            )}
            <Ionicons
              name="chevron-forward"
              size={rpx(14.0625)}
              color="rgba(0, 0, 0, 0.4)"
              style={styles.addressInfoIcon}
            />
          </TouchableOpacity>
        </View>
        {/* 商品信息 */}
        <View style={styles.productInfoCard}>
          <View style={styles.productInfoImageContainer}>
            <ImageWithPlaceholder
              source={{ uri: mainImage }}
              style={styles.productInfoImage}
              resizeMode="cover"
            />
          </View>
          <View style={styles.productInfoContent}>
            <Text style={styles.productInfoName} numberOfLines={2}>{productName}</Text>
            <Text style={styles.productInfoCount}>x1</Text>
          </View>
        </View>
        {/* 价格总计 */}
        <View style={styles.priceTotalCard}>
          <View style={styles.priceRow}>
            <View style={styles.priceRowLeft}>
              <Text style={styles.priceLabel}>商品总价</Text>
              <Text style={styles.priceCount}>共1件</Text>
            </View>
            <View style={styles.priceRowRight}>
              <View style={styles.priceAmountRow}>
                <Image source={Images.pointsMallPointsIcon} style={styles.coinIcon} resizeMode="contain" />
                <Text style={styles.priceValue}>{price}</Text>
              </View>
              {/* <Text style={styles.rmbValue}>￥ 0</Text> */}
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>合计</Text>
            <View style={styles.totalAmountRow}>
              <Image source={Images.pointsMallPointsIcon} style={styles.coinIcon} resizeMode="contain" />
              <Text style={styles.totalAmount}>{price}</Text>
            </View>
          </View>
        </View>
        {/* 温馨提示 */}
        <View style={styles.tipSection}>
          <Text style={styles.tipText}>温馨提示</Text>
          <Text style={styles.tipContent}>点击确认兑换，表示您已阅读并同意<Text style={styles.tipActive}>《兑换及退换货须知》</Text>，兑换后我们会根据须知内容处理您反馈的兑换问题</Text>
        </View>
      </View>
      {/* 下一步按钮 */}
      <TouchableOpacity
        style={[styles.nextButton, isDisabled && styles.nextButtonDisabled]}
        activeOpacity={isDisabled ? 1 : 0.8}
        disabled={isDisabled}
        onPress={handleButtonPress}
      >
        <LinearGradient
          colors={isDisabled ? ['#E0E0E0', '#C0C0C0'] : ['#FFDCBC', '#FFBB7B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.nextButtonGradient}
        >
          <Text style={[styles.nextButtonText, isDisabled && styles.nextButtonTextDisabled]}>确认兑换</Text>
        </LinearGradient>
      </TouchableOpacity>
      <ConfirmDialog
        visible={showConfirmDialog}
        title="确认兑换吗?"
        content="时间货币一旦兑换后订单不可取消哦"
        confirmText="确认兑换"
        cancelText="再考虑下"
        onClose={() => { setShowConfirmDialog(false) }}
        onConfirm={handleConfirmExchange}
      />
    </>
  )
}

const styles = createStyles({
  container: {
    width: '100%' as const,
    height: '100%' as const,
    padding: 14.0625, // 36
    paddingTop: 39.84375, // 102
    gap: 7.8125, // 20
    backgroundColor: "#F5F5F5" as const,
  },
  headerContainer: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    width: '100%' as const,
    height: 38.2813, // 98
    flexDirection: "row" as const,
    // backgroundColor: "#FFFFFF" as const,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    zIndex: 1
  },
  titleText: {
    fontFamily: "PingFang SC",
    fontWeight: "400" as const,
    fontSize: 11.7188, // 30
    color: "#000000",
  },
  addressInfoCard: {
    width: 378.125, // 968
    height: 41.4063, // 106
    backgroundColor: "#FFFFFF" as const,
    borderRadius: 7.8125, // 20
    overflow: "hidden" as const,
  },
  addressInfoContent: {
    width: '100%' as const,
    height: '100%' as const,
    flexDirection: "row" as const,
    justifyContent: "flex-start" as const,
    alignItems: "center" as const,
    paddingHorizontal: 15.625, // 40
    paddingVertical: 4.6875, // 32
    gap: 3.9063, // 10
  },
  addressInfoIcon: {
    width: 14.0625, // 36
    height: 14.0625, // 36
  },
  addressInfoText: {
    flex: 1,
    fontFamily: "PingFang SC",
    fontWeight: "400" as const,
    fontSize: 10.9375, // 28
    color: "#000000",
  },
  productInfoCard: {
    width: 378.125, // 968
    height: 93.75, // 240
    flexDirection: "row" as const,
    backgroundColor: "#FFFFFF" as const,
    justifyContent: "flex-start" as const,
    alignItems: "center" as const,
    paddingVertical: 10.9375, // 28
    paddingHorizontal: 9.375, // 24
    borderRadius: 7.8125, // 20
    gap: 9.375, // 24
  },
  productInfoImageContainer: {
    width: 78.125, // 200
    height: 78.125, // 200
    borderRadius: 8.5938, // 22
    overflow: "hidden" as const,
  },
  productInfoImage: {
    width: '100%' as const,
    height: '100%' as const,
  },
  productInfoContent: {
    flex: 1,
    height: '100%' as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
    paddingVertical: 3.9063, // 10
  },
  productInfoName: {
    fontFamily: "PingFang SC",
    fontWeight: "bold" as const,
    fontSize: 12.5, // 32
    color: "#000000CC",
  },
  productInfoCount: {
    fontFamily: "PingFang SC",
    fontWeight: "400" as const,
    fontSize: 11.7188, // 30
    color: "#00000073",
  },
  priceTotalCard: {
    width: 378.125, // 968
    height: 89.0625, // 228
    backgroundColor: "#FFFFFF" as const,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: 17.1875, // 44
    paddingVertical: 7.8125, // 20
    borderRadius: 7.8125, // 20
  },
  priceRow: {
    width: "100%" as const,
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 7.03125, // 18
  },
  priceRowLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 5.859375, // 15
  },
  priceLabel: {
    fontFamily: "PingFang SC",
    fontWeight: "bold" as const,
    fontSize: 10.9375, // 28
    color: "#000000",
  },
  priceCount: {
    fontFamily: "PingFang SC",
    fontWeight: "400" as const,
    fontSize: 11.71875, // 30
    color: "#00000073",
  },
  priceRowRight: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 11.71875, // 30
  },
  priceAmountRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 5.859375, // 15
  },
  coinIcon: {
    width: 20.3125, // 52
    height: 20.3125, // 52
  },
  priceValue: {
    fontFamily: "PingFang SC",
    fontWeight: "400" as const,
    fontSize: 12.5, // 32
    color: "#000000",
  },
  rmbValue: {
    fontFamily: "PingFang SC",
    fontWeight: "400" as const,
    fontSize: 12.5, // 32
    color: "#000000",
  },
  divider: {
    width: "100%" as const,
    height: 0.5859375, // 1.5 * 750 / 1920
    backgroundColor: "#0000001A",
    marginBottom: 7.03125, // 18
  },
  totalRow: {
    width: "100%" as const,
    flexDirection: "row" as const,
    justifyContent: "flex-end" as const,
    alignItems: "center" as const,
    gap: 5.859375, // 15
  },
  totalLabel: {
    fontFamily: "PingFang SC",
    fontWeight: "bold" as const,
    fontSize: 12.5, // 32
    color: "#000000",
  },
  totalAmountRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 5.859375, // 15
  },
  totalAmount: {
    fontFamily: "PingFang SC",
    fontWeight: "500" as const,
    fontSize: 12.5, // 32
    color: "#2260FF",
  },
  tipSection: {
    width: '100%' as const,
  },
  tipText: {
    fontFamily: "PingFang SC",
    fontWeight: "400" as const,
    fontSize: 8.5938, // 22
    color: "#0000008C",
  },
  tipContent: {
    fontFamily: "PingFang SC",
    fontWeight: "400" as const,
    fontSize: 9.375, // 24
    color: "#00000066",
  },
  tipActive: {
    color: "#0F6EFD",
  },
  nextButton: {
    position: "absolute" as const,
    bottom: 10.9375, // 28
    left: 108.0078125, // 276.5
    width: 187.5, // 480
    height: 33.203125, // 85
    backgroundColor: "#FF8C00",
    borderRadius: 15.625, // 40
    overflow: "hidden" as const,
  },
  nextButtonDisabled: {
    backgroundColor: "#E0E0E0",
    opacity: 0.6,
  },
  nextButtonGradient: {
    width: "100%" as const,
    height: "100%" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  nextButtonText: {
    fontFamily: "PingFang SC",
    fontWeight: "bold" as const,
    fontSize: 12.5, // 32
    color: "#743A14",
  },
  nextButtonTextDisabled: {
    color: "#999999",
  },
})

export default OrderConfirmView

