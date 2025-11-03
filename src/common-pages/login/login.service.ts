import globalStore from '@/services/global.state';
import uuid from 'react-native-uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {http} from '@utils';
import DeviceInfo from 'react-native-device-info';
import ReactNativeIdfaAaid from '@sparkfabrik/react-native-idfa-aaid';
import {Platform} from 'react-native';

export const sendCode = (userPhone: string) => {
  return http.post('app/sendCode', {userPhone});
};
const myAppType = 'myApp 1.0.2';
const getUuid = async (manufacturer: string) => {
  const uuids: any = uuid.v4();
  const getStorage = await AsyncStorage.getItem(manufacturer);
  if (getStorage === null) {
    AsyncStorage.setItem(manufacturer, uuids);
    return uuids;
  } else {
    return getStorage;
  }
};
/**
 * 获取广告ID信息
 */
export const getAdId = async () => {
  const {id} = await ReactNativeIdfaAaid.getAdvertisingInfo();
  return id ?? '';
};
export const userLogin = async (
  userPhone: string,
  code: string,
  deviceCode: string,
  inviteCode: string,
  equipmentType: string,
  systemType: string,
  adjustId: string,
  userInviteCode?: string,
  isLogin: boolean = true,
) => {
  const manufacturer = myAppType;
  const id = await getUuid(manufacturer);
  let androidId = '';
  let gaid: string = '';

  if (Platform.OS === 'android') {
    androidId = await DeviceInfo.getAndroidId();
    gaid = await getAdId();
  }

  const date = {
    userPhone,
    code,
    deviceCode: id,
    inviteCode,
    equipmentType,
    systemType,
    adjustId,
    userInviteCode,
    androidId,
    gaid,
  };
  if (!isLogin && globalStore.isWeb && !userInviteCode) {
    date.userInviteCode = localStorage.getItem('invitationCode') || undefined;
  }
  return http.post<
    null,
    {
      token: string;
      isNewUser: boolean;
    }
  >('app/userLoginNew', date);
};

export const passwordLogin = async (
  userPhone: string,
  password: string,
  deviceCode: string,
  inviteCode: string,
  equipmentType: string,
  systemType: string,
  adjustId: string,
) => {
  const manufacturer = myAppType;
  const id = await getUuid(manufacturer);
  return http.post<null, string>('app/password/login', {
    userPhone,
    password,
    deviceCode: id,
    inviteCode,
    equipmentType,
    systemType,
    adjustId,
  });
};

export const updatePassword = (password: string) => {
  return http.post<null, string>('app/user/set/password', {
    password,
  });
};
