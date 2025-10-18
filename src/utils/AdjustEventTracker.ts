import {Platform} from 'react-native';
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

// 定义Adjust Web SDK类型
interface AdjustWeb {
  initSdk: (config: {
    appToken: string;
    environment: 'sandbox' | 'production';
    logLevel?: 'verbose' | 'info' | 'warning' | 'error' | 'none';
  }) => void;
  trackEvent: (event: {
    eventToken: string;
    revenue?: number;
    currency?: string;
    callbackParameters?: Record<string, string>;
    partnerParameters?: Record<string, string>;
  }) => void;
}

// 声明全局变量类型（Web环境）
declare global {
  interface Window {
    adjust?: AdjustWeb;
  }
}

// 模块变量初始化
let Adjust: any = null;
let AdjustEvent: any = null;
let isInitialized = false;

// 应用配置（请替换为实际的应用令牌）
const APP_CONFIG = {
  android: {appToken: 'n6zcg598o6bk'},
  web: {appToken: 'n6zcg598o6bk'},
  // environment: 'sandbox' as 'sandbox' | 'production',
  environment: ENV_CONFIG.REACT_APP_ENV === 'prod' ? 'production' : 'sandbox',
  logLevel: 'verbose' as 'verbose' | 'info' | 'warning' | 'error' | 'none',
};

// 初始化函数
const initializeAdjust = async (): Promise<boolean> => {
  if (isInitialized) {
    return true;
  }

  try {
    if (Platform.OS === 'web') {
      // Web平台初始化
      if (typeof window !== 'undefined') {
        // 检查是否已通过CDN加载
        if (window.adjust) {
          Adjust = window.adjust;
        } else {
          // 动态导入npm包（需先安装：npm install @adjustcom/adjust-web-sdk）
          const webSdk = await import('@adjustcom/adjust-web-sdk');
          Adjust = webSdk.default || webSdk;
        }
        console.log('web', APP_CONFIG.environment);
        // 初始化Web SDK
        Adjust.initSdk({
          appToken: APP_CONFIG.web.appToken,
          environment: APP_CONFIG.environment,
          logLevel: APP_CONFIG.logLevel,
        });
        isInitialized = true;
      }
    } else {
      // 原生平台初始化（Android/iOS）
      let AdjustConfigParams: any = null;
      const adjustModule = require('react-native-adjust');
      Adjust = adjustModule.Adjust;
      AdjustEvent = adjustModule.AdjustEvent;
      AdjustConfigParams = adjustModule.AdjustConfig;
      console.log('android', APP_CONFIG.environment, Adjust, AdjustEvent);
      const adjustConfig = new adjustModule.AdjustConfig(
        APP_CONFIG.android.appToken,
        APP_CONFIG.environment === 'production'
          ? adjustModule.AdjustConfig.EnvironmentProduction
          : adjustModule.AdjustConfig.EnvironmentSandbox,
      );
      // adjustConfig.setLogLevel(getNativeLogLevel(APP_CONFIG.logLevel));
      // adjustConfig.setLogLevel(APP_CONFIG.logLevel);
      adjustConfig.setLogLevel(AdjustConfigParams.LogLevelVerbose);
      Adjust.create(adjustConfig);
      isInitialized = true;
    }
    console.log('Adjust SDK初始化成功');
    return true;
  } catch (error) {
    console.error('Adjust SDK初始化失败:', error);
    return false;
  }
};

// 日志级别转换（Web to Native）
// const getNativeLogLevel = (logLevel: string): number => {
//   const levels = {
//     verbose: 0,
//     info: 1,
//     warning: 2,
//     error: 3,
//     none: 4,
//   };
//   return levels[logLevel as keyof typeof levels] || 1;
// };

// 检查SDK是否可用
const isAdjustAvailable = (): boolean => {
  return isInitialized && Adjust !== null;
};

