import { DeviceEventEmitter, NativeModules, Platform } from 'react-native';

const { MobPushModule, AppModule } = NativeModules;

// 检查 MobPushModule 是否存在
if (!MobPushModule) {
  console.warn(
    'MobPushModule is not available. Push notifications may not work.',
  );
}

if (Platform.OS === 'ios' && MobPushModule) {
  MobPushModule.addPushReceiver = () => {};
}

const listeners: Record<string, any> = {};

// 创建一个安全的包装函数，检查 MobPushModule 是否存在
const safeCall = (method: string, ...args: any[]): any => {
  if (!MobPushModule || !MobPushModule[method]) {
    if (__DEV__) {
      console.warn(`MobPushModule.${method} is not available`);
    }
    return;
  }
  try {
    return MobPushModule[method](...args);
  } catch (error) {
    console.error(`Error calling MobPushModule.${method}:`, error);
    return;
  }
};

// 安全地获取属性
const safeGet = (property: string, defaultValue: any = undefined): any => {
  if (!MobPushModule) {
    return defaultValue;
  }
  return MobPushModule[property] ?? defaultValue;
};

/**
 * 获取推送设备信息
 * 返回 registrationID 和 deviceToken
 */
export async function getMobPushDeviceInfo(): Promise<{
  registrationID?: string;
  deviceToken?: string;
}> {
  const result: { registrationID?: string; deviceToken?: string } = {};

  try {
    // 获取 RegistrationID
    if (MobPushModule && MobPushModule.getRegistrationID) {
      const registrationID = await Promise.race([
        new Promise<string | undefined>(resolve => {
          const timer = setTimeout(() => resolve(undefined), 2000);
          try {
            MobPushModule.getRegistrationID(({ res }: { res: string }) => {
              clearTimeout(timer);
              resolve(res);
            });
          } catch (error) {
            clearTimeout(timer);
            console.error('Error getting registration ID:', error);
            resolve(undefined);
          }
        }),
        new Promise<string | undefined>(resolve =>
          setTimeout(() => resolve(undefined), 2500),
        ),
      ]);
      if (registrationID) {
        result.registrationID = registrationID;
      }
    }
  } catch (error) {
    console.error('Failed to get registration ID:', error);
  }

  try {
    // 获取 DeviceToken (仅 Android)
    if (
      Platform.OS !== 'ios' &&
      MobPushModule &&
      MobPushModule.getDeviceToken
    ) {
      const deviceToken = await Promise.race([
        new Promise<string | undefined>(resolve => {
          const timer = setTimeout(() => resolve(undefined), 1000);
          try {
            MobPushModule.getDeviceToken(({ res }: { res: string }) => {
              clearTimeout(timer);
              resolve(res);
            });
          } catch (error) {
            clearTimeout(timer);
            console.error('Error getting device token:', error);
            resolve(undefined);
          }
        }),
        new Promise<string | undefined>(resolve =>
          setTimeout(() => resolve(undefined), 1500),
        ),
      ]);
      if (deviceToken) {
        result.deviceToken = deviceToken;
      }
    }
  } catch (error) {
    console.error('Failed to get device token:', error);
  }

  if (__DEV__) {
    console.log('📱 推送设备信息:', result);
  }

  return result;
}

