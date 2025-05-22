import TouchableOpacity from '@basicComponents/touchable-opacity';
import LazyImage from '@basicComponents/image';
import React, {useState} from 'react';
import {ImageRequireSource, StyleSheet} from 'react-native';

export type PageButtonType = 'all' | 'left' | 'right';
export interface PageButtonProps {
  /** 页面按钮的类型 */
  type?: PageButtonType;
  /** 按钮是否失效 */
  disabled?: boolean;
  /** 按钮按下时触发事件 */
  onPress?: () => void;
}

interface PageButtonInfo {
  icon: ImageRequireSource;
  pressedIcon: ImageRequireSource;
  iconWidth: number;
  iconHeight: number;
}

const buttonMap: Record<PageButtonType, PageButtonInfo> = {
  all: {
    icon: require('@components/assets/icons/page-button/view-all.webp'),
    pressedIcon: require('@components/assets/icons/page-button/view-all-press.webp'),
    iconWidth: 70,
    iconHeight: 28,
  },
  left: {
    icon: require('@components/assets/icons/page-button/page-left.webp'),
    pressedIcon: require('@components/assets/icons/page-button/page-left-press.webp'),
    iconWidth: 28,
    iconHeight: 28,
  },
  right: {
    icon: require('@components/assets/icons/page-button/page-right.webp'),
    pressedIcon: require('@components/assets/icons/page-button/page-right-press.webp'),
    iconWidth: 28,
    iconHeight: 28,
  },
};

const PageButton: React.FC<PageButtonProps> = props => {
  const {type = 'all', disabled, onPress} = props;
  const {icon, pressedIcon, iconWidth, iconHeight} = buttonMap[type];
  const [pressed, setPressed] = useState<boolean>();

  const styles = StyleSheet.create({
    opacity: {
      opacity: 0.5,
    },
  });

  // 这里用该组件是因为Pressable组件在安卓环境下会出现按下很久才弹起来的bug，也不知道用那个组件怎么解决
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={disabled}
      containerStyle={disabled ? styles.opacity : {}}>
      <LazyImage
        occupancy={'transparent'}
        imageUrl={pressed ? pressedIcon : icon}
        width={iconWidth}
        height={iconHeight}
      />
    </TouchableOpacity>
  );
};

export default PageButton;
