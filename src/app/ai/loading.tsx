import { useState, useEffect, useCallback, useRef } from "react"
import { View, Image, StatusBar as RNStatusBar } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router"

import { SciencePopularization } from "../../components/SciencePopularization"
import { Images } from "../../constants/Assets"
import { aiOcr } from "../../services/ai"
import { globalImmersive } from "../../utils/globalImmersive"
import { createStyles } from "../../utils/rpxStyleSheet"
import { showError, showWarning } from "../../utils/toast"

/**
 * AI加载页面
 * 100%还原UniApp项目 /src/pages/AI/ai-loading.vue
 * 调用OCR API识别照片中的题目或作文
 */
export default function AILoadingScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const [imageLoaded, setImageLoaded] = useState(false)
  const hasCalledOCR = useRef(false)
  const [isNavigating, setIsNavigating] = useState(false) // 跳转状态

  // 确保全屏沉浸式
  useFocusEffect(
    useCallback(() => {
      RNStatusBar.setHidden(true, "none")
      globalImmersive.forceRestore()
    }, []),
  )

  useEffect(() => {
    console.log("🎬 Loading页面：初始化背景图片")
    // 图片加载完成立即显示科普组件
    setImageLoaded(true)
  }, [])

  useEffect(() => {
    // 使用 useRef 防止组件内重复调用
    if (hasCalledOCR.current) {
      return
    }

    if (!params.imguuid) {
      showWarning("参数缺失")
      setTimeout(() => {
        router.back()
      }, 1500)
      return
    }

    const uuid = params.imguuid as string
    const correctionType = params.type as string

    // 标记为已调用
    hasCalledOCR.current = true

    // 调用 AI OCR 识别API
    aiOcr({ imguuid: uuid, type: correctionType })
      .then((res) => {
        console.log("✅ OCR识别完成，准备跳转")

        // 先标记为正在跳转，卸载当前组件
        setIsNavigating(true)

        // 使用 requestAnimationFrame 确保在下一帧跳转
        requestAnimationFrame(() => {
          if (res.select === "作文") {
            router.replace({
              pathname: "/ai/result",
              params: {
                resData: JSON.stringify(res),
              },
            })
          } else {
            router.replace({
              pathname: "/ai/result",
              params: {
                cache_key: res.cache_key,
              },
            })
          }
          console.log("✅ 跳转已执行")
        })
      })
      .catch((err) => {
        console.log("❌ OCR识别失败:", err)
        hasCalledOCR.current = false
        const errorMsg = err?.data || "AI识别失败，请重试"
        showError(errorMsg)
        setTimeout(() => {
          router.back()
        }, 2000)
      })
  }, [params.imguuid, params.type])

  // 如果正在跳转，返回 null（完全卸载组件）
  if (isNavigating) {
    return null
  }

  return (
    <LinearGradient
      colors={["#93abff", "#e4f4ff", "#ecf8ff", "#ffffff"]}
      locations={[-0.1128, 0.1494, 0.8474, 1.0586]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.loadingContainer}
    >
      {/* 加载背景图片 - 使用静态图片 */}
      <Image source={Images.loadingBg} style={styles.loadingBg} resizeMode="cover" />

      {/* 科普功能组件 */}
      <View style={styles.scienceContainer}>
        <SciencePopularization gifLoaded={imageLoaded} />
      </View>
    </LinearGradient>
  )
}

const styles = createStyles({
  loadingContainer: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
    position: "relative" as const,
  },
  loadingBg: {
    width: "100%",
    height: "100%",
    position: "absolute" as const,
    top: 0,
    left: 0,
    zIndex: 1,
  },
  scienceContainer: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50, // 确保在背景之上，但低于科普组件
    pointerEvents: "none", // 允许点击穿透到科普组件
  },
})
