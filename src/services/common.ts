import { createFetch } from '@/utils/request';

/**
 * 通用接口
 */

// 获取兼容版本
export const getCompatibleVersion = createFetch<any, any>(
  '/boke/compatible/version',
  'GET',
);

// 获取微信签名等
export const getWeiSignature = createFetch<any, any>(
  '/boke/wechat/jsConfig',
  'POST',
);

// 获取 COS 密钥
export const getCosKey = createFetch<any, any>(
  '/boke/thirdparty/cos/tempCosKey',
  'GET',
);

// 登录
export const login = createFetch<any, any>('/boke/user/login', 'POST');

// 第三方登录
export const thirdLogin = createFetch<any, any>(
  '/boke/user/login/third',
  'POST',
);

// 小程序登录
export const miniLogin = createFetch<any, any>('/boke/user/mini/login', 'POST');

// 获取短信验证码
export const getSmsCode = createFetch<any, any>(
  '/boke/user/sendSms/public',
  'POST',
);

// 获取版本信息
export const getVersion = createFetch<any, any>(
  '/boke/user/client/version/update',
  'GET',
);

// 获取小程序版本
export const getMiniVersion = createFetch<any, any>(
  '/boke/user/version/update',
  'GET',
);

// 切换站内推送或设备端推送开关
export const changePushFlag = createFetch<any, any>(
  '/boke/user/pushFlag',
  'POST',
);

// 安卓微信支付
export const appTradePay = createFetch<any, any>(
  '/boke/custom/trade/pay/app',
  'POST',
);

// MOB回调registryID手动上传
export const updateRegId = createFetch<any, any>(
  '/boke/user/bindReqId',
  'POST',
);

// 使用APP的token换取小程序的token
export const getMiniToken = createFetch<any, any>(
  '/boke/user/token/exchange',
  'GET',
);

// App 版本检测（安卓 / iOS / 鸿蒙）
export const getAppVer = createFetch<any, any>('/boke/appver/version', 'GET');
