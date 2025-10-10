import { useEffect } from "react"
import { Slot, SplashScreen } from "expo-router"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"

// import ImmersiveWrapper from "../components/ImmersiveMode"
import { useUserStore } from "../stores/userStore"
import { createStyles } from "../utils/rpxStyleSheet"
// 防止闪屏
SplashScreen.preventAutoHideAsync()

/**
 * 根布局组件
 * 包含全局沉浸式模式配置
 */
export default function RootLayout() {
  const initializeFromStorage = useUserStore((state) => state.initializeFromStorage)

  useEffect(() => {
    // 初始化用户存储数据
    initializeFromStorage()

    // 延迟隐藏闪屏
    const timer = setTimeout(() => {
      SplashScreen.hideAsync()
    }, 1000)

    return () => clearTimeout(timer)
  }, [initializeFromStorage])

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* 全局沉浸式模式 - 隐藏状态栏和三大金刚键 */}
      {/* <ImmersiveWrapper enabled={true} /> */}

      <SafeAreaProvider>
        <Slot />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

// 使用rpx单位的样式
const styles = createStyles({
  container: {
    flex: 1,
    width: "100%" as const,
    height: "100%" as const,
  },
})
