import Text from '@/components/basic/text';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import globalStore from '@/services/global.state';
import theme from '@/style';
import {goTo, toPriceStr} from '@/utils';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {View, Image} from 'react-native';

export interface WalletProps {
  theme?: 'dark' | 'light';
}

const Wallet: React.FC<WalletProps> = ({theme: walletTheme = 'light'}) => {
  const [login, setLogin] = useState(false);
  const [amount, setAmount] = React.useState(0);
  const {i18n} = useTranslation();
  React.useEffect(() => {
    const amountSub = globalStore.amountChanged.subscribe(res => {
      setAmount(res.current);
    });
    const sub = globalStore.tokenSubject.subscribe(token => {
      setLogin(!!token);
    });
    return () => {
      amountSub.unsubscribe();
      sub.unsubscribe();
    };
  });
  return (
    <NativeTouchableOpacity
      onPress={() => {
        goTo('Recharge');
      }}
      style={[theme.flex.row, theme.flex.centerByCol]}>
      <View style={[theme.flex.col, theme.margin.rights]}>
        <Text
          textAlign="right"
          color={
            walletTheme === 'light'
              ? theme.basicColor.white
              : theme.fontColor.accent
          }>
          {i18n.t('label.balance')}
        </Text>
        <Text
          textAlign="right"
          blod
          color={
            walletTheme === 'light'
              ? theme.basicColor.white
              : theme.fontColor.main
          }>
          {login ? toPriceStr(amount, {suffixUnit: 'K'}) : '-'}
        </Text>
      </View>
      <Image
        source={require('@assets/imgs/home/wallet.webp')}
        style={[theme.icon.xxl]}
      />
    </NativeTouchableOpacity>
  );
};
export default Wallet;
