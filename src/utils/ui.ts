import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// 设计稿基准
const DESIGN_WIDTH = 375;
const DESIGN_HEIGHT = 812;

// 当前屏幕
export const screenWidth = width;
export const screenHeight = height;

// 机型判断
export const isSmallDevice = width < 360;
export const isLargeDevice = width >= 414;
export const isTablet = width >= 768;
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

// 按设计稿宽度缩放
export const scale = (size: number) => {
  return (width / DESIGN_WIDTH) * size;
};

// 按设计稿高度缩放
export const verticalScale = (size: number) => {
  return (height / DESIGN_HEIGHT) * size;
};

// 温和缩放
export const moderateScale = (size: number, factor = 0.5) => {
  return size + (scale(size) - size) * factor;
};

// 统一尺寸处理：适合字体/边距/圆角/图标
export const px = (size: number) => {
  return Math.round(PixelRatio.roundToNearestPixel(moderateScale(size)));
};

// 字体尺寸
export const fontSize = (size: number) => {
  return px(size);
};
