import { Platform, Linking } from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';
import React from 'react';
import { Text } from 'react-native';
import eventCenter from './eventCenter';
import { getStorage, setStorage } from './index';
import { showToast } from './toast';

/**
 * 检查相册权限
 * @returns Promise<{ granted: boolean; message?: string; canOpenSettings?: boolean }>
 */

export const PERMISSION_PROMPT_MESSAGES: Record<string, string> = {
  photo:
    '我们将向您申请相册/存储权限，用于从相册选择照片以上传头像、提交反馈截图等功能，您可以拒绝授权，后续如有需要可在系统设置中开启。',
  camera:
    '我们将向您申请相机权限，用于扫一扫绑定地锁设备、更换地锁二维码等功能，您可以拒绝授权，后续如有需要可在系统设置中开启。',
  bluetooth:
    '我们将向您申请蓝牙权限，用于与您的专属地锁设备进行近场连接控制等交互功能，您可以拒绝授权，后续如有需要可在系统设置中开启。',
  location:
    '我们将向您申请位置权限，用于设备定位、地图展示方便您查看与地锁距离快捷导航等功能，您可以拒绝授权，后续如有需要可在系统设置中开启。',
  microphone:
    '我们将向您申请麦克风权限，用于语音输入与 AI 对话等功能，您可以拒绝授权，后续如有需要可在系统设置中开启。',
};

const permissionPromptMemoryCache: Record<string, true | undefined> = {};

function markPermissionPromptAcknowledged(type: string): void {
  permissionPromptMemoryCache[type] = true;
}

function isPromptAcknowledged(value: any): boolean {
  if (value === true) return true;
  if (value === 1) return true;
  if (value === 'true' || value === '1') return true;
  if (value && typeof value === 'object') {
    if (value.data === true || value.value === true) return true;
    if (value.data === 1 || value.value === 1) return true;
    if (value.data === 'true' || value.value === 'true') return true;
    if (value.data === '1' || value.value === '1') return true;
  }
  return false;
}

class PermissionMutex {
  private queue = Promise.resolve();
  private isLocked = false;

  async lock<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue = this.queue.then(async () => {
        this.isLocked = true;
        try {
          // 这里强制加一个小延迟，确保前一个弹窗完全销毁后再呼出新的
          await new Promise((r: any) => setTimeout(r, 600));
          const result = await task();
          resolve(result);
        } catch (e) {
          reject(e);
        } finally {
          this.isLocked = false;
          // 增加延迟，防止连续弹窗时与系统权限弹窗冲突，导致弹窗被吞
          await new Promise((r: any) => setTimeout(r, 800));
        }
      });
    });
  }
}
export const permissionMutex = new PermissionMutex();

class PromptMutex {
  private queue = Promise.resolve();

  async lock<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue = this.queue.then(async () => {
        try {
          resolve(await task());
        } catch (e) {
          reject(e);
        } finally {
          // 让弹窗关闭动画和系统窗口切换有缓冲，避免内容为空或被系统弹窗吞掉
          await new Promise((r: any) => setTimeout(r, 500));
        }
      });
    });
  }
}
const permissionPromptMutex = new PromptMutex();

export async function runInPermissionQueue<T>(
  task: () => Promise<T>,
): Promise<T> {
  return permissionMutex.lock(task);
}

export async function showPermissionPromptIfNeeded(
  type: string,
): Promise<boolean> {
  return permissionPromptMutex.lock(async () => {
    const message = PERMISSION_PROMPT_MESSAGES[type];
    if (!message) return true;
    if (Platform.OS !== 'android') return true;

    // 优先命中内存缓存，避免每次都读 storage。
    if (permissionPromptMemoryCache[type]) {
      return true;
    }

    const cacheKey = `system_permission_prompt_${type}`;

    try {
      const hasPrompted = await getStorage({ key: cacheKey });
      if (isPromptAcknowledged(hasPrompted)) {
        markPermissionPromptAcknowledged(type);
        return true;
      }
    } catch (e) {}

    const confirmed = await new Promise<boolean>(resolve => {
      eventCenter.trigger('global:popConfirm:show', {
        title: '权限使用告知',
        children: React.createElement(
          Text,
          {
            style: {
              fontSize: 14,
              color: '#333333',
              marginTop: 10,
              textAlign: 'center',
              lineHeight: 20,
            },
          },
          message,
        ),
        showClose: false,
        maskClosable: false,
        confirmText: '我知道了',
        onConfirm: () => {
          markPermissionPromptAcknowledged(type);
          void setStorage({ key: cacheKey, data: { data: true } }).catch(
            () => {},
          );
          // 先立即结束当前确认回调，让弹窗先关闭。
          resolve(true);
        },
      });
    });

    // 确认后再给一点时间，确保告知框收起完成后再继续系统权限流程。
    if (confirmed) {
      await new Promise((r: any) => setTimeout(r, 500));
    }

    return confirmed;
  });
}

