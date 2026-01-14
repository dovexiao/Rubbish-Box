/**
 * 导航工具函数（兼容 Taro 风格）
 */
export {
  getCurrentPages,
  navigateBack,
  reLaunch,
  hideLoading,
} from './navigation';

export const inputFixedTwo = (inputVal: any) => {
  return inputVal ? inputVal.match(/\d*(\.)?(\d{1,2})?/)[0] : inputVal
}

export const mobileExp = (mobile: string) => {
  const mobileReg = /^1[3456789]\d{9}$/
  return mobileReg.test(mobile)
}

export const idCardExp = (idCard: string) => {
  const idCardReg =
    /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/
  return idCardReg.test(idCard)
}

export const isDecimal = (number: any) => {
  return Number.isFinite(number) && !Number.isInteger(number)
}

export function cdnDomain(cosPath: string) {
  return cosPath.replace('sbqfc-1307862547.cos.ap-shanghai.myqcloud.com', 'https://g.18qjz.cn')
}

export function cdnToCosDomain(cosPath: string) {
  return cosPath.replace(
    'https://g.18qjz.cn',
    'https://sbqfc-1307862547.cos.ap-shanghai.myqcloud.com',
  )
}

import { DeviceEventEmitter, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { cacheGet } from './cache';
import { storageUtil } from './storage';
import appPush from './push';
import { updateRegId } from '@/services/common';

/**
 * 获取存储数据（兼容 Taro 风格的 API）
 * @param options 配置对象，包含 key
 * @returns Promise<T | null>
 */
export async function getStorage<T = any>(options: { key: string }): Promise<T | null> {
  return storageUtil.getItem<T>(options.key);
}

/**
 * 设置存储数据（兼容 Taro 风格的 API）
 * @param options 配置对象，包含 key 和 data
 */
export async function setStorage<T = any>(options: { key: string; data: T }): Promise<void> {
  return storageUtil.setItem(options.key, options.data);
}

/**
 * 删除存储数据（兼容 Taro 风格的 API）
 * @param options 配置对象，包含 key
 */
export async function removeStorage(options: { key: string }): Promise<void> {
  return storageUtil.removeItem(options.key);
}

/**
 * 获取系统信息（兼容 Taro 风格）
 */
async function getSystemInfo(): Promise<{
  platform: string;
  brand?: string;
  model?: string;
  system?: string;
  version?: string;
}> {
  try {
    const brand = DeviceInfo.getBrand();
    const model = DeviceInfo.getModel();
    const system = DeviceInfo.getSystemName();
    const version = DeviceInfo.getSystemVersion();

    return {
      platform: Platform.OS,
      brand,
      model,
      system,
      version,
    };
  } catch (error) {
    console.error('Failed to get system info:', error);
    return {
      platform: Platform.OS,
    };
  }
}

export const getMobPushDeviceInfo = async () => {
  // 兜底校验：仅在同意隐私 + 已登录 + 用户开启通知服务时才真正拉取 deviceToken / registrationId
  try {
    const [agree, token, pushRes]: any[] = await Promise.all([
      cacheGet({ key: 'agreePrivacy' }).catch(() => false),
      cacheGet({ key: 'token' }).catch(() => undefined),
      getStorage({ key: 'pushEnabled' }).catch(() => ({ data: undefined }) as any),
    ]);
    const enabled = pushRes?.data === true;
    const loggedIn = !!token;
    if (!agree || !enabled || !loggedIn) {
      return;
    }
  } catch {
    // 发生异常时不继续，避免在未授权或未登录场景下触发 MobPush
    return;
  }
  const sys = await getSystemInfo();
  const isIOS = sys.platform === 'ios';

  const info: any = {
    platform: isIOS ? 'ios' : 'android',
    brand: sys.brand?.toLowerCase() || '',
  }

  // 1. 获取 deviceToken
  try {
    const token = await appPush.getDeviceToken()
    if (token) info.deviceToken = token
  } catch (e) {
    console.warn('getDeviceToken error:', e)
  }

  // 2. 获取 registrationId（MOBPush 最重要）,两秒没拿到就默认赋值为空
  const timeoutPromise = new Promise<boolean>(resolve => setTimeout(() => resolve(false), 2000))

  try {
    const rid = await Promise.race([appPush.getRegistrationID(), timeoutPromise])
    info.registrationId = rid || ''
  } catch (e) {
    console.warn('getRegistrationID error:', e)
  }

  setStorage({
    key: 'deviceInfo',
    data: info,
  })

  // 如果此时已经拿到有效的 registrationId，直接上报一次，避免仅依赖异步回调
  if (info.registrationId) {
    console.log('进来', info.registrationId, '这是MOB平台回调')
    try {
      await updateRegId({ ...info })
    } catch (e) {
      console.warn('updateRegId in getMobPushDeviceInfo error:', e)
    }
  }

  // 4️⃣ 补充：监听异步更新
  DeviceEventEmitter.addListener('registrationId', async rid => {
    console.log(rid, '这是MOB平台回调')
    if (!rid) return

    // 再次兜底校验：仅在同意隐私 + 已登录 + 用户开启通知服务时处理 registrationId
    try {
      const [agree, token, pushRes]: any[] = await Promise.all([
        cacheGet({ key: 'agreePrivacy' }).catch(() => false),
        cacheGet({ key: 'token' }).catch(() => undefined),
        getStorage({ key: 'pushEnabled' }).catch(() => ({ data: undefined }) as any),
      ])
      const enabled = pushRes?.data === true
      const loggedIn = !!token
      if (!agree || !enabled || !loggedIn) {
        return
      }
    } catch {
      // 发生异常时不继续上报，避免在未授权场景处理 registrationId
      return
    }

    let stored: any = {}
    try {
      const res = await getStorage({ key: 'deviceInfo' })
      stored = res?.data || {}
    } catch {
      stored = {}
    }
    stored.registrationId = rid
    try {
      await setStorage({ key: 'deviceInfo', data: stored })
    } catch { }

    // 可以在这里调用接口上传 rid
    try {
      await updateRegId({ ...stored, registrationId: rid })
    } catch (e) {
      console.warn('updateRegId error:', e)
    }
  })

  return info
}
















