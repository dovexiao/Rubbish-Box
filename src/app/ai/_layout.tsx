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
       <Stack.Screen name="camera-test" />
      <Stack.Screen name="loading" />
      <Stack.Screen name="result" />
      <Stack.Screen name="error-book" />
      <Stack.Screen name="practice-result" />
      <Stack.Screen name="question-analysis" />
      <Stack.Screen name="composition-record" />
      <Stack.Screen name="photo-manager" />
      <Stack.Screen name="polished-composition" />
    </Stack>
  )
}
