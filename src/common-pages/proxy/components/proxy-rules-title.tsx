// import LazyImage from '@basicComponents/image';
import React from 'react';
import {View} from 'react-native';
import theme from '@style';
import {useInnerStyle} from '../proxy.hooks';
// import {ruleBookImage} from '../proxy.variable';
import Text from '@basicComponents/text';
import i18n from '@/i18n';

const ProxyRulesTitle = () => {
  const {
    // size: {bookSize},
    rulesStyle,
  } = useInnerStyle();
  return (
    <View
      style={[
        theme.flex.col,
        theme.flex.start,
        theme.fill.fillW,
        theme.position.rel,
        theme.margin.topl,
        theme.padding.l,
      ]}>
      <View style={[theme.flex.col, theme.flex.start]}>
        <Text fontSize={23} color={theme.basicColor.white} blod>
          {i18n.t('proxy.rules.title')}
        </Text>
        <Text
          fontSize={theme.fontSize.m}
          color={theme.basicColor.white}
          style={[theme.margin.tops, rulesStyle.subtitle]}>
          {i18n.t('proxy.rules.subtitle')}
        </Text>
      </View>
      <View style={[theme.position.abs, rulesStyle.book]}>
        {/*<LazyImage*/}
        {/*  occupancy="#0000"*/}
        {/*  width={bookSize}*/}
        {/*  height={bookSize}*/}
        {/*  imageUrl={ruleBookImage}*/}
        {/*/>*/}
      </View>
    </View>
  );
};

export default ProxyRulesTitle;
