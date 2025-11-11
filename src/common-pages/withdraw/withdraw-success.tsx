import theme from '@/style';
import {View, StyleSheet, Modal} from 'react-native';
import Text from '@/components/basic/text';
import React from 'react';
import globalStore from '@/services/global.state';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {useTranslation} from 'react-i18next';
import {toPriceStr} from '@/utils';
import LinearGradient from '@/components/basic/linear-gradient';
import LazyImage from '@/components/basic/image';
import {useScreenSize} from '@/common-pages/hooks/size.hooks';
import useWithdrawStore from './withdraw.store';

const coinGoldShine = require('@/assets/imgs/withdraw/coin-gold-shine.webp');

export interface WithdrawSuccessType {
  visible?: boolean;
  onFinish?: () => void;
}

const WithdrawSuccess = (props: WithdrawSuccessType) => {
  const {visible = false, onFinish = () => {}} = props;
  const {i18n} = useTranslation();
  const {calcActualSize} = useScreenSize();
  const {receive} = useWithdrawStore();
  
  // 确保 amount 是数字类型，如果是字符串则转换为数字
  const amount = typeof receive === 'string' 
    ? (receive ? parseFloat(receive) : 0) 
    : (receive || 0);
  
  // 使用calcActualSize计算所有尺寸
  const containerWidth = calcActualSize(270);
  const containerHeight = calcActualSize(306);
  const titleMarginTop = calcActualSize(73);
  const titlePaddingHorizontal = calcActualSize(23);
  const titleAmountGap = calcActualSize(20);
  const amountLabelGap = calcActualSize(3);
  const tipMarginTop = calcActualSize(24);
  const tipPaddingHorizontal = calcActualSize(26);
  const buttonWidth = calcActualSize(234);
  const buttonHeight = calcActualSize(40);
  const coinWidth = calcActualSize(136);
  const coinHeight = calcActualSize(92);
  const coinTop = calcActualSize(-31);

  // 字体大小
  const titleFontSize = calcActualSize(22);
  const titleLineHeight = calcActualSize(25);
  const amountFontSize = calcActualSize(34);
  const amountLineHeight = calcActualSize(38);
  const labelFontSize = calcActualSize(14);
  const labelLineHeight = calcActualSize(18);

  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: theme.basicColor.newBgPop,
      borderRadius: 16,
      width: containerWidth,
      // height: containerHeight,
      alignItems: 'center',
      position: 'relative',
      flexDirection: 'column',
    },
    coinIcon: {
      position: 'absolute',
      top: coinTop,
      width: coinWidth,
      height: coinHeight,
      alignSelf: 'center',
    },
    title: {
      marginTop: titleMarginTop,
      marginBottom: titleAmountGap,
      paddingHorizontal: titlePaddingHorizontal,
      fontSize: titleFontSize,
      lineHeight: titleLineHeight,
      width: '100%',
      fontWeight: 'bold',
    },
    amount: {
      marginBottom: amountLabelGap,
      fontSize: amountFontSize,
      lineHeight: amountLineHeight,
      fontWeight: 'bold',
      paddingHorizontal: calcActualSize(8),
    },
    amountLabel: {
      marginBottom: tipMarginTop,
      fontSize: labelFontSize,
      lineHeight: labelLineHeight,
    },
    tip: {
      paddingHorizontal: tipPaddingHorizontal,
      fontSize: labelFontSize,
      lineHeight: labelLineHeight,
      width: '100%',
    },
    buttonWrapper: {
      paddingTop: calcActualSize(15),
      paddingBottom: calcActualSize(25),
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
    },
    buttonContainer: {
      width: buttonWidth,
      height: buttonHeight,
    },
    button: {
      height: buttonHeight,
      borderRadius: calcActualSize(20),
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
    },
  });

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onFinish}
      animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={dynamicStyles.container}>
          {/* 金币图标 */}
          <LazyImage
            occupancy={'transparent'}
            imageUrl={coinGoldShine}
            width={coinWidth}
            height={coinHeight}
            style={dynamicStyles.coinIcon}
          />
          
          <Text
            style={dynamicStyles.title}
            textAlign="center"
            fontFamily="fontInter"
            color={theme.basicColor.newFontWhite}>
            {i18n.t('withdraw-page.label.success')}
          </Text>
          
          <Text
            style={dynamicStyles.amount}
            textAlign="center"
            fontFamily="fontInter"
            color="#F0E139">
            {toPriceStr(amount, {
              thousands: true,
              spacing: true,
              fixed: 2,
              currency: globalStore.currency,
            })}
          </Text>
          
          <Text
            style={dynamicStyles.amountLabel}
            textAlign="center"
            color={theme.basicColor.lightWhite}>
            {i18n.t('withdraw-page.label.withdrawAmountLower')}
          </Text>
          
          <Text
            style={dynamicStyles.tip}
            textAlign="center"
            color={theme.basicColor.lightWhite}>
            {i18n.t('withdraw-page.tip.withdrawSubmitted')}
          </Text>
          
          <View style={dynamicStyles.buttonWrapper}>
            <NativeTouchableOpacity onPress={onFinish} style={dynamicStyles.buttonContainer}>
              <LinearGradient
                colors={['#ECF345', '#FCA811']}
                start={{x: 0, y: 0}}
                end={{x: 0, y: 1}}
                style={dynamicStyles.button}>
                <Text
                  style={{fontWeight: 'bold'}}
                  fontFamily="fontInter"
                  color={theme.basicColor.newFontWhite}
                  fontSize={calcActualSize(16)}>
                  {i18n.t('label.finish')}
                </Text>
              </LinearGradient>
            </NativeTouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
});

export default WithdrawSuccess;
