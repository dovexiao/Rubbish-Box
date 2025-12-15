import { View, Text, ActivityIndicator } from "react-native"
import { createStyles } from "../utils/rpxStyleSheet"

interface Props {
  text?: string
  size?: "small" | "large"
  color?: string
}

/**
 * Loading加载组件
 */
export function Loading({ text = "加载中...", size = "large", color = "#4891FF" }: Props) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.loadingText}>{text}</Text>}
    </View>
  )
}

const styles = createStyles({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12, // 12rpx
  },
  loadingText: {
    fontSize: 8.6, // 8.6rpx
    color: "#666",
  },
})

export default Loading
