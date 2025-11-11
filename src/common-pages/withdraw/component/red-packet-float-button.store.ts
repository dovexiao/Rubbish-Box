import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RedPacketFloatButtonStoreState = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  // 保存按钮的垂直位置（相对于 parentHeight 的百分比，0-1之间）
  positionRatio: number | null;
  // 设置位置
  setPositionRatio: (ratio: number | null) => void;
  // 重置位置visibleVisiblenull
  resetPosition: () => void;
  // 红包结束时间戳
  endTimestamp: number | null;
  // 设置红包结束时间戳
  setEndTimestamp: (timestamp: number | null) => void;
};

const useRedPacketFloatButtonStore = create<RedPacketFloatButtonStoreState>()(
  persist(
    set => ({
      visible: false,
      setVisible: (visible: boolean) => {
        set({visible});
      },
      positionRatio: null, // null 表示使用默认位置
      setPositionRatio: (ratio: number | null) => {
        console.log('当前位置比例: ', ratio);
        set({positionRatio: ratio});
      },
      resetPosition: () => {
        set({positionRatio: null});
      },
      endTimestamp: null,
      setEndTimestamp: (timestamp: number | null) => {
        set({endTimestamp: timestamp});
      },
    }),
    {
      name: 'redPacketFloatButtonStorage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export const useSetRedPacketVisible = useRedPacketFloatButtonStore.getState().setVisible;
export const useSetRedPacketEndTimestamp = useRedPacketFloatButtonStore.getState().setEndTimestamp;

export default useRedPacketFloatButtonStore;

