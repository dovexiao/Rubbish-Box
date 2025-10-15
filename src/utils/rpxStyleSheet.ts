import { StyleSheet, Dimensions, Platform } from "react-native"

// 设计稿尺寸配置
const DESIGN_WIDTH = 1920 // 设计稿宽度（px）
const DESIGN_HEIGHT = 1200 // 设计稿高度（px）
const DESIGN_WIDTH_RPX = 750 // 设计稿宽度转rpx
const DESIGN_HEIGHT_RPX = 468.75 // 设计稿高度转rpx (1200 * 750 / 1920)

// 获取屏幕尺寸
const getScreenDimensions = () => {
  const { width, height } = Dimensions.get("window")
  return { width, height }
}

// 判断是否为横屏
const isLandscape = (): boolean => {
  const { width, height } = getScreenDimensions()
  return width > height
}

// 判断是否为平板设备
const isTablet = (): boolean => {
  const { width, height } = getScreenDimensions()
  const minDimension = Math.min(width, height)
  // 最小边大于600被认为是平板
  return minDimension >= 600
}

/**
 * 智能rpx转换函数
 * 自动适配不同屏幕方向和设备类型
 * 
 * 转换规则：
 * 1. 横屏模式：基于屏幕高度计算（设计稿高度468.75rpx → 实际屏幕高度）
 * 2. 竖屏模式：基于屏幕宽度计算（设计稿宽度750rpx → 实际屏幕宽度）
 * 3. 自动根据设备方向选择最佳转换基准
 */
const rpx = (size: number): number => {
  const { width, height } = getScreenDimensions()
  
  if (isLandscape()) {
    // 横屏模式：基于高度计算
    // 公式：实际像素 = rpx值 × 屏幕高度 / 设计稿高度rpx
    return (height / DESIGN_HEIGHT_RPX) * size
  } else {
    // 竖屏模式：基于宽度计算
    // 公式：实际像素 = rpx值 × 屏幕宽度 / 设计稿宽度rpx
    return (width / DESIGN_WIDTH_RPX) * size
  }
}

/**
 * 获取当前缩放比例
 * 用于调试和日志输出
 */
export const getScaleRatio = (): number => {
  const { width, height } = getScreenDimensions()
  if (isLandscape()) {
    return height / DESIGN_HEIGHT_RPX
  } else {
    return width / DESIGN_WIDTH_RPX
  }
}

/**
 * 获取屏幕信息（用于调试）
 */
export const getScreenInfo = () => {
  const { width, height } = getScreenDimensions()
  const landscape = isLandscape()
  const tablet = isTablet()
  const scale = getScaleRatio()
  
  return {
    width,
    height,
    isLandscape: landscape,
    isTablet: tablet,
    scaleRatio: scale.toFixed(4),
    baseRpx: landscape ? DESIGN_HEIGHT_RPX : DESIGN_WIDTH_RPX,
    platform: Platform.OS,
  }
}

// 需要进行rpx转换的样式属性列表
const RPX_PROPERTIES = [
  // 尺寸相关
  "width",
  "height",
  "minWidth",
  "minHeight",
  "maxWidth",
  "maxHeight",

  // 边距相关
  "margin",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "marginHorizontal",
  "marginVertical",
  "padding",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "paddingHorizontal",
  "paddingVertical",

  // 定位相关
  "top",
  "right",
  "bottom",
  "left",

  // 边框相关
  "borderWidth",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "borderRadius",
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderBottomLeftRadius",
  "borderBottomRightRadius",

  // 字体相关
  "fontSize",
  "lineHeight",
  "letterSpacing",

  // 阴影相关
  "shadowRadius",
  "elevation",

  // 其他
  "gap",
  "rowGap",
  "columnGap",
]

// 递归处理样式对象
const processStyleValue = (key: string, value: any): any => {
  // 如果是数字且属于需要转换的属性，则转换为rpx
  if (typeof value === "number" && RPX_PROPERTIES.includes(key)) {
    return rpx(value)
  }

  // 处理shadowOffset特殊情况
  if (key === "shadowOffset" && typeof value === "object" && value !== null) {
    return {
      width: typeof value.width === "number" ? rpx(value.width) : value.width,
      height: typeof value.height === "number" ? rpx(value.height) : value.height,
    }
  }

  // 处理transform数组
  if (key === "transform" && Array.isArray(value)) {
    return value.map((transform) => {
      const transformKey = Object.keys(transform)[0]
      const transformValue = transform[transformKey]

      // 对translateX, translateY等进行rpx转换
      if (
        ["translateX", "translateY"].includes(transformKey) &&
        typeof transformValue === "number"
      ) {
        return { [transformKey]: rpx(transformValue) }
      }

      return transform
    })
  }

  // 递归处理嵌套对象
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    const processedValue: any = {}
    for (const [nestedKey, nestedValue] of Object.entries(value)) {
      processedValue[nestedKey] = processStyleValue(nestedKey, nestedValue)
    }
    return processedValue
  }

  return value
}

// 处理样式对象
const processStyles = (styles: any): any => {
  const processedStyles: any = {}

  for (const [styleKey, styleValue] of Object.entries(styles)) {
    if (typeof styleValue === "object" && styleValue !== null) {
      const processedStyleValue: any = {}

      for (const [propKey, propValue] of Object.entries(styleValue as any)) {
        processedStyleValue[propKey] = processStyleValue(propKey, propValue)
      }

      processedStyles[styleKey] = processedStyleValue
    } else {
      processedStyles[styleKey] = styleValue
    }
  }

  return processedStyles
}

// 增强版的StyleSheet.create
export const createStyles = <T extends any>(styles: T): T => {
  const processedStyles = processStyles(styles)
  return StyleSheet.create(processedStyles) as T
}

// 导出rpx函数供单独使用
export { rpx }

// 默认导出
export default {
  create: createStyles,
  rpx,
}
