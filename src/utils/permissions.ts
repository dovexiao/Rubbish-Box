import { Platform, Linking } from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';
import { showToast } from './toast';

/**
 * 检查相册权限
 * @returns Promise<{ granted: boolean; message?: string; canOpenSettings?: boolean }>
 */
export async function checkPhotoPermission(): Promise<{
  granted: boolean;
  message?: string;
  canOpenSettings?: boolean;
}> {
  try {
    if (Platform.OS === 'android') {
      // Android 13+ (API 33+) 需要 READ_MEDIA_IMAGES
      // Android < 13 需要 READ_EXTERNAL_STORAGE
      const androidVersion = Platform.Version as number;

      if (androidVersion >= 33) {
        // Android 13+
        const permission = PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
        const checkResult = await check(permission);

        if (checkResult === RESULTS.GRANTED) {
          return { granted: true };
        }

        if (checkResult === RESULTS.DENIED) {
          const requestResult = await request(permission);
          if (requestResult === RESULTS.GRANTED) {
            return { granted: true };
          } else {
            return { granted: false, message: '相册权限被拒绝' };
          }
        }

        if (checkResult === RESULTS.BLOCKED) {
          return {
            granted: false,
            message: '相册权限已被永久拒绝，请在设置中开启',
            canOpenSettings: true,
          };
        }

        return { granted: false, message: '相册权限状态未知' };
      } else {
        // Android < 13
        const permission = PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
        const checkResult = await check(permission);

        if (checkResult === RESULTS.GRANTED) {
          return { granted: true };
        }

        if (checkResult === RESULTS.DENIED) {
          const requestResult = await request(permission);
          if (requestResult === RESULTS.GRANTED) {
            return { granted: true };
          } else {
            return { granted: false, message: '相册权限被拒绝' };
          }
        }

        if (checkResult === RESULTS.BLOCKED) {
          return {
            granted: false,
            message: '相册权限已被永久拒绝，请在设置中开启',
            canOpenSettings: true,
          };
        }

        return { granted: false, message: '相册权限状态未知' };
      }
    } else if (Platform.OS === 'ios') {
      // iOS
      const permission = PERMISSIONS.IOS.PHOTO_LIBRARY;
      const checkResult = await check(permission);

      if (checkResult === RESULTS.GRANTED) {
        return { granted: true };
      }

      if (checkResult === RESULTS.DENIED) {
        const requestResult = await request(permission);
        if (requestResult === RESULTS.GRANTED) {
          return { granted: true };
        } else {
          return { granted: false, message: '相册权限被拒绝' };
        }
      }

      if (checkResult === RESULTS.BLOCKED) {
        return {
          granted: false,
          message: '相册权限已被永久拒绝，请在设置中开启',
          canOpenSettings: true,
        };
      }

      return { granted: false, message: '相册权限状态未知' };
    } else {
      // 其他平台（如鸿蒙）暂不支持权限库，统一视为已授权，由系统API或原生侧内部处理权限拦截
      return { granted: true };
    }
  } catch (error: any) {
    console.error('检查相册权限失败:', error);
    return { granted: false, message: error?.message || '检查相册权限失败' };
  }
}

/**
 * 检查相机权限
 * @returns Promise<{ granted: boolean; message?: string; canOpenSettings?: boolean }>
 */
export async function checkCameraPermission(): Promise<{
  granted: boolean;
  message?: string;
  canOpenSettings?: boolean;
}> {
  try {
    if (Platform.OS === 'android') {
      const permission = PERMISSIONS.ANDROID.CAMERA;
      const checkResult = await check(permission);

      if (checkResult === RESULTS.GRANTED) {
        return { granted: true };
      }

      if (checkResult === RESULTS.DENIED) {
        const requestResult = await request(permission);
        if (requestResult === RESULTS.GRANTED) {
          return { granted: true };
        } else {
          return { granted: false, message: '相机权限被拒绝' };
        }
      }

      if (checkResult === RESULTS.BLOCKED) {
        return {
          granted: false,
          message: '相机权限已被永久拒绝，请在设置中开启',
          canOpenSettings: true,
        };
      }

      return { granted: false, message: '相机权限状态未知' };
    } else if (Platform.OS === 'ios') {
      // iOS
      const permission = PERMISSIONS.IOS.CAMERA;
      const checkResult = await check(permission);

      if (checkResult === RESULTS.GRANTED) {
        return { granted: true };
      }

      if (checkResult === RESULTS.DENIED) {
        const requestResult = await request(permission);
        if (requestResult === RESULTS.GRANTED) {
          return { granted: true };
        } else {
          return { granted: false, message: '相机权限被拒绝' };
        }
      }

      if (checkResult === RESULTS.BLOCKED) {
        return {
          granted: false,
          message: '相机权限已被永久拒绝，请在设置中开启',
          canOpenSettings: true,
        };
      }

      return { granted: false, message: '相机权限状态未知' };
    } else {
      // 其他平台（如鸿蒙）
      return { granted: true };
    }
  } catch (error: any) {
    console.error('检查相机权限失败:', error);
    return { granted: false, message: error?.message || '检查相机权限失败' };
  }
}

/**
 * 打开系统设置页面
 */
