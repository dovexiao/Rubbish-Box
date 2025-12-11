import React, { memo, useCallback, useMemo, useRef } from "react"
import { View, Text, Image, Pressable } from "react-native"
import { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { createStyles } from "../utils/rpxStyleSheet"
import { Images } from "../constants/Assets"
import { BlurView } from "@react-native-community/blur";

// 预计算Tab配置映射，避免每次find()操作
const TAB_CONFIG_MAP = {
  index: {
    name: "index",
    text: "首页",
    imgUrl: Images.tabHome,
    imgUrlActive: Images.tabHomeActive,
  },
  study: {
    name: "study",
    text: "学习",
    imgUrl: Images.tabStudy,
    imgUrlActive: Images.tabStudyActive,
  },
  "points-mall": {
    name: "points-mall",
    text: "时间商城",
    imgUrl: Images.tabPointsMall,
    imgUrlActive: Images.tabPointsMallActive,
  },
  my: {
    name: "my",
    text: "我的",
    imgUrl: Images.tabMine,
    imgUrlActive: Images.tabMineActive,
  },
} as const

// 预计算样式对象，避免重复创建
const PRESSED_STYLE = { opacity: 0.6, transform: [{ scale: 0.95 }] }
const NORMAL_STYLE = { opacity: 1, transform: [{ scale: 1 }] }

// 高性能Tab项组件
const TabItem = memo(function TabItem({
  route,
  index,
  isFocused,
  tabConfig,
  options,
  onPress,
  onLongPress,
}: {
  route: any
  index: number
  isFocused: boolean
  tabConfig: any
  options: any
  onPress: () => void
  onLongPress: () => void
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel}
      testID={(options as any).tabBarTestID}
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.tabItem,
        pressed ? PRESSED_STYLE : NORMAL_STYLE,
      ]}
      hitSlop={{ top: 15, bottom: 15, left: 10, right: 10 }}
      android_disableSound={true}
      android_ripple={null}
    >
      <Image
        source={isFocused ? tabConfig.imgUrlActive : tabConfig.imgUrl}
        style={styles.tabIcon}
        resizeMode="contain"
      />
      <Text
        style={[
          styles.tabText,
          isFocused ? styles.tabTextActive : styles.tabTextInactive,
        ]}
      >
        {tabConfig.text}
      </Text>
    </Pressable>
  )
})

/**
 * 高性能TabBar组件
 * 移除所有动画，专注极致性能
 */
export const CustomTabBar = memo(function CustomTabBar({
  state,
  descriptors,
  navigation
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets()
  const lastPressTime = useRef<number>(0)
  const lastPressRoute = useRef<string>('')

  // 跟手感点击处理器 - 立即响应
  const handleTabPress = useCallback((route: any, isFocused: boolean) => {
    const now = Date.now()

    // 如果已经是当前页面，直接返回
    if (isFocused) return

    // 防抖：100ms内重复点击同一路由，忽略（更短的防抖时间）
    if (now - lastPressTime.current < 100 && lastPressRoute.current === route.name) {
      return
    }

    lastPressTime.current = now
    lastPressRoute.current = route.name

    // 立即导航，不等待任何事件处理
    navigation.navigate(route.name, route.params)

    // 异步发送事件，不阻塞导航
    requestAnimationFrame(() => {
      navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      })
    })
  }, [navigation])

  // 优化的onLongPress处理器
  const handleTabLongPress = useCallback((route: any) => {
    navigation.emit({
      type: "tabLongPress",
      target: route.key,
    })
  }, [navigation])

  return (
    <View style={[styles.tabbarWrapper, { bottom: 17.1875 + insets.bottom }]}>
      <View
        // colors={["rgba(255, 255, 255, 0.8)", "rgba(255, 255, 255, 0.2)"]}
        // locations={[0, 1]}
        // start={{ x: 0, y: 0 }}
        // end={{ x: 1, y: 1 }}
        style={styles.tabbarContainer}
      >
        <BlurView
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          blurType="light"
          blurAmount={8}
          overlayColor="rgba(255, 255, 255, 0.5)"
        />
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key]
          const isFocused = state.index === index

          // 使用预计算的映射，避免find()操作
          const tabConfig = TAB_CONFIG_MAP[route.name as keyof typeof TAB_CONFIG_MAP]
          if (!tabConfig) return null

          return (
            <TabItem
              key={route.key}
              route={route}
              index={index}
              isFocused={isFocused}
              tabConfig={tabConfig}
              options={options}
              onPress={() => handleTabPress(route, isFocused)}
              onLongPress={() => handleTabLongPress(route)}
            />
          )
        })}
      </View>
    </View>
  )
})

const styles = createStyles({
  tabbarWrapper: {
    position: "absolute" as const,
    left: "50%" as any,
    marginLeft: -208.3985,
    width: 416.797,
    height: 63.6718,
    shadowColor: "#1e64b7",
    shadowOffset: { width: 0, height: 1.5625 },
    shadowOpacity: 0.25,
    shadowRadius: 11.3281,
    elevation: 8,
  },
  tabbarContainer: {
    flex: 1,
    flexDirection: "row" as const,
    backgroundColor: "transparent",
    borderRadius: 15.625,
    overflow: "hidden" as const,
  },
  tabItem: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 8,
  },
  tabIcon: {
    width: 32.825,
    height: 32.825,
    marginBottom: 4,
  },
  tabText: {
    fontSize: 8.6,
    textAlign: "center" as const,
    fontWeight: "bold" as const,
  },
  tabTextActive: {
    color: "#2A3658",
  },
  tabTextInactive: {
    color: "rgba(0, 0, 0, 0.5019607843137255)",
  },
})

export default CustomTabBar