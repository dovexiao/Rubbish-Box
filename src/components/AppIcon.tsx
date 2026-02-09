import React from 'react';
import { Platform, StyleProp, TextStyle } from 'react-native';
import IconFont from '@/iconfont';
import { IconFontTTFName } from '@/iconfont/IconFontTTF';
import HarmonyIconImage from '@/harmony/HarmonyIconImage';

// 统一的图标 Props，兼容原 SVG 版 IconFont 的用法
export interface AppIconProps {
  name: IconFontTTFName;
  size?: number;
  // 兼容原来的 string | string[]
  color?: string | string[];
  style?: StyleProp<TextStyle>;
  // 透传其他属性（比如 onPress / accessibility 等）
  [key: string]: any;
}

const isNativePlatform = Platform.OS === 'android' || Platform.OS === 'ios';

const AppIcon: React.FC<AppIconProps> = props => {
  if (isNativePlatform) {
    // Android / iOS：继续使用 SVG 版 IconFont，保持现有效果
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <IconFont {...props} />;
  }

  // 其他平台统一当作 Harmony 处理：优先使用 PNG 图片图标，未配置时回退到 TTF
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <HarmonyIconImage {...props} />;
};

export default AppIcon;
