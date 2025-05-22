import {PageParams, PageResponse} from '@/types';
import {http} from '@/utils';

interface MyGameListParams extends PageParams {
  type: number;
}

export interface MyGameListItem {}

export const postUserGameList = (params: MyGameListParams) => {
  return http.post<MyGameListParams, PageResponse<MyGameListItem>>(
    'app/user/getUserGameList',
    params,
  );
};
