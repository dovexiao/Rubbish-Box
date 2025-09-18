import React from 'react';
import {Image, Modal, StyleSheet, View} from 'react-native'; //Text
import theme from '@style';
import {useScreenSize} from '@/common-pages/hooks/size.hooks';
import {goToWithLogin} from '@utils';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {useTranslation} from 'react-i18next';

interface HomePopTwoProps {
  isImageVisible: boolean;
  setIsImageVisible: React.Dispatch<React.SetStateAction<boolean>>;
  dynamicUrl?: string;
}

const HomePopTwo: React.FC<HomePopTwoProps> = ({
  isImageVisible,
  setIsImageVisible,
  dynamicUrl,
}) => {
  const {i18n} = useTranslation();
  const {screenWidth} = useScreenSize();
  // Modal关闭
  const closeImage = () => {
    setIsImageVisible(false);
  };
  // 点击图片
  const onImage = () => {
    closeImage();
    goToWithLogin(i18n.t('home.tab.deposit'));
  };
  console.log(111111, dynamicUrl);
  return (
    <Modal
      transparent={true}
      visible={isImageVisible}
      onRequestClose={closeImage}
      animationType="fade">
      <View style={styles.modalOverlay}>
        <NativeTouchableOpacity
          onPress={onImage}
          style={[{marginBottom: screenWidth * 0.13}]}>
          <Image
            style={[
              {
                width: screenWidth * 0.85,
                height: screenWidth * 0.98,
              },
            ]}
            source={{
              uri: dynamicUrl,
            }}
          />
          {/* <LazyImage
            imageUrl={{uri: dynamicUrl}}
            width={screenWidth * 0.85}
            height={screenWidth * 0.98}
          /> */}
        </NativeTouchableOpacity>
        <NativeTouchableOpacity
          onPress={closeImage}
          style={[styles.closeButton, {marginBottom: screenWidth * 0.08}]}>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  closeButton: {
    backgroundColor: 'none',
  },
});

export default HomePopTwo;
