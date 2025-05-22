import AsyncStorage from '@react-native-async-storage/async-storage';
import globalStore from './services/global.state';
import {http, VERSION_CODE} from '@utils';
import envConfig from './utils/env.config';
import DeviceInfo from 'react-native-device-info';

export const setVisitor = (id: string) => {
  AsyncStorage.getItem('visitor').then(res => {
    globalStore.visitor = res || id;
    AsyncStorage.setItem('visitor', res || id);
  });
};

export const setToken = () => {
  AsyncStorage.getItem('token').then(res => {
    if (res) {
      globalStore.token = res;
    }
  });
};

export const setUserInfo = () => {
  AsyncStorage.getItem('user').then(res => {
    if (res) {
      globalStore.userInfo = JSON.parse(res);
    }
  });
};

export const setFCMToken = async (token: string) => {
  await AsyncStorage.setItem('FCMToken', token);
};

// 初始化推送
export const initPush = async () => {
  const ReactMoE = require('react-native-moengage').default;
  const Moengage = require('react-native-moengage');
  const {MoEInitConfig, MoEPushConfig, MoEngageLogConfig, MoEngageLogLevel} =
    Moengage;
  const moEInitConfig = new MoEInitConfig(
    MoEPushConfig.defaultConfig(),
    new MoEngageLogConfig(MoEngageLogLevel.VERBOSE, true),
  );
  ReactMoE.initialize(envConfig.moengageAppId, moEInitConfig);

  const firebase = require('@react-native-firebase/app').default;
  const messaging = require('@react-native-firebase/messaging').default;
  const status = await firebase.utils().getPlayServicesStatus();
  // 支持Google service 才能获取到token
  if (status.isAvailable) {
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      ReactMoE.passFcmPushToken(fcmToken);
      await setFCMToken(fcmToken);
    }
  }
  // 请求推送权限
  ReactMoE.requestPushPermissionAndroid();
};

export interface VersionInfo {
  /** 版本 */
  appVersion: string;
  /** 下载地址 */
  downUrl: string;
  /** 提示文案 */
  levelContent: string;
  /** 1提示不强制,2不提示,3强更 */
  levelUp: 1 | 2 | 3;
  /** 图片url */
  popBack: string;
  // versionCode: 236;
}

export const checkVersion = () => {
  return http.post<
    {channelId: string; versionCode: string; signInfo: string},
    VersionInfo
  >('app/version/check', {
    channelId: globalStore.channel,
    packageInfo: undefined,
    versionCode: VERSION_CODE,
  });
};

export interface PopInfo {
  // createTime: number;
  // id: number;
  popImg: string;
  popUrl: string;
  /** 0开启1关闭 */
  status: 0 | 1;

  bannerImg: string;
  bannerImgWeb: string;
  bannerPosition: number;
  buttonStyle: number;
  subTitle: string;
  title: string;
}

export const checkPop = () => {
  // return http.post<null, PopInfo>('app/sysPop/check');
  return http.post<null, PopInfo[]>('app/sysPop/many/check');
};

// export const checkManyPop = () => {
//   return http.post<null, PopInfo[]>('app/sysPop/many/check')
// }
export const dailyRecord = () => {
  if (globalStore.isWeb) {
    // http
    //   .post('app/user/daily/record', {
    //     deviceId: globalStore.visitor,
    //   })
    //   .then();
  } else if (globalStore.isAndroid) {
    DeviceInfo.getAndroidId().then((androidId: string) => {
      console.log(androidId);
      // http
      //   .post('app/user/daily/record', {
      //     deviceId: androidId,
      //   })
      //   .then();
    });
  }
};

export const uploadOSSFile = (data: any) => {
  return http({
    method: 'POST',
    url: 'app/oss/uploadOss/uploadFile',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data,
  });
};
