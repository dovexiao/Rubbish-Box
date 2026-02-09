import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';
import { IconFontTTFName } from '@/iconfont/IconFontTTF';
import harmonyPngMap from './harmonyIconMap';

export interface HarmonyIconImageProps {
  name: IconFontTTFName;
  size?: number;
  color?: string | string[];
  style?: StyleProp<ImageStyle>;
  [key: string]: any;
}

// Harmony 专用：name -> PNG 资源映射
// 默认占位图（当某个 name 没有生成 PNG 时使用）
const DEFAULT_ICON = require('../../android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png');

const HarmonyIconImage: React.FC<HarmonyIconImageProps> = ({
  name,
  size = 18,
  color,
  style,
  ...rest
}) => {
  const source = harmonyPngMap[name] || DEFAULT_ICON;
  const singleColor = Array.isArray(color) ? color?.[0] : color;

  const imageStyle: StyleProp<ImageStyle> = [
    { width: size, height: size },
    // singleColor ? { tintColor: singleColor } : null,
    style,
  ];

  return <Image source={source} style={imageStyle} {...rest} />;
};

export default HarmonyIconImage;
