import React, {useEffect, useMemo, useState} from 'react';
import {ImageBackground, View, Image} from 'react-native';
import {position} from '@/components/style';
import {SafeAny} from '@/types';
import {useScreenSize} from '../hooks/size.hooks';
const ImageBackgroundBasic = (props: SafeAny) => {
  const [toponeImg, setToponeImg] = useState({
    width: 0,
    height: 0,
  });
  const {screenWidth, screenHeight} = useScreenSize();
  useEffect(() => {
    Image.getSize(props.Img, (width, height) => {
      setToponeImg({
        width,
        height,
      });
    });
  }, [props.Img]);
  const ImageBackgroundHieght = useMemo(() => {
    if (screenWidth / screenHeight < 0.43) {
      return screenHeight / 4;
    }
    if (screenHeight <= 720 || screenWidth / screenHeight > 0.62) {
      return (toponeImg.height / toponeImg.width) * screenWidth;
    } else {
      return screenHeight / 4;
    }
  }, [screenHeight, screenWidth, toponeImg.height, toponeImg.width]);
  return (
    <View>
      <ImageBackground
        style={[
          {
            width: screenWidth,
            height: ImageBackgroundHieght,
          },
          position.rel,
        ]}
        source={{uri: props.Img}}
        resizeMode="cover"
      />
    </View>
  );
};

export default ImageBackgroundBasic;
