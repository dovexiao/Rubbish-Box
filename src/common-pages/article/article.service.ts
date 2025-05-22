import {http} from '@/utils';

export interface ArticleListItem {
  //活动内容
  articleContent?: string;
  articleSubhead?: number;
  articleTitle?: number;
  articleImg?: string;
}

export function getArticleDetailService(id: number) {
  return http.get<{}, ArticleListItem>(`/app/article/${id}`);
}
