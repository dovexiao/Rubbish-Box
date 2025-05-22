import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import LazyImage from './lazy-image';
import LazyImageBackground from './lazy-image-background';
const ImageDemo: React.FC = () => {
  return (
    <View style={styles.view}>
      <LazyImage
        width={169}
        height={168}
        resizeMode="contain"
        imageUrl={'https://scratch-1.oss-ap-south-1.aliyuncs.com/ice.png'}
      />
      <LazyImageBackground
        width={169}
        height={168}
        resizeMode="contain"
        imageUrl={'https://scratch-1.oss-ap-south-1.aliyuncs.com/ice.png'}>
        <Text>这是前景文字</Text>
      </LazyImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  view: {
    flexDirection: 'row',
  },
});

export default ImageDemo;
