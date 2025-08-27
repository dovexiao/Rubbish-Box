import {BasicObject} from '@/types';
import React, {useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import Text from '@/components/basic/text';
import {LazyImageBackground} from '@/components/basic/image';
import theme from '@/style';
import {DIGIT} from '../constant';
import dayjs from 'dayjs';
import {useTranslation} from 'react-i18next';

const DigitResult = ({info = {}}: {info: BasicObject}) => {
  const {i18n} = useTranslation();
  const CodeArr = useMemo(() => {
    if (info.wonCode) {
      return info.wonCode.split('');
    }
    return [];
  }, [info.wonCode]);
  const labelArr = useMemo(() => {
    if (info.codeLists && info.codeLists.length) {
      const arr = info.codeLists[0].indexCode.split('=')[0].split('');
      if (arr.length > 3) {
        return ['Y', 'Z', 'A', 'B', 'C'];
      } else {
        return ['A', 'B', 'C'];
      }
    }
    return [];
  }, [info.codeLists]);
  const imageWidth = labelArr.length > 3 ? 22 : 36;
  return (
    <View
      style={[
        theme.background.newBgInOne,
        theme.padding.l,
        theme.margin.lrl,
        theme.borderRadius.l,
      ]}>
      <View style={[theme.flex.row, theme.flex.between]}>
        <Text white fontFamily="fontInterBold" size="medium">
          {i18n.t('bets-detail.label.drawRes')}:
        </Text>
        <View style={[theme.flex.row, theme.flex.centerByCol]}>
          <Text color={theme.fontColor.white} size="medium">
            {dayjs(info.gameDrawTime).format('YYYY-MM-DD')}{' '}
          </Text>
          <Text white fontFamily="fontInterBold" size="medium">
            {dayjs(info.gameDrawTime).format('hh:mm A')}
          </Text>
        </View>
      </View>
      <View
        style={[
          theme.flex.flex1,
          theme.flex.row,
          theme.flex.centerByCol,
          theme.flex.between,
          theme.margin.topm,
          styles.gap,
        ]}>
        <View style={[theme.flex.row, theme.flex.centerByCol, styles.gap]}>
          {labelArr.map((item: any, index: number) => (
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
        <Text white size="medium" fontFamily="fontInterBold">
          =
        </Text>
        <View style={[theme.flex.row, theme.flex.centerByCol, styles.gap]}>
          {labelArr.map((item: any, index: number) => (
            <LazyImageBackground
              key={index}
              occupancy="transparent"
              style={[theme.flex.center]}
              width={imageWidth}
              height={imageWidth}
              imageUrl={DIGIT[item]}>
              <Text fontFamily="fontInterBold">{CodeArr[index] || '*'}</Text>
            </LazyImageBackground>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gap: {
    columnGap: 4,
  },
});

export default DigitResult;
