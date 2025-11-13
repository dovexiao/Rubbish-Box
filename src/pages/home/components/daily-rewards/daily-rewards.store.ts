import {create} from 'zustand';

type DailyRewardsStoreState = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  show: () => void;
  hide: () => void;
};

const useDailyRewardsStore = create<DailyRewardsStoreState>()(set => ({
  visible: false,
  setVisible: (visible: boolean) => set({visible}),
  show: () => set({visible: true}),
  hide: () => set({visible: false}),
}));

export const useShowDailyRewards = useDailyRewardsStore.getState().show;
export const useHideDailyRewards = useDailyRewardsStore.getState().hide;
export default useDailyRewardsStore;

