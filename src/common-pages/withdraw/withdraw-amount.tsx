import React from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import Text from '@/components/basic/text';
import theme from '@/style';
import {TextInput} from '@/components/basic/input-field';
import globalStore from '@/services/global.state';
import {scaleSize} from '@/utils';
import CustomTitle from '@/components/business/custom-title';

export interface WithdrawAmountType {
  amount: string;
  receiveAmount: string;
  onAmountChange: (v: string) => void;
}

const WithdrawAmount = (props: WithdrawAmountType) => {
  const {i18n} = useTranslation();
  const {amount = '', onAmountChange, receiveAmount = ''} = props;

  return (
    <View style={[theme.padding.lrl, theme.padding.bl, theme.margin.l]}>
      <CustomTitle name={i18n.t('withdraw-page.label.withdrawAmount')} />
      <TextInput
        value={amount}
        style={[theme.border.primary]}
        onValueChange={value => {
          const regex = /^[0-9\b]+$/;
          if (
            value === '' ||
            (regex.test(value) && value[0] !== '0' && Number(value) <= 1000000)
          ) {
            onAmountChange(value);
          }
        }}
        leftElement={
          <Text
            style={{
              color: '#FFBD37',
              fontSize: scaleSize(18),
              paddingRight: scaleSize(10),
              fontWeight: 'bold',
            }}>
            ₹
          </Text>
        }
        hasMax={false}
        placeholder={i18n.t('withdraw-page.placeholder.enterAmount')}
      />
      <View style={[theme.flex.row, theme.flex.centerByCol, theme.margin.btms]}>
        <Text
          color={theme.fontColor.white}
          size="medium"
          style={{opacity: 0.6}}>
          {i18n.t('withdraw-page.label.received')}
        </Text>
        <Text
          size="medium"
          white
          style={[theme.margin.leftxxs, {fontWeight: 'bold', opacity: 0.6}]}>
          {globalStore.currency}
          {receiveAmount || '-'}
        </Text>
      </View>
    </View>
  );
};

export default WithdrawAmount;
