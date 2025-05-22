import Text from '@/components/basic/text';
import globalStore from '@/services/global.state';
import theme from '@/style';
import {toPriceStr} from '@/utils';
import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useScreenSize} from '../hooks/size.hooks';
import Button from '@/components/basic/button';

const TransferBalance = ({
  balance = 0,
  onGotoRecords,
}: {
  balance: number;
  onGotoRecords?: () => void;
}) => {
  const {i18n} = useTranslation();

  const {screenWidth, screenHeight, designWidth} = useScreenSize();
  const rightIconSize = (14 * screenWidth) / designWidth;
  const itemWidth = (72 * screenWidth) / designWidth;
  const itemHeight = (40 * screenWidth) / designWidth;
  const {} = React.useMemo(() => {
    return {
      screenWidth,
      screenHeight,
      designWidth,
      rightIconSize,
      itemWidth,
      itemHeight,
    };
  }, [
    screenWidth,
    screenHeight,
    designWidth,
    rightIconSize,
    itemWidth,
    itemHeight,
  ]);

  return (
    <View
      style={[
        styles.container,
        theme.margin.lrl,
        theme.padding.leftl,
        theme.flex.centerByCol,
        theme.background.mainDark,
        theme.border.main,
        theme.borderRadius.s,
        theme.flex.row,
        theme.flex.between,
      ]}>
      <View style={[theme.flex.flex1, theme.flex.centerByRow]}>
        <Text color={theme.fontColor.primaryMain} style={[styles.opacity]}>
          {i18n.t('transfer-page.label.balance')}
        </Text>
        <View style={[theme.flex.row, theme.flex.alignEnd, theme.margin.tops]}>
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
        </View>
      </View>
      <Button
        size="small"
        // eslint-disable-next-line react-native/no-inline-styles
        style={{marginRight: 30}}
        title={`${i18n.t('label.transfer')} ${i18n.t('label.records')}`}
        type={'linear-primary'}
        onPress={onGotoRecords}
      />
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
    height: 81,
    position: 'relative',
    overflow: 'hidden',
  },
  bottomContainer: {
    borderRadius: 8,
    padding: 8,
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
    paddingHorizontal: 8,
    // paddingTop: 20,
    alignItems: 'center',
  },
  methodContainer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    // paddingHorizontal: 20,
  },
});

export default TransferBalance;
