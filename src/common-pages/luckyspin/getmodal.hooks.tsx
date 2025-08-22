import {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import Text from '@basicComponents/text';
import {LazyImageBackground} from '@basicComponents/image';
import {useModal} from '@basicComponents/modal';
import theme from '@style';
import WebTouchableOpacity, {
  NativeTouchableOpacity,
} from '@basicComponents/touchable-opacity';
import globalStore from '@/services/global.state';
import React from 'react';
import LuckyspinWinAnimationWeb from './luckyspin-win-animation-web';
import LuckyspinBoxAnimationWeb from './luckyspin-box-animation-web';
import LuckyspinWinAnimation from './luckyspin-win-animation';
import LuckyspinBoxAnimation from './luckyspin-box-animation';
const TouchableOpacity = globalStore.isWeb
  ? WebTouchableOpacity
  : NativeTouchableOpacity;
const buttonGreenIcon = require('@assets/imgs/luckyspin/button-green.png');

export function useGetModal(refresh?: () => void) {
  const [amount, setAmount] = useState<number>(0);
  const styles = StyleSheet.create({
    amount: {
      color: '#fff75e',
    },
  });

  const {renderModal, show, hide} = useModal(
    <View style={[theme.flex.col, theme.flex.centerByCol, theme.position.rel]}>
      <View
        style={[
          theme.position.abs,
          {
            height: theme.imageSize.m * 3,
            width: theme.imageSize.m * 3,
            bottom: theme.paddingSize.l * 4,
          },
        ]}>
        {globalStore.isWeb ? (
          <View style={[theme.position.rel]}>
            <View style={[theme.position.abs]}>
              <LuckyspinWinAnimationWeb />
            </View>
            <View style={[theme.position.abs]}>
              <LuckyspinBoxAnimationWeb />
            </View>
          </View>
        ) : (
          <View style={[theme.position.abs]}>
            <View style={[theme.position.rel]}>
              <View style={[theme.position.abs]}>
                <LuckyspinWinAnimation />
              </View>
              <View style={[theme.position.abs]}>
                <LuckyspinBoxAnimation />
              </View>
            </View>
          </View>
        )}
      </View>
      <Text
        fontFamily="fontInter"
        fontSize={36}
        style={[styles.amount, theme.font.bold]}>
        {/* TODO 这里的amount后面如果不加一个空格的话,如果amount为个位数,在Android显示不出来,应该是宽度的问题,暂时这样解决 */}
        {'+' + amount + ' '}
      </Text>
      <TouchableOpacity onPress={() => handleHide()}>
        <LazyImageBackground
          occupancy={'transparent'}
          imageUrl={buttonGreenIcon}
          width={125}
          height={46}
          style={[theme.flex.col, theme.flex.center]}>
          <Text
            fontSize={theme.fontSize.l}
            style={[theme.font.bold, theme.font.white]}>
            Get
          </Text>
        </LazyImageBackground>
      </TouchableOpacity>
    </View>,
    {
      backDropClose: true,
      overlayStyle: {
        backgroundColor: 'transparent',
        shadowColor: 'transparent',
      },
    },
  );

  const handleHide = () => {
    refresh && refresh();
    hide();
  };

  const handleShow = (_amount: number) => {
    setAmount(() => _amount);
    show();
  };

  return {
    renderModal,
    show: handleShow,
  };
}
