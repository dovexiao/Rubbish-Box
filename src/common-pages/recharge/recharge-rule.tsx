import React from 'react';
import theme from '@style';
import {View, Text, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';

const CasinoNewPage = () => {
  const {i18n} = useTranslation();
  return (
    <View style={styleSheet.rule}>
      <Text style={styleSheet.ruleTitle}>
        {i18n.t('recharge-page.tip.depositTips')}
      </Text>
      <View style={[theme.flex.col, theme.flex.wrap, {paddingTop: 6}]}>
        <Text style={styleSheet.ruleText}>
          1. {i18n.t('recharge-page.tip.tip1')}
        </Text>
        <Text style={styleSheet.ruleText}>
          2. {i18n.t('recharge-page.tip.tip2')}
        </Text>
        <Text style={styleSheet.ruleText}>
          3. {i18n.t('recharge-page.tip.tip3')}
        </Text>
      </View>

      <View style={{paddingTop: 6}}>
        <View style={[theme.flex.col, theme.flex.wrap, {paddingTop: 6}]}>
          <Text style={styleSheet.ruleTitle}>
            {i18n.t('recharge-page.note.title')}
          </Text>
          <Text style={styleSheet.ruleText}>
            {i18n.t('recharge-page.note.note1')}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styleSheet = StyleSheet.create({
  rule: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  ruleTitle: {
    color: theme.basicColor.newFontWhite,
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 22,
  },
  ruleText: {
    width: '100%',
    color: '#FFD3D3',
    fontSize: 12,
    lineHeight: 22,
  },
});

export default CasinoNewPage;
