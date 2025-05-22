import {View, StyleSheet} from 'react-native';
import Text from '@/components/basic/text';
import theme from '@/style';
import {toPriceStr} from '@/utils';
import globalStore from '@/services/global.state';
import React from 'react';
import {useTranslation} from 'react-i18next';

export interface HeaderType {
  amount?: number | 0;
}

const Header = (props: HeaderType) => {
  const {amount = 0} = props;
  const {i18n} = useTranslation();
  return (
    <View style={[theme.flex.center, styles.container, theme.background.white]}>
      <Text>{i18n.t('transfer-page.label.total')}</Text>
      <Text fontSize={24} fontFamily="fontInterBold">
        {toPriceStr(amount, {
          thousands: true,
          fixed: 2,
          spacing: true,
          currency: globalStore.currency,
        })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 22,
    borderBottomColor: theme.backgroundColor.grey,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
});

export default Header;
