import {errorLog} from '@utils'; // convertImgToObscureUrl,convertImgToWidthUrl,
import React, {useState, useEffect, memo, useMemo} from 'react';
import {
  DimensionValue,
  ImageResizeMode,
  View,
  Image,
  ImageURISource,
  StyleSheet,
  ImageRequireSource,
  ViewProps,
} from 'react-native';

import {ImageUrlType} from './index.type';
// import theme from '@style';

export interface LazyImageProps extends ViewProps {
  // 图片宽度
  width?: DimensionValue;
  // 图片高度
  height?: DimensionValue;
  // 图片url，如果是一个静态图片就直接用source
  imageUrl: ImageUrlType;
  // 圆角
  radius?: number;
  resizeMode?: ImageResizeMode;
  // 占位背景色
  occupancy?: string;
  tintColor?: string;
}

function isNetImage(imageUrl: ImageUrlType): imageUrl is string {
  return typeof imageUrl === 'string' && imageUrl.startsWith('http');
}

const LazyImage: React.FC<LazyImageProps> = props => {
  const {
    imageUrl,
    width,
    height,
    radius,
    resizeMode = 'stretch',
    // occupancy,
    tintColor,
    ...otherProps
  } = props;
  // const [showBlur, setShowBlur] = useState<boolean>(true);
  // const [loading, setLoading] = useState(true);
  const transparent = '#0000';
  // const blurredImageUrl: string | null = isNetImage(imageUrl)
  //   ? convertImgToObscureUrl(imageUrl)
  //   : null;

  const [actualImageSize, setActualImageSize] = useState<{
    w: number;
    h: number;
  }>();

  const resultImageSize = useMemo<{
    w: DimensionValue;
    h: DimensionValue;
  }>(() => {
    if (!actualImageSize) {
      return {w: width || 'auto', h: height || 'auto'};
    }
    if (width == null && height != null) {
      if (typeof height === 'number') {
        return {w: (height / actualImageSize.h) * actualImageSize.w, h: height};
      }
      return {w: 'auto', h: height};
    }
    if (width != null && height == null) {
      if (typeof width === 'number') {
        return {w: width, h: (width / actualImageSize.w) * actualImageSize.h};
      }
      return {w: width, h: 'auto'};
    }
    return {w: width || 'auto', h: height || 'auto'};
  }, [actualImageSize, width, height]);

  const resultImageUrl = useMemo(() => {
    // if (typeof width === 'number' && isNetImage(imageUrl)) {
    //   return convertImgToWidthUrl(imageUrl, Math.ceil(width * 2));
    // }
    return imageUrl;
  }, [imageUrl]);
  //width, imageUrl

  const source: ImageRequireSource | ImageURISource = isNetImage(resultImageUrl)
    ? {uri: resultImageUrl}
    : resultImageUrl;

  const innerStyle = StyleSheet.create({
    image: {
      width: resultImageSize.w,
      height: resultImageSize.h,
      borderRadius: radius != null ? radius : 0,
    },
    view: {
      width: resultImageSize.w,
      height: resultImageSize.h,
      borderRadius: radius != null ? radius : 0,
    },
  });

  useEffect(() => {
    if (typeof imageUrl === 'string') {
      Image.getSize(
        imageUrl,
        (_width, _height) => {
          setActualImageSize({w: _width, h: _height});
        },
        error => errorLog('getImageError', error),
      );
    }
  }, [imageUrl]);

  const defaultSourceImage = useMemo<ImageRequireSource>(() => {
    if (!isNetImage(imageUrl)) {
      return undefined;
    }
    if (typeof height === 'number' && typeof width === 'number') {
      if (width > height * (2 / 3)) {
        return require('@/assets/imgs/image-loading-long.webp');
      }
    }
    return require('@/assets/imgs/image-loading.webp');
  }, [width, height, imageUrl]);

  return (
    <View
      style={[
        styles.view,
        innerStyle.view,
        {
          backgroundColor: transparent,
        },
        otherProps?.style,
      ]}>
      {/* {blurredImageUrl && showBlur && (
        <Image style={[innerStyle.image]} source={{uri: blurredImageUrl}} />
      )} */}
      <Image
        defaultSource={defaultSourceImage}
        tintColor={tintColor}
        style={[innerStyle.image, styles.realImageFloat]}
        resizeMode={resizeMode}
        source={source}
        onLoad={() => {
          // setShowBlur(false);
          // setLoading(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  view: {
    position: 'relative',
  },
  realImageFloat: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 2,
    backgroundColor: 'transparent',
  },
});

export default memo(LazyImage, (prevProps, nextProps) => {
  return prevProps?.imageUrl === nextProps?.imageUrl;
});
