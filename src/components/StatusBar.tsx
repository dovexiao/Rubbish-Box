import { useState, useCallback, useEffect } from "react"
import { View, Platform, StatusBar as RNStatusBar, Text } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { createStyles, rpx } from "../utils/rpxStyleSheet"
import { useNetwork } from "../stores/networkStore"
import { useBattery } from "../stores/batteryStore"
import { getScreenInfo } from "../utils/rpxStyleSheet"

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
  
  // 获取电池状态（共享全局状态）
  const {
    batteryLevel,
    isCharging,
  } = useBattery()

  // const batteryLevel = null;
  // const isCharging = true;

  // const isConnected = true;
  // const isInternetReachable = true;
  // const networkType = "wifi";
  // const networkDetails = {
  //   strength: 60,
  //   ssid: "test",
  //   frequency: 2437,
  //   cellularGeneration: "4G",
  // };

  const [isTablet, setIsTablet] = useState(false);

  const getIsTablet = async () => {
    const screenInfo = await getScreenInfo();
    const { isTablet } = screenInfo;
    setIsTablet(isTablet);
  }

  useEffect(() => {
    getIsTablet();
  }, []);

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

  // 渲染电池图标
  const renderBatteryIcon = () => {
    const baseIconColor = theme === "dark" ? "#fff" : "#000"
    
    // 充电状态颜色（绿色）
    const chargingColor = theme === "dark" ? "#4CAF50" : "#00C53B"
    
    // 根据电量设置颜色：危险(<20%) / 警告(20-40%) / 正常(>=40%)
    let batteryColor: string
    if (batteryLevel === null) {
      // 未知状态：灰色
      batteryColor = theme === "dark" ? "#999" : "#666"
    } else {
      const level = batteryLevel
      if (level < 0.1) {
        // 危险：红色
        batteryColor = theme === "dark" ? "#FF6B6B" : "#E60012"
      } else if (level < 0.2) {
        // 警告：橙色
        batteryColor = theme === "dark" ? "#FFB84D" : "#FF9500"
      } else {
        // 正常：使用基础颜色
        batteryColor = baseIconColor
      }
    }
    
    // 如果正在充电，使用充电颜色
    if (isCharging) {
      batteryColor = chargingColor
    }
    
    // 计算电量宽度（最大宽度 50，对应 100%）
    const level = batteryLevel ?? 0
    const batteryWidth = level * rpx(19.53125) // 50 = 19.53125rpx
    
    return (
      <View style={styles.batteryContainer}>
        {/* 大矩形（电池主体） */}
        <View style={[styles.batteryMainRect, { borderColor: baseIconColor }]}>
          {/* 中矩形（透明背景容器） */}
          <View style={styles.batteryMiddleRect}>
            {/* 最内小矩形（电量显示） */}
            <View 
              style={[
                styles.batteryLevelRect, 
                { 
                  width: batteryWidth,
                  backgroundColor: batteryColor 
                }
              ]} 
            />
          </View>
        </View>
        {/* 右边小矩形（电池正极） */}
        <View style={[styles.batteryTerminalRect, { backgroundColor: baseIconColor }]} />
        {/* 充电图标（如果正在充电） */}
        {isCharging && (
          <MaterialIcons
            name="flash-on"
            size={rpx(11.71875)} // 30
            color={baseIconColor}
            style={styles.batteryChargingIcon}
          />
        )}
      </View>
    )
  }

  // 渲染网络信号图标
  const renderNetworkIcon = () => {
    const iconSize = rpx(18.359375) // 47
    const baseIconColor = theme === "dark" ? "#fff" : "#000"
    
    // 判断是否为蜂窝网络类型
    const isCellular = networkType === "cellular"
    // 其他类型按 WiFi 处理
    
    let iconName: string
    let iconColor: string
    // 未连接网络
    if (!isConnected) {
      if (isCellular) {
        iconName = "signal-cellular-off"
      } else {
        iconName = "wifi-off"
      }
      // 根据主题设置未连接图标颜色
      iconColor = theme === "dark" ? "#999" : "#666"
    }
    // 假连接：已连接但无法访问互联网
    else if (!isInternetReachable) {
      if (isCellular) {
        iconName = "signal-cellular-connected-no-internet-4-bar"
      } else {
        iconName = "perm-scan-wifi"
      }
      // 根据主题设置假连接图标颜色
      // iconColor = theme === "dark" ? "#FFB84D" : "#FF9500"
      iconColor = theme === "dark" ? "#999" : "#666"
    }
    // 正常连接 - 根据信号强度显示
    else {
      const strength = networkDetails.strength ?? 100
      
      if (isCellular) {
        if (strength < 30) {
          iconName = "signal-cellular-alt-1-bar"
        } else if (strength < 70) {
          iconName = "signal-cellular-alt-2-bar"
        } else {
          iconName = "signal-cellular-alt"
        }
      } else {
        if (strength < 30) {
          iconName = "wifi-1-bar"
        } else if (strength < 70) {
          iconName = "wifi-2-bar"
        } else {
          iconName = "wifi"
        }
      }
      iconColor = baseIconColor
    }
    // 渲染图标
    const iconElement = (
      <MaterialIcons
        name={iconName as any}
        size={iconSize}
        color={iconColor}
        style={isCellular ? styles.cellularIcon : styles.wifiIcon}
      />
    )
    
    // 蜂窝网络正常连接时需要显示网络代数
    if (isCellular && isConnected && isInternetReachable) {
      const generation = networkDetails.cellularGeneration
      return (
        <View style={styles.signalContainer}>
          {iconElement}
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
    
    return (
      <View style={styles.signalContainer}>
        {iconElement}
      </View>
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
          {/* 电池图标 - 根据电池电量和充电状态动态显示 */}
          {isTablet && renderBatteryIcon()}
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
    height: 38.28125, // 98
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
    // marginLeft: 8,
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
  batteryContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    // width: 38.28125, // 98
    height: 11.71875, // 30
    marginRight: 5.859375, // 15
    gap: 0.78125, // 2
  },
  batteryMainRect: {
    width: 24.21875, // 62
    height: 11.71875, // 30
    borderRadius: 3.515625, // 9
    borderWidth: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  batteryMiddleRect: {
    width: 21.09375, // 54
    height: 8.59375, // 22
    borderRadius: 1.953125, // 5
    backgroundColor: "transparent",
    justifyContent: "center" as const,
    alignItems: "flex-start" as const,
    padding: 0.78125, // 2 gap
    overflow: "hidden" as const,
  },
  batteryLevelRect: {
    height: 7.03125, // 18
    maxWidth: 19.53125, // 50
    borderRadius: 1.171875, // 3
    minWidth: 0,
  },
  batteryTerminalRect: {
    width: 1.5625, // 4
    height:3.90625, // 10
    borderRadius: 0.78125, // 2
    marginLeft: 0.78125, // 2 gap
  },
  batteryChargingIcon: {
    // marginLeft: 0.78125, // 2 gap
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
