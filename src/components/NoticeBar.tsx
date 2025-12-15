import { useEffect, useRef, useState } from "react"
import { View, Image, Animated, Text as RNText } from "react-native"

import { Images } from "../constants/Assets"
import { createStyles } from "../utils/rpxStyleSheet"

// 自定义Text组件，避免lint错误
const Text = ({ children, style, ...props }: any) => {
  return (
    <RNText style={style} {...props}>
      {children}
    </RNText>
  )
}

// 创建可动画的Text组件
const AnimatedText = Animated.createAnimatedComponent(RNText)

interface NoticeBarProps {
  texts: string[]
  delay?: number
  color?: string
  backgroundColor?: string
}

/**
 * 通知栏组件 - 模拟UniApp中的wd-notice-bar
 * 实现垂直方向的文字滚动效果，2秒切换一次，循环滚动
 */
export function NoticeBar({
  texts,
  delay = 2,
  color = "#fff",
  backgroundColor = "rgba(255, 235, 181, 0.65)",
}: NoticeBarProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const translateY = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!texts || texts.length <= 1) return

    const intervalId = setInterval(() => {
      // 创建向上滑动的动画
      Animated.timing(translateY, {
        toValue: -20, // 向上移动的距离
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // 动画结束后，更新索引并重置位置
        setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length)
        translateY.setValue(0)
      })
    }, delay * 1000)

    return () => clearInterval(intervalId)
  }, [texts, delay, translateY])

  if (!texts || texts.length === 0) return null

  // 如果只有一个文本，直接显示
  if (texts.length === 1) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Image source={Images.tipsIcon} style={styles.icon} resizeMode="contain" />
        <View style={styles.textContainer}>
          <Text style={[styles.text, { color }]} numberOfLines={1}>
            {texts[0]}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Image source={Images.tipsIcon} style={styles.icon} resizeMode="contain" />
      <View style={styles.textContainer}>
        {/* 当前显示的文本 */}
        <AnimatedText
          style={[styles.text, { color }, { transform: [{ translateY }] }]}
          numberOfLines={1}
        >
          {texts[currentIndex]}
        </AnimatedText>

        {/* 下一个要显示的文本（从下方进入） */}
        <AnimatedText
          style={[styles.text, styles.nextText, { color }, { transform: [{ translateY }] }]}
          numberOfLines={1}
        >
          {texts[(currentIndex + 1) % texts.length]}
        </AnimatedText>
      </View>
    </View>
  )
}

const styles = createStyles({
  container: {
    width: "100%" as any,
    height: 23.4375,
    borderRadius: 7.8125,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingLeft: 15.625,
    marginTop: 8,
    marginBottom: 12,
    shadowColor: "#0b54ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5.6,
  },
  icon: {
    width: 12.5,
    height: 12.5,
    marginRight: 8,
    marginLeft: 8,
  },
  textContainer: {
    flex: 1,
    height: 16.40625,
    overflow: "hidden" as const,
  },
  text: {
    fontSize: 8.6,
    lineHeight: 16.40625,
  },
  nextText: {
    position: "absolute" as const,
    top: 16.40625, // 放在下方，等待上滑进入
  },
})

export default NoticeBar
