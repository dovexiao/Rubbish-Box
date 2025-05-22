import {ReactNode} from 'react';
import {ImageUrlType, LazyImageBackground} from '../image';
import React from 'react';
import theme from '@style';
import {StyleProp, ViewStyle} from 'react-native';

export interface CardImageProps {
  width: number;
  height: number;
  imageUrl?: ImageUrlType;
  paddingHorizontal?: number;
  paddingVertical?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}
const CardImage: React.FC<CardImageProps> = props => {
  const {
    width,
    height,
    imageUrl,
    children,
    radius = 0,
    paddingHorizontal = 0,
    paddingVertical = 0,
    style,
  } = props;
  return (
    <LazyImageBackground
      width={width}
      height={height}
      imageUrl={imageUrl}
      style={[
        {borderRadius: radius, paddingHorizontal, paddingVertical},
        theme.overflow.hidden,
        style,
      ]}>
      {children}
    </LazyImageBackground>
  );
};

export default CardImage;
