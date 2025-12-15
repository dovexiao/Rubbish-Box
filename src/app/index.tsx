import { Redirect } from "expo-router"

/**
 * 根路径重定向
 * 将根路径重定向到标签页布局
 */
export default function Index() {
  return <Redirect href="/(tabs)" />
}
