import {useWindowDimensions} from 'react-native';

/** 动态更新宽高,基于useWindowDimensions封装,限制了宽度最大为500 */
export const useResponsiveDimensions = () => {
  const {width, height} = useWindowDimensions();

  const maxWidth = 500;

  const responsiveWidth = width > maxWidth ? maxWidth : width;

  return {
    width: responsiveWidth,
    height,
  };
};
