import {
  CouponItem,
  getCouponListService,
} from '@/common-pages/coupon/coupon.service';
import {create} from 'zustand';

type CouponStoreState = {
  couponList: CouponItem[];
  selectedCoupon: Partial<CouponItem>;
  // 使用 actions 命名空间来存放所有的 action
  actions: {
    getCouponList: (status: number) => void;
  };
};

const useCouponStore = create<CouponStoreState>(set => ({
  couponList: [],
  selectedCoupon: {},
  actions: {
    getCouponList: async (status: number) => {
      const res = await getCouponListService(status);
      set({couponList: res?.content});
    },
  },
}));

export default useCouponStore;

export const useCouponActions = () => useCouponStore(state => state.actions);
