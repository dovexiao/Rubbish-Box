import { useState, useCallback, useRef } from "react"
import { View, ScrollView } from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"

import { StatusBar } from "../../components/StatusBar"
import { createStyles, rpx } from "../../utils/rpxStyleSheet"
import {
  DailyCheckIn,
  type DailyCheckInRef,
  DailyCheckInOnAnswer,
  CheckInSuccessPopup,
  type CheckInSuccessPopupRef,
  CurrencyGuideFloatingButton,
  CurrencyAmount,
  type CurrencyAmountRef,
  MultiCategoryProductList,
  DiscountedProductWindow,
  NewProductDetailsPopup,
  type NewProductDetailsPopupRef,
  CurrencyGuidePopup,
} from "@/components/points-mall"

export default function PointsMallScreen() {
  const router = useRouter()

  const [showDailyCheckInOnAnswer, setShowDailyCheckInOnAnswer] = useState(false);
  const [dailyCheckInPoints, setDailyCheckInPoints] = useState(0);
  const dailyCheckInRef = useRef<DailyCheckInRef>(null);
  const currencyAmountRef = useRef<CurrencyAmountRef>(null);
  const checkInSuccessPopupRef = useRef<CheckInSuccessPopupRef>(null);
  const newProductDetailsPopupRef = useRef<NewProductDetailsPopupRef>(null);
  const [showCurrencyGuide, setShowCurrencyGuide] = useState(false)

  // 处理打卡答题回调
  const handleDailyCheckInAnswer = useCallback((points: number) => {
    setShowDailyCheckInOnAnswer(true);
    setDailyCheckInPoints(points);
  }, []);

  // 关闭打卡答题弹窗，并刷新打卡列表和余额
  const handleCloseDailyCheckInOnAnswer = useCallback((points: number) => {
    setShowDailyCheckInOnAnswer(false);
    const timer = setTimeout(() => {
      // 显示打卡成功弹窗
      checkInSuccessPopupRef.current?.show(points);
      clearTimeout(timer);
    }, 0)
    // 重新加载打卡列表
    dailyCheckInRef.current?.loadWeekCheckInList();
    // 刷新余额
    currencyAmountRef.current?.refreshBalance();
  }, []);

  // 控制滚动的手势切换
  const [scrollViewEnabled, setScrollViewEnabled] = useState(true)
  const scrollViewRef = useRef<ScrollView>(null)

  // 显示货币指南
  const handleShowCurrencyGuide = useCallback(() => {
    setShowCurrencyGuide(true)
  }, []);

  // 点击商品详情
  const handleClickProductDetails = useCallback((id: number) => {
    newProductDetailsPopupRef.current?.show(id)
  }, [])

  // 关闭商品详情弹窗
  const handleCloseNewProductDetails = useCallback(() => {
    // 刷新余额
    currencyAmountRef.current?.refreshBalance()
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
      style={styles.container}
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
            onAnswer={handleDailyCheckInAnswer}
          />
          {/* 货币余额 */}
          <CurrencyAmount
            ref={currencyAmountRef}
            onPress={() => router.push("/currency-record")}
            style={styles.currencyAmountContainer}
          />
          {/* 折扣商品窗口 */}
          <DiscountedProductWindow
            style={styles.discountedProductWindowContainer}
            onProductClick={handleClickProductDetails}
          />
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
      </ScrollView>

      {/* 每日打卡答题弹窗 */}
      <DailyCheckInOnAnswer
        visible={showDailyCheckInOnAnswer}
        points={dailyCheckInPoints}
        onClose={handleCloseDailyCheckInOnAnswer}
      />

      {/* 打卡成功弹窗 */}
      <CheckInSuccessPopup ref={checkInSuccessPopupRef} />

      {/* 商品详情弹窗 */}
      <NewProductDetailsPopup
        ref={newProductDetailsPopupRef}
        onClose={handleCloseNewProductDetails}
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
    </LinearGradient>
  )
}

const styles = createStyles({
  container: {
    flex: 1,
    width: "100%" as const,
    height: "100%" as const,
  },
  scrollView: {
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
