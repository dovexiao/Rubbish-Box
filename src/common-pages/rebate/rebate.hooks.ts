import {useScreenSize} from '@/common-pages/hooks/size.hooks';
import {useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {scaleSize} from '@utils';
import theme from '@/style';

function useSize() {
  const {screenWidth, screenHeight, designWidth} = useScreenSize();

  const size = useMemo(() => {
    return {
      screenWidth,
      screenHeight,
      designWidth,
    };
  }, [screenWidth, screenHeight, designWidth]);
  return size;
}

export function useInnerStyle() {
  const size = useSize();
  const filterStyle = StyleSheet.create({
    wrap: {
      height: scaleSize(28),
      borderRadius: scaleSize(21),
    },
  });
  const rebateStyle = StyleSheet.create({
    container: {
      height: size.screenHeight,
    },
    button: {
      width: 104,
      height: 36,
    },
    itemLinear: {
      borderRadius: theme.borderRadiusSize.l,
      height: 28,
    },
    buttonDisabled: {backgroundColor: '#CED2D6'},
  });

  const bonusToastStyle = StyleSheet.create({
    toast: {
      width: (296 * size.screenWidth) / size.designWidth,
    },
    rule: {
      width: (351 * size.screenWidth) / size.designWidth,
    },
  });
  return {
    size,
    filterStyle,
    rebateStyle,
    bonusToastStyle,
  };
}
