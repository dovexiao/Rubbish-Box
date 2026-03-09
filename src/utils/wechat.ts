import {
  NativeModules,
  Platform,
  TurboModuleRegistry,
  Linking,
} from 'react-native';
import Config from 'react-native-config';
import DeviceInfo from 'react-native-device-info';
import { hideLoading, showLoading } from '@/utils';

const { AppModule } = NativeModules;
const WECHAT_APP_ID: string | undefined = AppModule?.wechatAppId;
const WECHAT_APP_ID_FALLBACK = 'wx5c90e0d5806a55c4';
const WECHAT_UNIVERSAL_LINK = 'https://g.18qjz.cn/wechat/';

let wechatRegisterPromise: Promise<boolean> | null = null;

const isHarmony = Platform.OS !== 'android' && Platform.OS !== 'ios';
const isNativeMobile =
  Platform.OS === 'android' || Platform.OS === 'ios' || isHarmony;

const harmonyWeChatModuleNames = ['WeChat', 'HarmonyWechatTurboModule'];

const resolveWeChatModule = () => {
  if (!isNativeMobile) return null;
  if (!isHarmony) {
    try {
      return require('react-native-wechat-lib');
    } catch (e) {
      console.warn('[WeChat] module not available:', e);
      return null;
    }
  }

  // Handle Harmony
  const turboGet = (TurboModuleRegistry as any)?.get;
  if (typeof turboGet === 'function') {
    for (const name of harmonyWeChatModuleNames) {
      try {
        const candidate = turboGet(name);
        if (candidate) {
          console.log(
            `[WeChatInit] Resolved WeChat via TurboModuleRegistry: ${name}`,
          );
          return candidate;
        }
      } catch (e) {}
    }
  }

  // Fallback to NativeModules
  const nativeModuleBucket = NativeModules as Record<string, unknown>;
  for (const name of harmonyWeChatModuleNames) {
    if (nativeModuleBucket[name]) {
      console.log(`[WeChatInit] Resolved WeChat via NativeModules: ${name}`);
      return nativeModuleBucket[name];
    }
  }

  // Last resort
  const wkey = Object.keys(NativeModules).find(k =>
    k.toLowerCase().includes('wechat'),
  );
  if (wkey && nativeModuleBucket[wkey]) {
    console.log(
      `[WeChatInit] Resolved WeChat via NativeModules fallback key: ${wkey}`,
    );
    return nativeModuleBucket[wkey];
  }

  console.warn(
    '[WeChatInit] WeChat is STILL null! NativeModules keys:',
    Object.keys(NativeModules).filter(k => k.toLowerCase().includes('wechat')),
  );
  return null;
};

let WeChat: any = resolveWeChatModule();

type ShareMiniProgramOptions = {
  title?: string;
  userName: string;
  path: string;
  webpageUrl?: string;
  thumbImageUrl?: string;
  scene?: number;
  miniProgramType?: number;
};

const ensureWeChatRegistered = () => {
  const resolvedAppId = WECHAT_APP_ID || WECHAT_APP_ID_FALLBACK;
  if (!isNativeMobile) {
    return Promise.reject(new Error('当前平台暂不支持微信 SDK'));
  }
  if (!resolvedAppId) {
    return Promise.reject(new Error('WECHAT_APP_ID 未配置'));
  }
  if (!WeChat) {
    WeChat = resolveWeChatModule(); // try again just in case
    if (!WeChat) return Promise.reject(new Error('微信 SDK 模块未正确加载'));
  }

  if (!wechatRegisterPromise) {
    try {
      const registerResult = WeChat.registerApp(
        resolvedAppId,
        WECHAT_UNIVERSAL_LINK,
      );
      wechatRegisterPromise = Promise.resolve(registerResult)
        .then((res: boolean) => !!res)
        .catch((err: any) => {
          console.error('WeChat registerApp error', err);
          wechatRegisterPromise = null;
          throw err;
        });
    } catch (err) {
      console.error('WeChat registerApp sync error', err);
      wechatRegisterPromise = null;
      return Promise.reject(err);
    }
  }
  return wechatRegisterPromise;
};

export const hasWeChatShareCapability = () =>
  isNativeMobile && !!WeChat && typeof WeChat.shareMiniProgram === 'function';

export const shareWeChatMiniProgram = async (
  options: ShareMiniProgramOptions,
) => {
  if (!isNativeMobile) throw new Error('当前平台暂不支持微信分享');
  if (!hasWeChatShareCapability()) throw new Error('微信分享能力不可用');
  await ensureWeChatRegistered();
  return WeChat.shareMiniProgram(options);
};

