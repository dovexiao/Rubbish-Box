import {StyleProp, View, ViewStyle} from 'react-native';
import theme from '@/style';
import Text, {TextProps} from '@/components/basic/text';
import React, {ReactNode} from 'react';
import {toPriceStr} from '@/utils';
import {ArrowUpIcon, NormalIcon} from '../svg.variable';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {LazyImageBackground} from '@/components/basic/image';
import {proxyColor, rightIcon} from '../proxy.variable';
import {useInnerStyle} from '../proxy.hooks';

export interface HomeUserDataItemProps {
  // 这个icon由svg那边提供
  icon?: ReactNode;
  title: string;
  result?: string;
  resultTextProps?: TextProps;
  // 钱包增幅，如果有则展示
  rateMoney?: number;
  style?: StyleProp<ViewStyle>;
  onClick?: () => void;
}

const HomeUserDataItem: React.FC<HomeUserDataItemProps> = ({
  icon,
  title,
  result,
  rateMoney,
  resultTextProps,
  style,
  onClick,
}) => {
  const {userInfoStyle} = useInnerStyle();

  const render = (
    <>
      <View style={[theme.flex.row, theme.flex.centerByCol]}>
        {icon}
        <Text white style={[theme.margin.leftxxs]}>
          {title}
        </Text>
      </View>
      <View style={[theme.flex.row, theme.flex.centerByCol]}>
        <Text
          fontFamily="fontInter"
          fontSize={theme.fontSize.l}
          white
          style={[{marginTop: theme.paddingSize.xxs / 2}]}
          {...resultTextProps}>
          {result || '-'}
        </Text>
        {onClick && (
          <LazyImageBackground
            occupancy="#0000"
            width={theme.paddingSize.xl}
            height={theme.paddingSize.xl}
            imageUrl={rightIcon}
            style={[theme.margin.lefts]}
          />
        )}
      </View>

      {rateMoney != null && (
        <View
          style={[theme.flex.row, theme.flex.centerByCol, userInfoStyle.rate]}>
          <Text
            color={
              rateMoney === 0 ? theme.basicColor.newFontPink : proxyColor.raise
            }
            fontFamily="fontInter"
            blod
            fontSize={theme.fontSize.xs}
            style={theme.margin.rightxxs}>
            {rateMoney > 0
              ? `+ ${toPriceStr(rateMoney, {suffixUnit: 'K'})}`
              : toPriceStr(0)}
          </Text>
          {rateMoney === 0 ? (
            <NormalIcon width={theme.iconSize.xs} height={theme.iconSize.xs} />
          ) : (
            <ArrowUpIcon width={theme.iconSize.xs} height={theme.iconSize.xs} />
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
