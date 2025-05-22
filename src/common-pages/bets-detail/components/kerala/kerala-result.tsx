import {BasicObject} from '@/types';
import {View, StyleSheet} from 'react-native';
import Text from '@/components/basic/text';
import React from 'react';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import LazyImage from '@/components/basic/image';
import {downIcon} from '@/common-pages/rebate/rebate.variables';
import theme from '@/style';
import {useTranslation} from 'react-i18next';

const KeralaResult = ({
  info,
  onGoResult = () => {},
}: {
  info: BasicObject;
  onGoResult?: () => void;
}) => {
  const {i18n} = useTranslation();
  return (
    <NativeTouchableOpacity
      onPress={onGoResult}
      style={[
        theme.padding.l,
        theme.flex.row,
        theme.background.mainDark,
        theme.flex.between,
        theme.margin.btml,
      ]}>
      <Text size="medium" white fontFamily="fontInterBold">
        {info.issueNo} {i18n.t('bets-detail.label.drawRes')}
      </Text>
      <View style={[styles.arrowStyle]}>
        <LazyImage
          imageUrl={downIcon}
          width={14}
          height={14}
          occupancy="transparent"
        />
      </View>
    </NativeTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  arrowStyle: {
    transform: [
      {
        rotate: '-90deg',
      },
    ],
  },
});

export default KeralaResult;
