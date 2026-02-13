import RNExitApp from 'react-native-exit-app';
import {
  NativeModules,
  Linking as RNLinking,
  Platform,
  AppState as RNAppState,
  NativeEventEmitter,
  DeviceEventEmitter,
} from 'react-native';
import IntentLauncher from 'react-native-intent-launcher';
import DeviceInfo from 'react-native-device-info';
import NativeNotifee, {
  AndroidImportance as NativeAndroidImportance,
  AndroidVisibility as NativeAndroidVisibility,
  AuthorizationStatus as NativeAuthorizationStatus,
} from '@notifee/react-native';
const { AppModule, BluetoothUnpair, BleProximityModule, BluetoothManager } =
  NativeModules;
import * as WeChat from 'react-native-wechat-lib';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { updateRegId } from '@/services/common';
import { cacheGet } from '@/utils/cache';
import { getSystemInfo, getStorage, setStorage } from '@/utils';
import appManager from './rn/appManager';
import push from './rn/push';

// NativeNotifee.onBackgroundEvent(async ({type, detail}) => {
// const {notification, pressAction} = detail
// Check if the user pressed the "Mark as read" action
// if (type === EventType.ACTION_PRESS && pressAction?.id === 'mark-as-read') {
// Update external API
// await fetch(`https://my-api.com/chat/${notification.data.chatId}/read`, {
//   method: 'POST',
// })
// Remove the notification
// await notifee.cancelNotification(notification.id)
// }
// console.log('onBackgroundEvent')
// })

export const exitApp = RNExitApp.exitApp;
export const notifee = NativeNotifee;
export const AndroidImportance = NativeAndroidImportance;
export const AndroidVisibility = NativeAndroidVisibility;
export const AuthorizationStatus = NativeAuthorizationStatus;
export const appPush: any = push;
export const Linking: any = RNLinking;
export const getAppManager: any = appManager;
const WECHAT_APP_ID: string | undefined = AppModule?.wechatAppId;
let wechatRegisterPromise: Promise<boolean> | null = null;

const ensureWeChatRegistered = () => {
  if (!WECHAT_APP_ID) {
    return Promise.reject(new Error('WECHAT_APP_ID 未配置'));
  }
  if (!wechatRegisterPromise) {
    wechatRegisterPromise = WeChat.registerApp(WECHAT_APP_ID)
      .then(res => {
        return !!res;
      })
      .catch(err => {
        console.error('WeChat registerApp error', err);
        wechatRegisterPromise = null;
        throw err;
      });
  }
  return wechatRegisterPromise;
};

export const isWxAppInstalled = async () => {
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
    return false;
  }
  try {
    await ensureWeChatRegistered();
    return !!(await WeChat.isWXAppInstalled());
  } catch (error) {
    console.error('isWxAppInstalled error', error);
    return false;
  }
};

export const wxAuthLogin = async (): Promise<string | undefined> => {
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
    return undefined;
  }
  try {
    await ensureWeChatRegistered();
    const state = `boklock_${Date.now()}`;
    const resp: any = await WeChat.sendAuthRequest('snsapi_userinfo', state);
    return resp?.code as string | undefined;
  } catch (error) {
    console.error('wxAuthLogin error', error);
    return undefined;
  }
};
export const intentLauncher: any = IntentLauncher;
export const platform: any = Platform;
export const AppState = RNAppState;
export const drawQrcodeInCanvas = (options: any) => {
  return new Promise((resolve, reject) => {});
};
export const userAgent = {
  browser: {},
  device: {},
};

export const rnBoxShadow = ({
  shadowColor,
  shadowOffsetX,
  shadowOffsetY,
  shadowOpacity,
  shadowRadius,
  elevation,
  backgroundColor,
}: {
  shadowColor?: string; // 阴影颜色
  shadowOffsetX?: number; // 水平偏移
  shadowOffsetY?: number; // 垂直偏移
  shadowOpacity?: number; // 透明度（结合颜色的 alpha）
  shadowRadius?: number; // 模糊半径
  elevation?: number; // 控制 Android 阴影高度
  backgroundColor?: string; // RN 中阴影需要背景色支持
}) => {
  return {
    // iOS 阴影
    shadowColor,
    shadowOffset: { width: shadowOffsetX, height: shadowOffsetY },
    shadowOpacity,
    shadowRadius,
    // Android 阴影
    elevation,
    backgroundColor,
  };
};

// mobpush: 复用 utils/index.ts 中已经适配 RN 的实现
export { getMobPushDeviceInfo } from '@/utils';

export const appState = AppState;

export const bluetoothUnpair: any = BluetoothUnpair;

export const bluetoothManager: any = BluetoothManager;

export const deviceInfo: any = DeviceInfo;
export const KeyboardAwareScrollBox: any = KeyboardAwareScrollView;
