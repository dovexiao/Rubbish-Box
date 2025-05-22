import {StyleSheet, View} from 'react-native';
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
    <View
      style={[
        theme.flex.row,
        theme.margin.lrl,
        theme.flex.centerByCol,
        theme.flex.between,
        theme.padding.leftl,
        theme.background.mainDark,
        theme.borderRadius.s,
        theme.border.primary50,
        styles.container,
      ]}>
      <View style={[theme.margin.leftxxl]}>
        <Text color={theme.fontColor.primaryMain}>
          {i18n.t('transfer-page.label.total')}
        </Text>
        <Text
          style={[theme.margin.tops]}
          color={theme.fontColor.white}
          fontSize={20}
          fontFamily="fontInterBold">
          {toPriceStr(amount, {
            thousands: true,
            fixed: 2,
            spacing: true,
            currency: globalStore.currency,
          })}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 81,
    overflow: 'hidden',
  },
});

export default Header;
