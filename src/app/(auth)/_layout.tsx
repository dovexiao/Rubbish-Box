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
    // 如果用户未登录且尝试访问需要认证的页面，重定向到登录页
    if (!isLoggedIn) {
      router.replace("/login")
    }
  }, [isLoggedIn, segments])

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    />
  )
}
