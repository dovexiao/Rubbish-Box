import React from 'react';
import {View} from 'react-native';
import Text from '@/components/basic/text';
import theme from '@/style';
import {toPriceStr} from '@/components/utils';
import globalStore from '@/services/global.state';
import LazyImage from '@/components/basic/image';
import {useInnerStyle} from './recharge.hooks';
import {useScreenSize} from '../hooks/size.hooks';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {useTranslation} from 'react-i18next';
import Button from '@/components/basic/button';
export interface RechargeBalanceProps {
  balance?: number;
  payMethod?: string;
  tip?: string;
  onRefresh?: () => void;
  onGotoRecords?: () => void;
}

const RechargeBalance: React.FC<RechargeBalanceProps> = props => {
  const {i18n} = useTranslation();
  const {balance = 0, onRefresh = () => {}, onGotoRecords} = props;
  const {screenWidth, designWidth} = useScreenSize();
  const {
    size: {},
    amountStyle,
    balanceStyles: styles,
  } = useInnerStyle();
  const refreshIconSize = (24 * screenWidth) / designWidth;

  return (
    <View
      style={[
        theme.margin.lrl,
        theme.background.mainDark,
        theme.border.main,
        theme.borderRadius.m,
        styles.container,
      ]}>
      <View style={[theme.flex.between, theme.flex.flex1]}>
        <View
          style={[
            theme.padding.leftl,
            theme.padding.topl,
            theme.flex.row,
            theme.flex.between,
            theme.flex.centerByCol,
          ]}>
          <View style={[theme.flex.flex1]}>
            <Text color={theme.fontColor.purple} style={[amountStyle.opacity]}>
              {i18n.t('label.balance')}
            </Text>
            <View
              style={[theme.flex.row, theme.flex.alignEnd, theme.margin.topxs]}>
              <Text
                fontFamily="fontInter"
                blod
                fontSize={20}
                style={[theme.font.white]}>
                {toPriceStr(balance, {
                  thousands: true,
                  spacing: true,
                  currency: globalStore.currency,
                })}
              </Text>
              <NativeTouchableOpacity
                activeOpacity={0.8}
                onPress={onRefresh}
                style={[theme.margin.leftm]}>
                <LazyImage
                  occupancy={'transparent'}
                  imageUrl={require('@assets/icons/refresh.webp')}
                  width={refreshIconSize}
                  height={refreshIconSize}
                />
              </NativeTouchableOpacity>
            </View>
          </View>
          <Button
            size="small"
            // eslint-disable-next-line react-native/no-inline-styles
            style={{marginRight: 30}}
            title={`${i18n.t('label.recharge')} ${i18n.t('label.records')}`}
            type={'linear-primary'}
            onPress={onGotoRecords}
          />
        </View>
        {/* <Text style={[theme.margin.leftl]} color={'#F7336B'}>
          {i18n.t('other.rechargeNotReceived')}
        </Text>
        <View
          style={[
            theme.padding.lrl,
            theme.padding.tbs,
            theme.background.mainDark,
          ]}>
          <Text color={theme.fontColor.white}>
            {i18n.t('recharge-page.currentMethod')}:
            <Text color={theme.fontColor.white} style={[theme.margin.leftxxs]}>
              {payMethod}
            </Text>
          </Text>
          <View style={[theme.margin.topxxs]}>
            <Text color={theme.fontColor.purple} style={[amountStyle.opacity]}>
              {tip}
            </Text>
          </View>
        </View> */}
      </View>
    </View>
  );
};

export default RechargeBalance;
