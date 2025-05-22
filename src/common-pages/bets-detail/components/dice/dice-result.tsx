import theme from '@/style';
import {View, StyleSheet} from 'react-native';
import Text from '@/components/basic/text';
import {BasicObject} from '@/types';
import React from 'react';
import LazyImage, {LazyImageBackground} from '@/components/basic/image';
import {DICES} from '../constant';
import {useTranslation} from 'react-i18next';

const DiceResult = ({info}: {info: BasicObject}) => {
  const resultData = React.useMemo(() => {
    if (info.result) {
      return info.result.split(',');
    }
    return [];
  }, [info]);
  const {i18n} = useTranslation();
  return (
    <View style={[theme.background.mainDark, theme.padding.l]}>
      <Text white fontFamily="fontInterBold" size="medium">
        {info.issNo} {i18n.t('bets-detail.label.drawRes')}:
      </Text>
      <View style={[theme.flex.row, theme.margin.topl, theme.flex.between]}>
        <View style={[]}>
          <Text
            color={theme.fontColor.primaryMain}
            fontSize={9}
            fontFamily="fontInterBold">
            {i18n.t('bets-detail.label.result').toUpperCase()}
          </Text>
          <View style={[theme.flex.row, styles.result]}>
            {resultData.map((item: string | number, index: number) => (
              <LazyImage
                occupancy="transparent"
                width={32}
                height={32}
                imageUrl={DICES[item]}
                key={index}
              />
            ))}
          </View>
        </View>
        <View style={styles.line} />
        <View style={[theme.flex.center]}>
          <Text
            color={theme.fontColor.primaryMain}
            fontSize={9}
            fontFamily="fontInterBold">
            {i18n.t('bets-detail.label.totalPoints').toUpperCase()}
          </Text>
          <View style={[styles.result]}>
            <LazyImageBackground
              occupancy="transparent"
              width={32}
              height={32}
              style={[theme.flex.center]}
              imageUrl={DICES.ball}>
              <Text fontSize={17} fontFamily="fontDin" fontWeight="bold">
                {info.totalCount}
              </Text>
            </LazyImageBackground>
          </View>
        </View>
        <View style={styles.line} />
        <View style={[theme.flex.center]}>
          <Text
            color={theme.fontColor.primaryMain}
            fontSize={9}
            fontFamily="fontInterBold">
            {i18n.t('bets-detail.label.draw').toUpperCase()}
          </Text>
          <View style={[styles.result, theme.flex.row]}>
            <LazyImage
              occupancy="transparent"
              width={32}
              height={32}
              imageUrl={info.totalCount >= 11 ? DICES.big : DICES.small}
            />
            <LazyImage
              occupancy="transparent"
              width={32}
              height={32}
              imageUrl={DICES[info.totalCount % 2 === 0 ? 'even' : 'odd']}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  result: {
    columnGap: 8,
    padding: 8,
    backgroundColor: theme.backgroundColor.black50,
    borderRadius: 8,
    marginTop: 4,
  },
  line: {
    width: 1,
    ...theme.background.grey,
  },
});

export default DiceResult;
