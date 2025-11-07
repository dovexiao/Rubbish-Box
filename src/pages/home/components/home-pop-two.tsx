import React, {useEffect, useState} from 'react';
import {Image, Modal, StyleSheet, View} from 'react-native';
import theme from '@style';
import {useScreenSize} from '@/common-pages/hooks/size.hooks';
import {goToWithLogin} from '@utils';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {useTranslation} from 'react-i18next';
import LazyImage from '@basicComponents/image/lazy-image';

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
  const {screenWidth, screenHeight} = useScreenSize();
  const [imgRatio, setImgRatio] = useState(948 / 712);
  const [isLoaded, setIsLoaded] = useState(false);
  const [canClick, setCanClick] = useState(false);

  const popImageWidth = screenWidth * 0.85;

  // 每次打开 Modal 时执行
  useEffect(() => {
    if (isImageVisible && dynamicUrl) {
      setIsLoaded(false);
      setCanClick(false);

      // 延迟允许点击，避免首次渲染误触
      const timer = setTimeout(() => setCanClick(true), 300);

      Image.getSize(
        dynamicUrl,
        (width, height) => {
          if (width && height) setImgRatio(height / width);
          setIsLoaded(true);
        },
        () => setIsLoaded(true),
      );

      return () => clearTimeout(timer);
    } else {
      // 每次关闭时重置状态
      setIsLoaded(false);
      setCanClick(false);
    }
  }, [isImageVisible, dynamicUrl]);

  const closeImage = () => {
    setIsImageVisible(false);
  };

  const onImage = () => {
    if (!canClick || !isLoaded) return;
    closeImage();
    goToWithLogin('Deposit');
  };

  return (
    <Modal
      transparent
      visible={isImageVisible}
      onRequestClose={closeImage}
      animationType="fade">
      <View style={[styles.modalOverlay]}>
        {isLoaded && (
          <NativeTouchableOpacity activeOpacity={0.9} onPress={onImage}>
            {/*<Image*/}
            {/*  source={{uri: dynamicUrl}}*/}
            {/*  resizeMode="contain"*/}
            {/*  style={{*/}
            {/*    width: screenWidth,*/}
            {/*    height: screenWidth * imgRatio,*/}
            {/*    // height: Math.min(*/}
            {/*    //   screenWidth * 0.95 * imgRatio,*/}
            {/*    //   screenHeight * 0.9,*/}
            {/*    // ),*/}
            {/*  }}*/}
            {/*/>*/}
            <LazyImage
              width={popImageWidth}
              height={popImageWidth * imgRatio + 50}
              imageUrl={dynamicUrl || ''}
            />
          </NativeTouchableOpacity>
        )}

        <NativeTouchableOpacity
          onPress={closeImage}
          style={[styles.closeButton, {marginTop: 25}]}>
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
    backgroundColor: 'transparent',
  },
});

export default HomePopTwo;
