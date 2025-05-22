import React from 'react';
import {View, StyleProp, TextStyle, ViewStyle} from 'react-native';
import Text, {TextProps} from '@basicComponents/text';
import theme from '@style';

const {
  background,
  flex,
  font,
  backgroundColor: backgroundColorVar,
  padding,
} = theme;

export type TagType = 'badge' | 'primary' | 'normal';

export interface TagProps {
  type?: TagType;
  content?: string | number;
  /** 当type='badge'时的size设计值 */
  badgeSize?: number;
  /** 当type='primary' | 'normal'时高度 */
  tagHeight?: number;
  /** 当type='primary' | 'normal'时角度 */
  tagRadius?: number;
  fontSize?: number;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  textProps?: TextProps;
}

const Tag: React.FC<TagProps> = props => {
  const {
    type = 'badge',
    badgeSize = 20,
    tagHeight = 24,
    tagRadius = 20,
    content,
    fontSize = 10,
    textProps = {},
    backgroundColor = backgroundColorVar.main,
    style,
  } = props;
  const resultBadgeSize = badgeSize;

  const tagStyleMap: Record<
    TagType,
    {
      textStyle?: StyleProp<TextStyle>;
      style?: StyleProp<ViewStyle>;
    }
  > = {
    badge: {
      textStyle: [font.xs, font.white],
      style: [
        flex.center,
        background.main,
        {
          width: resultBadgeSize,
          height: resultBadgeSize,
          borderRadius: resultBadgeSize / 2,
          backgroundColor: backgroundColor,
        },
        style,
      ],
    },
    primary: {
      textStyle: [font.s, font.white],
      style: [
        padding.lrl,
        flex.center,
        background.primary,
        {height: tagHeight, borderRadius: tagRadius},
        style,
      ],
    },
    normal: {
      textStyle: [font.s, font.second],
      style: [
        padding.lrl,
        flex.center,
        background.lightGrey,
        {height: tagHeight, borderRadius: tagRadius},
        style,
      ],
    },
  };

  const tagStyle = tagStyleMap[type];
  return (
    <View style={[tagStyle.style]}>
      <Text
        blod={type === 'badge' || type === 'primary'}
        style={[tagStyle.textStyle]}
        fontSize={fontSize}
        letterSpacing={type === 'badge' ? -0.3 : 0}
        {...textProps}>
        {content}
      </Text>
    </View>
  );
};

export default Tag;
