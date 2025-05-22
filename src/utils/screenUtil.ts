import {Dimensions, PixelRatio} from 'react-native';
/** iPhone 6 的默认像素密度 */
export const DEFAULT_DENSITY = 2;
/** 将像素转换为设备独立像素 (宽度) */
export const WIDTH_DP = 750 / DEFAULT_DENSITY;
/** 将像素转换为设备独立像素 (高度) */
export const HEIGHT_DP = 1334 / DEFAULT_DENSITY;
/** 获取设备的像素密度 */
export const PIXEL_RATIO = PixelRatio.get();
/** 屏幕宽度 */
export const WINDOW_WIDTH = Dimensions.get('window').width;
/** 屏幕高度 */
export const WINDOW_HEIGHT = Dimensions.get('window').height;
/** 获取缩放比例 */
const scaleVal = Math.min(WINDOW_HEIGHT / HEIGHT_DP, WINDOW_WIDTH / WIDTH_DP);
/** 缩放尺寸  */
export function scaleSize(size: number) {
  let _size = Math.round(size * scaleVal);
  return _size;
}
/**
 * 根据设计规范获取像素转换
 * @param size 大小
 * @returns
 */
export function px(size: number) {
  return Math.floor(scaleSize(size));
}
/**
 * 使用实际设计尺寸
 * @param size 尺寸
 * @param dp3 设计尺寸
 * @param dp1 使用尺寸
 * @returns
 */
export function dp3ToDp1(
  size: number,
  dp3: number = 1080,
  dp1: number = 375,
): number {
  const scaleFactor: number = Math.round((dp1 / dp3) * 100) / 100;
  return Math.ceil(size * scaleFactor);
}
