import { StyleSheet, Dimensions } from 'react-native'

// 获取屏幕宽度
const getScreenWidth = () => Dimensions.get('window').width

// rpx转换函数
const rpx = (size: number): number => {
  return (getScreenWidth() / 750) * size
}

// 需要进行rpx转换的样式属性列表
const RPX_PROPERTIES = [
  // 尺寸相关
  'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
  
  // 边距相关
  'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
  'marginHorizontal', 'marginVertical',
  'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'paddingHorizontal', 'paddingVertical',
  
  // 定位相关
  'top', 'right', 'bottom', 'left',
  
  // 边框相关
  'borderWidth', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
  'borderRadius', 'borderTopLeftRadius', 'borderTopRightRadius', 
  'borderBottomLeftRadius', 'borderBottomRightRadius',
  
  // 字体相关
  'fontSize', 'lineHeight', 'letterSpacing',
  
  // 阴影相关
  'shadowRadius', 'elevation',
  
  // 其他
  'gap', 'rowGap', 'columnGap'
]

// 递归处理样式对象
const processStyleValue = (key: string, value: any): any => {
  // 如果是数字且属于需要转换的属性，则转换为rpx
  if (typeof value === 'number' && RPX_PROPERTIES.includes(key)) {
    return rpx(value)
  }
  
  // 处理shadowOffset特殊情况
  if (key === 'shadowOffset' && typeof value === 'object' && value !== null) {
    return {
      width: typeof value.width === 'number' ? rpx(value.width) : value.width,
      height: typeof value.height === 'number' ? rpx(value.height) : value.height,
    }
  }
  
  // 处理transform数组
  if (key === 'transform' && Array.isArray(value)) {
    return value.map(transform => {
      const transformKey = Object.keys(transform)[0]
      const transformValue = transform[transformKey]
      
      // 对translateX, translateY等进行rpx转换
      if (['translateX', 'translateY'].includes(transformKey) && typeof transformValue === 'number') {
        return { [transformKey]: rpx(transformValue) }
      }
      
      return transform
    })
  }
  
  // 递归处理嵌套对象
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
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
    if (typeof styleValue === 'object' && styleValue !== null) {
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
