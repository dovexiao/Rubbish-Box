import {useSettingWindowDimensions} from '@/store/useSettingStore';
import React from 'react';
import {Image, StyleProp, ImageStyle} from 'react-native';

const BottomImage = (props: {style?: StyleProp<ImageStyle>}) => {
  const {style} = props;
  const {screenWidth} = useSettingWindowDimensions();
  return (
    <Image
      source={require('@assets/imgs/footer-image.webp')}
      // eslint-disable-next-line react-native/no-inline-styles
      style={[{height: 180, width: screenWidth}, style]}
    />
  );
};

export default BottomImage;