export async function openSystemSettings(): Promise<void> {
  try {
    if (Platform.OS === 'ios') {
      await openSettings();
    } else {
      // Android
      await Linking.openSettings();
    }
  } catch (error) {
    console.error('打开设置页面失败:', error);
    showToast('无法打开设置页面');
  }
}

/**
 * 检查并请求相册权限（带 Toast 提示）
 * @returns Promise<boolean> 是否有权限
 */
export async function checkAndRequestPhotoPermission(): Promise<boolean> {
  const result = await checkPhotoPermission();

  if (result.granted) {
    return true;
  }

  if (result.canOpenSettings) {
    showToast(result.message || '相册权限被拒绝');
    // 可以在这里添加打开设置的逻辑
    // await openSystemSettings();
  } else {
    showToast(result.message || '相册权限被拒绝');
  }

  return false;
}

/**
 * 检查并请求相机权限（带 Toast 提示）
 * @returns Promise<boolean> 是否有权限
 */
export async function checkAndRequestCameraPermission(): Promise<boolean> {
  const result = await checkCameraPermission();

  if (result.granted) {
    return true;
  }

  if (result.canOpenSettings) {
    showToast(result.message || '相机权限被拒绝');
    // 可以在这里添加打开设置的逻辑
    // await openSystemSettings();
  } else {
    showToast(result.message || '相机权限被拒绝');
  }

  return false;
}

/**
 * 检查蓝牙权限
 * @returns Promise<{ granted: boolean; message?: string; canOpenSettings?: boolean }>
 */
export async function checkBluetoothPermission(): Promise<{
  granted: boolean;
  message?: string;
  canOpenSettings?: boolean;
}> {
  try {
    if (Platform.OS === 'android') {
      // Android 12+ (API 31+) 需要 BLUETOOTH_CONNECT 权限
      // Android < 12 需要 BLUETOOTH 和 BLUETOOTH_ADMIN 权限
      const androidVersion = Platform.Version as number;

      if (androidVersion >= 31) {
        // Android 12+
        const permission = PERMISSIONS.ANDROID.BLUETOOTH_CONNECT;
        const checkResult = await check(permission);

        if (checkResult === RESULTS.GRANTED) {
          return { granted: true };
        }

        if (checkResult === RESULTS.DENIED) {
          const requestResult = await request(permission);
          if (requestResult === RESULTS.GRANTED) {
            return { granted: true };
          } else {
            return { granted: false, message: '蓝牙连接权限被拒绝' };
          }
        }

        if (checkResult === RESULTS.BLOCKED) {
          return {
            granted: false,
            message: '蓝牙连接权限已被永久拒绝，请在设置中开启',
            canOpenSettings: true,
          };
        }

        return { granted: false, message: '蓝牙连接权限状态未知' };
      } else {
        // Android < 12
        // 旧版本 Android 蓝牙权限在安装时自动授予
        return { granted: true };
      }
    } else if (Platform.OS === 'ios') {
      // iOS
      // iOS 13+ 使用 BLUETOOTH
      // iOS 13 之前蓝牙权限在 Info.plist 中配置，系统会自动处理
      try {
        const permission = PERMISSIONS.IOS.BLUETOOTH;
        const checkResult = await check(permission);

        if (checkResult === RESULTS.GRANTED) {
          return { granted: true };
        }

        if (checkResult === RESULTS.DENIED) {
          const requestResult = await request(permission);
          if (requestResult === RESULTS.GRANTED) {
            return { granted: true };
          } else {
            return { granted: false, message: '蓝牙权限被拒绝' };
          }
        }

        if (checkResult === RESULTS.BLOCKED) {
          return {
            granted: false,
            message: '蓝牙权限已被永久拒绝，请在设置中开启',
            canOpenSettings: true,
          };
        }

        if (checkResult === RESULTS.UNAVAILABLE) {
          // iOS 13 之前的设备，权限在 Info.plist 中配置，系统会自动处理
          return { granted: true };
        }

        return { granted: false, message: '蓝牙权限状态未知' };
      } catch (error) {
        // 如果权限检查失败（可能是 iOS 版本不支持），返回已授权
        // 因为旧版本 iOS 蓝牙权限在 Info.plist 中配置
        console.warn('iOS 蓝牙权限检查失败，使用默认授权:', error);
        return { granted: true };
      }
    } else {
      // 其他平台（如鸿蒙）暂不支持当前权限库的蓝牙能力
      return { granted: true };
    }
  } catch (error: any) {
    console.error('检查蓝牙权限失败:', error);
    return { granted: false, message: error?.message || '检查蓝牙权限失败' };
  }
}

/**
 * 检查并请求蓝牙权限（带 Toast 提示）
 * @returns Promise<boolean> 是否有权限
 */
export async function checkAndRequestBluetoothPermission(): Promise<boolean> {
  const result = await checkBluetoothPermission();

  if (result.granted) {
    return true;
  }

  if (result.canOpenSettings) {
    showToast(result.message || '蓝牙权限被拒绝');
    // 可以在这里添加打开设置的逻辑
    // await openSystemSettings();
  } else {
    showToast(result.message || '蓝牙权限被拒绝');
  }

  return false;
}
