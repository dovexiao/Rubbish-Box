import {http} from '@/utils';
import {BasicObject, PageParams, PageResponse} from '@types';

export interface PromotionListItem {
  buttonName: string;
  buttonLink: string;
  //活动内容
  activityContent?: string;
  activityStartTime?: number;
  activityEndTime?: number;
  activityIcon?: string;
  // 标题
  activityTitle: string;
  activitySubTitle: string;
  titlePosition: number;
  buttonText: string;
  // 跳转url，后台设定
  activityUrl: string;
  activityType?: 'signin' | 'other';
  id: number;
  tagList: BasicObject[];
}

export function getPromotionList(pageNo: number, tagId: number) {
  return http.post<PageParams, PageResponse<PromotionListItem>>(
    'app/sysActivity/getList',
    {
      pageNo,
      tagId,
    },
  );
}

export interface ActivityTagListItem {
  name: string;
  icon: string;
  id: number;
}

export function getActivityTagList() {
  return http.post<any, ActivityTagListItem[]>(
    'app/sysActivity/getActivityTagList',
  );
}

export function getPromotionDetail(id: number) {
  return http.post<{}, PromotionListItem>(
    `app/sysActivity/getSysActivity/${id}`,
  );
}
