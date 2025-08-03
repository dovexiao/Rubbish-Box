import {BasicObject} from '@types';

/** 金刚区通知 */
export interface NoticeMap {
  FREE_LOTTERY?: number;
  REBATE?: number;
  LUCKY_SPIN?: number;
}

/** Casino接口入参 */
export interface CasinoListParams {
  pageNo: number;
  gameType: string;
}

/** Casino列表返回数据类型 */
export interface CasinoListResponse {
  content: CasinoGameItem[];
  totalSize: number;
  totalPages: number;
}

/** Casino游戏类型 */
export interface CasinoGameItem {
  gameId: number;
  gameName: string;
  gamePic: string;
  provider: string;
  tripartiteUniqueness: string;
}

/** Casino类型列表数据类型 */
export interface CasinoTypeItem {
  icon: string;
  name: string;
  openIcon: string;
}

/** 首页banner */
export type BannerListItem = {
  bannerId: number;
  bannerImg: string;
  bannerVideo: string;
  skipLinks: string;
} & BasicObject;

/** 3D Official Lottery类型 */
export interface DigitOffListItem {
  closeTimeMillis: number;
  currentTimestamp: number;
  digitsBackImg: string;
  digitsLogo: string;
  digitsName: string;
  drawTimestamp: number;
  id: number;
  sort: number;
  status: number;
  winAmount: number;
}

/** 小游戏类型 */
export interface HotGameItem {
  bigImg: string;
  // createBy: number;
  createTime: number | string | Date;
  gameName: string;
  id: number;
  // lastUpdateBy: number;
  lastUpdateTime: number | string | Date;
  middleImg: string;
  // packageId: number;
  skipLinks: string;
  smallImg: string;
  // sort: number;
  // status: number;
}

/** kerala类型 */
export interface KeralaListItem {
  backImg: string;
  drawDate: number;
  drawTime: string;
  headTwo: string;
  instName: 'KERALA';
  issueNo: 'BR-93';
  lotteryMoney: number;
  lotteryPrice: string;
  lotteryType: string;
  sellMoney: number;
}

/** digit类型 */
export interface DigitListItem {
  createTime?: number;
  drawTime: number;
  pickBackImg: string;
  pickLogo: string;
  pickName: string;
  sellAmount: number;
  sort: number;
  status: number;
  updateTime: number;
  winAmount: number;
  id: number;
}

/** quickdigit类型 */
export interface QuickDigitListItem {
  createTime?: number;
  drawTime: number;
  pickBackImg: string;
  pickLogo: string;
  pickName: string;
  sellAmount: number;
  sort: number;
  status: number;
  updateTime: number;
  winAmount: number;
  id: number;
}

/** dice类型 */
export interface DiceListItem {
  cycle: number;
  iconUrl: string;
  iconUrlWeb: string;
  id: number;
}

/** color类型 */
export interface ColorListItem {
  cycle: number;
  iconUrl: string;
  iconUrlWeb: string;
  id: number;
}

/** Matka类型 */
export interface MatkaListItem {
  backImg: string;
  closeDraw: string;
  closeResultNum: string;
  openResultNum: string;
  fullStatus: number;
  halfStatus: number;
  id: number;
  isClose: number;
  lotteryName: string;
  minPrice: number;
  openDraw: string;
  wonAmount: number;
}

/** Car类型 */
export interface CarListItem {
  currentTimestamp: number;
  gameType: string;
  picPlaceholder: number;
  packageId: number;
  playersNumber: number;
  gameUrl: string;
  sort: number;
  source: string;
  gamePic: string;
  gamePrice: number;
  provider: string;
  name: string; // '5 Minutes'
  id: number;
  categoryId: 15;
  clcyle?: number;
  remain?: number;
}

/** LiveCasino类型 */
export interface LiveGameListParams {
  gameName?: string;
  sort?: number;
}

export interface LiveHotGameItem {
  callBackLink: string;
  defaultTable: number;
  gameCode: string;
  gameImg: string;
  gameLink: string;
  gameName: string;
  gameType: number;
  gameTypeName: string;
  onlineNumber: number;
  roomRemark: string;
  subscriptStatus: number;
  superTag: number;
}

export type NoticeCheckListItem = {
  image: string;
  noticeCount: number;
  noticeKey: string;
  title: string;
  url: string;
};

export type NoticeCheckList = NoticeCheckListItem[];

export interface RankingItem {
  prizeAmount: string;
  userPhone: number;
}

export type RankingList = RankingItem[];

export interface PagerParams {
  pageNo?: number;
  pageSize?: number;
}

export interface SpinOrderItem {
  betAmount: string;
  prizeAmount: string;
}

export type SpinOrderList = SpinOrderItem[];

export interface OrderCreateParams {
  isDemo: number;
  count: number;
  betAmount: number;
}

export interface PrizeInfo {
  prizeIndex: number;
  prizeAmount: string;
}

export interface FreeLotteryInfo {
  contentStr: string;
  imgUrl: string;
  maxNum: number;
  num: number;
  shareUrl: string;
}

export interface HomeGameParams {
  position: number;
}

export interface HomeGameFloorItem {
  // 楼层icon图片
  categoryPic: string;
  gamesList: HomeGameCardItem[];
  // 楼层标题
  name: string;
  // 楼层唯一key
  uniqueKey: string;
  id: number;
}

export interface HomeGameCardItem {
  // 游戏图片
  gamePic: string;
  // 游戏价格
  gamePrice: string;
  // 具体游戏类型 Lottery类型分dice和color，其他楼层类型一样
  gameType: string;
  // 游戏url，对于dice和color和scratch，需要自行配置url进行匹配，
  gameUrl: string;
  // 游戏名称
  name: string;
  // 游戏厂商
  provider: string;
  // 厂商独立游戏编号，比如SA厂商使用的defaultTable
  tripartiteUniqueness: string;
  // 游戏id，Slotegrator厂商使用这个拿到链接
  id: number;
  // 游戏厂商 判断跳转的使用这个
  source: string;
  grandPrize: number;
  maxBetting: number;
  maxBonus: number;
  playersNumber: number;
  picPlaceholder?: number;
}

export interface LiveGameListParams {
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

export interface LiveGameListItem {
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
  playersNumber: number;
}

export interface LiveGamePageInfo {
  totalPages: number;
  totalSize: number;
  content: LiveGameListItem[];
}

export interface CarPageInfo {
  totalPages: number;
  totalSize: number;
  content: CarListItem[];
}

export interface PageTagItem {
  name: string;
  imageUrl: string;
  id: number;
  parentTagId: number;
  level: number;
  subTagList: PageTagItem[];
}

export interface PageGameListItem {
  gameName: string;
  gamePic: string;
  gameUrl: string;
  id: number;
  packageId: number;
}

export interface PageGameSectionListItem {
  gameList: LiveGameListItem[];
  oneCategoryId: number;
  packageId: number;
  tagId: number;
  tagImageUrl: string;
  tagName: string;
}
