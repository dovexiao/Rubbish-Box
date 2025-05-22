/* eslint-disable prettier/prettier */
import theme from '@/style';
import {toPriceStr} from '@/utils';
import {View, Image} from 'react-native';
import Text from '@basicComponents/text';
import React, {useMemo} from 'react';
import {Input} from '@rneui/themed';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {useInnerStyle} from './recharge.hooks';
import {BalanceListItem} from './recharge.service';
// import BoxShadow from '@/components/basic/shadow';
import {useTranslation} from 'react-i18next';
import globalStore from '@/services/global.state';
import useCouponStore from '@/store/useCouponStore';

export interface RechargeSelectProps {
  min: number;
  max: number;
  balance: string;
  onChangeBalance: (balance: string) => void;
  balanceList?: BalanceListItem[];
  bounsComponent?: any;
  couponList?: any;
}

const RechargeSelect: React.FC<RechargeSelectProps> = ({
  balance,
  onChangeBalance,
  balanceList,
  min,
  max,
  bounsComponent,
  couponList,
}) => {
  const {i18n} = useTranslation();
  const {inputStyle, inputStyles, selectStyles} = useInnerStyle();
  const selectedCoupon = useCouponStore(state => state.selectedCoupon);
  React.useEffect(() => {
    if (couponList.length > 0) {
      couponList.sort(
        (
          a: {couponAmount: number; rechargeAmount: number},
          b: {couponAmount: number; rechargeAmount: number},
        ) =>
          b.rechargeAmount - a.rechargeAmount &&
          b.couponAmount - a.couponAmount,
      );
      let items = couponList?.filter(
        (item: {rechargeAmount: number}) =>
          Number(balance) >= item.rechargeAmount,
      );
      let item = items[0];
      if (item && item?.status === 2 && balance >= item.couponAmount) {
        useCouponStore.setState({selectedCoupon: item});
      } else {
        useCouponStore.setState({selectedCoupon: {}});
      }
    }
  }, [balance, couponList]);
  const memoBalanceAmount = useMemo(() => {
    const filterList = balanceList?.filter(
      item => Number(balance) === item?.balance,
    );
    const findV: any =
      filterList && filterList.length
        ? filterList[filterList.length - 1]
        : undefined;
    let couponAmount: number = 0;
    if (selectedCoupon && Object.keys(selectedCoupon)?.length !== 0) {
      if (parseFloat(balance) >= (selectedCoupon?.rechargeAmount || 0)) {
        couponAmount = selectedCoupon?.couponAmount || 0;
      } else {
        couponAmount = 0;
      }
    }
    return findV
      ? {
          paidAmount: balance,
          receivedAmount:
            // findV?.balance +
            Number(balance) +
            (findV?.balance * findV?.giveBalance) / 100 +
            couponAmount * 1,
          platformBonus: (findV?.balance * findV?.giveBalance) / 100,
          discountedBonuses: couponAmount,
        }
      : {
          paidAmount: balance,
          receivedAmount: Number(balance) + couponAmount,
          platformBonus: 0,
          discountedBonuses: couponAmount,
        };
  }, [balanceList, balance, selectedCoupon]);

  return (
    <View
      style={[
        theme.flex.col,
        theme.borderRadius.m,
        theme.padding.l,
        theme.background.mainDark,
        {marginTop: 12},
      ]}>
      <View style={[theme.flex.col, theme.margin.btms]}>
        <View
          style={[
            theme.flex.col,
            selectStyles.inputWrap,
            theme.borderRadius.xs,
            theme.margin.btms,
            theme.border.main,
          ]}>
          <Input
            containerStyle={[theme.padding.lrm, inputStyles.container]}
            inputContainerStyle={inputStyles.inputContainer}
            style={inputStyle}
            errorStyle={inputStyles.error}
            keyboardType="numeric"
            inputMode="numeric"
            value={balance}
            onChangeText={value => {
              if (value && !value.startsWith('0')) {
                if (/^[0-9]+$/.test(value)) {
                  if (max > 0) {
                    if (Number(value) <= max) {
                      onChangeBalance(value);
                    }
                  } else {
                    if (Number(value) <= 50000) {
                      onChangeBalance(value);
                    }
                  }
                } else {
                  onChangeBalance(balance || '');
                }
              } else {
                onChangeBalance('');
              }
            }}
            placeholder={i18n.t('recharge-page.label.enter')}
          />
        </View>
        <View style={[theme.flex.row]}>
          <Text white fontSize={theme.fontSize.m}>
            {i18n.t('recharge-page.label.min')}
          </Text>
          <Text
            style={[theme.margin.leftxxs]}
            white
            blod
            fontSize={theme.fontSize.m}>
            {min ? toPriceStr(min, {fixed: 0, thousands: true}) : '--'}
          </Text>
          <Text
            style={[theme.margin.leftxxl]}
            white
            fontSize={theme.fontSize.m}>
            {i18n.t('recharge-page.label.max')}
          </Text>
          <Text
            style={[theme.margin.leftxxs]}
            white
            blod
            fontSize={theme.fontSize.m}>
            {max ? toPriceStr(max, {fixed: 0, thousands: true}) : '--'}
          </Text>
        </View>
      </View>
      <View
        style={[
          theme.padding.tops,
          theme.flex.row,
          theme.flex.wrap,
          theme.gap.m,
        ]}>
        {balanceList?.map((bl, index) => (
          <NativeTouchableOpacity
            key={index}
            style={[selectStyles.item, theme.flex.col, {minHeight: 80}]}
            onPress={() => onChangeBalance(bl.balance + '')}>
            {bl.balance + '' !== balance ? (
              <View
                style={[
                  theme.flex.center,
                  theme.background.primary15,
                  theme.border.primary50,
                  theme.borderRadius.s,
                  selectStyles.item,
                  theme.gap.xs,
                  // eslint-disable-next-line react-native/no-inline-styles
                  {minHeight: 80},
                ]}>
                <Text white blod fontSize={20}>
                  {toPriceStr(bl.balance, {
                    fixed: 0,
                    showCurrency: true,
                    thousands: true,
                  })}
                </Text>
                <Text
                  color={theme.fontColor.green}
                  style={[{overflow: 'hidden', flexWrap: 'nowrap'}]}
                  fontSize={11}>
                  {i18n.t('other.bonus')} {bl.giveBalance}%{' '}
                  {globalStore.currency}
                  {(bl.balance * bl.giveBalance) / 100}
                </Text>
              </View>
            ) : (
              <View
                style={[
                  selectStyles.item,
                  theme.position.rel,
                  theme.flex.center,
                  theme.background.primary30,
                  theme.border.primary,
                  theme.borderRadius.s,
                  theme.gap.xs,
                  {minHeight: 80},
                ]}>
                <Text color={theme.basicColor.white} blod fontSize={20}>
                  {toPriceStr(bl.balance, {
                    fixed: 0,
                    showCurrency: true,
                    thousands: true,
                  })}
                </Text>
                <Text
                  color={theme.fontColor.green}
                  style={[{overflow: 'hidden', flexWrap: 'nowrap'}]}
                  fontSize={11}>
                  {i18n.t('other.bonus')}: {bl.giveBalance} %{' '}
                  {globalStore.currency}
                  {(bl.balance * bl.giveBalance) / 100}
                </Text>
                <Image
                  style={[
                    theme.position.abs,
                    theme.icon.s,
                    // eslint-disable-next-line react-native/no-inline-styles
                    {bottom: 0, right: 0},
                  ]}
                  source={require('@/assets/icons/btn-checked.webp')}
                />
              </View>
            )}
          </NativeTouchableOpacity>
        ))}
      </View>
      <View
        style={[
          // eslint-disable-next-line react-native/no-inline-styles
          {
            backgroundColor: theme.basicColor.primary15,
            marginTop: 12,
            paddingTop: 8,
            paddingBottom: 12,
            borderRadius: 6,
            paddingLeft: 10,
            paddingRight: 10,
          },
        ]}>
        {bounsComponent}
        <View
          style={[theme.flex.row, theme.flex.centerByCol, theme.margin.tops]}>
          <Text white fontSize={theme.fontSize.m}>
            {i18n.t('other.needToPayAmount')}:{' '}
          </Text>
          <Text
            style={[theme.margin.leftxxs]}
            color={theme.fontColor.green}
            blod
            fontSize={theme.fontSize.m}>
            {toPriceStr(Number(memoBalanceAmount?.paidAmount), {
              fixed: 0,
              thousands: true,
            })}
          </Text>
          {/* <Text style={[theme.margin.leftxxl]} white fontSize={theme.fontSize.m}>
          You get amount
        </Text>
        <Text
          style={[theme.margin.leftxxs]}
          color={theme.fontColor.green}
          blod
          fontSize={theme.fontSize.m}>
          {toPriceStr(Number(memoBalanceAmount?.receivedAmount), {
            fixed: 0,
            thousands: true,
          })}
        </Text> */}
        </View>
        <View
          style={[theme.flex.row, theme.flex.centerByCol, theme.margin.tops]}>
          <Text white fontSize={theme.fontSize.m}>
            {i18n.t('other.platformBonus')}:{' '}
          </Text>
          <Text
            style={[theme.margin.leftxxs]}
            color={'#F7336B'}
            blod
            fontSize={theme.fontSize.m}>
            {toPriceStr(Number(memoBalanceAmount?.platformBonus), {
              fixed: 0,
              thousands: true,
            })}
          </Text>
        </View>
        <View
          style={[theme.flex.row, theme.flex.centerByCol, theme.margin.tops]}>
          <Text
            fontSize={theme.fontSize.m}
            style={{
              color: '#fff',
              // memoBalanceAmount.discountedBonuses &&
              // Number(memoBalanceAmount?.discountedBonuses) > 0
              //   ? '#F7336B'
              //   : '#fff',
            }}>
            {i18n.t('other.couponBonus')}:{' '}
          </Text>
          <Text
            style={[theme.margin.leftxxs]}
            color={'#F7336B'}
            blod
            fontSize={theme.fontSize.m}>
            {toPriceStr(Number(memoBalanceAmount?.discountedBonuses), {
              fixed: 0,
              thousands: true,
            })}
          </Text>
        </View>
        <View
          style={[theme.flex.row, theme.flex.centerByCol, theme.margin.tops]}>
          <Text white fontSize={theme.fontSize.m}>
            {i18n.t('other.youGetAmount')}:{' '}
          </Text>
          <Text
            style={[theme.margin.leftxxs]}
            color={theme.fontColor.green}
            blod
            fontSize={theme.fontSize.m}>
            {toPriceStr(Number(memoBalanceAmount?.receivedAmount), {
              fixed: 0,
              thousands: true,
            })}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default RechargeSelect;
