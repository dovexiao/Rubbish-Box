import React from 'react';
import theme from '@style';
import {View, Text, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';

const CasinoNewPage = () => {
  const {i18n} = useTranslation();
  return (
    <View style={styleSheet.rule}>
      <Text style={styleSheet.ruleTitle}>
        {i18n.t('recharge-page.tip.depositInstructions')}
      </Text>
      <View style={[theme.flex.col, theme.flex.wrap]}>
        <Text style={styleSheet.ruleText}>
          1, {i18n.t('recharge-page.tip.tip1')}
        </Text>
        <Text style={styleSheet.ruleText}>
          2, {i18n.t('recharge-page.tip.tip2')}
        </Text>
        <Text style={styleSheet.ruleText}>
          3, {i18n.t('recharge-page.tip.tip3')}
        </Text>
        <Text style={styleSheet.ruleText}>
          4, {i18n.t('recharge-page.tip.tip4')}
        </Text>
        <Text style={styleSheet.ruleText}>
          5, {i18n.t('recharge-page.tip.tip5')}
        </Text>
        <Text style={styleSheet.ruleText}>
          6, {i18n.t('recharge-page.tip.tip6')}
        </Text>
        <Text style={styleSheet.ruleTextRed}>
          7, {i18n.t('recharge-page.tip.tip7')}
        </Text>
        <Text style={styleSheet.ruleTextRed}>
          8, {i18n.t('recharge-page.tip.tip8')}
        </Text>
        {/* <Text style={styleSheet.ruleTextRed}>
          9, {i18n.t('recharge-page.tip.tip9')}
        </Text> */}
      </View>
    </View>
  );
};

const styleSheet = StyleSheet.create({
  rule: {
    marginTop: 20,
  },
  ruleTitle: {
    color: theme.basicColor.newFontWhite,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 22,
  },
  ruleText: {
    width: '100%',
    color: theme.basicColor.newFontWhite,
    fontSize: 12,
    lineHeight: 22,
  },
  ruleTextRed: {
    width: '100%',
    color: theme.basicColor.newFontPink,
    fontSize: 12,
    lineHeight: 22,
  },
});

export default CasinoNewPage;
