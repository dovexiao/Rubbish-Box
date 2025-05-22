import {View, StyleSheet} from 'react-native';
import tableStyle from '../style';
import React, {useMemo} from 'react';
import Text from '@/components/basic/text';
import theme from '@/style';
import {BasicObject} from '@/types';
import {toPriceStr} from '@/utils';
import {LazyImageBackground} from '@/components/basic/image';
import {DIGIT} from '../constant';
import {useTranslation} from 'react-i18next';

const DigitTable = ({list = []}: {list: BasicObject[]}) => {
  const labelArr = useMemo(() => {
    if (list && list.length) {
      return list[0].indexCode.split('=')[0].split('');
    }
    return [];
  }, [list]);
  const {i18n} = useTranslation();
  const getABC = (indexCode: string) => {
    if (!indexCode) {
      return ['A', 'B', 'C'].map(key => ({key, value: ''}));
    }
    const [alphaCodes, digitCodes] = indexCode.split('=').map(v => v.split(''));
    const codeMap = alphaCodes.reduce((a, b, i) => {
      a[b] = digitCodes[i];
      return a;
    }, {} as BasicObject);
    // const result = labelArr.map((key: string | number) => ({
    //   [key]: codeMap[key] || '',
    // }));
    // return result;
    return codeMap;
  };
  const imageWidth = labelArr.length > 3 ? 20 : 24;
  const minWidth = labelArr.length > 3 ? 120 : 100;

  const getMaxNum = useMemo(() => {
    if (!list || list.length === 0) {
      return ['A', 'B', 'C'];
    }
    const len = list[0].indexCode.split('=')[0].split('').length;
    if (len > 3) {
      return ['Y', 'Z', 'A', 'B', 'C'];
    } else {
      return ['A', 'B', 'C'];
    }
  }, [list]);
  return (
    <>
      <View style={[tableStyle.th]}>
        <View style={[theme.flex.flex1, {minWidth: minWidth}]}>
          <View style={[theme.flex.row, styles.container]}>
            {getMaxNum.map((item: any, index: number) => (
              <LazyImageBackground
                key={index}
                occupancy="transparent"
                style={[theme.flex.center]}
                width={imageWidth}
                height={imageWidth}
                imageUrl={DIGIT[item]}>
                <Text fontFamily="fontInterBold">{item}</Text>
              </LazyImageBackground>
            ))}
          </View>
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
        {list.map((item, index) => {
          const abcData = getABC(item.indexCode);
          return (
            <View
              key={index}
              style={[tableStyle.td, index % 2 === 1 && tableStyle.tdGray]}>
              <View
                style={[
                  theme.flex.flex1,
                  theme.flex.row,
                  {minWidth: minWidth},
                ]}>
                <View
                  style={[
                    theme.flex.row,
                    theme.flex.centerByCol,
                    styles.container,
                  ]}>
                  {getMaxNum.map((pie: string, i: number) => (
                    <LazyImageBackground
                      occupancy="transparent"
                      key={i}
                      style={[theme.flex.center]}
                      width={imageWidth}
                      height={imageWidth}
                      imageUrl={DIGIT[pie]}>
                      <Text fontFamily="fontInterBold">
                        {Array.isArray(abcData)
                          ? abcData.find(item => item.key === pie)?.value || '-'
                          : abcData[pie] || '-'}
                      </Text>
                    </LazyImageBackground>
                  ))}
                </View>
              </View>
              <View style={[tableStyle.tbPayment]}>
                <Text
                  blod
                  fontFamily="fontInter"
                  size="medium"
                  white
                  style={[theme.font.center]}>
                  {toPriceStr(item.pickAmount, {
                    fixed: 2,
                    showCurrency: true,
                    thousands: true,
                  })}
                  *{item.pickCount}
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
                    <Text white>
                      {i18n.t(
                        item.codeWinAmount > 0
                          ? 'bets-detail.label.won'
                          : 'bets-detail.label.noWin',
                      )}
                    </Text>
                    <Text
                      color={
                        item.codeWinAmount > 0
                          ? theme.fontColor.winColor
                          : theme.fontColor.white
                      }
                      fontFamily="fontInter"
                      blod
                      size="medium">
                      {toPriceStr(item.codeWinAmount || 0, {
                        fixed: 2,
                        showCurrency: true,
                        thousands: true,
                      })}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    columnGap: 2,
  },
});

export default DigitTable;
