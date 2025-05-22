import {
  ActivityTaskListItem,
  ShopAmountDataResponse,
  ShopCategoryListItem,
  ShopGoodsListItem,
  ShopHomeGoodsListItem,
  TaskEnum,
  WelfareHomeDataResponse,
  postActivityTaskList,
  postGetShopAmountData,
  postGoodsCategoryList,
  postGoodsHomeData,
  postGoodsList,
  postWelfareHomeData,
} from '@/common-pages/welfare/welfare.service';

import {create} from 'zustand';

type WelfareStoreState = {
  welfareHomeData: WelfareHomeDataResponse;
  activityTaskList: ActivityTaskListItem[];

  shopAmountData: ShopAmountDataResponse;
  shopCategoryTabsList: ShopCategoryListItem[];
  shopCategoryIndex: number;

  shopHomeGoodsList: ShopHomeGoodsListItem[];
  shopGoodsList: ShopGoodsListItem[];

  // 使用 actions 命名空间来存放所有的 action
  actions: {
    getWelfareHomeData: () => void;
    getActivityTaskList: (type: TaskEnum) => void;

    getShopAmountData: () => void;
    getShopCategoryTabList: () => void;
    getShopHomeGoodsList: () => void;
    getShopGoodsList: () => void;
  };
};

const useWelfareStore = create<WelfareStoreState>()((set, get) => ({
  welfareHomeData: {
    wealCheckinInfo: {
      checkinList: [],
      issueNo: '',
      jackpotAmount: 0,
    },
    wealCoinInfo: {
      coinCount: 0,
      coinNote: '',
      gemCount: 0,
    },
    wealNewUserInfo: {
      issueNo: '',
      newUserInfoList: [],
    },
  },
  activityTaskList: [],

  shopAmountData: {gemCount: 0, coinCount: 0, tip: '', coinNote: ''},
  shopCategoryTabsList: [],
  shopCategoryIndex: 0,

  shopHomeGoodsList: [],
  shopGoodsList: [],
  actions: {
    getWelfareHomeData: async () => {
      const welfareHomeData = await postWelfareHomeData();
      set({
        welfareHomeData,
      });
    },
    getActivityTaskList: async (type: TaskEnum) => {
      const list = await postActivityTaskList(type);
      set({
        activityTaskList: list,
      });
    },

    getShopAmountData: async () => {
      const data = await postGetShopAmountData();
      set({
        shopAmountData: data,
      });
    },
    getShopCategoryTabList: async () => {
      const list = await postGoodsCategoryList();
      set({
        shopCategoryTabsList: list,
        shopCategoryIndex: [...list].shift()?.id || 0,
      });
    },
    getShopHomeGoodsList: async () => {
      const list = await postGoodsHomeData();
      set({
        shopHomeGoodsList: list,
      });
    },
    getShopGoodsList: async () => {
      const list = await postGoodsList(get().shopCategoryIndex);
      set({
        shopGoodsList: list,
      });
    },
  },
}));

export default useWelfareStore;

export const useWelfareStoreActions = () =>
  useWelfareStore(state => state.actions);
