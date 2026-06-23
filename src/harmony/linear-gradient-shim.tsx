import React, { useMemo } from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';

/**
 * Harmony 平台下的 react-native-linear-gradient JS Shim 实现 (渐变效果版)。
 * 不依赖任何原生 UI 组件（如 BVLinearGradient）。
 *
 * 采用多层绝对定位的 View 组装呈现以在鸿蒙上模拟出平滑的视觉渐变效果，
 * 支持横向与纵向的基础渐变分割。
 */

export interface LinearGradientProps extends ViewProps {
  colors: (string | number)[];
  locations?: number[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

const parseColor = (
  colorStr: string | number,
): [number, number, number, number] => {
  if (typeof colorStr !== 'string') return [0, 0, 0, 1];
  let str = colorStr.trim().toLowerCase();
  if (str.startsWith('#')) {
    str = str.slice(1);
    if (str.length === 3)
      str = str
        .split('')
        .map(c => c + c)
        .join('');
    if (str.length === 4)
      str = str
        .split('')
        .map(c => c + c)
        .join('');
    if (str.length === 6) str += 'ff';
    const num = parseInt(str, 16);
    return [
      (num >> 24) & 255,
      (num >> 16) & 255,
      (num >> 8) & 255,
      (num & 255) / 255,
    ];
  }
  const match = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (match) {
    return [
      parseInt(match[1]),
      parseInt(match[2]),
      parseInt(match[3]),
      match[4] ? parseFloat(match[4]) : 1,
    ];
  }
  return [0, 0, 0, 1];
};

const interpolate = (
  c1: [number, number, number, number],
  c2: [number, number, number, number],
  t: number,
): [number, number, number, number] => [
  Math.round(c1[0] + (c2[0] - c1[0]) * t),
  Math.round(c1[1] + (c2[1] - c1[1]) * t),
  Math.round(c1[2] + (c2[2] - c1[2]) * t),
  c1[3] + (c2[3] - c1[3]) * t,
];

const getColorAt = (
  parsedColors: [number, number, number, number][],
  userLocs: number[] | undefined,
  t: number,
) => {
  if (parsedColors.length === 0) return 'rgba(0,0,0,0)';
  if (parsedColors.length === 1)
    return `rgba(${parsedColors[0][0]}, ${parsedColors[0][1]}, ${parsedColors[0][2]}, ${parsedColors[0][3]})`;

  let locs = userLocs;
  if (!locs || locs.length !== parsedColors.length) {
    locs = parsedColors.map((_, i) => i / (parsedColors.length - 1));
  }

  let index = 0;
  while (index < locs.length - 2 && t >= locs[index + 1]) {
    index++;
  }

  const startLoc = locs[index];
  const endLoc = locs[index + 1] !== undefined ? locs[index + 1] : 1;
  const segT = endLoc === startLoc ? 1 : (t - startLoc) / (endLoc - startLoc);

  const startC = parsedColors[index];
  const endC = parsedColors[index + 1] || startC;

  const res = interpolate(startC, endC, Math.max(0, Math.min(1, segT)));
  return `rgba(${res[0]}, ${res[1]}, ${res[2]}, ${res[3]})`;
};

const LinearGradient: React.FC<LinearGradientProps> = ({
  colors = ['#000000', '#000000'],
  locations,
  start = { x: 0, y: 0 },
  end = { x: 0, y: 1 },
  style,
  children,
  ...rest
}) => {
  const SLICES = 128;

  const gradientViews = useMemo(() => {
    const parsedColors = colors.map(parseColor);
    const dx = end.x - start.x;
    const dy = end.y - start.y;

    // 简单拆分横竖分布，针对多数常规渐变需求
    const isHorizontal = Math.abs(dx) > Math.abs(dy);
    const reverse = isHorizontal ? dx < 0 : dy < 0;

    const views = [];
    for (let i = 0; i < SLICES; i++) {
      const t = i / (SLICES - 1);
      const actualT = reverse ? 1 - t : t;
      const color = getColorAt(parsedColors, locations, actualT);

      views.push(
        <View
          key={i}
          style={{
            flex: 1,
            backgroundColor: color,
            marginTop: -0.2,
            marginBottom: -0.2,
          }}
        />,
      );
    }

    return (
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { flexDirection: isHorizontal ? 'row' : 'column' },
        ]}
      >
        {views}
      </View>
    );
  }, [colors, locations, start.x, start.y, end.x, end.y]);

  return (
    <View style={[{ overflow: 'hidden' }, style]} {...rest}>
      {gradientViews}
      {children}
    </View>
  );
};

export default LinearGradient;
