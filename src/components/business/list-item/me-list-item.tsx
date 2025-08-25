import LazyImage, {ImageUrlType} from '@components/basic/image';
import theme from '@style';
import React, {ReactNode} from 'react';
import {Pressable, View} from 'react-native';
import Text from '@basicComponents/text';
import {useResponsiveDimensions} from '@/utils';

const {flex, font, margin, padding} = theme;
export const agencyIcon = require('@components/assets/icons/me-list-item/proxy.webp');
export const resultHistoryIcon = require('@components/assets/icons/me-list-item/result-history.webp');
export const betsIcon = require('@components/assets/icons/me-list-item/money.webp');
export const transactionsIcon = require('@components/assets/icons/me-list-item/transactions.webp');
export const giftcode = require('@components/assets/icons/me-list-item/commission.webp');
export const rebateIcon = require('@components/assets/icons/me-list-item/rebate.webp');
export const notificationsIcon = require('@components/assets/icons/me-list-item/notifications.webp');
export const passwordIcon = require('@components/assets/icons/me-list-item/password.webp');
export const languagesIcon = require('@components/assets/icons/me-list-item/languages.webp');
export const customerServiceIcon = require('@components/assets/icons/me-list-item/customer-service.webp');
export const updateIcon = require('@components/assets/icons/me-list-item/update-icon.webp');
export const gameIcon = require('@components/assets/icons/me-list-item/game.webp');

const rightIcon = require('@components/assets/icons/me-list-item/right-icon-2.webp');

export interface MeListItemProps {
  icon: ImageUrlType;
  iconSize?: number;
  mt?: number;
  title: string;
  hasRightIcon?: boolean;
  rightContent?: ReactNode;
  onPress?: () => void;
  hideBottomBorder?: boolean;
}

const MeListItem: React.FC<MeListItemProps> = props => {
  const {width} = useResponsiveDimensions();
  const rightIconSize = (width / 375) * 8;
  const rightIconSizeh = (width / 375) * 14;
  const defaultIconSize = (width / 375) * 16;
  const {
    icon,
    iconSize = defaultIconSize,
    title,
    rightContent = null,
    hasRightIcon = true,
    hideBottomBorder = false,
    onPress,
  } = props;

  const borderStyle = !hideBottomBorder
    ? {
        borderBlockColor: '#ffffff1a',
        borderBottomWidth: 1,
      }
    : {};
  return (
    <Pressable
      onPress={onPress}
      style={[
        flex.centerByCol,
        flex.row,
        flex.between,
        padding.tbl,
        padding.lrl,
        {height: 49},
        borderStyle,
      ]}>
      <View style={[flex.centerByCol, flex.row]}>
        {icon && (
          <LazyImage
            occupancy={'transparent'}
            imageUrl={icon}
            width={iconSize}
            height={iconSize}
          />
        )}
        <Text
          color={theme.basicColor.newFontWhite}
          style={[margin.lefts, font.fm]}>
          {title}
        </Text>
      </View>
      <View style={[flex.row, flex.centerByCol]}>
        {rightContent}
        {hasRightIcon && (
          <View style={[margin.leftl]}>
            <LazyImage
              occupancy={'transparent'}
              imageUrl={rightIcon}
              width={rightIconSize}
              height={rightIconSizeh}
            />
          </View>
        )}
      </View>
    </Pressable>
  );
};

export default MeListItem;
