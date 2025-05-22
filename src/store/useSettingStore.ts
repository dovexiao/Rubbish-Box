import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Dimensions, useWindowDimensions} from 'react-native';
import {useShallow} from 'zustand/react/shallow';
import {useCallback, useMemo} from 'react';

// persist 存储数据时不能用actions将所有方法包裹起来，需要zustand官方查看，目前没有处理方法
type SettingStoreState = {
  screenWidth: number;
  screenHeight: number;
  setState: (state: {[key: string]: any}) => void;
};

const useSettingStore = create<SettingStoreState>()(
  persist(
    set => ({
      screenWidth:
        Dimensions.get('window').width > 500
          ? 500
          : Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,
      setState: state => {
        set({...state});
      },
    }),
    {
      name: 'settingStorage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export default useSettingStore;

export const useSettingWindowDimensions = () => {
  const {setDimensions} = useSettingStore(
    useShallow(state => ({
      setDimensions: state.setState,
    })),
  );
  const {width: windowWidth, height: screenHeight} = useWindowDimensions();

  const designWidth: number = 375;
  const maxScreenWidth: number = 500;

  const screenWidth = useMemo(() => {
    return windowWidth > maxScreenWidth ? maxScreenWidth : windowWidth;
  }, [windowWidth]);

  const updateWindowDimensions = useCallback(() => {
    requestAnimationFrame(() => {
      const {width, height: widowHeight2} = Dimensions.get('window');
      setDimensions({
        screenWidth: width > maxScreenWidth ? maxScreenWidth : width,
        screenHeight: widowHeight2,
      });
    });
  }, [setDimensions]);

  const calculateItemWidth = useCallback(
    (originalImageWidth: number) => {
      const scaleFactor = screenWidth / designWidth;
      // 根据比例计算图片最终宽度
      const finalImageWidth = originalImageWidth * scaleFactor;
      // 防止图片宽度超过设计稿中的最大宽度
      return Math.min(
        finalImageWidth,
        originalImageWidth * (maxScreenWidth / designWidth),
      );
    },
    [screenWidth],
  );

  return {
    screenWidth,
    screenHeight,
    designWidth,
    updateWindowDimensions,
    calculateItemWidth,
  };
};
