import {SafeAny} from '@/types';
import {http, indusWinHttp} from '@utils';

export interface GameItem {
  callBackLink: string;
  gameCode: string;
  gameImg: string;
  gameName: string;
  jackpotAmount: number;
  maxAmount: number;
  minAmount: number;
  payLink: string;
  status: number;
  subscriptStatus: number;
  /** 描述 */
  remark: number;
  gameLink: string;
  [k: string]: SafeAny;
}

export interface BigWinnerDto {
  avatar: string;
  bonus: number;
  userName: string;
}

export interface BannerInfo {
  imgUrl: string;
  skipLinks: string;
}

export interface CasinoBaseParams {
  packageId: number;
  packageInfo: string | null;
}

export interface CasinoGameParams extends CasinoBaseParams {
  gameName: string;
  gameCode: string;
}

export interface NewGameListParams {
  // 来自首页的分类id
  categoryId: number;
  gameType?: string;
  source?: string;
  provicer?: string;
  orderByField?: string;
  isAsc?: boolean;
  pageNo?: number;
  pageSize?: number;
}

export interface NewGameListItem {
  categoryId: number;
  // 图片地址
  gamePic: string;
  // 游戏价格
  gamePrice: number;
  // 游戏地址
  gameUrl: string;
  // 游戏厂商
  provider: string;
  // 游戏名称
  name: string;
  // 游戏厂商 判断跳转使用
  source: string;
  // 游戏id
  id: number;
  tripartiteUniqueness: string;
}

export interface NewGamePageInfo {
  totalPages: number;
  totalSize: number;
  content: NewGameListItem[];
}

export type GameList = GameItem[];

export function postGameList() {
  return indusWinHttp.post<CasinoBaseParams, GameList>('iGaming/home/gameList');
}

export function postNotifications() {
  return indusWinHttp.post<CasinoBaseParams, string[]>(
    'iGaming/home/scrollNotificationList',
  );
}

export function postBannerInfo() {
  return indusWinHttp.post<CasinoBaseParams, BannerInfo[]>(
    'iGaming/banner/getBannersList',
  );
}

export function postLuckyDay(gameCode: string, gameName: string) {
  return indusWinHttp.post<CasinoGameParams, null>('iGaming/user/luckyDay', {
    gameCode,
    gameName,
  });
}

export function postNewGameList(params: NewGameListParams) {
  return http.post<NewGameListParams, NewGamePageInfo>(
    'app/homeGames/getList',
    params,
  );
}
