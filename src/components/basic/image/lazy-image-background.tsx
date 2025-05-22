import React, {ReactNode} from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import LazyImage, {LazyImageProps} from './lazy-image';
import {ImageUrlType} from './index.type';
import theme from '@/style';
export interface LazyImageBackgroundProps
  extends Omit<LazyImageProps, 'imageUrl'> {
  style?: StyleProp<ViewStyle>;
  imageUrl?: ImageUrlType;
  children?: ReactNode;
}
const LazyImageBackground: React.FC<LazyImageBackgroundProps> = props => {
  const {
    children = null,
    width,
    height,
    imageUrl,
    radius = 0,
    style,
    occupancy,
    ...imageProps
  } = props;

  const transparent = '#0000';
  return (
    <View
      style={[
        styles.view,
        style,
        {
          width,
          height,
          backgroundColor: imageUrl
            ? transparent
            : occupancy || theme.backgroundColor.mainDark,
        },
      ]}>
      {imageUrl && (
        <View style={[styles.image]}>
          <LazyImage
            imageUrl={imageUrl}
            radius={radius}
            width={width}
            height={height}
            {...imageProps}
          />
        </View>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  view: {
    position: 'relative',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: -1,
  },
});

export default LazyImageBackground;
