import {http} from '@/utils';

export interface CollectGoodsItem {
  buttonText: string;
  categoryId: number;
  collectImage: string;
  goodsName: string;
  goodsNote: string;
  collectStatus: number;
  id: number;
  notCollectImage: string;
}

export interface CollectCategoryItem {
  categoryDesc: string;
  categoryName: string;
  collectGoodsList: CollectGoodsItem[];
  iconUrl: string;
  id: number;
  imageUrl: string;
  rewardDesc: string;
}

export interface CollectResponseData {
  categoryList: CollectCategoryItem[];
  desc: string;
  title: '收藏';
  rewardDesc: string;
  imageUrl: string;
  howWorkArticleId: number;
}

export function postCollectHomeData() {
  return http.post<any, any>('app/collect/getCollectHomeData', {});
}

export function postReceiveAward(id: number) {
  return http.post<any, any>('app/collect/receiveAward', {
    collectGoodsId: id,
  });
}
