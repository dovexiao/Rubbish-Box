/**
 * rpx工具函数
 * 提供单独的rpx函数，方便在组件内部使用
 */
import { Dimensions } from "react-native"

/**
 * rpx单位转换函数
 * 将rpx单位转换为实际像素单位
 * 基于750rpx设计稿
 * 公式：实际像素 = rpx值 × 屏幕宽度 / 750
 *
 * @param size rpx单位的尺寸（已经通过 px × 750 / 1920 转换过的值）
 * @returns 转换后的实际像素尺寸
 */
export const rpx = (size: number): number => {
  const screenWidth = Dimensions.get("window").width
  return (screenWidth / 750) * size
}

export default rpx
