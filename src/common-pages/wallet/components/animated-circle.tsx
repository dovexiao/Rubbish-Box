import theme from '@/style';
import React, {ReactNode} from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import Svg, {Circle} from 'react-native-svg';

interface AnimatedCircleProps {
  progress: number;
  style?: StyleProp<ViewStyle>;
  fillColor?: string;
  // 内半径
  r?: number;
  // 外半径
  wrapR?: number;
  children?: ReactNode;
}

const AnimatedCircle: React.FC<AnimatedCircleProps> = ({
  progress,
  fillColor = '#FFDFDF',
  r = 60,
  wrapR = 70,
  children,
  style,
}) => {
  const circumference = 2 * Math.PI * r; // 周长
  const svgStyle = StyleSheet.create({
    svg: {
      left: 0,
      top: 0,
    },
  });
  return (
    <View
      style={[
        theme.position.rel,
        {width: wrapR * 2, height: wrapR * 2},
        style,
      ]}>
      <Svg
        style={[theme.position.abs, svgStyle.svg]}
        width={wrapR * 2}
        height={wrapR * 2}>
        {/* 两倍的(半径+宽度) */}
        {/** 灰底的圆环，只作为底色使用 */}
        <Circle
          stroke={theme.backgroundColor.grey} // 圆环颜色
          fill={fillColor} // 填充色
          strokeWidth={wrapR - r} // 圆环宽度
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={0}
          r={r} // 圆环的半径
          cx={wrapR} // 圆心的x轴 半径+宽度
          cy={wrapR} // 圆心的y轴 半径+宽度
        />
        {/** 红底的圆环，表示真实进度的圆环 */}
        <Circle
          stroke={theme.basicColor.primary} // 圆环颜色
          fill={'#0000'} // 填充色
          strokeWidth={wrapR - r} // 圆环宽度
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference - (circumference * progress) / 100}
          r={r} // 圆环的半径
          cx={wrapR} // 圆心的x轴 半径+宽度
          cy={wrapR} // 圆心的y轴 半径+宽度
        />
      </Svg>
      {children}
    </View>
  );
};

export default AnimatedCircle;
