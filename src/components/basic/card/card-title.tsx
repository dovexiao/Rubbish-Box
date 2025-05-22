import React, {ReactNode} from 'react';
import LazyImage, {ImageUrlType} from '../image';
import theme from '@/style';
import {View, ViewStyle, StyleProp} from 'react-native';
import Text from '@basicComponents/text';
import LinearGradient, {LinearGradientProps} from '../linear-gradient';

export const lightLinear: LinearGradientProps = {
  start: {x: 0, y: 0},
  end: {x: 0, y: 1},
  colors: ['#fff', 'rgba(255, 255, 255, 0)'],
};

export interface CardTitleProps {
  icon?: {
    url: ImageUrlType;
    width: number;
    height: number;
  };

  linear?: LinearGradientProps;

  backgroundColor?: string;

  title: string;

  /** 左右边距，默认12 */
  paddingHorizontal?: number;
  /** 上下边距，默认8 */
  paddingVertical?: number;

  /** 右侧的具体内容 */
  children?: ReactNode;

  style?: StyleProp<ViewStyle>;
}

const CardTitle: React.FC<CardTitleProps> = props => {
  const {
    icon,
    title,
    linear,
    paddingHorizontal = theme.paddingSize.l,
    paddingVertical = theme.paddingSize.s,
    backgroundColor = 'transparent',
    children,
    style,
  } = props;

  const renderContent = (
    <View
      style={[
        {paddingHorizontal, paddingVertical, backgroundColor},
        theme.flex.row,
        theme.flex.centerByCol,
        style,
      ]}>
      {icon ? (
        <LazyImage
          occupancy={'transparent'}
          imageUrl={icon.url}
          width={icon.width}
          height={icon.height}
        />
      ) : null}
      <Text
        fontSize={theme.fontSize.m}
        blod
        style={[theme.font.white, theme.padding.leftxxs]}>
        {title}
      </Text>
      {children}
    </View>
  );

  return linear ? (
    <LinearGradient {...linear}>{renderContent}</LinearGradient>
  ) : (
    renderContent
  );
};

export default CardTitle;
