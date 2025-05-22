import {View, StyleSheet} from 'react-native';
import tableStyle from '../style';
import React from 'react';
import Text from '@/components/basic/text';
import theme from '@/style';
import {BasicObject} from '@/types';
import {toPriceStr} from '@/utils';
import LazyImage from '@/components/basic/image';
import {useTranslation} from 'react-i18next';
import {LEVELS} from '../constant';

const KeralaTable = ({list = []}: {list: BasicObject[]}) => {
  const {i18n} = useTranslation();
  return (
    <View
      style={[
        theme.background.mainDark,
        theme.padding.l,
        theme.borderRadius.l,
      ]}>
      <View style={[tableStyle.th]}>
        <View style={[theme.flex.flex1]}>
          <Text white>{i18n.t('bets-detail.label.number').toUpperCase()}</Text>
        </View>
        <View style={[tableStyle.tbPayment]}>
          <Text white style={[theme.font.center]}>
            {i18n.t('bets-detail.label.payment').toUpperCase()}
          </Text>
        </View>
        <View style={[theme.flex.flex1]}>
          <Text white style={[tableStyle.textRight]}>
            {i18n.t('bets-detail.label.result').toUpperCase()}
          </Text>
        </View>
      </View>
      <View>
        {list.map((item, index) => (
          <View
            key={index}
            style={[tableStyle.td, index % 2 === 1 && tableStyle.tdGray]}>
            <View style={[theme.flex.flex1, theme.flex.row]}>
              <View
                style={[styles.codeContainer, item.isWin && styles.codeWin]}>
                <Text
                  fontFamily="fontInterBold"
                  color={
                    item.isWin
                      ? theme.fontColor.winColor
                      : theme.fontColor.white
                  }>
                  {item.wonCode}
                </Text>
              </View>
            </View>
            <View style={[tableStyle.tbPayment]}>
              <Text
                fontFamily="fontInter"
                blod
                size="medium"
                white
                style={[theme.font.center]}>
                {toPriceStr(item.lotteryPrice, {
                  fixed: 2,
                  showCurrency: true,
                  thousands: true,
                })}
              </Text>
            </View>
            <View style={[theme.flex.flex1]}>
              <View
                style={[
                  theme.flex.end,
                  theme.flex.row,
                  theme.flex.centerByCol,
                ]}>
                {item.level && (
                  <LazyImage
                    occupancy="transparent"
                    width={32}
                    height={32}
                    imageUrl={LEVELS[item.level]}
                  />
                )}
                <View style={[theme.margin.leftxxs, theme.flex.alignEnd]}>
                  <Text white>
                    {i18n.t(
                      item.isWin
                        ? 'bets-detail.label.won'
                        : 'bets-detail.label.noWin',
                    )}
                  </Text>
                  <Text
                    blod
                    color={
                      item.isWin
                        ? theme.fontColor.winColor
                        : theme.fontColor.white
                    }
                    fontFamily="fontInter"
                    size="medium">
                    {toPriceStr(item.wonAmount || 0, {
                      fixed: 2,
                      showCurrency: true,
                      thousands: true,
                    })}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  codeContainer: {
    height: 28,
    borderRadius: 36,
    justifyContent: 'center',
    alignContent: 'center',
  },
  codeWin: {},
});

export default KeralaTable;
