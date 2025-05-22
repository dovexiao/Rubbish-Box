import {IUserInfo, postUserInfo} from '@/services/global.service';
import globalStore from '@/services/global.state';
import {
  StorageEnum,
  // getStorage,
  // getStringStorage,
  setStorage,
} from '@/utils/storage';
import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useShallow} from 'zustand/react/shallow';
import {useMemo} from 'react';

// persist 存储数据时不能用actions将所有方法包裹起来，需要zustand官方查看，目前没有处理方法

type UserStoreState = {
  token: string;
  userInfo?: IUserInfo;
  setToken: (token: string) => void;
  getUserInfo: () => void;
  loginOut: () => void;
};

const useUserStore = create<UserStoreState>()(
  persist(
    set => ({
      token: '',
      userInfo: undefined,
      setToken: token => {
        set({token: token});
        setStorage(StorageEnum.token, token);
      },
      getUserInfo: async () => {
        const data = await postUserInfo();
        set({userInfo: data});
        setStorage(StorageEnum.user, data);
        globalStore.userInfo = data;
      },
      loginOut: () => {
        set({
          token: '',
          userInfo: undefined,
        });
        setStorage(StorageEnum.token, '');
        setStorage(StorageEnum.user, {});
      },
    }),
    {
      name: 'userInfoStorage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export default useUserStore;

export const useToken = () => {
  const token = useUserStore(state => state.token);
  const isLogin = useMemo(() => {
    return !!token;
  }, [token]);

  return {
    token,
    isLogin,
  };
};
export const useUserInfo = () => useUserStore(state => state.userInfo);
export const useUserActions = () => {
  const {setToken, getUserInfo, loginOut} = useUserStore(
    useShallow(state => ({
      setToken: state.setToken,
      getUserInfo: state.getUserInfo,
      loginOut: state.loginOut,
    })),
  );
  return {setToken, getUserInfo, loginOut};
};
