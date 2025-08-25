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
  locations?: number[];
  style?: StyleProp<ViewStyle>;
  imageUrl?: ImageUrlType;
  children?: ReactNode;
  subtractBottomTabHeight?: boolean; //是否减去底部tab的高度
  fullHeight?: boolean; //是否全屏高度
}
const LazyImageLGBackground: React.FC<LazyImageLGBackgroundProps> = props => {
  const {showBottomBG = false, children = null, style, ...imageProps} = props;
  const {width: screenWidth, height: screenHeight} = useResponsiveDimensions();

  return (
    <LinearGradient
      start={{x: 0, y: 0}}
      end={{x: 0, y: 1}}
      locations={[0, 0.4, 0.4, 1]}
      colors={
        imageProps?.locations?.length === 2 //传入locations={[0, 1]}成立
          ? theme.basicColor.newBgOne //一级页面
          : [theme.basicColor.newBgInOne, theme.basicColor.newBgTwo] //二级页面
      }
      // style={[
      //   styles.view,
      //   style,
      //   {
      //     width: screenWidth,
      //     height: (screenHeight / 375) * 375,
      //   },
      // ]}
      style={[styles.view, style, {width: screenWidth, height: screenHeight}]}
      {...imageProps}>
      {/* <Image
        source={require('@assets/icons/header-backimg.webp')}
        style={[theme.fill.fillW, theme.position.abs, {height: 92}]}
      /> */}
      {/* 传入showBottomBG生效 */}
      {showBottomBG ? (
        <Image
          source={require('@assets/icons/login_bottom_back_image.webp')}
          style={[
            theme.fill.fillW,
            theme.position.abs,
            {bottom: 0, height: '50%'},
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
