/* eslint-disable prettier/prettier */
import React from 'react';
import {View, ImageBackground, Image, StyleSheet} from 'react-native'; //Dimensions,
import {Input} from '@rneui/themed';
import {useTranslation} from 'react-i18next';
import theme from '@/style';
import {toPriceStr} from '@/utils';
import Text from '@basicComponents/text';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {useInnerStyle} from './recharge.hooks';
import LinearGradient from '@/components/basic/linear-gradient';
// import globalStore from '@/services/global.state';
import {BalanceListItem} from './recharge.service';
import RechargeQipao from '@/common-pages/recharge/recharge-qipao';
import CustomTitle from './custom-title';

export interface RechargeSelectProps {
  min: number;
  max: number;
  balance: string;
  onChangeBalance: (balance: string) => void;
  balanceList?: BalanceListItem[];
  bounsComponent?: any;
}

// const screenWidth = Dimensions.get('window').width;
// const isSmallScreen = screenWidth < 350;

const RechargeSelect: React.FC<RechargeSelectProps> = ({
  balance,
  onChangeBalance,
  balanceList = [],
  min,
  max,
}) => {
  const {i18n} = useTranslation();
  const {inputStyle, inputStyles, selectStyles} = useInnerStyle();

  const handleInputChange = (value: string) => {
    if (!value || value.startsWith('0')) return onChangeBalance('');
    const numericValue = Number(value);
    if (/^\d+$/.test(value)) {
      const limit = max > 0 ? max : 50000;
      if (numericValue <= limit) {
        return onChangeBalance(value);
      }
    }
    return onChangeBalance(balance || '');
  };

  return (
    <View
      style={[
        theme.flex.col,
        theme.margin.topxxxxl,
        theme.borderRadius.s,
        {
          paddingHorizontal: 16,
        },
      ]}>
      <CustomTitle name={i18n.t('recharge-page.depositAmount')} />
      {/* 输入框区域 */}
      <View style={[theme.flex.col]}>
        <View
          style={[
            theme.flex.col,
            selectStyles.inputWrap,
            theme.borderRadius.xs,
            theme.margin.btms,
            theme.border.main,
            {backgroundColor: '#5A0000'},
          ]}>
          <Input
            containerStyle={[theme.padding.lrm, inputStyles.container]}
            inputContainerStyle={inputStyles.inputContainer}
            style={inputStyle}
            errorStyle={inputStyles.error}
            keyboardType="numeric"
            inputMode="numeric"
            value={balance}
            onChangeText={handleInputChange}
            leftIcon={
              <Text
                style={{
                  color: '#FFBD37',
                  fontSize: 18,
                  paddingRight: 10,
                  fontWeight: 'bold',
                }}>
                ₹
              </Text>
            }
            placeholder={i18n.t('recharge-page.label.enter')}
          />
        </View>
      </View>
      {/* 最小最大金额显示 */}
      <View style={[styleSheet.tips]}>
        <Image
          source={require('@/assets/icons/wallet/recharge-tishi.webp')}
          style={styleSheet.tipsImg}
        />
        <Text style={styleSheet.tipsText}>
          {i18n.t('recharge-page.label.min')}
        </Text>
        <Text style={[theme.margin.leftxxs, styleSheet.tipsText]}>
          {min ? toPriceStr(min, {fixed: 0, thousands: true}) : '--'}
        </Text>
        <Text style={[theme.margin.leftxxl, styleSheet.tipsText]}>
          {i18n.t('recharge-page.label.max')}
        </Text>
        <Text style={[theme.margin.leftxxs, styleSheet.tipsText]}>
          {max ? toPriceStr(max, {fixed: 0, thousands: true}) : '--'}
        </Text>
      </View>
      {/* 快捷金额选择区域 */}
      <View
        style={[
          theme.padding.topxl,
          theme.flex.row,
          theme.flex.wrap,
          {columnGap: 16, rowGap: 18},
        ]}>
        {balanceList.map((bl, index) => {
          // const isSelected = bl.balance + '' === balance;
          // const bonusValue = (bl.balance * bl.giveBalance) / 100;
          return (
            <NativeTouchableOpacity
              key={index}
              style={[selectStyles.item, theme.flex.col, {width: '30%'}]}
              onPress={() => onChangeBalance(bl.balance + '')}>
              {bl.balance + '' !== balance ? (
                <LinearGradient
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                  colors={['#5A0000', '#5A0000']}
                  style={[
                    theme.flex.center,
                    theme.borderRadius.l,
                    selectStyles.item,
                    {
                      borderWidth: StyleSheet.hairlineWidth,
                      borderColor: 'transparent',
                    },
                  ]}>
                  {bl.giveBalance !== 0 && (
                    <RechargeQipao
                      height={18}
                      text={
                        i18n.t('recharge-page.extra') +
                        '+' +
                        toPriceStr(bl.giveBalance, {
                          fixed: 0,
                          showCurrency: false,
                          thousands: true,
                        })
                      }
                      fontSize={theme.fontSize.xs}
                      color={theme.basicColor.white}
                      gradientColors={theme.basicColor.newButtonLinear}
                      borderRadius={9}
                      top={-9}
                      left={0}
                    />
                  )}

                  <Text
                    fontSize={17}
                    color={theme.basicColor.newFontWhite}
                    style={[{fontWeight: '900'}]}>
                    ₹{' '}
                    {toPriceStr(bl.balance, {
                      fixed: 0,
                      showCurrency: false,
                      thousands: true,
                    })}
                  </Text>
                </LinearGradient>
              ) : (
                <LinearGradient
                  start={{x: 0.5, y: 1}} // 起点：底部中间
                  end={{x: 0.5, y: 0}} // 终点：顶部中间
                  colors={['#AF5704', '#713702']}
                  style={[
                    theme.flex.center,
                    selectStyles.item,
                    theme.borderRadius.l,
                    {
                      borderWidth: StyleSheet.hairlineWidth,
                      borderColor: '#FFBD37',
                    },
                  ]}>
                  {bl.giveBalance !== 0 && (
                    <RechargeQipao
                      height={18}
                      text={
                        i18n.t('recharge-page.extra') +
                        '+' +
                        toPriceStr(bl.giveBalance, {
                          fixed: 0,
                          showCurrency: false,
                          thousands: true,
                        })
                      }
                      fontSize={theme.fontSize.xs}
                      color={theme.basicColor.white}
                      gradientColors={theme.basicColor.newButtonLinear}
                      borderRadius={9}
                      top={-8}
                      left={0}
                    />
                  )}

                  <Text
                    fontSize={17}
                    color={theme.basicColor.white}
                    style={[{fontWeight: '900'}]}>
                    ₹{' '}
                    {toPriceStr(bl.balance, {
                      fixed: 0,
                      showCurrency: false,
                      thousands: true,
                    })}
                  </Text>
                </LinearGradient>
              )}
            </NativeTouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styleSheet = StyleSheet.create({
  title: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleIcon: {
    width: 4,
    height: 15,
    backgroundColor: theme.basicColor.newButtonYellow,
    borderRadius: 2,
    marginRight: 8,
  },
  titleText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.basicColor.newFontWhite,
    fontFamily: 'Arial, Arial-Bold',
  },
  tips: {
    ...theme.flex.row,
    alignItems: 'center',
    height: 20,
  },
  tipsImg: {
    ...theme.margin.rightxs,
    width: 14,
    height: 14,
  },
  tipsText: {fontSize: 12, color: 'rgba(255, 255, 255, 0.8)'},
});
export default RechargeSelect;
