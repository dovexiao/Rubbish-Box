import {BasicObject} from '@/types';
import {View, StyleSheet} from 'react-native';
import Text from '@/components/basic/text';
import React from 'react';
import theme from '@/style';
import {LazyImageBackground} from '@/components/basic/image';
import {COLORS} from '../constant';
import {useTranslation} from 'react-i18next';

const ColorResult = ({info = {}}: {info: BasicObject}) => {
  const {i18n} = useTranslation();
  const Ball = React.useMemo(() => {
    if (info.colorResult) {
      const bg = info.colorResult.split(',').join('');
      return (
        <LazyImageBackground
          occupancy="transparent"
          width={32}
          height={32}
          style={[theme.flex.center]}
          imageUrl={COLORS[bg]}>
          <Text
            fontSize={16}
            color={theme.fontColor.white}
            fontFamily="fontDin"
            fontWeight="bold">
            {info.digitResult}
          </Text>
        </LazyImageBackground>
      );
    }
    return null;
  }, [info]);

  return (
    <View
      style={[
        theme.flex.row,
        theme.padding.tbl,
        theme.background.newBgInOne,
        styles.container,
      ]}>
      <View style={[theme.flex.flex1]}>
        <Text white size="medium" fontFamily="fontInterBold">
          {info.groupOrderNo}
        </Text>
        <Text white size="medium" fontFamily="fontInterBold">
          {i18n.t('bets-detail.label.drawRes')}:
        </Text>
      </View>
      <View style={[theme.flex.flex1, styles.result]}>{Ball}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  result: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: theme.backgroundColor.black15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ColorResult;
