import {
  postVipConfig,
  postVipInfo,
  IVipConfig,
  IVipItemList,
} from '@/services/global.service';
import {create} from 'zustand';

interface VipInfo {
  level: number;
  diff: number; // 差多少值结束
  nextValue: number; // 该等级结束值
}

type VipStoreState = {
  vipInfo: VipInfo;
  vipConfigList: IVipConfig;
  vipInfoList: IVipItemList;
  // 使用 actions 命名空间来存放所有的 action
  actions: {
    setVipConfig: () => void;
    setVipInfo: () => void;
  };
};

const useVipStore = create<VipStoreState>()(set => ({
  vipInfo: {
    level: 0,
    diff: 200,
    nextValue: 200,
  },
  vipConfigList: [],
  vipInfoList: [],
  actions: {
    setVipConfig: async () => {
      const data = await postVipConfig();
      const currentConf = (data || [])?.find(c => c.level === 1);
      set({
        vipInfo: {
          level: 0,
          diff: currentConf?.recharge || 200,
          nextValue: currentConf?.recharge || 200,
        },
        vipConfigList: data || [],
      });
    },
    setVipInfo: async () => {
      const data = await postVipInfo();
      const findV = (data || [])?.find(v => v.diff > 0);
      set({
        vipInfo: {
          level: (findV?.level as number) || 0,
          diff: findV?.diff as number,
          nextValue: findV?.amount as number,
        },
        vipInfoList: data || [],
      });
    },
  },
}));

export default useVipStore;
export const useVipInfo = () => useVipStore(state => state.vipInfo);
export const useVipActions = () => useVipStore(state => state.actions);
