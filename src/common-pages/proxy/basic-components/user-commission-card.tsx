import theme from '@/style';
import {View} from 'react-native';
import React from 'react';
import {ImageUrlType, LazyImageBackground} from '@/components/basic/image';
import Text from '@/components/basic/text';
import {useInnerStyle} from '../proxy.hooks';
import i18n from '@/i18n';
import {rightIcon} from '../proxy.variable';
import {toPriceStr} from '@/utils';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
export interface UserCommissionCardProps {
  avatar?: ImageUrlType;
  userPhone?: string;
  lastLogin?: string;
  amount?: number;
  onClick?: () => void;
}

const UserCommissionCard: React.FC<UserCommissionCardProps> = ({
  avatar,
  userPhone = '-',
  lastLogin = '-',
  amount = 0,
  onClick,
}) => {
  const {userCommissionCardStyle} = useInnerStyle();
  return (
    <NativeTouchableOpacity onPress={onClick}>
      <View
        style={[
          theme.flex.col,
          theme.background.mainDark,
          theme.padding.l,
          theme.borderRadius.m,
        ]}>
        <View
          style={[theme.flex.row, theme.flex.between, theme.flex.centerByCol]}>
          <View style={[theme.flex.row, theme.flex.centerByCol]}>
            <LazyImageBackground
              radius={theme.iconSize.l}
              width={theme.iconSize.l}
              height={theme.iconSize.l}
              imageUrl={avatar}
            />
            <Text white blod style={[theme.margin.leftxxs]}>
              {userPhone}
            </Text>
          </View>
          <Text white>{lastLogin}</Text>
        </View>
        <View
          style={[
            userCommissionCardStyle.commissionItem,
            theme.flex.between,
            theme.flex.row,
            theme.flex.centerByCol,
            theme.margin.tops,
          ]}>
          <Text fontSize={theme.fontSize.m} white>
            {i18n.t('proxy.commission-card.commission')}
          </Text>
          <View style={[theme.flex.row, theme.flex.centerByCol]}>
            <Text
              color={theme.fontColor.green}
              fontFamily="fontInter"
              fontSize={theme.fontSize.l}
              blod>
              {amount > 0 ? '+ ' : ''}
              {toPriceStr(amount, {fixed: 2})}
            </Text>
            <LazyImageBackground
              occupancy="#0000"
              width={14}
              height={14}
              imageUrl={rightIcon}
              style={[theme.margin.leftxxs]}
            />
          </View>
        </View>
      </View>
    </NativeTouchableOpacity>
  );
};

export default UserCommissionCard;
