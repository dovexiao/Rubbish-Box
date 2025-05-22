import React from 'react';

import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import Text from '@/components/basic/text';
import theme from '@/style';
import {View} from 'react-native';
import {useInnerStyle} from '../invitation.style.hooks';
import {goBack} from '@/utils';
import {BackIcon, RulesIcon} from '../svg.variables';
import {useTranslation} from 'react-i18next';
export interface NormalNavProps {
  title: string;
  onRules?: () => void;
  hideBack?: boolean;
}

const NormalNav: React.FC<NormalNavProps> = ({title, onRules, hideBack}) => {
  const {homeStyle} = useInnerStyle();
  const {t} = useTranslation();
  return (
    <View
      style={[
        theme.fill.fill,
        theme.flex.center,
        theme.position.rel,
        theme.padding.lrl,
        theme.flex.row,
      ]}>
      {!hideBack && (
        <NativeTouchableOpacity
          style={[
            theme.icon.l,
            theme.position.abs,
            theme.fill.fillH,
            theme.flex.center,
            homeStyle.navFloat,
            {
              left: theme.paddingSize.l,
            },
          ]}
          onPress={goBack}>
          <BackIcon
            width={theme.iconSize.s}
            height={theme.iconSize.s}
            stroke={theme.basicColor.white}
          />
        </NativeTouchableOpacity>
      )}
      <Text fontSize={theme.fontSize.l} blod color={theme.basicColor.white}>
        {title}
      </Text>
      <View
        style={[
          theme.position.abs,
          theme.flex.center,
          homeStyle.navFloat,
          // eslint-disable-next-line react-native/no-inline-styles
          {
            right: theme.paddingSize.l,
            height: 52,
            bottom: 0,
          },
        ]}>
        <NativeTouchableOpacity
          style={[theme.flex.row, theme.flex.centerByCol]}
          onPress={onRules}>
          <RulesIcon
            width={[theme.iconSize.l]}
            height={[theme.iconSize.l]}
            fill={theme.basicColor.white}
          />
          <Text color={theme.basicColor.white} style={theme.margin.lefts}>
            {t('invitation.home.rules')}
          </Text>
        </NativeTouchableOpacity>
      </View>
    </View>
  );
};

export default NormalNav;
