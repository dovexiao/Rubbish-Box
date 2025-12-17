import { StyleSheet, Dimensions, Platform } from "react-native"

// 设计稿尺寸配置
const DESIGN_WIDTH_RPX = 750 // 设计稿宽度转rpx
const DESIGN_HEIGHT_RPX = 400 // 设计稿高度转rpx (1200 * 750 / 1920)

// 设备专用配置 - 可手动调节每个设备的缩放比
const DEVICE_CONFIGS = [
  {
    name: '1920×1200',
    physicalWidth: 1920,
    physicalHeight: 1200,
    // 手动设置缩放比，调大则元素变大，调小则元素变小
    scaleRatio: 1.28, // 默认基于逻辑像素 600/400=1.5
    baseRpx: 400, // 横屏基于高度
  },
  {
    name: '1920×1080',
    physicalWidth: 1920,
    physicalHeight: 1080,
    // 1920×1080 的逻辑像素可能是 960×540
    scaleRatio: 2.56, // 540/400=1.35
    baseRpx: 400,
  },
  {
    name: '960×600 (逻辑)',
    logicalWidth: 960,
    logicalHeight: 600,
    // 当检测到逻辑像素时的缩放
    scaleRatio: 1.28, // 600/400=1.5
    baseRpx: 400,
  },
   {
    name: '1280×800',
    logicalWidth: 1280,
    logicalHeight: 800,
    // 当检测到逻辑像素时的缩放
    scaleRatio: 1.68, // 600/400=1.5
    baseRpx: 400,
  },
  {
    name: '1280×720',
    logicalWidth: 1280,
    logicalHeight: 720,
    // 当检测到逻辑像素时的缩放
    scaleRatio: 1.68, // 600/400=1.5
    baseRpx: 400,
  },
]
// 缓存屏幕尺寸信息
let cachedDimensions: {
  width: number
  height: number
  scale: number
  physicalWidth: number
  physicalHeight: number
} | null = null

// 标记是否已输出匹配日志
let hasLoggedMatch = false

