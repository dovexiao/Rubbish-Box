import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Image, Modal, StyleSheet, View} from 'react-native';
import {useScreenSize} from '../hooks/size.hooks';
import LazyImage from '@/components/basic/image';
import theme from '@/style';

import Text from '@basicComponents/text';
import {goBack, scaleSize} from '@/utils';
import {useSkipTodayModal} from './recharge.hooks';

export interface RechargeModalProps {
  visible?: boolean;
  amount?: number;
  onClose?: () => void;
}

const RechargeModal = ({
  visible = false,
  amount = 0,
  onClose,
}: RechargeModalProps) => {
  const {i18n} = useTranslation();
  const {screenWidth, screenHeight} = useScreenSize();
  const [imgRatio, setImgRatio] = useState(948 / 712);
  const [skipToday, setSkipToday] = useState(false);

  const {handleSkipToday} = useSkipTodayModal('recharge');

  const popImageWidth = screenWidth * 0.85;

  const closeImage = async () => {
    if (skipToday) {
      await handleSkipToday();
    }

    onClose?.();
    goBack();
  };

  const onImage = () => {
    onClose?.();
  };

  /**
   * checkbox 切换事件
   */
  const handleCheckboxChange = () => {
    setSkipToday(prev => !prev);
  };

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={closeImage}
      animationType="fade">
      <View style={[styles.modalOverlay]}>
        <NativeTouchableOpacity activeOpacity={0.9} onPress={onImage}>
          <LazyImage
            width={popImageWidth}
            height={popImageWidth * imgRatio + 50}
            imageUrl={require('@assets/imgs/recharge/modal.webp')}
          />
          <View
            style={{
              position: 'absolute',
              left: 0,
              top: scaleSize(172),
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              width: popImageWidth,
              columnGap: scaleSize(8),
            }}>
            <Image
              style={{
                width: scaleSize(36),
                height: scaleSize(36),
                marginTop: scaleSize(8),
              }}
              source={require('@/assets/icons/recharge/coin.webp')}
            />
            <Text
              white
              fontSize={scaleSize(36)}
              textAlign="center"
              color="#ffee32"
              style={{fontWeight: 'bold'}}>
              {amount} Bonus!
            </Text>
          </View>
        </NativeTouchableOpacity>
        <NativeTouchableOpacity
          onPress={handleCheckboxChange}
          style={{
            paddingBottom: scaleSize(20),
            flexDirection: 'row',
            alignItems: 'center',
            columnGap: scaleSize(6),
          }}>
          <Image
            source={
              skipToday
                ? require('@/assets/icons/checked.webp')
                : require('@/assets/icons/unchecked.webp')
            }
            style={{
              width: scaleSize(14),
              height: scaleSize(14),
            }}
          />
          <Text white fontSize={scaleSize(14)}>
            Don't show again today
          </Text>
        </NativeTouchableOpacity>
        <NativeTouchableOpacity
          onPress={closeImage}
          style={[styles.closeButton]}>
          <Image
            style={[theme.icon.xxl]}
            source={require('@assets/icons/home/button-close.png')}
          />
        </NativeTouchableOpacity>
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
  closeButton: {
    backgroundColor: 'transparent',
  },
});

export default RechargeModal;
