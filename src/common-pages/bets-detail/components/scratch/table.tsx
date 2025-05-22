import {View} from 'react-native';
import tableStyle from '../style';
import React from 'react';
import Text from '@/components/basic/text';
import theme from '@/style';
import {BasicObject} from '@/types';
import {toPriceStr} from '@/utils';
import {useTranslation} from 'react-i18next';

const ScratchTable = ({
  list = [],
  payment = 0,
}: {
  list: BasicObject[];
  payment: number;
}) => {
  const {i18n} = useTranslation();
  return (
    <>
      <View style={[tableStyle.th]}>
        <View style={[theme.flex.flex1]}>
          <Text>{i18n.t('bets-detail.label.number').toUpperCase()}</Text>
        </View>
        <View style={[tableStyle.tbPayment]}>
          <Text style={[theme.font.center]}>
            {i18n.t('bets-detail.label.payment').toUpperCase()}
          </Text>
        </View>
        <View style={[theme.flex.flex1]}>
          <Text style={[tableStyle.textRight]}>
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
              <Text fontFamily="fontInterBold" color={theme.fontColor.second}>
                ID:{item.cardId}
              </Text>
            </View>
            <View style={[tableStyle.tbPayment]}>
              <Text
                blod
                fontFamily="fontDin"
                size="medium"
                style={[theme.font.center]}>
                {toPriceStr(payment, {
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
                <View style={[theme.margin.leftxxs, theme.flex.alignEnd]}>
                  <Text>
                    {i18n.t(
                      item.status === 1
                        ? 'bets-detail.label.won'
                        : 'bets-detail.label.noWin',
                    )}
                  </Text>
                  <Text
                    color={
                      item.status === 1
                        ? theme.backgroundColor.second
                        : theme.fontColor.second
                    }
                    fontFamily="fontDin"
                    size="medium">
                    {toPriceStr(item.winAmount || 0, {
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
    </>
  );
};

export default ScratchTable;
