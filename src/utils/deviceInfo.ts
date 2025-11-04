import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeIdfaAaid from '@sparkfabrik/react-native-idfa-aaid';

const ANDROID_ID_CACHE_KEY = 'cachedAndroidId';
const AD_ID_CACHE_KEY = 'cachedAdId';

/**
 * 获取并缓存 Android ID
 */
export async function getCachedAndroidId(): Promise<string> {
  try {
    const cached = await AsyncStorage.getItem(ANDROID_ID_CACHE_KEY);
    if (cached && cached !== 'unknown' && cached !== 'null') {
      return cached;
    }

    const id = await DeviceInfo.getAndroidId();
    if (id && id !== 'unknown' && id !== 'null') {
      await AsyncStorage.setItem(AD_ID_CACHE_KEY, id);
      return id;
    }

    // 如果获取不到，就直接返回空字符串，不生成 UUID
    return '';
  } catch (e) {
    console.warn('getCachedAndroidId error:', e);
    return '';
  }
}

/**
 * 获取并缓存 GAID（广告 ID）
 */
export async function getCachedAdId(): Promise<string> {
  const CACHE_KEY = 'cachedAdId';

  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached && cached !== 'unknown' && cached !== 'null') {
      return cached;
    }

    const {id} = await ReactNativeIdfaAaid.getAdvertisingInfo();
    if (id && id !== 'unknown' && id !== 'null') {
      await AsyncStorage.setItem(CACHE_KEY, id);
      return id;
    }

    return '';
  } catch (e) {
    console.warn('getCachedAdId error:', e);
    return '';
  }
}

/**
 * 同步最新系统值到缓存
 */
export async function ensureDeviceIds() {
  const androidId = await getCachedAndroidId();
  const gaid = await getCachedAdId();

  try {
    // 同步 Android ID
    const latestAndroidId = await DeviceInfo.getAndroidId();
    if (
      latestAndroidId &&
      latestAndroidId !== 'unknown' &&
      latestAndroidId !== 'null' &&
      latestAndroidId !== androidId
    ) {
      await AsyncStorage.setItem(ANDROID_ID_CACHE_KEY, latestAndroidId);
    }

    // 同步 GAID
    const {id: latestGaid} = await ReactNativeIdfaAaid.getAdvertisingInfo();
    if (
      latestGaid &&
      latestGaid !== 'unknown' &&
      latestGaid !== 'null' &&
      latestGaid !== gaid
    ) {
      await AsyncStorage.setItem(AD_ID_CACHE_KEY, latestGaid);
    }
  } catch (e) {
    console.warn('syncDeviceIdsToCache error:', e);
  }
}
