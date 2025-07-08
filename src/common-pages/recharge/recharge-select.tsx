/* eslint-disable prettier/prettier */
import React from 'react';
import {View, Image, Dimensions} from 'react-native';
import {Input} from '@rneui/themed';
import {useTranslation} from 'react-i18next';
import theme from '@/style';
import {toPriceStr} from '@/utils';
import Text from '@basicComponents/text';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {useInnerStyle} from './recharge.hooks';
import globalStore from '@/services/global.state';
import {BalanceListItem} from './recharge.service';

export interface RechargeSelectProps {
  min: number;
  max: number;
  balance: string;
  onChangeBalance: (balance: string) => void;
  balanceList?: BalanceListItem[];
  bounsComponent?: any;
}

const screenWidth = Dimensions.get('window').width;
const isSmallScreen = screenWidth < 350;

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
        theme.borderRadius.m,
        theme.padding.l,
        theme.background.transparentMedium1,
        {marginTop: 12},
      ]}>
      {/* 输入框区域 */}
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
            onChangeText={handleInputChange}
            placeholder={i18n.t('recharge-page.label.enter')}
          />
        </View>

        {/* 最小最大金额显示 */}
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

      {/* 快捷金额选择区域 */}
      <View
        style={[
          theme.padding.topm,
          theme.flex.row,
          theme.flex.wrap,
          theme.gap.m,
        ]}>
        {balanceList.map((bl, index) => {
          const isSelected = bl.balance + '' === balance;
          const bonusValue = (bl.balance * bl.giveBalance) / 100;

          return (
            <NativeTouchableOpacity
              key={index}
              style={[selectStyles.item, theme.flex.col, {minHeight: 80}]}
              onPress={() => onChangeBalance(bl.balance + '')}>
              <View
                style={[
                  theme.flex.center,
                  isSelected ? theme.border.primary : theme.border.primary50,
                  theme.borderRadius.s,
                  selectStyles.item,
                  theme.gap.xs,
                  theme.position.rel,
                  {minHeight: 80},
                ]}>
                <Text
                  color={
                    isSelected ? theme.basicColor.white : theme.fontColor.white
                  }
                  blod
                  fontSize={20}>
                  {toPriceStr(bl.balance, {
                    fixed: 0,
                    showCurrency: true,
                    thousands: true,
                  })}
                </Text>

                {/* 优惠信息，避免换行 */}
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  color={
                    isSelected ? theme.fontColor.primary : theme.fontColor.white
                  }
                  style={{
                    maxWidth: '100%',
                    flexShrink: 1,
                    fontSize: isSmallScreen ? 10 : 11,
                  }}>
                  {`${i18n.t('other.bonus')} ${bl.giveBalance}% ${
                    globalStore.currency
                  }${bonusValue}`}
                </Text>

                {/* 选中图标 */}
                {isSelected && (
                  <Image
                    style={[
                      theme.position.abs,
                      theme.icon.s,
                      {bottom: 0, right: 0},
                    ]}
                    source={require('@/assets/icons/btn-checked.webp')}
                  />
                )}
              </View>
            </NativeTouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default RechargeSelect;