export const isWxAppInstalled = async () => {
  try {
    if (!isNativeMobile) return false;
    await ensureWeChatRegistered();

    if (isHarmony) {
      // 鸿蒙系统下，使用可以拉起微信的方法来检测是否安装
      // 这里必须在 module.json5 里配置 querySchemes: ['weixin'] 才能生效
      const supported = await Linking.canOpenURL('weixin://');
      if (supported) {
        return true;
      }
    }

    return !!(await WeChat.isWXAppInstalled());
  } catch (error) {
    console.error('isWxAppInstalled error', error);
    return false;
  }
};

export const WeChatInit = async () => {
  try {
    if (!isNativeMobile) return false;

    if (!WeChat) {
      WeChat = resolveWeChatModule();
    }

    const bundleId = DeviceInfo.getBundleId();
    console.log('[WeChatInit] 当前包名:', bundleId);
    console.log(
      '[WeChatInit] 使用微信AppID:',
      WECHAT_APP_ID || WECHAT_APP_ID_FALLBACK,
    );

    const registerResult = await ensureWeChatRegistered();
    console.log('[WeChatInit] registerApp 结果:', registerResult);

    if (registerResult) {
      let installed = false;
      if (isHarmony) {
        // 使用鸿蒙特定的方式检查：看是否能打开 weixin:// scheme
        installed = await Linking.canOpenURL('weixin://').catch(() => false);
        if (!installed) {
          // fallback to native checking if Linking fails
          installed = await WeChat?.isWXAppInstalled?.();
        }
      } else {
        installed = await WeChat?.isWXAppInstalled?.();
      }

      console.log('[WeChatInit] 微信是否已安装?', installed);
      return !!installed;
    }
    console.warn('[WeChatInit] registerApp 返回 false');
    return false;
  } catch (e) {
    console.error('WeChatModule init failed', e);
    return false;
  }
};

export const wechatOpenMiniProgram = async (path?: string) => {
  if (!isNativeMobile) {
    return {
      result: false,
      code: undefined,
      message: '当前平台暂不支持打开微信小程序',
    };
  }
  const installed = await WeChatInit();
  if (!installed) {
    return { result: false, code: undefined, message: '请先安装微信' };
  }
  try {
    const res = await WeChat?.launchMiniProgram?.({
      userName: 'gh_00245e3a7d08',
      miniProgramType: Config.ENV === 'dev' ? 2 : 0,
      path: path ? path : '/pages/login/index',
    });
    return { result: true, code: res?.errCode, message: '打开小程序成功' };
  } catch (e: any) {
    return {
      result: false,
      code: undefined,
      message: '打开小程序失败，请重试',
    };
  }
};

export const wechatLogin = async () => {
  showLoading({ title: '正在拉起微信' });
  try {
    if (!isNativeMobile) {
      hideLoading();
      return {
        result: false,
        code: undefined,
        message: '当前平台暂不支持微信登录',
      };
    }

    // Use \ properly so powershell doesn't replace it and we don't break JS
    const randomStr = Math.random().toString(36).substring(2, 10);
    const authResponse = await WeChat?.sendAuthRequest?.(
      'snsapi_userinfo',
      `wechat_login_${randomStr}`,
    );

    if (!authResponse) {
      hideLoading();
      return {
        result: false,
        code: undefined,
        message: '拉起微信失败，请重试',
      };
    }
    hideLoading();
    switch (authResponse.errCode) {
      case 0:
        return { result: true, code: authResponse.code, message: '授权成功' };
      case -1:
        return { result: false, code: undefined, message: '授权失败，请重试' };
      case -2:
        return { result: false, code: undefined, message: '用户取消授权' };
      case -4:
        return { result: false, code: undefined, message: '用户拒绝授权' };
      default:
        return {
          result: false,
          code: undefined,
          message: `授权失败，错误码：${authResponse.errCode}`,
        };
    }
  } catch (e: any) {
    hideLoading();
    return { result: false, code: undefined, message: '授权失败，请重试' };
  }
};

export const checkInstalledWeChat = async () => {
  if (!isNativeMobile) {
    return {
      result: false,
      code: undefined,
      message: '当前平台暂不支持微信 SDK',
    };
  }
  const installed = await WeChatInit();
  if (!installed) {
    return { result: false, code: undefined, message: '请先安装微信' };
  } else {
    return { result: true, code: undefined, message: '已安装微信' };
  }
};