export default {
  submitPolicyGrantResult: (agree: boolean) => {
    // 通过 AppModule 调用，因为 MobPushModule 已被删除
    if (Platform.OS !== 'ios' && AppModule?.submitPolicyGrantResult) {
      try {
        AppModule.submitPolicyGrantResult(agree);
      } catch (error) {
        console.warn('AppModule.submitPolicyGrantResult call failed:', error);
      }
    }
  },
  toggleNotifeeCore: (enabled: boolean) => {
    if (Platform.OS !== 'ios') {
      try {
        AppModule?.toggleNotifeeCore?.(enabled);
      } catch (error) {
        console.warn('AppModule.toggleNotifeeCore call failed:', error);
      }
    }
  },
  toggleMobPushOEM: (enabled: boolean) => {
    if (Platform.OS !== 'ios') {
      try {
        AppModule?.toggleMobPushOEM?.(enabled);
      } catch (error) {
        console.warn('AppModule.toggleMobPushOEM call failed:', error);
      }
    }
  },
  onCustomMessageReceive: (callback: (result: any) => void) => {
    if (!MobPushModule) return;
    safeCall('addPushReceiver');
    listeners[callback.toString()] = DeviceEventEmitter.addListener(
      'onCustomMessageReceive',
      result => {
        callback(result);
      },
    );
  },
  offCustomMessageReceive: (callback: (result: any) => void) => {
    const key = callback.toString();
    if (!listeners[key]) {
      return;
    }
    listeners[key].remove();
    delete listeners[key];
  },
  onNotifyMessageReceive: (callback: (result: any) => void) => {
    if (!MobPushModule) return;
    safeCall('addPushReceiver');
    listeners[callback.toString()] = DeviceEventEmitter.addListener(
      'onNotifyMessageReceive',
      result => {
        callback(result);
      },
    );
  },
  offNotifyMessageReceive: (callback: (result: any) => void) => {
    const key = callback.toString();
    if (!listeners[key]) {
      return;
    }
    listeners[key].remove();
    delete listeners[key];
  },
  onNotifyMessageOpenedReceive: (callback: (result: any) => void) => {
    if (!MobPushModule) return;
    safeCall('addPushReceiver');
    listeners[callback.toString()] = DeviceEventEmitter.addListener(
      'onNotifyMessageOpenedReceive',
      result => {
        callback(result);
      },
    );
  },
  offNotifyMessageOpenedReceive: (callback: (result: any) => void) => {
    const key = callback.toString();
    if (!listeners[key]) {
      return;
    }
    listeners[key].remove();
    delete listeners[key];
  },
  onTagsCallback: (callback: (result: any) => void) => {
    if (!MobPushModule) return;
    safeCall('addPushReceiver');
    listeners[callback.toString()] = DeviceEventEmitter.addListener(
      'onTagsCallback',
      result => {
        callback(result);
      },
    );
  },
  offTagsCallback: (callback: (result: any) => void) => {
    const key = callback.toString();
    if (!listeners[key]) {
      return;
    }
    listeners[key].remove();
    delete listeners[key];
  },
  onAliasCallback: (callback: (result: any) => void) => {
    if (!MobPushModule) return;
    safeCall('addPushReceiver');
    listeners[callback.toString()] = DeviceEventEmitter.addListener(
      'onAliasCallback',
      result => {
        callback(result);
      },
    );
  },
  offAliasCallback: (callback: (result: any) => void) => {
    const key = callback.toString();
    if (!listeners[key]) {
      return;
    }
    listeners[key].remove();
    delete listeners[key];
  },
  getRegistrationID: (
    callback?: (res: string | undefined) => void,
  ): Promise<string | undefined> => {
    return new Promise(resolve => {
      if (!MobPushModule || !MobPushModule.getRegistrationID) {
        callback?.(undefined);
        resolve(undefined);
        return;
      }
      try {
        MobPushModule.getRegistrationID(({ res }: { res: string }) => {
          callback?.(res);
          resolve(res);
        });
      } catch (error) {
        console.error('Error getting registration ID:', error);
        callback?.(undefined);
        resolve(undefined);
      }
    });
  },
  getDeviceToken: (
    callback?: (res: string | undefined) => void,
  ): Promise<string | undefined> => {
    return new Promise(resolve => {
      if (Platform.OS !== 'ios') {
        if (!MobPushModule || !MobPushModule.getDeviceToken) {
          resolve(undefined);
          return;
        }
        const timer = setTimeout(() => {
          resolve(undefined);
        }, 1000);
        try {
          MobPushModule.getDeviceToken(({ res }: { res: string }) => {
            clearTimeout(timer);
            callback?.(res);
            resolve(res);
          });
        } catch (error) {
          clearTimeout(timer);
          console.error('Error getting device token:', error);
          callback?.(undefined);
          resolve(undefined);
        }
      } else {
        resolve(undefined);
      }
    });
  },
  setDebugLog: (status: boolean) => {
    if (Platform.OS === 'ios') {
      safeCall('setDebugLog', status);
    }
  },
  setAPNsForProduction: (type: number) => {
    if (Platform.OS === 'ios') {
      safeCall('setAPNsForProduction', type);
    }
  },
  setupNotification: (type: number) => {
    // const types = 1 | 2 | 4; // 1 (Badge) | 2 (Sound) | 4 (Alert) 把需要的值相加就是入参
    if (Platform.OS === 'ios') {
      safeCall('setupNotification', type);
    }
  },
  setAPNsShowForegroundType: (status: number) => {
    if (Platform.OS === 'ios') {
      safeCall('setAPNsShowForegroundType', status);
    }
  },
  registerAppKey: (appkey: string, appSecret: string) => {
    if (Platform.OS === 'ios') {
      safeCall('registerAppKey', appkey, appSecret);
    }
  },
  checkTcpStatus: (callback: (result: any) => void) => {
    if (Platform.OS !== 'ios') {
      safeCall('checkTcpStatus', callback);
    }
  },
  // 不能用Promise 可能会不返回
  isPushStopped: (callback: (res: boolean) => void) => {
    if (!MobPushModule || !MobPushModule.isPushStopped) {
      callback?.(false);
      return;
    }
    try {
      MobPushModule.isPushStopped(({ res }: { res: boolean }) => {
        callback?.(res);
      });
    } catch (error) {
      console.error('Error checking push stopped status:', error);
      callback?.(false);
    }
  },
  stopPush: () => safeCall('stopPush'),
  restartPush: () => safeCall('restartPush'),
  setAlias: (alias: string) => safeCall('setAlias', alias),
  getAlias: () => safeCall('getAlias'),
  deleteAlias: () => safeCall('deleteAlias'),
  addTags: (tags: string[]) => safeCall('addTags', tags),
  getTags: () => safeCall('getTags'),
  deleteTags: (tags: string[]) => safeCall('deleteTags', tags),
  cleanTags: () => safeCall('cleanTags'),
  addLocalNotification: (params: any, callback?: (result: any) => void) => {
    if (Platform.OS === 'ios') {
      safeCall('addNotification', params, callback);
    } else {
      safeCall('addLocalNotification', params, callback);
    }
  },
  removeLocalNotification: (
    notificationId: string,
    callback?: (result: any) => void,
  ) => {
    if (Platform.OS !== 'ios') {
      safeCall('removeLocalNotification', notificationId, callback);
    }
  },
  clearLocalNotifications: (callback?: (result: any) => void) => {
    if (Platform.OS !== 'ios') {
      safeCall('clearLocalNotifications', callback);
    }
  },
  setShowBadge: (showBadge: boolean) => {
    if (Platform.OS !== 'ios') {
      safeCall('setShowBadge', showBadge);
    }
  },
  setBadgeCounts: (count: number) => safeCall('setBadgeCounts', count),
  getShowBadge: () => safeCall('getShowBadge'),
  setNotificationMaxCount: (count: number) => {
    if (Platform.OS !== 'ios') {
      safeCall('setNotificationMaxCount', count);
    }
  },
  getNotificationMaxCount: (callback: (count: number) => void) => {
    if (Platform.OS !== 'ios') {
      if (!MobPushModule || !MobPushModule.getNotificationMaxCount) {
        callback?.(0);
        return;
      }
      try {
        MobPushModule.getNotificationMaxCount(callback);
      } catch (error) {
        console.error('Error getting notification max count:', error);
        callback?.(0);
      }
    }
  },
  // 不能用Promise 可能会不返回
  isNotificationsEnabled: (callback: (res: boolean) => void) => {
    if (!MobPushModule || !MobPushModule.isNotificationsEnabled) {
      callback?.(false);
      return;
    }
    try {
      MobPushModule.isNotificationsEnabled(({ res }: { res: boolean }) => {
        callback?.(res);
      });
    } catch (error) {
      console.error('Error checking notifications enabled:', error);
      callback?.(false);
    }
  },
  openNotifications: () => safeCall('openNotifications'),
  stopNotificationMonitor: () => {
    if (Platform.OS !== 'ios') {
      safeCall('stopNotificationMonitor');
    }
  },
  startNotificationMonitor: () => {
    if (Platform.OS !== 'ios') {
      safeCall('startNotificationMonitor');
    }
  },
  setSilenceTime: (
    startHour: number,
    startMinute: number,
    endHour: number,
    endMinute: number,
  ) => {
    if (Platform.OS !== 'ios') {
      safeCall('setSilenceTime', startHour, startMinute, endHour, endMinute);
    }
  },
  setClickNotificationToLaunchMainActivity: (isLaunch: boolean) => {
    if (Platform.OS !== 'ios') {
      safeCall('setClickNotificationToLaunchMainActivity', isLaunch);
    }
  },
  // ios
  MPushAuthorizationOptionsNone: safeGet('MPushAuthorizationOptionsNone', 0),
  MPushAuthorizationOptionsBadge: safeGet('MPushAuthorizationOptionsBadge', 1),
  MPushAuthorizationOptionsSound: safeGet('MPushAuthorizationOptionsSound', 2),
  MPushAuthorizationOptionsAlert: safeGet('MPushAuthorizationOptionsAlert', 4),
  MSendMessageTypeAPNs: safeGet('MSendMessageTypeAPNs', 1),
  MSendMessageTypeCustom: safeGet('MSendMessageTypeCustom', 2),
  MSendMessageTypeTimed: safeGet('MSendMessageTypeTimed', 3),
};
