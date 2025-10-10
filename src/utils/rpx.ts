/**
 * rpx工具函数
 * 提供单独的rpx函数，方便在组件内部使用
 */
import { Dimensions } from 'react-native';

/**
 * rpx单位转换函数
 * 将rpx单位转换为像素单位
 * 基于750rpx设计稿
 * 
 * @param size rpx单位的尺寸
 * @returns 转换后的像素尺寸
 */
export const rpx = (size: number): number => {
  const screenWidth = Dimensions.get('window').width;
  return (screenWidth / 750) * size;
};

export default rpx;
