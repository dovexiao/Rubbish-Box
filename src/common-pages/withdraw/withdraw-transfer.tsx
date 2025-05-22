import {View, StyleSheet, Dimensions} from 'react-native';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {TextInput} from '@/components/basic/input-field';
import Text from '@/components/basic/text';
import theme from '@/style';

import LazyImage from '@/components/basic/image';
import React from 'react';
import {useTranslation} from 'react-i18next';
import RechargeButton from '@/components/business/recharge-button';
import globalStore from '@/services/global.state';
import {toPriceStr} from '@/utils';
// import BoxShadow from '@/components/basic/shadow';
// import LinearGradient from '@/components/basic/linear-gradient';
const closeIcon = require('@/assets/icons/close.webp');
const {width} = Dimensions.get('window');

const WithdrawTransfer = (props: {
  withdrawAmount: number;
  inputAmount: string;
  receiveAmount: number;
  onInputChange: (v: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  const {
    withdrawAmount = 0,
    onInputChange = () => {},
    onClose = () => {},
    inputAmount = '',
    receiveAmount = 0,
    onConfirm,
  } = props;
  const {i18n} = useTranslation();

  const disabled = React.useMemo(() => {
    if (!withdrawAmount) {
      return true;
    } else {
      if (parseInt(inputAmount, 10) >= Math.trunc(withdrawAmount)) {
        return true;
      }
    }
    return false;
  }, [inputAmount, withdrawAmount]);

  return (
    <View style={[styles.container, theme.background.mainDark]}>
      <View style={[theme.flex.end, styles.header]}>
        <View
          style={[theme.flex.row, theme.flex.centerByCol, theme.flex.between]}>
          <Text white blod size="medium">
            {i18n.t('label.transfer')}
          </Text>
          <NativeTouchableOpacity onPress={onClose}>
            <LazyImage
              imageUrl={closeIcon}
              width={theme.iconSize.m}
              height={theme.iconSize.m}
              occupancy={'transparent'}
            />
          </NativeTouchableOpacity>
        </View>
      </View>
      <View style={[styles.body]}>
        <TextInput
          hasMax
          placeholder={`${i18n.t(
            'transfer-page.label.withdrawable',
          )}: ${toPriceStr(withdrawAmount, {
            thousands: true,
            spacing: false,
            currency: globalStore.currency,
          })}`}
          rightElement={
            <NativeTouchableOpacity
              onPress={() => onInputChange(`${Math.trunc(withdrawAmount)}`)}
              disabled={disabled}>
              <Text
                size="medium"
                blod
                color={theme.fontColor.green}
                style={[disabled && styles.disabled]}>
                MAX
              </Text>
            </NativeTouchableOpacity>
          }
          onValueChange={value => {
            const regex = /^[0-9\b]+$/;
            if (value === '' || (regex.test(value) && value[0] !== '0')) {
              onInputChange(value);
            }
          }}
          value={inputAmount}
        />
        <View style={[theme.flex.row, styles.buttonContainer]}>
          {[100, 200, 500, 1000].map((item, index) => (
            <NativeTouchableOpacity
              onPress={() => onInputChange(`${item}`)}
              style={styles.buttonItemContainer}
              key={index}>
              {/* <BoxShadow
                shadowStyle={{
                  radius: theme.borderRadiusSize.xs,
                  out: {x: 0, y: 2, blur: 0, color: '#C3C8DC'},
                }}> */}
              <View
                style={[
                  theme.flex.center,
                  styles.buttonItem,
                  theme.borderRadius.xs,
                  theme.background.primary15,
                  theme.border.primary50,
                ]}>
                <Text white blod fontSize={theme.fontSize.m}>
                  {toPriceStr(item, {
                    fixed: 0,
                    showCurrency: false,
                    thousands: true,
                  })}
                </Text>
              </View>
              {/* </BoxShadow> */}
            </NativeTouchableOpacity>
          ))}
        </View>
        <Text adjustsFontSizeToFit color={theme.fontColor.primaryMain}>
          {i18n.t('transfer-page.tip.tip')}
        </Text>
      </View>
      <View
        style={[
          theme.flex.row,
          theme.flex.centerByCol,
          theme.flex.center,
          theme.margin.tops,
        ]}>
        <Text color={theme.fontColor.white}>
          {i18n.t('transfer-page.label.willGet')}:
        </Text>
        <Text
          style={styles.money}
          color={theme.fontColor.green}
          fontFamily="fontInterBold"
          size="large">
          {toPriceStr(receiveAmount, {
            showCurrency: true,
            thousands: true,
          })}
        </Text>
      </View>
      <RechargeButton
        disabled={Boolean(!receiveAmount)}
        onRecharge={onConfirm}
        text={i18n.t('label.confirm')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  header: {
    height: 44,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  body: {
    marginHorizontal: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.backgroundColor.grey,
  },
  money: {
    marginLeft: 4,
    fontSize: 20,
  },
  buttonContainer: {
    columnGap: 13,
    marginTop: 8,
    marginBottom: 16,
  },
  buttonItemContainer: {
    width: (width - 48 - 13 * 3) / 4,
    height: 40,
  },
  buttonItem: {
    elevation: 2,
    width: (width - 48 - 13 * 3) / 4,
    height: 40,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default WithdrawTransfer;
