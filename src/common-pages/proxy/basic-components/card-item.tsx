import React from 'react';
import theme from '@style';
import {View, Image} from 'react-native';
import Text from '@basicComponents/text';

export interface CardContent {
  icon?: any;
  text?: string | number;
}

// 0 居左 1 居中 2 居右
export type Position = 0 | 1 | 2;

export interface CardItemProps<T> {
  isRight?: Position;
  content: T[];
  margin?: number;
  upStyle?: any;
  downStyle?: any;
  rest?: any;
}

const CardItem = (props: CardItemProps<CardContent>) => {
  const {content, isRight, upStyle, downStyle, margin, rest} = props;
  return (
    <View
      style={[
        theme.flex.flex,
        theme.flex.col,
        isRight === 0
          ? theme.flex.alignStart
          : isRight === 1
          ? theme.flex.centerByCol
          : theme.flex.alignEnd,
      ]}>
      {content.map((row, index) => {
        const {icon, text} = row;
        return (
          <View
            key={index}
            style={[
              theme.flex.flex,
              theme.flex.row,
              theme.flex.centerByCol,
              {
                marginBottom: margin,
              },
            ]}>
            {icon && (
              <Image
                source={icon}
                style={[
                  theme.margin.rights,
                  {width: theme.paddingSize.xxl, height: theme.paddingSize.xxl},
                ]}
              />
            )}
            <Text
              numberOfLines={1}
              style={index ? [downStyle?.style] : [upStyle?.style]}
              blod={index ? downStyle?.bold : upStyle?.bold}>
              {text}
            </Text>
            <View style={[theme.margin.rightxxs]} />
            {index === 1 && rest}
          </View>
        );
      })}
    </View>
  );
};

export default CardItem;
