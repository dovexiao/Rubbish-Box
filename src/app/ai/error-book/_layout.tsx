import { Stack } from "expo-router"

/**
 * 错题本模块路由布局
 */
export default function ErrorBookLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="selection" />
      <Stack.Screen name="questions" />
      <Stack.Screen name="detail" />
      <Stack.Screen name="practice" />
      <Stack.Screen name="result" />
      <Stack.Screen name="camera" />
    </Stack>
  )
}


