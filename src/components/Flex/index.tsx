import React, { ReactNode } from 'react';
import { View, ViewStyle, TouchableOpacity } from 'react-native';
import { styles } from './styles';

interface FlexProps extends Omit<ViewStyle, 'flexDirection' | 'alignItems' | 'justifyContent' | 'flexWrap' | 'direction'> {
  children?: ReactNode;
  align?: 'center' | 'end' | 'start' | 'baseline' | 'stretch';
  justify?: 'center' | 'end' | 'between' | 'around' | 'evenly' | 'stretch';
  direction?: 'row' | 'column';
  isTouchView?: boolean;
  wrap?: boolean;
  onPress?: () => void;
  activeOpacity?: number;
  style?: ViewStyle | ViewStyle[];
}

const Flex: React.FC<FlexProps> = ({
  children,
  align,
  justify,
  direction = 'row',
  wrap,
  isTouchView = false,
  onPress,
  activeOpacity = 0.7,
  style,
  ...viewProps
}) => {
  // 映射 align 属性到 React Native 的 alignItems
  const getAlignItems = (): ViewStyle['alignItems'] => {
    switch (align) {
      case 'center':
        return 'center';
      case 'end':
        return 'flex-end';
      case 'start':
        return 'flex-start';
      case 'baseline':
        return 'baseline';
      case 'stretch':
        return 'stretch';
      default:
        return undefined;
    }
  };

  // 映射 justify 属性到 React Native 的 justifyContent
  const getJustifyContent = (): ViewStyle['justifyContent'] => {
    switch (justify) {
      case 'center':
        return 'center';
      case 'end':
        return 'flex-end';
      case 'between':
        return 'space-between';
      case 'around':
        return 'space-around';
      case 'evenly':
        return 'space-evenly';
      case 'stretch':
        // React Native 不支持 justifyContent: stretch，使用 flex-start 作为替代
        return 'flex-start';
      default:
        return undefined;
    }
  };

  const flexStyle: ViewStyle = {
    flexDirection: direction,
    alignItems: getAlignItems(),
    justifyContent: getJustifyContent(),
    flexWrap: wrap ? 'wrap' : 'nowrap',
    ...viewProps,
  };

  const combinedStyle = [styles.box, flexStyle, style];

  if (isTouchView) {
    return (
      <TouchableOpacity
        style={combinedStyle}
        onPress={onPress}
        activeOpacity={activeOpacity}
        disabled={!onPress}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={combinedStyle}>{children}</View>;
};

export default Flex;
