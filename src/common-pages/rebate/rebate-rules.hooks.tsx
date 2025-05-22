import {View} from 'react-native';
import Text from '@basicComponents/text';
import React, {useMemo} from 'react';
import theme from '@style';
import {useModal} from '@/components/basic/modal';
import {useInnerStyle} from './rebate.hooks';
import LazyImage from '@/components/basic/image';
import {closeIcon} from './rebate.variables';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import globalStore from '@/services/global.state';
import {useTranslation} from 'react-i18next';

const {borderRadiusSize, flex, padding} = theme;
const nameMap: Record<number, string> = {
  3: 'IndraLottery',
};
export function useRebateRules() {
  const {i18n} = useTranslation();
  const {bonusToastStyle} = useInnerStyle();
  const name = useMemo(() => {
    return nameMap[globalStore.packageId];
  }, []);
  const {show, hide, renderModal} = useModal(
    <View style={[theme.padding.l, flex.col, bonusToastStyle.rule]}>
      <View style={[flex.col, padding.l]}>
        <View
          style={[theme.flex.row, theme.flex.between, theme.flex.centerByCol]}>
          <Text white fontSize={theme.fontSize.xl} blod>
            {i18n.t('rebate.title')}
          </Text>
          <NativeTouchableOpacity onPress={() => hide()}>
            <LazyImage
              occupancy="#0000"
              width={theme.iconSize.l}
              height={theme.iconSize.l}
              imageUrl={closeIcon}
            />
          </NativeTouchableOpacity>
        </View>

        <Text white fontSize={theme.fontSize.l} blod>
          {i18n.t('rebate.rule.betting')}
        </Text>
        <Text accent fontSize={theme.fontSize.m}>
          {i18n.t('rebate.rule.betting-detail', {name})}
        </Text>
        <Text white fontSize={theme.fontSize.l} blod>
          {i18n.t('rebate.rule.activity')}
        </Text>
        <Text accent fontSize={theme.fontSize.m}>
          {i18n.t('rebate.rule.activity-detail', {name})}
        </Text>
        <Text accent fontSize={theme.fontSize.m}>
          {i18n.t('rebate.rule.actrule')}
        </Text>
        <Text accent fontSize={theme.fontSize.m}>
          {i18n.t('rebate.rule.actrule-detail', {name})}
        </Text>
        <Text white fontSize={theme.fontSize.l} blod>
          {i18n.t('rebate.rule.precaution')}
        </Text>
        <Text accent fontSize={theme.fontSize.m}>
          {i18n.t('rebate.rule.precaution-detail-1', {name})}
        </Text>
        <Text accent fontSize={theme.fontSize.m}>
          {i18n.t('rebate.rule.precaution-detail-2', {name})}
        </Text>
        <Text accent fontSize={theme.fontSize.m}>
          {i18n.t('rebate.rule.precaution-detail-3', {name})}
        </Text>
      </View>
    </View>,
    {
      overlayStyle: [
        {
          padding: 0,
          borderRadius: borderRadiusSize.m + borderRadiusSize.s,
          backgroundColor: theme.backgroundColor.mainDark,
        },
      ],
      backDropClose: true,
    },
  );

  return {
    show,
    hide,
    renderModal,
  };
}
