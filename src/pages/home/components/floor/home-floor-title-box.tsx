import LinearGradient, {
  LinearGradientProps,
} from '@basicComponents/linear-gradient';
import theme from '@/style';
import React, {Component} from 'react';
import {
  ImageBackground,
  ImageURISource,
  View,
  ViewProps,
  ImageSourcePropType,
} from 'react-native';

const lightLinear: LinearGradientProps = {
  start: {x: 0, y: 0},
  end: {x: 0, y: 1},
  colors: ['#fff', 'rgba(255, 255, 255, 0)'],
};

class HomeFloorTitleBox extends Component<
  ViewProps & {
    titleBgImg?: ImageURISource;
    source?: ImageSourcePropType;
    // 是否有渐变，但titleBgImg生效时该配置失效
    linear?: boolean;
  }
> {
  render() {
    const {children, source, titleBgImg, linear, style, ...otherProps} =
      this.props;
    if (titleBgImg) {
      return (
        <ImageBackground
          {...otherProps}
          style={[
            style,
            theme.fill.fillW,
            theme.borderRadius.xl,
            // eslint-disable-next-line react-native/no-inline-styles
            {
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            },
            theme.overflow.hidden,
          ]}
          source={source || require('@assets/imgs/home/floor-bg.webp')}>
          {children}
        </ImageBackground>
      );
    } else if (linear) {
      return (
        <LinearGradient {...lightLinear}>
          <View {...otherProps}>{children}</View>
        </LinearGradient>
      );
    } else {
      return <View {...otherProps}>{children}</View>;
    }
  }
}

export default HomeFloorTitleBox;
