import { useState, useCallback, useEffect } from "react"
import { View, Platform, StatusBar as RNStatusBar, Text } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { createStyles, rpx } from "../utils/rpxStyleSheet"

interface StatusBarProps {
  theme?: "light" | "dark"
  backgroundColor?: string
  translucent?: boolean
}

/**
 * 自定义状态栏组件
 * 完全自定义实现，不依赖系统状态栏
 * 提供状态栏高度占位和样式控制
 */
export function StatusBar({
  theme = "light",
  backgroundColor = "transparent",
  translucent = true,
}: StatusBarProps) {
  const [currentTime, setCurrentTime] = useState("")

  // 更新时间
  const updateTime = useCallback(() => {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, "0")
    const minutes = String(now.getMinutes()).padStart(2, "0")
    setCurrentTime(`${hours}:${minutes}`)
  }, [])

  // 设置极速更新定时器
  useEffect(() => {
    updateTime()
    const timeInterval = setInterval(updateTime, 1000) // 每秒更新一次
    return () => clearInterval(timeInterval)
  }, [updateTime])

  // 隐藏系统状态栏 - 只调用 setHidden，避免其他设置触发状态栏显示
  useEffect(() => {
    // 只隐藏状态栏，不做其他设置
    RNStatusBar.setHidden(true)
    
    // 使用延迟再次确认隐藏
    const timer = setTimeout(() => {
      RNStatusBar.setHidden(true)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [theme, translucent])

  return (
    <View
      style={[
        styles.statusBarContainer,
        {
          backgroundColor,
        },
      ]}
    >
      <View style={styles.statusBarLeft}>
        <Text style={[styles.time, theme === "dark" ? styles.darkText : styles.lightText]}>
          {currentTime}
        </Text>
      </View>
      <View style={styles.statusBarRight}>
        <View style={styles.iconGroup}>
          {/* WiFi图标 - 使用Ionicons */}
          <Ionicons
            name="wifi"
            size={rpx(16.25)} // 使用rpx函数转换16.25rpx
            color={theme === "dark" ? "#fff" : "#000"}
            style={styles.wifiIcon}
          />
        </View>
      </View>
    </View>
  )
}

const styles = createStyles({
  statusBarContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    height: 38.28125, // 98px转rpx = 98 * 750 / 1920 = 38.28125rpx
    backgroundColor: "transparent",
    paddingHorizontal: 20.3125,
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 9998, // 降低z-index，避免与NavBar重叠
  },
  statusBarLeft: {
    alignItems: "center",
  },
  statusBarRight: {
    alignItems: "center",
  },
  iconGroup: {
    alignItems: "center",
    flexDirection: "row",
  },
  time: {
    fontSize: 15.625,
    lineHeight: 18,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontWeight: "600", // 增加字重确保清晰显示
  },
  wifiIcon: {
    marginLeft: 8,
  },
  lightText: {
    color: "#000",
  },
  darkText: {
    color: "#fff",
  },
})

export default StatusBar
