/*
 * @Author: zdb zhiubo_1@163.com
 * @Date: 2025-09-30 13:32:51
 * @LastEditors: zdb zhiubo_1@163.com
 * @LastEditTime: 2025-10-13 13:32:49
 * @FilePath: /xhtx-app/xhtx/src/components/NavBar.tsx
 * @Description:
 */
import { View, Text, TouchableOpacity } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { createStyles, rpx } from "../utils/rpxStyleSheet"

/**
 * 导航栏组件
 * 对应UniApp项目中的Navbar组件
 */
interface NavBarProps {
  title: string
  leftArrow?: boolean
  goBackDelta?: number
  onBackPress?: () => void
  rightContent?: React.ReactNode
}

export function NavBar({
  title,
  leftArrow = true,
  goBackDelta = 1,
  onBackPress,
  rightContent,
}: NavBarProps) {
  const router = useRouter()

  const handleClickLeft = () => {
    if (onBackPress) {
      onBackPress()
    } else {
      // 检查是否可以返回
      if (router.canGoBack?.()) {
        router.back()
      } else {
        // 如果不能返回，导航到首页
        router.navigate("/(tabs)/study")
      }
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {leftArrow && (
          <TouchableOpacity
            style={styles.leftButton}
            onPress={handleClickLeft}
            activeOpacity={0.6}
            delayPressIn={0}
          >
            <Ionicons name="chevron-back" size={rpx(19.53125)} color="#1571fc" />
          </TouchableOpacity>
        )}
        {/* 标题容器 */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.rightContent}>{rightContent}</View>
      </View>
    </View>
  )
}

const styles = createStyles({
  container: {
    marginTop: 37.5, // 96
  },
  navBar: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    backgroundColor: "transparent",
    height: 26.5625, // 68
    zIndex: 9999, // 确保NavBar在StatusBar之上
  },
  leftButton: {
    width: 26.5625, // 68
    height: 26.5625, // 68
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginLeft: 23.4375, // 60
  },
  titleContainer: {
    position: "absolute" as const,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  title: {
    textAlign: "center" as const,
    color: "#1571fc", // UniApp原值
    fontSize: 15.625, // 40
    fontWeight: "400" as const,
    fontFamily: "kingnam_bobo",
  },
  rightContent: {
    minWidth: 31.25, // 40px转rpx = 31.25rpx
    alignItems: "flex-end" as const,
    flexShrink: 0,
  },
})
