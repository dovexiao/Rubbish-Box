import React, { useState, useCallback } from "react"
import { View, Image, ImageProps, ActivityIndicator, StyleProp, ImageStyle, ViewStyle, Text } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { rpx } from "../../utils/rpxStyleSheet"

interface ImageWithPlaceholderProps extends Omit<ImageProps, "source"> {
  source: { uri: string } | number
  placeholderStyle?: StyleProp<ViewStyle>
  imageStyle?: StyleProp<ImageStyle>
  showLoadingIndicator?: boolean
  placeholderIcon?: keyof typeof Ionicons.glyphMap
  placeholderIconSize?: number
  placeholderIconColor?: string
  placeholderBackgroundColor?: string
}

/**
 * 带占位元素的 Image 组件
 * 支持加载中、加载失败、加载成功三种状态
 */
const ImageWithPlaceholder: React.FC<ImageWithPlaceholderProps> = ({
  source,
  placeholderStyle,
  imageStyle,
  showLoadingIndicator = true,
  placeholderIcon = "image-outline",
  placeholderIconSize,
  placeholderIconColor = "#B0B0B0",
  placeholderBackgroundColor = "#EBEBEB",
  style,
  onLoadStart,
  onLoad,
  onError,
  ...restProps
}) => {
  // 验证 source 是否有效
  const isValidSource = useCallback((): boolean => {
    if (!source) return false
    
    // number 类型（require() 返回的本地资源）始终有效
    if (typeof source === "number") return true
    
    // 对象类型，检查是否有有效的 uri
    if (typeof source === "object" && "uri" in source) {
      const uri = source.uri
      return typeof uri === "string" && uri.trim().length > 0
    }
    
    return false
  }, [source])

  const sourceValid = isValidSource()
  const [loading, setLoading] = useState(sourceValid)
  const [error, setError] = useState(!sourceValid)

  // 处理开始加载
  const handleLoadStart = useCallback(() => {
    setLoading(true)
    setError(false)
    onLoadStart?.()
  }, [onLoadStart])

  // 处理加载成功
  const handleLoad = useCallback((e: any) => {
    console.log("✅ 加载成功:", e)
    setLoading(false)
    setError(false)
    onLoad?.(e)
  }, [onLoad])

  // 处理加载失败
  const handleError = useCallback((e: any) => {
    console.log("❌ 加载失败:", e)
    setLoading(false)
    setError(true)
    onError?.(e)
  }, [onError])

  // 合并样式
  const containerStyle: StyleProp<ViewStyle> = [
    {
      overflow: "hidden",
      backgroundColor: placeholderBackgroundColor,
    },
    style,
  ]

  const finalImageStyle: StyleProp<ImageStyle> = [
    {
      width: "100%",
      height: "100%",
    },
    imageStyle,
  ]

  const finalPlaceholderStyle: StyleProp<ViewStyle> = [
    {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: placeholderBackgroundColor,
    },
    placeholderStyle,
  ]

  // 计算图标大小（如果没有提供，使用默认值）
  const iconSize = placeholderIconSize || (typeof style === "object" && style && "width" in style && typeof style.width === "number" ? style.width * 0.3 : rpx(40))

  return (
    <View style={containerStyle}>
      {/* 图片：只在 source 有效且未出错时显示 */}
      {sourceValid && !error && (
        <Image
          source={source}
          style={finalImageStyle}
          onLoadStart={handleLoadStart}
          onLoad={handleLoad}
          onError={handleError}
          {...restProps}
        />
      )}

      {/* 占位元素：source 无效、加载中或加载失败 */}
      {(!sourceValid || loading || error) && (
        <View style={finalPlaceholderStyle}>
          {!sourceValid || error ? (
            <Ionicons name={placeholderIcon} size={iconSize} color={placeholderIconColor} />
          ) : loading && showLoadingIndicator ? (
            <ActivityIndicator size="small" color={placeholderIconColor} />
          ) : (
            <Text style={{ color: "#999", fontSize: rpx(9.375), textAlign: "center" }}>暂无图片</Text>
          )}
        </View>
      )}
    </View>
  )
}

export default ImageWithPlaceholder

