import {goBack} from '@/utils';
import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import theme from '@style';
import Text from '@basicComponents/text';
import {useInnerStyle} from '../proxy.hooks';
import i18n from '@/i18n';
import {BackIcon} from '../svg.variable';

const ProxyRulesHeader = () => {
  const {rulesStyle} = useInnerStyle();
  return (
    <View
      style={[
        theme.fill.fillW,
        theme.flex.row,
        theme.flex.center,
        theme.position.rel,
        rulesStyle.header,
      ]}>
      <TouchableOpacity
        onPress={() => goBack()}
        style={[theme.position.abs, rulesStyle.headerBack]}>
        <BackIcon
          width={theme.iconSize.s}
          height={theme.iconSize.s}
          stroke={theme.basicColor.white}
        />
      </TouchableOpacity>
      <Text fontSize={theme.fontSize.l} blod color={theme.basicColor.white}>
        {i18n.t('proxy.rules.header')}
      </Text>
    </View>
  );
};

export default ProxyRulesHeader;
