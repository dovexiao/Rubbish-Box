import React, {ReactNode} from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {LazyImageProps} from './lazy-image';
import {ImageUrlType} from './index.type';
import {useResponsiveDimensions} from '@/utils';
import Svg, {Polygon} from 'react-native-svg';
import theme from '@/style';

export interface LazyImageLGBackgroundProps
  extends Omit<LazyImageProps, 'imageUrl'> {
  subtractBottomTabHeight?: boolean;
  style?: StyleProp<ViewStyle>;
  imageUrl?: ImageUrlType;
  children?: ReactNode;
  fullHeight?: boolean;
  showBottomBG?: boolean;
  locations?: number[];
}

const HexGrid: React.FC<{width: number; height: number}> = ({
  width,
  height,
}) => {
  const hexSize = 15; // 单个六边形大小
  const hexWidth = hexSize * Math.sqrt(3);
  const hexHeight = hexSize * 2;
  const hexVert = (hexHeight * 3) / 4;

  const hexagons = [];

  for (let y = 0; y < height + hexHeight; y += hexVert) {
    for (let x = 0; x < width + hexWidth; x += hexWidth) {
      const offsetX = (Math.floor(y / hexVert) % 2) * (hexWidth / 2);
      const points = [
        `${x + offsetX + hexWidth / 2},${y}`,
        `${x + offsetX + hexWidth},${y + hexHeight / 4}`,
        `${x + offsetX + hexWidth},${y + (hexHeight * 3) / 4}`,
        `${x + offsetX + hexWidth / 2},${y + hexHeight}`,
        `${x + offsetX},${y + (hexHeight * 3) / 4}`,
        `${x + offsetX},${y + hexHeight / 4}`,
      ].join(' ');

      hexagons.push(
        <Polygon
          key={`${x}-${y}`}
          points={points}
          stroke="rgba(63, 63, 63, 0.2)" // 边框颜色（带透明度）
          strokeWidth="1"
          fill="none"
        />,
      );
    }
  }

  return (
    <Svg
      width={width}
      height={height}
      style={StyleSheet.absoluteFill}
      pointerEvents="none">
      {hexagons}
    </Svg>
  );
};

const LazyImageLGBackground: React.FC<LazyImageLGBackgroundProps> = props => {
  const {
    children = null,
    style,
    subtractBottomTabHeight = false,
    fullHeight = false,
    ...imageProps
  } = props;

  const {width: screenWidth, height: screenHeight} = useResponsiveDimensions();

  const containerHeight = fullHeight
    ? '100%'
    : subtractBottomTabHeight
    ? screenHeight - 50
    : screenHeight;

  return (
    <View
      style={[
        styles.container,
        style,
        {width: screenWidth, height: containerHeight},
      ]}
      {...imageProps}>
      <HexGrid width={screenWidth} height={screenHeight} />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: `linear-gradient(180deg, ${theme.linearGradientColor.pageLinearGradient})`,
  },
});

export default LazyImageLGBackground;
