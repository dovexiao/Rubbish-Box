import {http, indusWinHttp} from '@utils';
import {
  NoticeCheckList,
  RankingList,
  PagerParams,
  SpinOrderList,
  OrderCreateParams,
  PrizeInfo,
  FreeLotteryInfo,
  BannerListItem,
  HotGameItem,
  KeralaListItem,
  DigitListItem,
  // QuickDigitListItem,
  DiceListItem,
  ColorListItem,
  MatkaListItem,
  LiveHotGameItem,
  LiveGameListParams,
  HomeGameFloorItem,
  HomeGameParams,
  LiveGamePageInfo,
  CarPageInfo,
  PageTagItem,
  CasinoListParams,
  CasinoListResponse,
  CasinoTypeItem,
  DigitOffListItem,
} from './home.type';

/** 获取活动入口 */
export const getNoticeCheck = () => {
  return http.post<null, NoticeCheckList>('app/sys/notice/check');
};
export const getFirstRecharge = () => {
  return http.post<null, any>('app/base/check/first/recharge');
};
export const getFirstRechargeV1 = () => {
  return http.post<null, any>('app/base/check/first/recharge/v1');
};
export const getHomeTabCheck = () => {
  return http.post<null, any>('app/base/check/tab');
};
// 所有消息提醒
export const getAllRemind = () => {
  return http.post<null, number>('app/message/all/remind');
};

export const getCasinoList = (params: CasinoListParams) => {
  return http.post<CasinoListParams, CasinoListResponse>(
    'app/casion/list',
    params,
  );
};

/** sport获取游戏链接 */
export function getSportUrl() {
  return http.post<null, string>('iGaming/js/login/sport/');
}

/** fish,casino,live获取游戏链接 */
export function getCasinoUrl(id: number) {
  return http.post<{id: number}, string>('iGaming/js/login/' + id);
}

/** casino获取游戏类型列表 */
export const getCasinoType = () => {
  return http.post<null, CasinoTypeItem[]>('app/casion/game/type/list');
};

/** 顶部banner */
export const getBannerList = (type = 2) => {
  return http.post<{type: number}, BannerListItem[]>('app/banner/manage/list', {
    type,
  });
};

/** 3D Official Lottery列表 */
export const getDigitOffList = (digitsType: number) => {
  return http.post<{digitsType: number}, DigitOffListItem[]>(
    'app/digits/info/list',
    {digitsType},
  );
};

/** 热门小游戏 */
export const getHotGgmeList = () => {
  return http.post<null, HotGameItem[]>('app/hotGame/list');
};

/** kerala列表 */
export const getKeralaList = () => {
  return http.post<{type: number}, KeralaListItem[]>(
    'app/lottery/type/kerala/list/new',
    // TODO 这里的渠道是临时解决,需要后端调整逻辑
    {type: 1, channel: 'h5'},
  );
};

/** 3Digit列表 */
export const getDigitList = () => {
  return http.post<null, DigitListItem[]>('app/pick/info/list');
};

/** World3Digit列表 */
export const getWorldDigitList = () => {
  return http.post<null, DigitListItem[]>('app/pick/info/world/list');
};

/** StateLottery列表 */
export const getStateLotteryList = () => {
  return http.post<null, DigitListItem[]>('app/pick/info/five/list');
};

/** Quick3Digit列表 */
export const getQuickDigitList = () => {
  // return http.post<null, QuickDigitListItem[]>('app/pick/info/homeList');
};

/** Dice列表 */
export const getDiceList = () => {
  return http.post<null, DiceListItem[]>('app/diceThree/homeList');
};

/** Color列表 */
export const getColorList = () => {
  return http.post<null, ColorListItem[]>('app/redGreen/lottery/homeList');
};

/** Matka列表 */
export const getMatkaList = () => {
  return http.post<null, MatkaListItem[]>('app/matka/lottery/home/listV2');
};

/** Home板块游戏列表，目前暂时不使用 */
export const getHomeGames = () => {
  return http.post<HomeGameParams, HomeGameFloorItem[]>(
    'app/homeGamesCategory/getAllListBySort',
    {
      position: 1,
    },
  );
};

export const postRankingList = () => {
  return http.post<null, RankingList>('app/turntable/order/ranking/list');
};

export const postSpinOrderList = (params: PagerParams) => {
  return http.post<PagerParams, SpinOrderList>(
    'app/turntable/order/list',
    params,
  );
};

export const postSpinOrderCreate = (count: number) => {
  return http.post<OrderCreateParams, PrizeInfo>('app/turntable/order/create', {
    isDemo: 1,
    count,
    betAmount: 10 * count,
  });
};

export const postGetFreeLottery = () => {
  return http.post<null, FreeLotteryInfo>('app/share/getFreeKeralaTickets');
};

export const getLiveHotGameList = () => {
  return indusWinHttp.get<null, LiveHotGameItem[]>('iGaming/liveHotGameList');
};

/**
 * 首页视讯游戏列表
 * @param gameName 游戏名称（筛选）
 * @param sort 可不传 0 desc 1 asc
 */
export function getLiveGameList() {
  return http.post<LiveGameListParams, LiveGamePageInfo>(
    'app/homeGames/getList',
    {
      categoryId: 6, // 目前依然使用固定分类id
    },
  );
}

/**
 * 首页视讯游戏列表
 * @param gameName 游戏名称（筛选）
 * @param sort 可不传 0 desc 1 asc
 */
export function getCarGameList() {
  return http.post<LiveGameListParams, CarPageInfo>('app/homeGames/getList', {
    categoryId: 15, // car
  });
}

/**
 * 首页Tag列表
 */
export function getGameTagList(oneCategoryId: number) {
  return http.post<{}, PageTagItem[]>('app/game/getGameTagList', {
    oneCategoryId: oneCategoryId, // car
  });
}
export function getGameTagListV1() {
  return http.post<{}, PageTagItem[]>('app/game/getGameTagListV1', {
    oneCategoryId: 1, // car
  });
}

export function getHomeCategoryDataService(oneCategoryId: number) {
  return http.post<{}, any>('app/game/getCategoryHomeData', {
    oneCategoryId: oneCategoryId, // car
  });
}

export interface HomeGameListItem {
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

export interface HomeGameListData {
  totalPages: number;
  totalSize: number;
  content: HomeGameListItem[];
}

export function getCategoryGameListService(params: any) {
  return http.post<{}, HomeGameListData>('app/game/getGameList', {
    ...params,
  });
}
