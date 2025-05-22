import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  MessageTypeDataResponse,
  UnReadCountResponse,
  getMessageTypeService,
  getUnReadCountService,
  NotificationItem,
} from '@/common-pages/notification/notification.service';
// import {getNoticeCheck} from '@/pages/home/home.service';
import {BasicObject} from '@/types';
// import {getFeedBackUnReadCount} from '@/common-pages/feedback/feedback.service';

// persist 存储数据时不能用actions将所有方法包裹起来，需要zustand官方查看，目前没有处理方法
type NotificationStoreState = {
  unReadMessageCount: UnReadCountResponse & {feedbackUnReadCount: number};
  getUnReadCount: () => void;

  messageTypeTabIndex: number;
  messageTypeList: MessageTypeDataResponse[];
  getMessageTypeList: () => void;

  noticeMap: BasicObject;
  getNoticeMap: () => {};

  notificationDetail: Partial<NotificationItem>;
};

const useNotificationStore = create<NotificationStoreState>()(
  persist(
    set => ({
      unReadMessageCount: {
        messageTotalCount: 0,
        sysMessageCount: 0,
        sysUserMessageCount: 0,
        feedbackUnReadCount: 0,
      },
      getUnReadCount: async () => {
        const res = await getUnReadCountService();
        // const feedbackCount = await getFeedBackUnReadCount();
        set({
          unReadMessageCount: {
            ...res,
            feedbackUnReadCount: 0,
          },
        });
      },

      messageTypeTabIndex: 0,
      messageTypeList: [],
      getMessageTypeList: async () => {
        const res = await getMessageTypeService();
        set({messageTypeList: res});
      },

      noticeMap: {
        FREE_LOTTERY: 0,
        REBATE: 0,
        LUCKY_SPIN: 0,
      },
      getNoticeMap: async () => {
        // const res = await getNoticeCheck();
        // res?.forEach(item => {
        //   set({
        //     noticeMap: {
        //       [item?.noticeKey]: item?.noticeCount,
        //     },
        //   });
        // });
      },

      notificationDetail: {},
    }),
    {
      name: 'settingStorage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export default useNotificationStore;
