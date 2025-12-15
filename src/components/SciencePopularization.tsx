import { useState, useEffect, useRef, useCallback } from "react"
import { View, Animated, ImageBackground } from "react-native"
import { LinearGradient } from "expo-linear-gradient"

import { Text } from "./Themed"
import { Images } from "../constants/Assets"
import { getWhysList } from "../services/ai"
import { createStyles } from "../utils/rpxStyleSheet"

interface ScienceData {
  id?: number
  typeid?: number
  category?: string
  title: string
  content: string
}

interface Props {
  data?: ScienceData
  gifLoaded?: boolean
}

/**
 * 科普组件
 * 100%还原UniApp项目 /src/components/SciencePopularization.vue
 * 在AI加载页面显示科普知识，每12.5秒轮播一次
 */
export function SciencePopularization({ data, gifLoaded = false }: Props) {
  const [scienceData, setScienceData] = useState<ScienceData>(data || { title: "", content: "" })
  const [isLoaded, setIsLoaded] = useState(false)
  const [scienceDataList, setScienceDataList] = useState<ScienceData[]>([])
  const [_currentIndex, _setCurrentIndex] = useState(0)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current
  const hasFetchedWhys = useRef(false)

  // 更新科普知识内容
  const updateWhysContent = useCallback(
    (newData: ScienceData) => {
      console.log("更新科普内容:", newData.title)

      if (isLoaded) {
        // 淡出动画
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // 使用 requestAnimationFrame 包裹 setState，避免 useInsertionEffect 警告
          requestAnimationFrame(() => {
            // 更新数据
            setScienceData(newData)

            // 淡入动画
            Animated.parallel([
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }),
            ]).start()
          })
        })
      } else {
        setScienceData(newData)
      }
    },
    [isLoaded, fadeAnim, scaleAnim],
  )

  // 获取科普知识列表
  const fetchWhysList = useCallback(async () => {
    // 使用 useRef 防止重复请求
    if (hasFetchedWhys.current) {
      return
    }

    if (scienceDataList.length > 0) return

    hasFetchedWhys.current = true // 标记为已请求

    try {
      console.log("请求科普知识列表...")
      const response = await getWhysList()
      console.log("科普知识响应:", response)

      if (response && response.whys_list && response.whys_list.length > 0) {
        setScienceDataList(response.whys_list)
        console.log(`获取到${response.whys_list.length}条科普知识`)
        // 显示第一条
        updateWhysContent(response.whys_list[0])
      } else {
        console.warn("科普知识列表为空")
      }
    } catch (error) {
      console.error("获取科普知识失败:", error)
      hasFetchedWhys.current = false // 失败时重置，允许重试
    }
  }, [scienceDataList.length, updateWhysContent])

  // 显示下一条科普知识 - 使用useCallback避免重复创建
  const showNextWhys = useCallback(() => {
    if (scienceDataList.length === 0) {
      console.warn("科普列表为空，无法显示下一条")
      return
    }

    _setCurrentIndex((prevIndex) => {
      const nextIndex = (prevIndex + 1) % scienceDataList.length
      console.log(`显示第${nextIndex + 1}条科普知识，标题:`, scienceDataList[nextIndex].title)

      // 直接在这里更新内容
      updateWhysContent(scienceDataList[nextIndex])

      return nextIndex
    })
  }, [scienceDataList, updateWhysContent])

  // 监听 gifLoaded 变化 - 简化逻辑，立即显示
  useEffect(() => {
    console.log("科普组件 gifLoaded 状态:", gifLoaded)
    console.log("科普数据列表长度:", scienceDataList.length)

    // 只要GIF加载完成且有科普数据，就立即显示
    if (gifLoaded && scienceDataList.length > 0 && !isLoaded) {
      console.log("GIF加载完成且有科普数据，立即显示科普组件")

      // 立即显示，不需要额外延迟
      setIsLoaded(true)

      // 淡入动画
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => {
        console.log("科普组件动画完成")
      })
    }
  }, [gifLoaded, scienceDataList.length, isLoaded, fadeAnim, scaleAnim])

  // 组件挂载时获取科普列表
  useEffect(() => {
    console.log("科普组件挂载")
    fetchWhysList()
  }, [fetchWhysList])

  // 设置轮播定时器 - 移除currentIndex依赖，避免重复创建定时器
  useEffect(() => {
    if (!isLoaded || scienceDataList.length === 0) {
      console.log("轮播定时器未启动：isLoaded=", isLoaded, "数据长度=", scienceDataList.length)
      return
    }

    console.log("🔄 启动科普知识轮播定时器，每12.5秒切换一次")
    const timer = setInterval(() => {
      console.log("⏰ 定时器触发，切换到下一条")
      showNextWhys()
    }, 12500) // 每12.5秒更新一次

    return () => {
      console.log("🔄 清理轮播定时器")
      clearInterval(timer)
    }
  }, [isLoaded, scienceDataList.length, showNextWhys])

  if (!isLoaded) {
    console.log("科普组件未加载，返回null")
    return null
  }

  console.log("科普组件渲染，当前数据:", scienceData.title)

  return (
    <Animated.View
      style={[
        styles.sciencePopularization,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* 科普卡片 - 带背景图 */}
      <ImageBackground
        source={Images.aiLoadingNotionBg}
        style={styles.scienceCard}
        resizeMode="cover"
        imageStyle={styles.scienceCardImage}
      >
        {/* 标题区域 */}
        <LinearGradient
          colors={["#19e0ff", "#3a7fff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cardTitle}
        >
          <Text style={styles.titleText} numberOfLines={1} ellipsizeMode="tail">
            小科普：{scienceData.title}
          </Text>
        </LinearGradient>

        {/* 内容区域 */}
        <View style={styles.cardContent}>
          <Text style={styles.contentText} numberOfLines={3} ellipsizeMode="tail">
            {scienceData.content}
          </Text>
        </View>
      </ImageBackground>
    </Animated.View>
  )
}

const styles = createStyles({
  sciencePopularization: {
    position: "absolute" as const,
    top: 131.4, // 131.4rpx - UniApp原值
    left: 100.59375, // 120.59375rpx - UniApp原值
    zIndex: 100, // 提高层级，确保显示在最上层
    width: 212.5, // 212.5rpx - UniApp原值
    height: 114.0625, // 114.0625rpx - UniApp原值
    overflow: "hidden" as const,
    borderRadius: 16, // 16rpx
  },
  scienceCard: {
    position: "relative" as const,
    width: 212.5, // 212.5rpx
    height: 114.0625, // 114.0625rpx
    flexDirection: "column" as const,
    overflow: "hidden" as const,
    borderRadius: 16, // 16rpx
    paddingVertical: 27.3543, // 27.3543rpx - UniApp原值
    paddingHorizontal: 27.3423, // 27.3423rpx - UniApp原值
  },
  scienceCardImage: {
    borderRadius: 16,
  },
  cardTitle: {
    position: "relative" as const,
    zIndex: 2,
    backgroundColor: "#19e0ff", // 渐变改为背景色
    borderWidth: 1,
    borderColor: "rgba(92, 163, 255, 0.57)",
    maxWidth: 200, // 200rpx
    height: 21.484, // 21.484rpx
    borderRadius: 4.296, // 4.296rpx
    paddingHorizontal: 3, // 3rpx
    paddingVertical: 3,
    shadowColor: "#1696ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4.8,
    elevation: 3,
  },
  titleText: {
    color: "#fff",
    fontSize: 9.3675, // 9.3675rpx - UniApp原值
    fontWeight: "bold",
    position: "absolute" as const,
    left: 4, // 4rpx
    top: 4,
  },
  cardContent: {
    position: "relative" as const,
    zIndex: 2,
    flex: 1,
    marginTop: 8, // 8rpx
  },
  contentText: {
    color: "#2681f0", // UniApp原值
    fontSize: 8.6, // 8.6rpx
    lineHeight: 10, // 1.4倍行高
  },
})

export default SciencePopularization
