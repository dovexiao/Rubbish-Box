import {DeviceEventEmitter, NativeModules, Platform} from 'react-native'

const {MobPushModule, AppModule} = NativeModules

// 检查 MobPushModule 是否存在
if (!MobPushModule) {
  console.warn('MobPushModule is not available. Push notifications may not work.')
}

if (Platform.OS === 'ios' && MobPushModule) {
  MobPushModule.addPushReceiver = () => {}
}

const listeners = {}

// 创建一个安全的包装函数，检查 MobPushModule 是否存在
const safeCall = (method: string, ...args: any[]) => {
  if (!MobPushModule || !MobPushModule[method]) {
    console.warn(`MobPushModule.${method} is not available`)
    return
  }
  try {
    return MobPushModule[method](...args)
  } catch (error) {
    console.error(`Error calling MobPushModule.${method}:`, error)
    return
  }
}

// 安全地获取属性
const safeGet = (property: string, defaultValue: any = undefined) => {
  if (!MobPushModule) {
    return defaultValue
  }
  return MobPushModule[property] ?? defaultValue
}

export default {
  submitPolicyGrantResult: (agree: boolean) => safeCall('submitPolicyGrantResult', agree),
  toggleNotifeeCore: (enabled: boolean) => {
    if (Platform.OS !== 'ios') {
      try {
        AppModule?.toggleNotifeeCore?.(enabled)
      } catch (error) {
        console.warn('AppModule.toggleNotifeeCore call failed:', error)
      }
    }
  },
  toggleMobPushOEM: (enabled: boolean) => {
    if (Platform.OS !== 'ios') {
      try {
        AppModule?.toggleMobPushOEM?.(enabled)
      } catch (error) {
        console.warn('AppModule.toggleMobPushOEM call failed:', error)
      }
    }
  },
  onCustomMessageReceive: callback => {
    if (!MobPushModule) return
    safeCall('addPushReceiver')
    listeners[callback] = DeviceEventEmitter.addListener('onCustomMessageReceive', result => {
      callback(result)
    })
  },
  offCustomMessageReceive: callback => {
    if (!listeners[callback]) {
      return
    }
    listeners[callback].remove()
    listeners[callback] = null
  },
  onNotifyMessageReceive: callback => {
    if (!MobPushModule) return
    safeCall('addPushReceiver')
    listeners[callback] = DeviceEventEmitter.addListener('onNotifyMessageReceive', result => {
      callback(result)
    })
  },
  offNotifyMessageReceive: callback => {
    if (!listeners[callback]) {
      return
    }
    listeners[callback].remove()
    listeners[callback] = null
  },
  onNotifyMessageOpenedReceive: callback => {
    if (!MobPushModule) return
    safeCall('addPushReceiver')
    listeners[callback] = DeviceEventEmitter.addListener('onNotifyMessageOpenedReceive', result => {
      callback(result)
    })
  },
  offNotifyMessageOpenedReceive: callback => {
    if (!listeners[callback]) {
      return
    }
    listeners[callback].remove()
    listeners[callback] = null
  },
  onTagsCallback: callback => {
    if (!MobPushModule) return
    safeCall('addPushReceiver')
    listeners[callback] = DeviceEventEmitter.addListener('onTagsCallback', result => {
      callback(result)
    })
  },
  offTagsCallback: callback => {
    if (!listeners[callback]) {
      return
    }
    listeners[callback].remove()
    listeners[callback] = null
  },
  onAliasCallback: callback => {
    if (!MobPushModule) return
    safeCall('addPushReceiver')
    listeners[callback] = DeviceEventEmitter.addListener('onAliasCallback', result => {
      callback(result)
    })
  },
  offAliasCallback: callback => {
    if (!listeners[callback]) {
      return
    }
    listeners[callback].remove()
    listeners[callback] = null
  },
  getRegistrationID: callback => {
    return new Promise(resolve => {
      if (!MobPushModule || !MobPushModule.getRegistrationID) {
        callback?.(undefined)
        resolve(undefined)
        return
      }
      try {
        MobPushModule.getRegistrationID(({res}) => {
          callback?.(res)
          resolve(res)
        })
      } catch (error) {
        console.error('Error getting registration ID:', error)
        callback?.(undefined)
        resolve(undefined)
      }
    })
  },
  getDeviceToken: callback => {
    return new Promise(resolve => {
      if (Platform.OS !== 'ios') {
        if (!MobPushModule || !MobPushModule.getDeviceToken) {
          resolve(undefined)
          return
        }
        const _timer = setTimeout(() => {
          resolve(undefined)
        }, 1000)
        try {
          MobPushModule.getDeviceToken(({res}) => {
            _timer && clearTimeout(_timer)
            callback?.(res)
            resolve(res)
          })
        } catch (error) {
          _timer && clearTimeout(_timer)
          console.error('Error getting device token:', error)
          callback?.(undefined)
          resolve(undefined)
        }
      } else {
        resolve(undefined)
      }
    })
  },
  setDebugLog: status => {
    if (Platform.OS === 'ios') {
      safeCall('setDebugLog', status)
    }
  },
  setAPNsForProduction: type => {
    if (Platform.OS === 'ios') {
      safeCall('setAPNsForProduction', type)
    }
  },
  setupNotification: type => {
    // const types = 1 | 2 | 4; // 1 (Badge) | 2 (Sound) | 4 (Alert) 把需要的值相加就是入参
    if (Platform.OS === 'ios') {
      safeCall('setupNotification', type)
    }
  },
  setAPNsShowForegroundType: status => {
    if (Platform.OS === 'ios') {
      safeCall('setAPNsShowForegroundType', status)
    }
  },
  registerAppKey: (appkey, appSecret) => {
    if (Platform.OS === 'ios') {
      safeCall('registerAppKey', appkey, appSecret)
    }
  },
  checkTcpStatus: callback => {
    if (Platform.OS !== 'ios') {
      safeCall('checkTcpStatus', callback)
    }
  },
  // 不能用Promise 可能会不返回
  isPushStopped: callback => {
    if (!MobPushModule || !MobPushModule.isPushStopped) {
      callback?.(false)
      return
    }
    try {
      MobPushModule.isPushStopped(({res}) => {
        callback?.(res)
      })
    } catch (error) {
      console.error('Error checking push stopped status:', error)
      callback?.(false)
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
  addLocalNotification: (params, callback) => {
    if (Platform.OS === 'ios') {
      safeCall('addNotification', params, callback)
    } else {
      safeCall('addLocalNotification', params, callback)
    }
  },
  removeLocalNotification: (notificationId, callback) => {
    if (Platform.OS !== 'ios') {
      safeCall('removeLocalNotification', notificationId, callback)
    }
  },
  clearLocalNotifications: callback => {
    if (Platform.OS !== 'ios') {
      safeCall('clearLocalNotifications', callback)
    }
  },
  setShowBadge: showBadge => {
    if (Platform.OS !== 'ios') {
      safeCall('setShowBadge', showBadge)
    }
  },
  setBadgeCounts: (count: number) => safeCall('setBadgeCounts', count),
  getShowBadge: () => safeCall('getShowBadge'),
  setNotificationMaxCount: count => {
    if (Platform.OS !== 'ios') {
      safeCall('setNotificationMaxCount', count)
    }
  },
  getNotificationMaxCount: callback => {
    if (Platform.OS !== 'ios') {
      if (!MobPushModule || !MobPushModule.getNotificationMaxCount) {
        callback?.(0)
        return
      }
      try {
        MobPushModule.getNotificationMaxCount(callback)
      } catch (error) {
        console.error('Error getting notification max count:', error)
        callback?.(0)
      }
    }
  },
  // 不能用Promise 可能会不返回
  isNotificationsEnabled: callback => {
    if (!MobPushModule || !MobPushModule.isNotificationsEnabled) {
      callback?.(false)
      return
    }
    try {
      MobPushModule.isNotificationsEnabled(({res}) => {
        callback?.(res)
      })
    } catch (error) {
      console.error('Error checking notifications enabled:', error)
      callback?.(false)
    }
  },
  openNotifications: () => safeCall('openNotifications'),
  stopNotificationMonitor: () => {
    if (Platform.OS !== 'ios') {
      safeCall('stopNotificationMonitor')
    }
  },
  startNotificationMonitor: () => {
    if (Platform.OS !== 'ios') {
      safeCall('startNotificationMonitor')
    }
  },
  setSilenceTime: (startHour, startMinute, endHour, endMinute) => {
    if (Platform.OS !== 'ios') {
      safeCall('setSilenceTime', startHour, startMinute, endHour, endMinute)
    }
  },
  setClickNotificationToLaunchMainActivity: isLaunch => {
    if (Platform.OS !== 'ios') {
      safeCall('setClickNotificationToLaunchMainActivity', isLaunch)
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
}
