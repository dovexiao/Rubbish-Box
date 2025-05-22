import {useTranslation} from 'react-i18next';
import LazyImage from '@/components/basic/image';
import {View, StyleSheet} from 'react-native';
import React from 'react';
import theme from '@/style';
import Text from '@/components/basic/text';
import {toPriceStr} from '@/utils';
import globalStore from '@/services/global.state';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {useScreenSize} from '../hooks/size.hooks';
// const transferIcon = require('@assets/icons/withdraw/transfer.webp');
const rightIcon = require('@components/assets/icons/chevron-right.png');
import Button from '@/components/basic/button';

export interface WithdrawBalanceProps {
  balance?: number;
  onRefresh?: () => void;
  onPressTransfer?: () => void;
  onGotoRecords?: () => void;
}

const WithdrawBalance: React.FC<WithdrawBalanceProps> = props => {
  const {balance = 0, onRefresh, onPressTransfer, onGotoRecords} = props;
  const {i18n} = useTranslation();

  const {screenWidth, screenHeight, designWidth} = useScreenSize();
  const rightIconSize = (14 * screenWidth) / designWidth;
  const refreshIconSize = (24 * screenWidth) / designWidth;
  const itemWidth = (72 * screenWidth) / designWidth;
  const itemHeight = (40 * screenWidth) / designWidth;
  const size = React.useMemo(() => {
    return {
      screenWidth,
      screenHeight,
      designWidth,
      refreshIconSize,
      rightIconSize,
      itemWidth,
      itemHeight,
    };
  }, [
    screenWidth,
    screenHeight,
    designWidth,
    refreshIconSize,
    rightIconSize,
    itemWidth,
    itemHeight,
  ]);

  return (
    <View
      style={[
        theme.margin.lrl,
        styles.container,
        theme.border.main,
        theme.borderRadius.m,
      ]}>
      <View
        style={[
          styles.balanceContainer,
          theme.margin.leftxs,
          theme.flex.row,
          theme.flex.between,
        ]}>
        <View style={[theme.flex.flex1]}>
          <Text color={theme.fontColor.primaryMain} style={[styles.opacity]}>
            {i18n.t('withdraw-page.label.withdrawAmount')}
          </Text>
          <View style={[theme.flex.row, theme.flex.alignEnd]}>
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
                width={size.refreshIconSize}
                height={size.refreshIconSize}
              />
            </NativeTouchableOpacity>
          </View>
        </View>
        <Button
          size="small"
          // eslint-disable-next-line react-native/no-inline-styles
          style={{marginRight: 30}}
          title={`${i18n.t('other.withdraw')} ${i18n.t('other.records')}`}
          type={'linear-primary'}
          onPress={onGotoRecords}
        />
      </View>
      <NativeTouchableOpacity
        style={[theme.margin.tops, theme.padding.l, theme.background.purple80]}
        onPress={onPressTransfer}>
        <View
          style={[
            styles.bottomContainer,
            theme.flex.row,
            theme.flex.centerByCol,
          ]}>
          <View
            style={[theme.flex.row, theme.flex.centerByCol, theme.flex.flex1]}>
            {/* <LazyImage
              occupancy={'transparent'}
              imageUrl={transferIcon}
              width={size.refreshIconSize}
              height={size.refreshIconSize}
            /> */}
            <View style={[]}>
              <Text blod color={theme.fontColor.white}>
                {i18n.t('label.transfer')}
              </Text>
              <Text color={theme.fontColor.primaryMain}>
                {i18n.t('withdraw-page.tip.transfer')}
              </Text>
            </View>
          </View>
          <LazyImage
            occupancy={'transparent'}
            imageUrl={rightIcon}
            width={size.rightIconSize}
            height={size.rightIconSize}
          />
        </View>
      </NativeTouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardBg: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
  },
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  bottomContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  opacity: {
    opacity: 0.7,
  },
  bgBox: {
    width: '100%',
    height: '100%',
  },
  balanceContainer: {
    paddingLeft: 8,
    paddingTop: 20,
    alignItems: 'center',
  },
  methodContainer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    // paddingHorizontal: 20,
  },
});

export default React.memo(WithdrawBalance);
