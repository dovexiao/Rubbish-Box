import { useState, useCallback, useEffect } from "react"
import { View, Platform, StatusBar as RNStatusBar, Text } from "react-native"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { createStyles, rpx } from "../utils/rpxStyleSheet"
import { useNetwork } from "../stores/networkStore"

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
  
  // 获取网络状态和信号强度（共享全局状态）
  const { 
    isConnected, 
    isInternetReachable, 
    networkType, 
    networkDetails 
  } = useNetwork()

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

  // 渲染网络信号图标
  const renderNetworkIcon = () => {
    const iconColor = theme === "dark" ? "#fff" : "#000"
    const iconSize = rpx(16.25)

    // 未连接网络
    if (!isConnected) {
      return (
        <Ionicons
          name="wifi-outline"
          size={iconSize}
          color="#999"
          style={styles.wifiIcon}
        />
      )
    }

    // WiFi 网络 - 根据信号强度显示
    if (networkType === "wifi") {
      const strength = networkDetails.strength ?? 100
      let wifiIconName: "wifi-outline" | "wifi" = "wifi"
      
      if (strength < 30) {
        wifiIconName = "wifi-outline" // 弱信号
      } else if (strength < 70) {
        wifiIconName = "wifi" // 中等信号
      } else {
        wifiIconName = "wifi" // 强信号
      }

      return (
        <View style={styles.signalContainer}>
          <Ionicons
            name={wifiIconName}
            size={iconSize}
            color={iconColor}
            style={styles.wifiIcon}
          />
        </View>
      )
    }

    // 蜂窝网络 - 显示网络代数
    if (networkType === "cellular") {
      const generation = networkDetails.cellularGeneration
      
      return (
        <View style={styles.signalContainer}>
          <MaterialIcons
            name="signal-cellular-alt"
            size={iconSize}
            color={iconColor}
            style={styles.cellularIcon}
          />
          {generation && (
            <Text style={[
              styles.networkGeneration,
              theme === "dark" ? styles.darkText : styles.lightText
            ]}>
              {generation.toUpperCase()}
            </Text>
          )}
        </View>
      )
    }

    // 其他网络类型 - 显示默认 WiFi 图标
    return (
      <Ionicons
        name="wifi"
        size={iconSize}
        color={iconColor}
        style={styles.wifiIcon}
      />
    )
  }

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
          {/* 网络信号图标 - 根据网络状态和信号强度动态显示 */}
          {renderNetworkIcon()}
        </View>
      </View>
    </View>
  )
}

const styles = createStyles({
  statusBarContainer: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    width: "100%" as const,
    height: 38.28125, // 98px转rpx = 98 * 750 / 1920 = 38.28125rpx
    backgroundColor: "transparent",
    paddingHorizontal: 20.3125,
    position: "absolute" as const,
    top: 0,
    left: 0,
    zIndex: 9998, // 降低z-index，避免与NavBar重叠
  },
  statusBarLeft: {
    alignItems: "center" as const,
  },
  statusBarRight: {
    alignItems: "center" as const,
  },
  iconGroup: {
    alignItems: "center" as const,
    flexDirection: "row" as const,
  },
  signalContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginLeft: 8,
  },
  time: {
    fontSize: 15.625,
    lineHeight: 18,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontWeight: "600" as const, // 增加字重确保清晰显示
  },
  wifiIcon: {
    // WiFi 图标样式
  },
  cellularIcon: {
    marginRight: 2,
  },
  networkGeneration: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "600" as const,
    marginLeft: 2,
  },
  lightText: {
    color: "#000",
  },
  darkText: {
    color: "#fff",
  },
})

export default StatusBar
