/* eslint-disable prettier/prettier */
import React, {ReactNode} from 'react';
import {StyleProp, StyleSheet, ViewStyle, Image} from 'react-native';
import {LazyImageProps} from './lazy-image';
import {ImageUrlType} from './index.type';
import LinearGradient from '../linear-gradient';
import theme from '@style';
import {useResponsiveDimensions} from '@/utils';

export interface LazyImageLGBackgroundProps
  extends Omit<LazyImageProps, 'imageUrl'> {
  showBottomBG?: boolean;
  subtractBottomTabHeight?: boolean;
  locations?: number[];
  style?: StyleProp<ViewStyle>;
  imageUrl?: ImageUrlType;
  children?: ReactNode;
  fullHeight?: boolean;
}
const LazyImageLGBackground: React.FC<LazyImageLGBackgroundProps> = props => {
  const {
    children = null,
    style,
    showBottomBG = true,
    subtractBottomTabHeight = false,
    fullHeight = false,
    ...imageProps
  } = props;
  const {width: screenWidth, height: screenHeight} = useResponsiveDimensions();

  return (
    <LinearGradient
      start={{x: 0, y: 0}}
      end={{x: 0, y: 1}}
      locations={[0, 1]}
      colors={theme.linearGradientColor.primaryLinearGradient}
      style={[
        styles.view,
        style,
        {
          width: screenWidth,
          height: fullHeight
            ? '100%'
            : subtractBottomTabHeight
            ? screenHeight - 50
            : screenHeight,
        },
      ]}
      {...imageProps}>
      <Image
        source={require('@assets/icons/header-backimg.webp')}
        // eslint-disable-next-line react-native/no-inline-styles
        style={[theme.fill.fillW, theme.position.abs, {height: 188}]}
      />
      {showBottomBG ? (
        <Image
          source={require('@assets/imgs/footer-image.webp')}
          style={[
            theme.fill.fillW,
            theme.position.abs,
            // eslint-disable-next-line react-native/no-inline-styles
            {height: 180, bottom: 0, zIndex: 0},
          ]}
        />
      ) : null}
      {children}
    </LinearGradient>
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

export default LazyImageLGBackground;
