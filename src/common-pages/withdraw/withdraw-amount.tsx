import React from 'react';
import {useTranslation, Trans} from 'react-i18next';
import {View, StyleSheet} from 'react-native';
import Text from '@/components/basic/text';
import theme from '@/style';
import {TextInput} from '@/components/basic/input-field';
import globalStore from '@/services/global.state';

export interface WithdrawAmountType {
  amount: string;
  receiveAmount: string;
  onAmountChange: (v: string) => void;
}

const WithdrawAmount = (props: WithdrawAmountType) => {
  const {i18n} = useTranslation();
  const {amount = '', onAmountChange, receiveAmount = ''} = props;

  return (
    <View
      style={[
        theme.padding.lrl,
        theme.padding.bl,
        theme.border.main,
        theme.borderRadius.s,
        theme.background.newBgInTwo,
        theme.margin.l,
      ]}>
      <Text style={[theme.margin.tbm]} white size="medium">
        {i18n.t('withdraw-page.label.withdrawAmount')}
      </Text>
      <TextInput
        value={amount}
        onValueChange={value => {
          const regex = /^[0-9\b]+$/;
          if (
            value === '' ||
            (regex.test(value) && value[0] !== '0' && Number(value) <= 1000000)
          ) {
            onAmountChange(value);
          }
        }}
        hasMax={false}
        placeholder={i18n.t('withdraw-page.placeholder.enterAmount')}
      />
      <View style={[theme.flex.row, theme.flex.centerByCol, theme.margin.btms]}>
        <Text color={theme.fontColor.white} size="medium">
          {i18n.t('withdraw-page.label.received')}
        </Text>
        <Text blod size="medium" white style={[theme.margin.leftxxs]}>
          {globalStore.currency}
          {receiveAmount || '-'}
        </Text>
      </View>
      <View style={[styles.line]} />
      <View>
        <Text style={[theme.margin.btml]}>
          <Trans i18nKey={'withdraw-page.rules.fee'} values={{percent: '3%'}}>
            <Text color={theme.fontColor.primary} />
            <Text color={theme.fontColor.primary} />
          </Trans>
        </Text>
        {/*<Text style={[theme.margin.btml]}>*/}
        {/*  <Trans i18nKey={'withdraw-page.rules.times'} values={{times: '(3)'}}>*/}
        {/*    <Text color={theme.fontColor.primaryMain} />*/}
        {/*    <Text color={theme.fontColor.primaryMain} />*/}
        {/*  </Trans>*/}
        {/*</Text>*/}
        <Text color={theme.fontColor.primaryMain} style={[theme.margin.btml]}>
          {i18n.t('withdraw-page.rules.note')}
          <Text color={theme.fontColor.primary}>2 hours</Text>
          <Text color={theme.fontColor.primaryMain} style={[theme.margin.btml]}>
            {i18n.t('withdraw-page.rules.limit')}
            <Text color={theme.fontColor.primary}>24 hours.</Text>
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  line: {
    height: 1,
    backgroundColor: theme.backgroundColor.grey,
    marginBottom: 8,
  },
});

export default WithdrawAmount;
