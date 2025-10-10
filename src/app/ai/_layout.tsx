import { Stack } from "expo-router"

/**
 * AI模块布局
 */
export default function AILayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="camera" />
      <Stack.Screen name="rotate" />
      <Stack.Screen name="loading" />
      <Stack.Screen name="result" />
    </Stack>
  )
}
