import Button from '@/components/basic/button';
import NavTitle from '@/components/basic/nav-title';
import Text from '@/components/basic/text';
import globalStore from '@/services/global.state';
import theme from '@/style';
import {goBack, goTo} from '@/utils';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Image, StyleSheet, View} from 'react-native';

const styles = StyleSheet.create({
  buttonStyle: {
    paddingHorizontal: theme.paddingSize.m * 2,
    borderColor: theme.basicColor.primary,
    borderWidth: 1,
    height: 40,
  },
  buttonBoxStyle: {borderRadius: 20, overflow: 'hidden'},
});

const PaidSuccess = () => {
  const {i18n} = useTranslation();
  return (
    <View style={[theme.flex.col, theme.fill.fill]}>
      <NavTitle onBack={goBack} title={i18n.t('paidSuccess.label.title')} />
      <View style={[theme.flex.flex1, theme.margin.l]}>
        <View
          style={[
            theme.background.white,
            theme.borderRadius.m,
            theme.flex.center,
            {
              padding: theme.paddingSize.l * 2,
            },
          ]}>
          <Image
            source={require('@assets/imgs/pay-sucess.webp')}
            // eslint-disable-next-line react-native/no-inline-styles
            style={{
              width: 80,
              height: 78,
            }}
          />
          <Text fontSize={20} main blod style={[theme.margin.tbl]}>
            {i18n.t('paidSuccess.label.subTitle')}
          </Text>
          <Text
            size="medium"
            textAlign="center"
            second
            style={{marginBottom: theme.paddingSize.l * 2}}>
            {i18n.t('paidSuccess.tip.msg')}
          </Text>
          <View style={[theme.flex.row, theme.flex.centerByCol]}>
            <Button
              color={theme.basicColor.transparent}
              onPress={() => {
                goTo('Bets');
              }}
              style={styles.buttonBoxStyle}
              buttonStyle={styles.buttonStyle}>
              <Text color={theme.basicColor.primary} size="medium" blod>
                {i18n.t('paidSuccess.label.viewOrder')}
              </Text>
            </Button>
            <View style={{width: theme.paddingSize.l}} />
            <Button
              color={theme.basicColor.transparent}
              onPress={() => goTo(globalStore.homePage)}
              style={styles.buttonBoxStyle}
              buttonStyle={styles.buttonStyle}>
              <Text color={theme.basicColor.primary} size="medium" blod>
                {i18n.t('paidSuccess.label.backHome')}
              </Text>
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
};

export default PaidSuccess;
