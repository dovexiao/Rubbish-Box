import {useResponsiveDimensions} from '@/utils';
import {useCallback} from 'react';

export function useScreenSize() {
  const {width: screenWidth, height: screenHeight} = useResponsiveDimensions();
  const designWidth = 375;
  // 根据实际宽度与设计宽度比例变换值
  // Change the value according to the actual width and design width ratio
  const calcActualSize = useCallback(
    (size: number) => {
      return (size * screenWidth) / designWidth;
    },
    [screenWidth],
  );
  return {
    screenWidth,
    screenHeight,
    designWidth,
    calcActualSize,
  };
}
