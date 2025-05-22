import theme from '@/style';
import React from 'react';
import {
  ImageStyle,
  ImageURISource,
  StyleProp,
  View,
  ViewProps,
  Image,
} from 'react-native';

export interface ErrorPageProps extends ViewProps {
  img: ImageURISource;
  imgStyle?: StyleProp<ImageStyle>;
}

const imageStyle = {
  height: 160,
  width: 160,
  marginBottom: 20,
};

const ErrorPage = ({
  img,
  imgStyle,
  children,
  style,
  ...otherProps
}: ErrorPageProps) => {
  return (
    <View style={[theme.flex.center, theme.fill.fill, style]} {...otherProps}>
      <View style={[theme.flex.flex1]} />
      <Image resizeMode="cover" style={[imageStyle, imgStyle]} source={img} />
      {children}
      <View style={[theme.flex.flex2]} />
    </View>
  );
};

export default ErrorPage;
