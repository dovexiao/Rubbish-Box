import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import Text from '@/components/basic/text';
import theme from '@/style';
import globalStore from '@/services/global.state';
import {useTranslation} from 'react-i18next';
import {toPriceStr} from '@/utils';
// import LinearGradient from '@/components/basic/linear-gradient';
// import BoxShadow from '@/components/basic/shadow';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {TextInput} from '@/components/basic/input-field';

const {width} = Dimensions.get('window');
const TransferAmount = ({
  receiveAmount = 0,
  inputAmount,
  onInputChange,
  balance = 0,
}: {
  receiveAmount: number;
  inputAmount: string;
  balance: number;
  onInputChange: (v: string) => void;
}) => {
  const {i18n} = useTranslation();

  const disabled = React.useMemo(() => {
    if (!balance) {
      return true;
    } else {
      if (parseInt(inputAmount, 10) >= Math.trunc(balance)) {
        return true;
      }
    }
    return false;
  }, [inputAmount, balance]);

  return (
    <View style={[theme.padding.l]}>
      <Text style={[theme.margin.btms]} white size="medium">
        {i18n.t('transfer-page.label.balanceTitle')}
      </Text>
      <View
        style={[
          theme.background.mainDark,
          theme.padding.l,
          theme.borderRadius.l,
        ]}>
        <TextInput
          onValueChange={value => {
            const regex = /^[0-9\b]+$/;
            if (value === '' || (regex.test(value) && value[0] !== '0')) {
              onInputChange(value);
            }
          }}
          value={inputAmount}
          hasMax
          placeholder={`${i18n.t(
            'transfer-page.label.withdrawable',
          )}: ${toPriceStr(balance, {
            thousands: true,
            fixed: 2,
            spacing: false,
            currency: globalStore.currency,
          })}`}
          rightElement={
            <NativeTouchableOpacity
              onPress={() => onInputChange(`${Math.trunc(balance)}`)}
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
        />
        <View
          style={[theme.flex.row, theme.flex.centerByCol, theme.margin.btms]}>
          <Text color={theme.fontColor.white} size="medium">
            {i18n.t('withdraw-page.label.received')}
          </Text>
          <Text blod white size="medium" style={[theme.margin.leftxxs]}>
            {toPriceStr(receiveAmount, {
              thousands: true,
              spacing: false,
              fixed: 2,
              currency: globalStore.currency,
            })}
          </Text>
        </View>
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
                    fixed: 2,
                    showCurrency: false,
                    thousands: true,
                  })}
                </Text>
              </View>
              {/* </BoxShadow> */}
            </NativeTouchableOpacity>
          ))}
        </View>
        <Text color={theme.fontColor.primaryMain}>
          {i18n.t('transfer-page.tip.tip')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  line: {
    height: 1,
    marginBottom: 8,
    ...theme.background.grey,
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
    borderColor: 'white',
    borderWidth: 1,
    elevation: 2,
    width: (width - 48 - 13 * 3) / 4,
    height: 40,
  },
  disabled: {
    opacity: 0.3,
  },
});

export default TransferAmount;
