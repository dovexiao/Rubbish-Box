import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BannerListItem,
  DiceListItem,
  ColorListItem,
  DigitListItem,
  QuickDigitListItem,
  KeralaListItem,
  MatkaListItem,
  PageTagItem,
  PageGameSectionListItem,
} from '@/pages/home/home.type';
import {
  getBannerList,
  getDiceList,
  getColorList,
  getDigitList,
  // getWorldDigitList,
  getStateLotteryList,
  getQuickDigitList,
  getKeralaList,
  getMatkaList,
  getGameTagList,
  getHomeCategoryDataService,
  getCategoryGameListService,
  HomeGameListItem,
} from '@/pages/home/home.service';
import {formatSettledData} from '@/utils';

// persist 存储数据时不能用actions将所有方法包裹起来，需要zustand官方查看，目前没有处理方法
type HomeStoreState = {
  setState: (state: {[key: string]: any}) => void;

  isShowCategoryTab: boolean;
  oneCategoryPageIndex: number;
  setOneCategoryPageIndex: (index: number) => void;

  homeBannerList: BannerListItem[];
  getHomeBannerList: () => void;

  lotteryPageData: {
    diceList: DiceListItem[];
    colorList: ColorListItem[];
    digitList: DigitListItem[];
    // worldDigitList: DigitListItem[];
    stateList: DigitListItem[];
    quickDigitList: QuickDigitListItem[];
    matkaList: MatkaListItem[];
    keralaList: KeralaListItem[];
  };
  getLotteryPageData: () => void;

  // Casino Live等页面的顶部标签
  pageTagList: PageTagItem[];
  pageTagIndex: number;
  pageSubTagId: number;
  getHomeTagList: () => void;

  categoryHomeList: PageGameSectionListItem[];
  getCategoryHomeList: () => void;

  isRefresh: boolean;
  hasMoreData: boolean;
  categoryGameList: HomeGameListItem[];
  getCategoryGameList: (params: {[key: string]: any}) => void;
};

const useHomeStore = create<HomeStoreState>()(
  persist(
    (set, get) => ({
      setState: (state: {[key: string]: any}) => {
        set({...state});
      },

      isShowCategoryTab: true,
      oneCategoryPageIndex: 4,
      setOneCategoryPageIndex: index => {
        set({oneCategoryPageIndex: index});
      },

      homeBannerList: [],
      getHomeBannerList: async () => {
        const res = await getBannerList(2);
        set({homeBannerList: res});
      },

      lotteryPageData: {
        diceList: [],
        colorList: [],
        digitList: [],
        worldDigitList: [],
        stateList: [],
        quickDigitList: [],
        matkaList: [],
        keralaList: [],
      },
      getLotteryPageData: async () => {
        const [
          dice,
          color,
          digit,
          // worldDigit,
          stateList,
          quickDigit,
          matka,
          kerala,
        ] = await Promise.allSettled([
          getDiceList(),
          getColorList(),
          getDigitList(),
          // getWorldDigitList(),
          getStateLotteryList(),
          getQuickDigitList(),
          getMatkaList(),
          getKeralaList(),
        ]);
        set({
          lotteryPageData: {
            diceList: formatSettledData(dice),
            colorList: formatSettledData(color),
            digitList: formatSettledData(digit),
            // worldDigitList: formatSettledData(worldDigit),
            stateList: formatSettledData(stateList),
            quickDigitList: formatSettledData(quickDigit) || [],
            matkaList: formatSettledData(matka),
            keralaList: formatSettledData(kerala),
          },
        });
      },

      pageTagList: [],
      pageTagIndex: -1,
      pageSubTagId: 0,
      getHomeTagList: async () => {
        const res = await getGameTagList(get().oneCategoryPageIndex);
        set({pageTagList: res});
      },

      categoryHomeList: [],
      getCategoryHomeList: async () => {
        const res = await getHomeCategoryDataService(
          get().oneCategoryPageIndex,
        );
        set({categoryHomeList: res});
      },

      isRefresh: false,
      hasMoreData: true,
      categoryPageNo: 1,
      categoryGameList: [],
      getCategoryGameList: async (params: {[key: string]: any}) => {
        const res = await getCategoryGameListService({
          oneCategoryId: get().oneCategoryPageIndex,
          tagId: get().pageTagIndex,
          subTagId: get().pageSubTagId,
          pageNo: params?.page,
          pageSize: 30,
        });
        const newListData =
          params?.page === 1
            ? res?.content
            : [...get().categoryGameList, ...res?.content];
        set({
          categoryGameList: newListData,
          hasMoreData: newListData.length === res?.totalSize ? false : true,
          isRefresh: false,
        });
      },
    }),
    {
      name: 'homeInfoStorage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export default useHomeStore;
