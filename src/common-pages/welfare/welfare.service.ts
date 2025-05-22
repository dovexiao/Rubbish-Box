import {http} from '@utils';

export interface WelfareCheckingItem {
  buttonText: string;
  date: number;
  day: string;
  issueNo: string;
  prizeList: [
    {
      count: number;
      icon: string;
      name: number;
    },
  ];
  status: number; //（0未领取、1待领取、2已领取、3已过期）
  statusIcon: string;
  week: string;
}

export interface WelfareHomeDataResponse {
  wealCheckinInfo: {
    checkinList: WelfareCheckingItem[];
    issueNo: string;
    jackpotAmount: number;
  };
  wealCoinInfo: {
    coinCount: number;
    coinNote: string;
    gemCount: number;
  };
  wealNewUserInfo: {
    issueNo: string;
    newUserInfoList: WelfareCheckingItem[];
  };
}

export function postWelfareHomeData() {
  return http.post<{}, any>('app/weal/getWealHomeData', {});
}

export function postNewUserGetAward(issueNo: string, date: number) {
  return http.post<{}, any>('app/weal/newUserGetAward', {
    issueNo,
    date,
  });
}

export enum TaskEnum {
  NoviceTask = 0, //新手任务
  DailyTask = 1, //日常任务
  CheckInTask = 2, //签到任务
}

export interface ActivityTaskListItem {
  alreadyCompleteCount: number;
  buttonText: string;
  coinCount: number;
  gemCount: number;
  giftBoxCount: number;
  id: number;
  imageUrl: string;
  name: string;
  needCompleteCount: number;
  note: string;
  patchCheckinCardCount: number;
  skipLinks: string;
  status: number;
  type: number;
}

export function postActivityTaskList(type: TaskEnum) {
  return http.post<{type: TaskEnum}, ActivityTaskListItem[]>(
    'app/weal/getActivityTaskList',
    {
      type: type,
    },
  );
}

export interface ShopCategoryListItem {
  id: number;
  imageUrl: string;
  name: string;
  tip: string;
  goodsShowType: number;
}

export function postGoodsCategoryList() {
  return http.post<any, ShopCategoryListItem[]>(
    'app/shop/getGoodsCategoryList',
    {},
  );
}

export interface ShopGoodsListItem {
  buttonText: string;
  coinCount: number;
  goodsCategoryId: number;
  goodsImage: string;
  goodsName: string;
  goodsNote: string;
  goodsType: number;
  goodsTypeCount: number;
  id: number;
}

export function postGoodsList(category: number) {
  return http.post<any, ShopGoodsListItem[]>('app/shop/getGoodsList', {
    goodsCategoryId: category,
  });
}

export interface ShopHomeGoodsListItem {
  goodsList: ShopGoodsListItem[];
  id: number;
  goodsShowType: number;
  imageUrl: string;
  name: string;
}

export function postGoodsHomeData() {
  return http.post<any, ShopHomeGoodsListItem[]>(
    'app/shop/getShopHomeData',
    {},
  );
}

export function postExChangeGoods(goodsId: number, count: number = 1) {
  return http.post<any, any>('app/shop/exchangeGoods', {
    goodsId: goodsId,
    count: count,
  });
}

export interface ShopAmountDataResponse {
  coinCount: number;
  coinNote: string;
  gemCount: number;
  tip: string;
}

export function postGetShopAmountData() {
  return http.post<any, ShopAmountDataResponse>('app/shop/getShopData', {});
}
