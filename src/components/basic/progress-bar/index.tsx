import React from 'react';
import {View, Text, StyleSheet, ViewStyle, TextStyle} from 'react-native';

interface ProgressBarProps {
  /** 进度（0~1） */
  progress?: number;
  /** 高度 */
  height?: number;
  /** 底色 */
  backgroundColor?: string;
  /** 进度条颜色 */
  progressColor?: string;
  /** 是否显示百分比文字 */
  showLabel?: boolean;
  /** 圆角 */
  borderRadius?: number;
  /** 可选外层样式扩展 */
  style?: ViewStyle;
  /** 可选文字样式扩展 */
  labelStyle?: TextStyle;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress = 0,
  height = 16,
  backgroundColor = '#E5E5E5',
  progressColor = '#F7D85D',
  showLabel = true,
  borderRadius = 8,
  style,
  labelStyle,
}) => {
  // 限制 progress 范围，防止超出
  const safeProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View
      style={[
        styles.container,
        {height, backgroundColor, borderRadius},
        style,
      ]}>
      <View
        style={[
          styles.progress,
          {
            width: `${safeProgress * 100}%`,
            backgroundColor: progressColor,
            borderRadius,
          },
        ]}
      />
      {showLabel && (
        <Text style={[styles.label, labelStyle]}>
          {Math.round(safeProgress * 100)}%
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  progress: {
    height: '100%',
  },
  label: {
    position: 'absolute',
    alignSelf: 'center',
    color: '#152A36',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default ProgressBar;
