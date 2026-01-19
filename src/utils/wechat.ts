import { Toast } from "@ant-design/react-native";
import { NativeModules } from "react-native";
import Config from "react-native-config";
import * as WeChat from 'react-native-wechat-lib';
const { AppModule } = NativeModules;
const WECHAT_APP_ID: string | undefined = AppModule?.wechatAppId;
let wechatRegisterPromise: Promise<boolean> | null = null;



const ensureWeChatRegistered = () => {
  if (!WECHAT_APP_ID) {
    return Promise.reject(new Error('WECHAT_APP_ID 未配置'))
  }
  if (!wechatRegisterPromise) {
    wechatRegisterPromise = WeChat.registerApp(WECHAT_APP_ID)
      .then((res: boolean) => {
        return !!res
      })
      .catch((err: any) => {
        console.error('WeChat registerApp error', err)
        wechatRegisterPromise = null
        throw err
      })
  }
  return wechatRegisterPromise
}

export const isWxAppInstalled = async () => {
  try {
    await ensureWeChatRegistered()
    return !!(await WeChat.isWXAppInstalled())
  } catch (error) {
    console.error('isWxAppInstalled error', error)
    return false
  }
}


export const WeChatInit = async () => {
  try {
    const registerResult = await WeChat.registerApp(
      'wx5c90e0d5806a55c4',
      'https://g.18qjz.cn/wechat/',
    )
    console.log('[WeChatInit] registerApp 结果:', registerResult)

    if (registerResult) {
      const installed = await WeChat.isWXAppInstalled()
      console.log('[WeChatInit] 微信是否已安装:', installed)
      return installed
    }
    console.warn('[WeChatInit] registerApp 返回 false')
    return false
  } catch (e) {
    console.error('WeChatModule init failed', e)
    return false
  }
}


export const wechatOpenMiniProgram = async (path?: string) => {
  const installed = await WeChatInit()
  if (!installed) {
    return { result: false, code: undefined, message: '请先安装微信' }
  }
  try {
    console.log(path, '========>path')
    // showLoading({title: '正在打开小程序'})
    const res = await WeChat.launchMiniProgram({
      userName: 'gh_00245e3a7d08', // 小程序原始id
      miniProgramType: Config.ENV === 'dev' ? 2 : 0, // 正式版
      path: path ? path : '/pages/login/index', //拉起小程序页面的可带参路径，不填默认拉起小程序首页
    })

    return { result: true, code: res.errCode, message: '打开小程序成功' }
  } catch (e: any) {
    return { result: false, code: undefined, message: '打开小程序失败，请重试' }
  }
}

export const wechatLogin = async () => {
  const loadingToast = Toast.loading('正在拉起微信', 0);
  try {
    const authResponse = await WeChat.sendAuthRequest(
      'snsapi_userinfo',
      `wechat_login_${Math.random().toString(36).substr(2, 10)}`,
    )
    Toast.remove(loadingToast)
    switch (authResponse.errCode) {
      case 0: // 授权成功，返回code
        return { result: true, code: authResponse.code, message: '授权成功' }
      case -1:
        return { result: false, code: undefined, message: '授权失败，请重试' }
      case -2: //-2 用户取消授权
        return { result: false, code: undefined, message: '用户取消授权' }
      case -4: //-4 用户拒绝授权
        return { result: false, code: undefined, message: '用户取消授权' }
      default:
        return {
          result: false,
          code: undefined,
          message: `授权失败，错误码：${authResponse.errCode}`,
        }
    }
  } catch (e: any) {
    Toast.remove(loadingToast)
    return { result: false, code: undefined, message: '授权失败，请重试' }
  }
}


export const checkInstalledWeChat = async () => {
  const installed = await WeChatInit()
  if (!installed) {
    return { result: false, code: undefined, message: '请先安装微信' }
  } else {
    return { result: true, code: undefined, message: '已安装微信' }
  }
}