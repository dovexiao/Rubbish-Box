import LazyImage, {ImageUrlType} from '@components/basic/image';
import theme from '@style';
import React, {ReactNode, useMemo} from 'react';
import {Pressable, StyleProp, View, ViewStyle} from 'react-native';
import Text from '@basicComponents/text';
import {useResponsiveDimensions} from '@/utils';

const {flex, font, margin, padding} = theme;
export const agencyIcon = require('@components/assets/icons/me-list-item/proxy.webp');

export const gamesIcon = require('@components/assets/icons/me-list-item/games.webp');
export const collectIcon = require('@components/assets/icons/me-list-item/collect.webp');
export const rebateIcon = require('@components/assets/icons/me-list-item/rebate.webp');
export const transactionsIcon = require('@components/assets/icons/me-list-item/transaction.webp');
export const betsIcon = require('@components/assets/icons/me-list-item/bets.webp');
export const resultHistoryIcon = require('@components/assets/icons/me-list-item/result-history.webp');
export const shopIcon = require('@components/assets/icons/me-list-item/shop.webp');
export const couponIcon = require('@components/assets/icons/me-list-item/coupon.webp');

export const commissionIcon = require('@components/assets/icons/me-list-item/commission.webp');
export const notificationsIcon = require('@components/assets/icons/me-list-item/notifications.webp');
export const passwordIcon = require('@components/assets/icons/me-list-item/password.webp');
export const languagesIcon = require('@components/assets/icons/me-list-item/languages.webp');
export const customerServiceIcon = require('@components/assets/icons/me-list-item/customer-service.webp');
export const updateIcon = require('@components/assets/icons/me-list-item/update-icon.webp');

const rightIcon = require('@assets/icons/right-purple.webp');

export interface MeListItemProps {
  containerStyle?: StyleProp<ViewStyle>;
  icon: ImageUrlType;
  iconSize?: number;
  title: string;
  description?: string;
  hasRightIcon?: boolean;
  rightContent?: ReactNode;
  onPress?: () => void;
  hideBottomBorder?: boolean;
  rightIconSize?: number;
  mt?: number; //maginTop
}

const MeListItem: React.FC<MeListItemProps> = props => {
  const {width} = useResponsiveDimensions();
  const {
    containerStyle,
    icon,
    iconSize,
    title,
    description = '',
    mt = 8,
    rightContent = null,
    hasRightIcon = true,
    rightIconSize = 24,
    // hideBottomBorder = false,
    onPress,
  } = props;

  const memoIconSize = useMemo(() => {
    return iconSize ? (width / 375) * iconSize : (width / 375) * 36;
  }, [iconSize, width]);

  return (
    <Pressable
      onPress={onPress}
      style={[
        flex.row,
        flex.centerByCol,
        flex.between,
        padding.tbs,
        padding.lrl,
        theme.background.mainDark,
        theme.borderRadius.s,

        {
          marginTop: mt,
        },
        containerStyle,
      ]}>
      <View style={[flex.centerByCol, flex.row]}>
        {icon && (
          <LazyImage
            occupancy={'transparent'}
            imageUrl={icon}
            width={memoIconSize}
            height={memoIconSize}
          />
        )}
        <View style={[]}>
          <Text style={[margin.lefts, font.m, font.white]}>{title}</Text>
          {description ? (
            <Text
              style={[margin.lefts, margin.topxxs, font.s, font.primaryMain]}>
              {description}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={[flex.row, flex.centerByCol]}>
        {rightContent}
        {hasRightIcon && (
          <View style={[margin.leftl]}>
            <LazyImage
              occupancy={'transparent'}
              imageUrl={rightIcon}
              width={rightIconSize}
              height={rightIconSize}
            />
          </View>
        )}
      </View>
    </Pressable>
  );
};

export default MeListItem;
