import { DeviceEventEmitter, NativeModules, Platform } from 'react-native';

const { MobPushModule, AppModule } = NativeModules;

type AnyCallback = (...args: any[]) => void;
type EventCallback = (result: any) => void;
type ValueCallback<T = any> = (value: T | undefined) => void;
type BoolCallback = (value: boolean) => void;
type NumberCallback = (value: number) => void;

// 检查 MobPushModule 是否存在
if (!MobPushModule) {
  console.warn(
    'MobPushModule is not available. Push notifications may not work.',
  );
}

if (Platform.OS === 'ios' && MobPushModule) {
  MobPushModule.addPushReceiver = () => {};
}

const listeners = new Map<EventCallback, { remove: () => void }>();
const OPTIONAL_MOB_PUSH_METHODS = new Set(['stopPush', 'restartPush']);

// 创建一个安全的包装函数，检查 MobPushModule 是否存在
const safeCall = (method: string, ...args: any[]) => {
  if (!MobPushModule) {
    return;
  }
  try {
    const fn = MobPushModule[method];
    if (typeof fn !== 'function') {
      const isHarmony = Platform.OS !== 'ios' && Platform.OS !== 'android';
      if (isHarmony && OPTIONAL_MOB_PUSH_METHODS.has(method)) {
        return;
      }
      console.warn(
        `MobPushModule.${method} is not available or not a function`,
      );
      return;
    }
    return fn(...args);
  } catch (error) {
    console.error(`Error calling MobPushModule.${method}:`, error);
    return;
  }
};

// 安全地获取属性
const safeGet = (property: string, defaultValue: any = undefined) => {
  if (!MobPushModule) {
    return defaultValue;
  }
  return MobPushModule[property] ?? defaultValue;
};

const addPushEventListener = (eventName: string, callback: EventCallback) => {
  if (!MobPushModule) return;
  safeCall('addPushReceiver');
  const subscription = DeviceEventEmitter.addListener(eventName, result => {
    callback(result);
  });
  listeners.set(callback, subscription);
};

const removePushEventListener = (callback: EventCallback) => {
  const subscription = listeners.get(callback);
  if (!subscription) {
    return;
  }
  subscription.remove();
  listeners.delete(callback);
};

export default {
  submitPolicyGrantResult: (agree: boolean) =>
    safeCall('submitPolicyGrantResult', agree),
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
  onCustomMessageReceive: (callback: EventCallback) => {
    addPushEventListener('onCustomMessageReceive', callback);
  },
  offCustomMessageReceive: (callback: EventCallback) => {
    removePushEventListener(callback);
  },
  onNotifyMessageReceive: (callback: EventCallback) => {
    addPushEventListener('onNotifyMessageReceive', callback);
  },
  offNotifyMessageReceive: (callback: EventCallback) => {
    removePushEventListener(callback);
  },
  onNotifyMessageOpenedReceive: (callback: EventCallback) => {
    addPushEventListener('onNotifyMessageOpenedReceive', callback);
  },
  offNotifyMessageOpenedReceive: (callback: EventCallback) => {
    removePushEventListener(callback);
  },
  onTagsCallback: (callback: EventCallback) => {
    addPushEventListener('onTagsCallback', callback);
  },
  offTagsCallback: (callback: EventCallback) => {
    removePushEventListener(callback);
  },
  onAliasCallback: (callback: EventCallback) => {
    addPushEventListener('onAliasCallback', callback);
  },
  offAliasCallback: (callback: EventCallback) => {
    removePushEventListener(callback);
  },
  getRegistrationID: (callback?: ValueCallback<any>) => {
    return new Promise(resolve => {
      if (!MobPushModule || !MobPushModule.getRegistrationID) {
        callback?.(undefined);
        resolve(undefined);
        return;
      }
      try {
        MobPushModule.getRegistrationID(({ res }: { res?: any }) => {
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
  getDeviceToken: (callback?: ValueCallback<any>) => {
    return new Promise(resolve => {
      if (Platform.OS !== 'ios') {
        if (!MobPushModule || !MobPushModule.getDeviceToken) {
          resolve(undefined);
          return;
        }
        const _timer = setTimeout(() => {
          resolve(undefined);
        }, 1000);
        try {
          MobPushModule.getDeviceToken(({ res }: { res?: any }) => {
            _timer && clearTimeout(_timer);
            callback?.(res);
            resolve(res);
          });
        } catch (error) {
          _timer && clearTimeout(_timer);
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
  setAPNsShowForegroundType: (status: boolean) => {
    if (Platform.OS === 'ios') {
      safeCall('setAPNsShowForegroundType', status);
    }
  },
  registerAppKey: (appkey: string, appSecret: string) => {
    if (Platform.OS === 'ios') {
      safeCall('registerAppKey', appkey, appSecret);
    }
  },
  checkTcpStatus: (callback?: EventCallback) => {
    if (Platform.OS !== 'ios') {
      safeCall('checkTcpStatus', callback);
    }
  },
  // 不能用Promise 可能会不返回
  isPushStopped: (callback?: BoolCallback) => {
    if (!MobPushModule || !MobPushModule.isPushStopped) {
      callback?.(false);
      return;
    }
    try {
      MobPushModule.isPushStopped(({ res }: { res?: boolean }) => {
        callback?.(res ?? false);
      });
    } catch (error) {
      console.error('Error checking push stopped status:', error);
      callback?.(false);
    }
  },
  stopPush: () => {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      return;
    }
    safeCall('stopPush');
  },
  restartPush: () => {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      return;
    }
    safeCall('restartPush');
  },
  setAlias: (alias: string) => safeCall('setAlias', alias),
  getAlias: () => safeCall('getAlias'),
  deleteAlias: () => safeCall('deleteAlias'),
  addTags: (tags: string[]) => safeCall('addTags', tags),
  getTags: () => safeCall('getTags'),
  deleteTags: (tags: string[]) => safeCall('deleteTags', tags),
  cleanTags: () => safeCall('cleanTags'),
  addLocalNotification: (
    params: Record<string, any>,
    callback?: AnyCallback,
  ) => {
    if (Platform.OS === 'ios') {
      safeCall('addNotification', params, callback);
    } else {
      safeCall('addLocalNotification', params, callback);
    }
  },
  removeLocalNotification: (
    notificationId: string | number,
    callback?: AnyCallback,
  ) => {
    if (Platform.OS !== 'ios') {
      safeCall('removeLocalNotification', notificationId, callback);
    }
  },
  clearLocalNotifications: (callback?: AnyCallback) => {
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
  getNotificationMaxCount: (callback?: NumberCallback) => {
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
  isNotificationsEnabled: (callback?: BoolCallback) => {
    if (!MobPushModule || !MobPushModule.isNotificationsEnabled) {
      callback?.(false);
      return;
    }
    try {
      MobPushModule.isNotificationsEnabled(({ res }: { res?: boolean }) => {
        callback?.(res ?? false);
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