export async function checkPhotoPermission(): Promise<{
  granted: boolean;
  message?: string;
  canOpenSettings?: boolean;
}> {
  return permissionMutex.lock(async () => {
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
            await showPermissionPromptIfNeeded('photo');
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
          const permissionType = 'photo';
          const permission = PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
          const checkResult = await check(permission);

          if (checkResult === RESULTS.GRANTED) {
            return { granted: true };
          }

          if (checkResult === RESULTS.DENIED) {
            await showPermissionPromptIfNeeded(permissionType);
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
        const permissionType = 'photo';
        const permission = PERMISSIONS.IOS.PHOTO_LIBRARY;
        const checkResult = await check(permission);

        if (checkResult === RESULTS.GRANTED) {
          return { granted: true };
        }

        if (checkResult === RESULTS.DENIED) {
          await showPermissionPromptIfNeeded(permissionType);
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
  });
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
  return permissionMutex.lock(async () => {
    try {
      if (Platform.OS === 'android') {
        const permissionType = 'camera';
        const permission = PERMISSIONS.ANDROID.CAMERA;
        const checkResult = await check(permission);

        if (checkResult === RESULTS.GRANTED) {
          return { granted: true };
        }

        if (checkResult === RESULTS.DENIED) {
          await showPermissionPromptIfNeeded(permissionType);
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
        const permissionType = 'camera';
        const permission = PERMISSIONS.IOS.CAMERA;
        const checkResult = await check(permission);

        if (checkResult === RESULTS.GRANTED) {
          return { granted: true };
        }

        if (checkResult === RESULTS.DENIED) {
          await showPermissionPromptIfNeeded(permissionType);
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
  });
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
 * 检查麦克风权限
 */
export async function checkMicrophonePermission(): Promise<boolean> {
  return permissionMutex.lock(async () => {
    try {
      if (Platform.OS === 'android') {
        const permission = PERMISSIONS.ANDROID.RECORD_AUDIO;
        const checkResult = await check(permission);

        if (checkResult === RESULTS.GRANTED) {
          return true;
        }

        if (checkResult === RESULTS.DENIED) {
          await showPermissionPromptIfNeeded('microphone');
          const requestResult = await request(permission);
          return requestResult === RESULTS.GRANTED;
        }

        if (checkResult === RESULTS.BLOCKED) {
          showToast('麦克风权限已被永久拒绝，请在设置中开启');
          return false;
        }

        return false;
      }

      if (Platform.OS === 'ios') {
        const permission = PERMISSIONS.IOS.MICROPHONE;
        const checkResult = await check(permission);

        if (checkResult === RESULTS.GRANTED) {
          return true;
        }

        if (checkResult === RESULTS.DENIED) {
          await showPermissionPromptIfNeeded('microphone');
          const requestResult = await request(permission);
          return requestResult === RESULTS.GRANTED;
        }

        if (checkResult === RESULTS.BLOCKED) {
          showToast('麦克风权限已被永久拒绝，请在设置中开启');
          return false;
        }

        return false;
      }

      return true;
    } catch (error: any) {
      console.error('检查麦克风权限失败:', error);
      return false;
    }
  });
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
  return permissionMutex.lock(async () => {
    try {
      if (Platform.OS === 'android') {
        // Android 12+ (API 31+) 需要 BLUETOOTH_CONNECT 权限
        // Android < 12 需要 BLUETOOTH 和 BLUETOOTH_ADMIN 权限
        const androidVersion = Platform.Version as number;

        if (androidVersion >= 31) {
          // Android 12+
          const permissionType = 'bluetooth';
          const permission = PERMISSIONS.ANDROID.BLUETOOTH_CONNECT;
          const checkResult = await check(permission);

          if (checkResult === RESULTS.GRANTED) {
            return { granted: true };
          }

          if (checkResult === RESULTS.DENIED) {
            await showPermissionPromptIfNeeded(permissionType);
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
          const permissionType = 'bluetooth';
          const permission = PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL;
          const checkResult = await check(permission);

          if (checkResult === RESULTS.GRANTED) {
            return { granted: true };
          }

          if (checkResult === RESULTS.DENIED) {
            await showPermissionPromptIfNeeded(permissionType);
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
  });
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
