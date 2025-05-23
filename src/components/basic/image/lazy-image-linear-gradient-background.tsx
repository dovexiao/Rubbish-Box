import React, {ReactNode} from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {LazyImageProps} from './lazy-image';
import {ImageUrlType} from './index.type';
import {useResponsiveDimensions} from '@/utils';
import Svg, {Circle, Line} from 'react-native-svg';

export interface LazyImageLGBackgroundProps
  extends Omit<LazyImageProps, 'imageUrl'> {
  showBottomBG?: boolean;
  subtractBottomTabHeight?: boolean;
  locations?: number[];
  style?: StyleProp<ViewStyle>;
  imageUrl?: ImageUrlType;
  children?: ReactNode;
  fullHeight?: boolean;
}

const generatePoints = (width: number, height: number, count = 60) => {
  const points = [];
  for (let i = 0; i < count; i++) {
    points.push({
      x: Math.random() * width,
      y: Math.random() * height,
    });
  }
  return points;
};

const NeuralNetGrid: React.FC<{width: number; height: number}> = ({
  width,
  height,
}) => {
  const points = generatePoints(width, height, 360);
  const lines = [];

  points.forEach((p1, i) => {
    const connections = points.slice(i + 1).filter(() => Math.random() < 0.08);
    connections.forEach(p2 => {
      lines.push(
        <Line
          key={`${p1.x}-${p1.y}-${p2.x}-${p2.y}`}
          x1={p1.x}
          y1={p1.y}
          x2={p2.x}
          y2={p2.y}
          stroke="rgba(150, 200, 255, 0.4)" // 淡蓝线
          strokeWidth="1"
        />,
      );
    });
  });

  return (
    <Svg
      width={width}
      height={height}
      style={StyleSheet.absoluteFill}
      pointerEvents="none">
      {points.map((p, i) => {
        const color =
          Math.random() < 0.5
            ? 'rgba(255,255,255,0.8)' // 白点
            : 'rgba(120,180,255,0.8)'; // 淡蓝点
        return (
          <Circle key={`dot-${i}`} cx={p.x} cy={p.y} r={1.5} fill={color} />
        );
      })}
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
        styles.view,
        style,
        {width: screenWidth, height: containerHeight},
      ]}
      {...imageProps}>
      <View style={styles.bg}>
        <NeuralNetGrid width={screenWidth} height={screenHeight} />
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  view: {
    position: 'relative',
    backgroundColor: '#000',
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
});

export default LazyImageLGBackground;