// 事件Token映射（与Adjust后台配置对应）
export const EVENT_TOKENS = {
  Register: 'pq5yba',
  First_Deposit: 'nv7401',
  Recharge: 'jgi9qa',
  Deposit: 'd75e06',
  game_rounds: 'aexogy',
  game_time: 'uop9h8',
  nextdaylogin: 'b227at',
  threedaylogin: '2l00io',
  sevendaylogin: '36yztv',
} as const;

// 初始化SDK（应用启动时调用）
export const initAdjustTracker = async (): Promise<boolean> => {
  return initializeAdjust();
};

/**
 * 跟踪注册事件
 */
export const trackRegister = async (): Promise<void> => {
  if (!(await initializeAdjust()) || !isAdjustAvailable()) {
    // console.log('[Adjust模拟] 注册事件跟踪');
    return;
  }

  try {
    if (Platform.OS === 'web') {
      Adjust.trackEvent({
        eventToken: EVENT_TOKENS.Register,
      });
    } else {
      const event = new AdjustEvent(EVENT_TOKENS.Register);
      Adjust.trackEvent(event);
    }
    // console.log('注册事件跟踪成功');
  } catch (error) {
    console.error('注册事件跟踪失败:', error);
  }
};

/**
 * 跟踪首充事件
 * @param amount - 充值金额
 * @param currency - 货币代码（默认INR）
 */
export const trackFirstDeposit = async (
  amount: number,
  currency: string = 'INR',
): Promise<void> => {
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    console.error('无效的充值金额');
    return;
  }

  if (!(await initializeAdjust()) || !isAdjustAvailable()) {
    // console.log(`[Adjust模拟] 首充事件跟踪，金额: ${amount} ${currency}`);
    return;
  }

  try {
    if (Platform.OS === 'web') {
      Adjust.trackEvent({
        eventToken: EVENT_TOKENS.First_Deposit,
        revenue: amount,
        currency: currency,
      });
    } else {
      const event = new AdjustEvent(EVENT_TOKENS.First_Deposit);
      event.setRevenue(amount, currency);
      Adjust.trackEvent(event);
    }
    // console.log(`首充事件跟踪成功，金额: ${amount} ${currency}`);
  } catch (error) {
    console.error('首充事件跟踪失败:', error);
  }
};

/**
 * 跟踪复充事件
 * @param amount - 充值金额
 * @param currency - 货币代码（默认INR）
 */
export const trackRecharge = async (
  amount: number,
  currency: string = 'INR',
): Promise<void> => {
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    console.error('无效的充值金额');
    return;
  }

  if (!(await initializeAdjust()) || !isAdjustAvailable()) {
    // console.log(`[Adjust模拟] 复充事件跟踪，金额: ${amount} ${currency}`);
    return;
  }

  try {
    if (Platform.OS === 'web') {
      Adjust.trackEvent({
        eventToken: EVENT_TOKENS.Recharge,
        revenue: amount,
        currency: currency,
      });
    } else {
      const event = new AdjustEvent(EVENT_TOKENS.Recharge);
      event.setRevenue(amount, currency);
      Adjust.trackEvent(event);
    }
    // console.log(`复充事件跟踪成功，金额: ${amount} ${currency}`);
  } catch (error) {
    console.error('复充事件跟踪失败:', error);
  }
};
/**
 * 跟踪总充值事件
 * @param amount - 充值金额
 * @param currency - 货币代码（默认INR）
 */
export const trackDepositAll = async (
  amount: number,
  currency: string = 'INR',
): Promise<void> => {
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    console.error('无效的充值金额');
    return;
  }

  if (!(await initializeAdjust()) || !isAdjustAvailable()) {
    // console.log(`[Adjust模拟] 总充值事件跟踪，金额: ${amount} ${currency}`);
    return;
  }

  try {
    if (Platform.OS === 'web') {
      Adjust.trackEvent({
        eventToken: EVENT_TOKENS.Deposit,
        revenue: amount,
        currency: currency,
      });
    } else {
      const event = new AdjustEvent(EVENT_TOKENS.Deposit);
      event.setRevenue(amount, currency);
      Adjust.trackEvent(event);
    }
    // console.log(`总充值事件跟踪成功，金额: ${amount} ${currency}`);
  } catch (error) {
    console.error('总充值事件跟踪失败:', error);
  }
};

