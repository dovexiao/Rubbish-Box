import React, {useState} from 'react';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {useTranslation} from 'react-i18next';
import {Image, Modal, StyleSheet, View} from 'react-native';
import LazyImage from '@/components/basic/image';
import theme from '@/style';

import Text from '@basicComponents/text';
import {goBack, scaleSize, toPriceStr} from '@/utils';
import {useScreenSize} from '@/common-pages/hooks/size.hooks';
import CountDownTimer from '@/components/business/count-down-timer';

export interface ExitIntentModalProps {
  visible?: boolean;
  amount?: number;
  onClose?: () => void;
}

const ExitIntentModal = ({
  visible = false,
  amount = 0,
  onClose,
}: ExitIntentModalProps) => {
  const {i18n} = useTranslation();
  const {screenWidth, screenHeight} = useScreenSize();
  const [imgRatio, setImgRatio] = useState(948 / 712);
  const [skipToday, setSkipToday] = useState(false);

  const popImageWidth = screenWidth * 0.85;

  const closeImage = async () => {
    onClose?.();
    goBack();
  };

  const onImage = () => {
    onClose?.();
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
            imageUrl={require('@assets/imgs/withdraw/exit-intent-background.webp')}
          />
          <View
            style={{
              position: 'absolute',
              left: 0,
              bottom: scaleSize(110),
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              width: popImageWidth,
              columnGap: scaleSize(8),
            }}>
            <CountDownTimer initialTime={60} />
            {/* <Text
              white
              fontSize={scaleSize(36)}
              textAlign="center"
              color="#000000"
              style={{fontWeight: 'bold'}}>
              0 Bonus!
            </Text> */}
          </View>
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

export default ExitIntentModal;