// 获取屏幕尺寸
const getScreenDimensions = () => {
  // 如果已缓存，直接返回
  if (cachedDimensions) {
    return cachedDimensions
  }
  
  // React Native 使用逻辑像素（DIP），直接用于布局计算
  const screen = Dimensions.get("screen")
  const window = Dimensions.get("window")
  
  const scale = screen.scale || window.scale || 1
  
  // 计算物理像素（仅用于调试和设备识别）
  const physicalWidth = screen.width * scale
  const physicalHeight = screen.height * scale
  
  // 缓存结果
  cachedDimensions = { 
    width: screen.width, 
    height: screen.height, 
    scale,
    physicalWidth,
    physicalHeight
  }
  
  // 首次调用时输出调试信息
  console.log("=== 屏幕信息（首次初始化）===")
  console.log("逻辑像素:", screen.width, "×", screen.height)
  console.log("物理像素:", physicalWidth, "×", physicalHeight)
  console.log("scale:", scale)
  
  return cachedDimensions
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

// 获取设备类型和适配策略
const getDeviceAdaptationStrategy = () => {
  const dimensions = getScreenDimensions()
  const { width, height } = dimensions
  const landscape = isLandscape()
  
  // 标准化尺寸（确保width > height为横屏）
  const screenWidth = landscape ? width : height
  const screenHeight = landscape ? height : width
  
  const physicalWidth = dimensions.physicalWidth || 0
  const physicalHeight = dimensions.physicalHeight || 0
  
  // 1. 优先通过逻辑像素匹配设备配置（React Native 使用逻辑像素布局）
  let matchedConfig = DEVICE_CONFIGS.find(config => {
    if (config.logicalWidth && config.logicalHeight) {
      const widthMatch = Math.abs(width - config.logicalWidth) <= 10
      const heightMatch = Math.abs(height - config.logicalHeight) <= 10
      return widthMatch && heightMatch
    }
    return false
  })
  
  // 2. 如果没匹配到，尝试通过物理像素匹配
  if (!matchedConfig) {
    matchedConfig = DEVICE_CONFIGS.find(config => {
      if (config.physicalWidth && config.physicalHeight) {
        const widthMatch = Math.abs(physicalWidth - config.physicalWidth) <= 50
        const heightMatch = Math.abs(physicalHeight - config.physicalHeight) <= 50
        return widthMatch && heightMatch
      }
      return false
    })
  }
  
  // 3. 使用匹配到的配置
  if (matchedConfig) {
    // 只在首次调用时输出
    if (!hasLoggedMatch) {
      console.log("✓ 匹配到设备配置:", matchedConfig.name)
      console.log("  使用缩放比:", matchedConfig.scaleRatio)
      hasLoggedMatch = true
    }
    return {
      deviceName: matchedConfig.name,
      scaleRatio: matchedConfig.scaleRatio,
      baseRpx: matchedConfig.baseRpx,
      isCustom: true
    }
  }
  
  // 4. 未匹配到配置，使用默认计算
  const scaleRatio = landscape ? screenHeight / DESIGN_HEIGHT_RPX : screenWidth / DESIGN_WIDTH_RPX
  if (!hasLoggedMatch) {
    console.log("✗ 未匹配到配置，使用默认缩放比:", scaleRatio)
    console.log("  当前逻辑像素:", width, "×", height)
    console.log("  当前物理像素:", physicalWidth, "×", physicalHeight)
    hasLoggedMatch = true
  }
  
  return {
    deviceName: `${physicalWidth}×${physicalHeight} (未配置)`,
    scaleRatio,
    baseRpx: landscape ? DESIGN_HEIGHT_RPX : DESIGN_WIDTH_RPX,
    isCustom: false
  }
}

/**
 * 智能rpx转换函数
 * 自动适配不同屏幕方向和设备类型
 * 
 * 转换规则：
 * 1. 优先使用设备专用适配策略（1920×1200、1920×1080、1280×800）
 * 2. 横屏模式：基于屏幕高度计算（设计稿高度468.75rpx → 实际屏幕高度）
 * 3. 竖屏模式：基于屏幕宽度计算（设计稿宽度750rpx → 实际屏幕宽度）
 * 4. 自动根据设备方向选择最佳转换基准
 */
const rpx = (size: number): number => {
  // const strategy = getDeviceAdaptationStrategy()
  
  // if (strategy.isCustom) {
  //   // 使用专门的适配策略
  //   // 公式：实际像素 = rpx值 × 缩放比例
  //   return size * strategy.scaleRatio
  // }
  
  // 使用原有的通用策略
  const { width, height } = getScreenDimensions()

  return (width / DESIGN_WIDTH_RPX) * size
  
  // if (isLandscape()) {
  //   // 横屏模式：基于高度计算
  //   // 公式：实际像素 = rpx值 × 屏幕高度 / 设计稿高度rpx
  //   return (height / DESIGN_HEIGHT_RPX) * size
  // } else {
  //   // 竖屏模式：基于宽度计算
  //   // 公式：实际像素 = rpx值 × 屏幕宽度 / 设计稿宽度rpx
  //   return (width / DESIGN_WIDTH_RPX) * size
  // }
}

/**
 * 获取当前缩放比例
 * 用于调试和日志输出
 */
export const getScaleRatio = (): number => {
  const strategy = getDeviceAdaptationStrategy()
  
  if (strategy.isCustom) {
    return strategy.scaleRatio
  }
  
  // 使用原有逻辑
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
  const dimensions = getScreenDimensions()
  const { width, height, physicalWidth, physicalHeight } = dimensions
  const landscape = isLandscape()
  const tablet = isTablet()
  const strategy = getDeviceAdaptationStrategy()
  const scaleRatio = getScaleRatio()
  
  return {
    width, // 逻辑像素（用于布局）
    height, // 逻辑像素（用于布局）
    physicalWidth, // 物理像素（仅供参考）
    physicalHeight, // 物理像素（仅供参考）
    scale: dimensions.scale,
    isLandscape: landscape,
    isTablet: tablet,
    deviceName: strategy.deviceName,
    scaleRatio: scaleRatio.toFixed(4),
    baseRpx: strategy.baseRpx,
    isCustomAdaptation: strategy.isCustom,
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