/**
 * 跟踪游戏局数
 * @param rounds - 游戏局数（正整数）
 */
export const trackGameRounds = async (rounds: number): Promise<void> => {
  if (!Number.isInteger(rounds) || rounds <= 0) {
    console.error('游戏局数必须是正整数');
    return;
  }

  if (!(await initializeAdjust()) || !isAdjustAvailable()) {
    // console.log(`[Adjust模拟] 游戏局数跟踪，局数: ${rounds}`);
    return;
  }

  try {
    if (Platform.OS === 'web') {
      Adjust.trackEvent({
        eventToken: EVENT_TOKENS.game_rounds,
        callbackParameters: {rounds: rounds.toString()},
      });
    } else {
      const event = new AdjustEvent(EVENT_TOKENS.game_rounds);
      event.addCallbackParameter('rounds', rounds.toString());
      Adjust.trackEvent(event);
    }
    // console.log(`游戏局数跟踪成功，局数: ${rounds}`);
  } catch (error) {
    console.error('游戏局数跟踪失败:', error);
  }
};

/**
 * 跟踪游戏时长
 * @param seconds - 游戏时长（秒，正整数）
 */
export const trackGameTime = async (seconds: number): Promise<void> => {
  if (!Number.isInteger(seconds) || seconds <= 0) {
    console.error('游戏时长必须是正整数（秒）');
    return;
  }

  if (!(await initializeAdjust()) || !isAdjustAvailable()) {
    // console.log(`[Adjust模拟] 游戏时长跟踪，时长: ${seconds}秒`);
    return;
  }

  try {
    if (Platform.OS === 'web') {
      Adjust.trackEvent({
        eventToken: EVENT_TOKENS.game_time,
        callbackParameters: {duration: seconds.toString()},
      });
    } else {
      const event = new AdjustEvent(EVENT_TOKENS.game_time);
      event.addCallbackParameter('duration', seconds.toString());
      Adjust.trackEvent(event);
    }
    // console.log(`游戏时长跟踪成功，时长: ${seconds}秒`);
  } catch (error) {
    console.error('游戏时长跟踪失败:', error);
  }
};

/**
 * 跟踪留存事件
 * @param type - 留存类型
 */
export const trackRetention = async (
  type: Extract<
    keyof typeof EVENT_TOKENS,
    'nextdaylogin' | 'threedaylogin' | 'sevendaylogin'
  >,
): Promise<void> => {
  if (!(await initializeAdjust()) || !isAdjustAvailable()) {
    // console.log(`[Adjust模拟] 留存事件跟踪，类型: ${type}`);
    return;
  }

  try {
    if (Platform.OS === 'web') {
      Adjust.trackEvent({
        eventToken: EVENT_TOKENS[type],
      });
    } else {
      const event = new AdjustEvent(EVENT_TOKENS[type]);
      Adjust.trackEvent(event);
    }
    // console.log(`留存事件跟踪成功，类型: ${type}`);
  } catch (error) {
    console.error(`留存事件跟踪失败，类型: ${type}`, error);
  }
};

// 导出类型定义
export type RetentionType = Parameters<typeof trackRetention>[0];
export type EventTracker = {
  initAdjustTracker: typeof initAdjustTracker;
  trackRegister: typeof trackRegister;
  trackFirstDeposit: typeof trackFirstDeposit;
  trackRecharge: typeof trackRecharge;
  trackGameRounds: typeof trackGameRounds;
  trackGameTime: typeof trackGameTime;
  trackRetention: typeof trackRetention;
};
