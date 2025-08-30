import {Platform} from 'react-native';
import axios, {AxiosResponse} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import globalStore from '@services/global.state';
import {errorLog, goTo, parseCookie, getUrlParams} from '@utils';
import envConfig from './env.config';
import {BasicObject} from '@/types';
import {getVersion} from 'react-native-device-info';
import useUserStore from '@/store/useUserStore';
import RNConfig from 'react-native-config';

const IS_WEB = Platform.OS === 'web';

const ENV_CONFIG = (IS_WEB ? process.env : RNConfig) as {
  REACT_APP_ENV: 'dev' | 'prod';
  REACT_APP_API_BASE_URL: string;
  REACT_APP_API_INDUSWIN_URL?: string;
  REACT_APP_API_SPORTS_URL?: string;
  REACT_APP_API_H5GAMES_URL?: string;
  REACT_APP_API_RACECAR_URL?: string;
  REACT_APP_API_H5VUE_URL?: string;
  REACT_APP_PACKAGE?: number;
  REACT_APP_API_DOWNLOAD_URL?: string;
  REACT_APP_API_CHANNEL_ID?: string;
  REACT_APP_API_PACKAGE_ID?: string | number;
  REACT_APP_API_CUSTOM_SERVICE_URL?: string;
  REACT_APP_API_DOWNLOAD_CHANNEL_URL?: string;
  REACT_APP_API_LOGO_URL?: string;
  REACT_APP_API_LOGO_URL_V2?: string;
  REACT_APP_API_LAUNCH_SCREEN_URL?: string;
  [k: string]: string | number | undefined;
};

export const VERSION_CODE = globalStore.isWeb
  ? '999'
  : getVersion().replace(/\./g, '');

const header = {
  'Content-Type': 'application/json',
  packageId: globalStore.packageId + '',
};

export const datas: any = {
  packageId: globalStore.packageId,
  // packageInfo: globalStore.packageInfo,
  versionCode: VERSION_CODE,
};

let result = '';
for (let item in datas) {
  if (datas[item] && String(datas[item])) {
    result += `&${item}=${datas[item]}`;
  }
}
if (result) {
  result = result.slice(1);
}
result += '&vfamx47613hb54tbtvmqaklgcxmdlrwc0e80t5fakts';

const getToken = async () => {
  const token = await AsyncStorage.getItem('token');
  return token;
};

const rejectResponse = <T>(
  response: AxiosResponse<
    {
      data: T;
      code: number;
      msg: string;
    },
    any
  >,
) => {
  globalStore.globalTotal.next({
    type: 'warning',
    message: response.data.msg,
    backgroundColor: '#A1251C',
  });
  return Promise.reject(response);
};

interface CreateHttpParams {
  baseUrl: string;
  mergeHeader?: BasicObject;
  mergeData?: BasicObject;
}

const createHTTP = ({
  baseUrl,
  mergeHeader = {},
  mergeData = {},
}: CreateHttpParams) => {
  // 创建一个Axios实例
  const http = axios.create({
    baseURL: baseUrl,
    timeout: 15000, // 设置请求超时时间
    headers: {
      ...header,
      ...mergeHeader,
    },
  });
  // 请求拦截器
  http.interceptors.request.use(
    async config => {
      const params = getUrlParams();
      config.data = {
        channel: globalStore.isAndroid ? 'Android' : 'h5',
        lang: globalStore.lang,
        visitor: globalStore.visitor,
        reqDate: new Date().getTime(),
        ...datas,
        ...mergeData,
        ...config.data,
        channelId: IS_WEB
          ? globalStore.channel
          : params.channelId ||
            ENV_CONFIG.REACT_APP_API_CHANNEL_ID ||
            globalStore.channel ||
            'supbet',
      };
      const token = globalStore.token || (await getToken());
      if (token) {
        config.headers.Token = token;
      }
      config.headers.visitor = globalStore.visitor;
      config.headers['Access-Control-Allow-Origin'] = '*';
      if (globalStore.isWeb) {
        const cookiedata = parseCookie();
        config.headers.pixelid = localStorage.getItem('pixelid');
        config.headers.fbp = cookiedata._fbp;
        config.headers.fbc = cookiedata._fbc;
      }
      return config;
    },
    (error: any) => {
      globalStore.globalTotal.next({
        type: 'warning',
        message: error.message,
        backgroundColor: '#A1251C',
      });
      errorLog('请求拦截器错误:', error);
      globalStore.globalWaringTotal('Request Error');
      return Promise.reject(error);
    },
  );

  // 响应拦截器
  http.interceptors.response.use(
    <T>(response: AxiosResponse<{data: T; code: number; msg: string}>) => {
      if (response.status === 200) {
        if (
          response.data.code === -1
          // TODO 授权失败返回-1
          // 授权失败导致的登录一律返回首页
          // 应该尽可能避免被接口触发,而应该通过前端逻辑或者路由守卫
          // response.data.msg === 'Authorization failed!'
        ) {
          globalStore.token = null;
          globalStore.userInfo = null;
          useUserStore.getState().loginOut();
          goTo('Login', {
            backPage: globalStore.homePage,
          });
        } else if (response.data.code === 0) {
          return response.data.data;
        } else if (response.data.code === 14) {
          // TODO 这里专门为代理接口处理异常,应该使用新的接口后删除这段逻辑
          return response.data.data;
        } else {
          return rejectResponse(response);
        }
      }
      return rejectResponse(response);
    },
    error => {
      globalStore.globalTotal.next({
        type: 'warning',
        message: error.message,
        backgroundColor: '#A1251C',
      });
      errorLog('响应拦截器错误:', error);
      globalStore.globalWaringTotal('Network Error');
      return Promise.reject(error);
    },
  );

  return http;
};

const http = createHTTP({
  baseUrl: envConfig.baseUrl,
});

const indusWinHttp = createHTTP({
  baseUrl: envConfig.induswinUrl || envConfig.baseUrl,
});

const sportsHttp = createHTTP({
  baseUrl: envConfig.sportsUrl || envConfig.baseUrl,
});

export {http, indusWinHttp, sportsHttp};
