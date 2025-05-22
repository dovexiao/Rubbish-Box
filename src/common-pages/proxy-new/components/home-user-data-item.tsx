import {StyleProp, View, ViewStyle} from 'react-native';
import theme from '@/style';
import Text, {TextProps} from '@/components/basic/text';
import React from 'react';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {LazyImageBackground} from '@/components/basic/image';
import {rightIcon} from '@/common-pages/proxy/proxy.variable';

export interface HomeUserDataItemProps {
  title: string;
  type: number;
  result?: string;
  resultTextProps?: TextProps;
  // 钱包增幅，如果有则展示
  rateMoney?: number;
  style?: StyleProp<ViewStyle>;
  onClick?: () => void;
}

const HomeUserDataItem: React.FC<HomeUserDataItemProps> = ({
  title,
  result,
  resultTextProps,
  style,
  type,
  onClick,
}) => {
  const render = (
    <>
      {type == 1 ? (
        <View style={[theme.flex.flex, theme.flex.row]}>
          <View style={[{}]}>
            <View
              style={[
                theme.flex.row,
                theme.flex.centerByCol,
                theme.flex.centerByRow,
              ]}>
              <Text
                fontFamily="fontInter"
                fontSize={theme.fontSize.l}
                white
                style={[{marginTop: theme.paddingSize.xxs / 2}]}
                {...resultTextProps}>
                {result || '-'}
              </Text>
            </View>
            <View
              style={[
                theme.flex.row,
                theme.flex.centerByCol,
                theme.flex.centerByRow,
              ]}>
              <Text white style={[theme.margin.leftxxs]}>
                {title}
              </Text>
            </View>
          </View>
          {onClick && (
            <View style={[theme.flex.flex, theme.flex.centerByRow]}>
              <LazyImageBackground
                occupancy="#0000"
                width={theme.paddingSize.xl}
                height={theme.paddingSize.xl}
                imageUrl={rightIcon}
                style={[theme.margin.lefts]}
              />
            </View>
          )}
        </View>
      ) : (
        <View style={[theme.flex.flex, theme.flex.row]}>
          <View style={[{}]}>
            <View
              style={[
                theme.flex.row,
                theme.flex.centerByCol,
                theme.flex.centerByRow,
              ]}>
              <Text numberOfLines={1} white style={[theme.margin.leftxxs]}>
                {title}
              </Text>
            </View>
            <View
              style={[
                theme.flex.row,
                theme.flex.centerByCol,
                theme.flex.centerByRow,
              ]}>
              <Text
                fontFamily="fontInter"
                fontSize={theme.fontSize.l}
                white
                style={[{marginTop: theme.paddingSize.xxs / 2}]}
                {...resultTextProps}>
                {result || '-'}
              </Text>
            </View>
          </View>
          {onClick && (
            <View style={[theme.flex.flex, theme.flex.centerByRow]}>
              <LazyImageBackground
                occupancy="#0000"
                width={theme.paddingSize.xl}
                height={theme.paddingSize.xl}
                imageUrl={rightIcon}
                style={[theme.margin.lefts]}
              />
            </View>
          )}
        </View>
      )}
    </>
  );
  return onClick ? (
    <NativeTouchableOpacity
      style={[theme.flex.flex1, theme.flex.col, style]}
      onPress={onClick}>
      {render}
    </NativeTouchableOpacity>
  ) : (
    <View style={[theme.flex.flex1, theme.flex.col, style]}>{render}</View>
  );
};

export default HomeUserDataItem;
