import { Stack } from "expo-router"
import { useUserStore } from "../../stores/userStore"
import { useEffect } from "react"
import { useRouter, useSegments } from "expo-router"

/**
 * 认证布局组件
 * 处理需要登录才能访问的页面
 */
export default function AuthLayout() {
  const { isLoggedIn } = useUserStore()
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    // 如果用户未登录且尝试访问需要认证的页面，显示登录弹窗
    if (!isLoggedIn) {
      // 动态导入登录工具函数
      import("../../utils/loginUtils").then(({ showLoginModal }) => {
        showLoginModal({
          onSuccess: () => {
            console.log("🔐 用户登录成功，可以访问认证页面")
          },
          onCancel: () => {
            console.log("🔐 用户取消登录，返回上一页")
            router.back()
          },
        })
      })
    }
  }, [isLoggedIn, segments, router])

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    />
  )
}
