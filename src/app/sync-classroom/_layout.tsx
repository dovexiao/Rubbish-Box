import { Stack } from "expo-router"

/**
 * 同步课堂模块路由布局
 */
export default function SyncClassroomLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="video" />
      <Stack.Screen name="video-modular" />
      <Stack.Screen name="video-modular-v2" />
    </Stack>
  )
}

