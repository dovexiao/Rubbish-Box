import {create} from 'zustand';
import {postSpinConfig} from '@/common-pages/luckyspin/luckyspin.service';

type SpinConfig = {
  freeCount: number;
  spinBatchCount: number;
  spinBasePrice: number;
};

type LuckySpinStoreState = {
  luckySpinConfig: SpinConfig;
  // 使用 actions 命名空间来存放所有的 action
  actions: {
    setSpinConfig: (isToken: boolean) => void;
  };
};

const useLuckySpinStore = create<LuckySpinStoreState>(set => ({
  luckySpinConfig: {
    freeCount: 0,
    spinBatchCount: 30,
    spinBasePrice: 10,
  },
  actions: {
    setSpinConfig: async token => {
      const data = await postSpinConfig(token);
      set({
        luckySpinConfig: {
          spinBasePrice: data?.singleAmount,
          spinBatchCount: data?.batchCount,
          freeCount: data || 0,
        },
      });
    },
  },
}));

export const useLuckySpinConfig = () =>
  useLuckySpinStore(state => state.luckySpinConfig);
export const useLuckySpinActions = () =>
  useLuckySpinStore(state => state.actions);
