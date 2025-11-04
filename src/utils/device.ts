export interface DeviceInfo {
  os: 'ios' | 'android' | 'other';
  isTouchDevice: boolean;
  browser: 'safari' | 'chrome' | 'firefox' | 'edge' | 'other';
}

/**
 * 获取设备信息
 */
export function getDeviceInfo(): DeviceInfo {
  if (typeof navigator === 'undefined') {
    // SSR 或非浏览器环境
    return {
      os: 'other',
      isTouchDevice: false,
      browser: 'other',
    };
  }

  // @ts-ignore
  const ua = navigator.userAgent || navigator.vendor || window?.opera;
  let os: DeviceInfo['os'] = 'other';
  let browser: DeviceInfo['browser'] = 'other';

  // 判断 OS
  if (/android/i.test(ua)) os = 'android';
  // @ts-ignore
  else if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) os = 'ios';

  // 判断浏览器
  if (/Chrome\/\d+/.test(ua) && !/Edge\/\d+/.test(ua)) browser = 'chrome';
  else if (/Safari\/\d+/.test(ua) && !/Chrome\/\d+/.test(ua))
    browser = 'safari';
  else if (/Firefox\/\d+/.test(ua)) browser = 'firefox';
  else if (/Edge\/\d+/.test(ua)) browser = 'edge';

  // 是否触摸设备
  const isTouchDevice =
    'ontouchstart' in window || navigator.maxTouchPoints > 0;

  return {
    os,
    isTouchDevice,
    browser,
  };
}
