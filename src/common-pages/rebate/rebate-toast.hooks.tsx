import Text from '@basicComponents/text';
import LazyImage from '@basicComponents/image';
import {useModal} from '@basicComponents/modal';
import theme from '@style';
import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import {useInnerStyle} from './rebate.hooks';
import {toPriceStr} from '@/utils';
import {rebateIcon} from './rebate.variables';
import {useTranslation} from 'react-i18next';
const {borderRadiusSize, flex, font, margin, padding} = theme;
const successIcon = require('@components/assets/icons/modal/success.webp');
export function useRebateSuccessToast() {
  const {i18n} = useTranslation();
  const {bonusToastStyle} = useInnerStyle();
  const iconSize = 28;
  const [bonus, setBonus] = useState(0);
  const {renderModal, show} = useModal(
    <View
      style={[flex.col, bonusToastStyle.toast, padding.l, flex.centerByCol]}>
      <View style={[flex.row, flex.center]}>
        <LazyImage
          occupancy={'transparent'}
          imageUrl={successIcon}
          width={iconSize}
          height={iconSize}
        />
      </View>
      <View style={[flex.col, flex.center, margin.tops]}>
        <Text style={[font.center, font.white, font.l]} blod>
          {i18n.t('rebate.congratulations')}
        </Text>
      </View>
      <View style={[flex.row, flex.center, margin.tops]}>
        <LazyImage
          imageUrl={rebateIcon}
          width={theme.iconSize.l}
          height={theme.iconSize.l}
          occupancy="#0000"
        />
        <Text style={[font.center, font.white, font.m, theme.margin.leftxxs]}>
          {i18n.t('rebate.get-bonus')}
        </Text>
      </View>
      <View style={[flex.col, flex.center, margin.tops]}>
        <Text
          blod
          fontFamily="fontDin"
          color={theme.backgroundColor.second}
          style={[font.center]}
          fontSize={24}>
          {toPriceStr(bonus, {fixed: 1})}
        </Text>
      </View>
    </View>,
    {
      overlayStyle: {
        borderRadius: borderRadiusSize.xl,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
      },
      delayClose: 2000,
      backDropClose: true,
    },
  );
  const handleShow = useCallback(
    (_bonus: number) => {
      setBonus(_bonus);
      show();
    },
    [show],
  );
  return {renderModal, show: handleShow};
}
