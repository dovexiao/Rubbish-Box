import React from 'react';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {Image, Modal, StyleSheet, View} from 'react-native';
import {LazyImageBackground} from '@/components/basic/image';
import theme from '@/style';

import {useScreenSize} from '@/common-pages/hooks/size.hooks';
import RedPacketCountdown from './red-packet-countdown';
import {useSetRedPacketVisible} from './red-packet-float-button.store';
import useRedPacketFloatButtonStore from './red-packet-float-button.store';

export interface ExitIntentModalProps {
  visible?: boolean;
  onPress?: () => void;
  onClose?: () => void;
}

const ExitIntentModal = ({
  visible = false,
  onPress,
  onClose,
}: ExitIntentModalProps) => {
  const {calcActualSize} = useScreenSize();
  const {endTimestamp} = useRedPacketFloatButtonStore();

  const closeImage = async () => {
    onClose?.();
  };

  const onImage = () => {
    onPress?.();
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
          <LazyImageBackground
            width={calcActualSize(336)}
            height={calcActualSize(452)}
            imageUrl={require('@assets/imgs/withdraw/exit-intent-background.webp')}
          >
            <View
              style={{
                position: 'absolute',
                left: 0,
                bottom: calcActualSize(112),
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
              }}>
              <RedPacketCountdown
                endTimestamp={endTimestamp ?? Date.now()} 
                onFinish={() => {
                  onClose?.();
                  useSetRedPacketVisible(false);
                }}
              />
            </View>
          </LazyImageBackground>
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
