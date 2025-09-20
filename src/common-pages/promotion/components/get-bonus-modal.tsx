import React from 'react';
import {Modal, StyleSheet, View} from 'react-native';
import Text from '@basicComponents/text';
import theme from '@style';
import {useScreenSize} from '@/common-pages/hooks/size.hooks';
// import {goToWithLogin} from '@utils';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {useTranslation} from 'react-i18next';
import LazyImage from '@/components/basic/image';
import globalStore from '@services/global.state';
const topUrl = require('@assets/imgs/promotion/modal-amt.webp');
const midUrl = require('@assets/imgs/promotion/modal-btn.webp');
const midBtnPlus = require('@assets/imgs/promotion/modal-plus.webp');
import LinearGradient from '@/components/basic/linear-gradient';

interface HomePopTwoProps {
  isImageVisible: boolean;
  setIsImageVisible: React.Dispatch<React.SetStateAction<boolean>>;
  amount: number;
}

const GetBonusModal: React.FC<HomePopTwoProps> = ({
  isImageVisible,
  setIsImageVisible,
  amount = 0,
}) => {
  const {i18n} = useTranslation();
  const {screenWidth} = useScreenSize();
  // Modal关闭
  const closeImage = () => {
    setIsImageVisible(false);
  };
  const onPressGetBonus = () => {
    globalStore.updateAmount.next();
    closeImage();
  };
  return (
    <Modal
      transparent={true}
      visible={isImageVisible}
      onRequestClose={closeImage}
      animationType="fade">
      <View style={styles.modalOverlay}>
        <NativeTouchableOpacity activeOpacity={1}>
          <LazyImage
            imageUrl={topUrl}
            width={screenWidth * 0.98}
            height={screenWidth * 0.98}
          />
          <View
            style={[
              {
                position: 'absolute',
                width: 100,
                height: 32,
                bottom: (screenWidth / 375) * 88,
                left: '50%',
                transform: [{translateX: -50}],
              },
            ]}>
            <LazyImage imageUrl={midUrl} width={100} height={32} />
            <LazyImage
              imageUrl={midBtnPlus}
              width={12}
              height={12}
              style={[{position: 'absolute', left: 10, top: 10}]}
            />
            <View
              style={[
                {
                  position: 'absolute',
                  left: 30,
                  top: 0,
                  bottom: 0,
                  justifyContent: 'center',
                  alignItems: 'center',
                },
              ]}>
              <Text
                style={[
                  {
                    color: theme.fontColor.white,
                    fontWeight: 'bold',
                    fontSize: 20,
                  },
                ]}>
                {amount}Rs
              </Text>
            </View>
          </View>
        </NativeTouchableOpacity>

        {/* 获取奖励按钮 */}
        <NativeTouchableOpacity
          onPress={() => onPressGetBonus()}
          style={{
            alignItems: 'center',
            width: '70%',
          }}>
          <LinearGradient
            colors={['#FE8A1A', '#FEBC0A']}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            style={{
              position: 'relative',
              top: -50,
              alignItems: 'center',
              marginBottom: 8,
              width: '100%',
              borderRadius: 25,
              paddingVertical: 12,
              paddingHorizontal: 60,
              shadowColor: '#FF6347',
              shadowOffset: {width: 0, height: 4},
              shadowOpacity: 0.4,
              shadowRadius: 6,
              elevation: 6,
            }}>
            <Text
              style={{
                color: theme.fontColor.white60,
                fontWeight: 'bold',
                fontSize: 16,
              }}>
              {i18n.t('rebate.get-bonus-modal')}
            </Text>
          </LinearGradient>
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  closeButton: {
    backgroundColor: 'none',
  },
});

export default GetBonusModal;
