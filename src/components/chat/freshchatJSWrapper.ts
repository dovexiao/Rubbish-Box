import {
  EmitterSubscription,
  NativeEventEmitter,
  NativeModules,
  Platform,
} from 'react-native';
import {errorLog} from '../utils';
const {RNFreshchat} = NativeModules;
declare var emitter: any;
// const _eventHandlers = {};
const _eventHandlers: Record<string, Map<Function, EmitterSubscription>> = {};
const version = '1.0';

const rn_sdk_version_placeholder = '{{rn-version}}';
const platform_name_placeholder = '{{platform}}';
const platform_sdk_version_placeholder = '{{platform-version}}';
const android_platform_name = 'android';
const ios_platform_name = 'ios';
const sdk_version_placeholder =
  'rn-' +
  rn_sdk_version_placeholder +
  '-' +
  platform_name_placeholder +
  '-' +
  platform_sdk_version_placeholder;

const isAndroid = function () {
  return !isIos();
};

const isIos = function () {
  return Platform.OS === 'ios';
};

const registerForRestoreIdUpdates = function (register: any) {
  RNFreshchat.registerForRestoreIdUpdates(register);
};

const registerForMessageCountUpdates = function (register: any) {
  RNFreshchat.registerForMessageCountUpdates(register);
};

const registerUserInteractionListerner = function (register: any) {
  RNFreshchat.registerUserInteractionListerner(register);
};

const registerForOpeningLink = function (register: any) {
  RNFreshchat.registerForOpeningLink(register);
};

const registerForLocaleChangedByWebview = function (register: any) {
  RNFreshchat.registerForOpeningLink(register);
};

const registerForUserActions = function (register: any) {
  RNFreshchat.registerForUserActions(register);
};

const registerNotificationClickListener = function (register: any) {
  RNFreshchat.registerNotificationClickListener(register);
};

const registerForJWTRefresh = function (register: any) {
  RNFreshchat.registerForJWTRefresh(register);
};

const enableNativeListenerForType = function (type: any, enable: boolean) {
  switch (type) {
    case RNFreshchat.ACTION_UNREAD_MESSAGE_COUNT_CHANGED:
      registerForMessageCountUpdates(enable);
      break;
    case RNFreshchat.ACTION_USER_RESTORE_ID_GENERATED:
      registerForRestoreIdUpdates(enable);
      break;
    case RNFreshchat.ACTION_USER_INTERACTION:
      registerUserInteractionListerner(enable);
      break;
    case RNFreshchat.ACTION_OPEN_LINKS:
      registerForOpeningLink(enable);
      break;
    case RNFreshchat.ACTION_LOCALE_CHANGED_BY_WEBVIEW:
      registerForLocaleChangedByWebview(enable);
      break;
    case RNFreshchat.ACTION_FRESHCHAT_EVENTS:
      registerForUserActions(enable);
      break;
    case RNFreshchat.FRESHCHAT_ACTION_NOTIFICATION_CLICK_LISTENER:
      registerNotificationClickListener(enable);
      break;
    case RNFreshchat.ACTION_SET_TOKEN_TO_REFRESH_DEVICE_PROPERTIES:
      registerForJWTRefresh(enable);
      break;
  }
};

const eventsList = function (key: string) {
  const events: Record<string, string> = {
    EVENT_EXTERNAL_LINK_CLICKED: RNFreshchat.ACTION_OPEN_LINKS,
    EVENT_LOCALE_CHANGED_BY_WEBVIEW:
      RNFreshchat.ACTION_LOCALE_CHANGED_BY_WEBVIEW,
    EVENT_UNREAD_MESSAGE_COUNT_CHANGED:
      RNFreshchat.ACTION_UNREAD_MESSAGE_COUNT_CHANGED,
    EVENT_USER_RESTORE_ID_GENERATED:
      RNFreshchat.ACTION_USER_RESTORE_ID_GENERATED,
    EVENT_USER_INTERACTED: RNFreshchat.ACTION_USER_INTERACTION,
    FRESHCHAT_EVENTS: RNFreshchat.ACTION_FRESHCHAT_EVENTS,
    FRESHCHAT_NOTIFICATION_CLICKED:
      RNFreshchat.FRESHCHAT_ACTION_NOTIFICATION_CLICK_LISTENER,
    EVENT_SET_TOKEN_TO_REFRESH_DEVICE_PROPERTIES:
      RNFreshchat.ACTION_SET_TOKEN_TO_REFRESH_DEVICE_PROPERTIES,
  };
  return events[key];
};

const FreshchatJSWrapper = {
  EVENT_EXTERNAL_LINK_CLICKED: eventsList('EVENT_EXTERNAL_LINK_CLICKED'),
  EVENT_ANDROID_LOCALE_CHANGED_BY_WEBVIEW: eventsList(
    'EVENT_LOCALE_CHANGED_BY_WEBVIEW',
  ),
  EVENT_UNREAD_MESSAGE_COUNT_CHANGED: eventsList(
    'EVENT_UNREAD_MESSAGE_COUNT_CHANGED',
  ),
  EVENT_USER_RESTORE_ID_GENERATED: eventsList(
    'EVENT_USER_RESTORE_ID_GENERATED',
  ),
  EVENT_USER_INTERACTED: eventsList('EVENT_USER_INTERACTED'),
  FRESHCHAT_EVENTS: eventsList('FRESHCHAT_EVENTS'),
  FRESHCHAT_NOTIFICATION_CLICKED: eventsList('FRESHCHAT_NOTIFICATION_CLICKED'),
  EVENT_SET_TOKEN_TO_REFRESH_DEVICE_PROPERTIES: eventsList(
    'EVENT_SET_TOKEN_TO_REFRESH_DEVICE_PROPERTIES',
  ),

  getChannelId: function (callback: any) {
    RNFreshchat.getChannelIdWithString(callback);
  },

  init: function (freshchatConfig: any) {
    RNFreshchat.init(freshchatConfig);
  },

  showFAQs: function (faqOptions: any) {
    if (faqOptions) {
      RNFreshchat.showFAQsWithOptions(faqOptions);
    } else {
      RNFreshchat.showFAQs();
    }
  },

  showConversations: function (conversationOptions: null | any) {
    if (conversationOptions) {
      RNFreshchat.showConversationsWithOptions(conversationOptions);
    } else {
      RNFreshchat.showConversations();
    }
  },

  resetUser: function () {
    RNFreshchat.resetUser();
  },

  getUnreadCountAsync: function (callback: any, tags: any) {
    try {
      if (tags) {
        RNFreshchat.getUnreadCountAsyncForTags(callback, tags);
      } else {
        RNFreshchat.getUnreadCountAsync(callback);
      }
    } catch (err) {
      errorLog(err);
    }
  },

  setUser: function (user: any, errorCallback: Function) {
    RNFreshchat.setUser(user, errorCallback);
  },

  setUserWithIdToken: function (jwt: string, errorCallback: Function) {
    if (isAndroid()) {
      RNFreshchat.setUserWithIdToken(jwt, errorCallback);
    } else {
      RNFreshchat.setUserWithIdToken(jwt);
    }
  },

  getUser: function (callback: any) {
    RNFreshchat.getUser(callback);
  },

  getSDKVersionCode: function (callback: (arg0: string) => void) {
    RNFreshchat.getSDKVersionCode((native_sdk_version: string) => {
      var platformName = '';
      if (isAndroid()) {
        platformName = android_platform_name;
      } else {
        platformName = ios_platform_name;
      }

      var reactNativeVersion = sdk_version_placeholder;
      reactNativeVersion = reactNativeVersion.replace(
        rn_sdk_version_placeholder,
        version,
      );
      reactNativeVersion = reactNativeVersion.replace(
        platform_name_placeholder,
        platformName,
      );
      reactNativeVersion = reactNativeVersion.replace(
        platform_sdk_version_placeholder,
        native_sdk_version,
      );

      callback(reactNativeVersion);
    });
  },

  setUserProperties: function (userProperties: any, errorCallback: Function) {
    RNFreshchat.setUserProperties(userProperties, errorCallback);
  },

  setBotVariables: function (variables: any, botSpecificVariables: any) {
    RNFreshchat.setBotVariables(variables, botSpecificVariables);
  },
  sendMessage: function (freshchatMessage: any) {
    RNFreshchat.sendMessage(freshchatMessage);
  },

  identifyUser: function (
    externalId: string,
    restoreId: string,
    errorCallback: Function,
  ) {
    RNFreshchat.identifyUser(externalId, restoreId, errorCallback);
  },

  restoreUserWithIdToken: function (jwt: string, errorCallback: Function) {
    if (isAndroid()) {
      RNFreshchat.restoreUser(jwt, errorCallback);
    } else {
      RNFreshchat.restoreUser(jwt);
    }
  },

  getUserIdTokenStatus: function (callback: Function) {
    RNFreshchat.getUserIdTokenStatus(callback);
  },

  getFreshchatUserId: function (callback: Function) {
    RNFreshchat.getFreshchatUserId(callback);
  },

  /**
   * Function to dismiss Freshchat SDK screens
   *
   * @since 0.4.5
   */
  dismissFreshchatViews: function () {
    RNFreshchat.dismissFreshchatViews();
  },

  setNotificationConfig: function (freshchatNotificationConfig: any) {
    RNFreshchat.setNotificationConfig(freshchatNotificationConfig);
  },

  setPushRegistrationToken: function (token: any) {
    RNFreshchat.setPushRegistrationToken(token);
  },

  isFreshchatNotification: function (payload: any, callback: Function) {
    RNFreshchat.isFreshchatNotification(payload, callback);
  },

  handlePushNotification: function (payload: any) {
    RNFreshchat.handlePushNotification(payload);
  },

  openFreshchatDeeplink: function (link: any) {
    RNFreshchat.openFreshchatDeeplink(link);
  },

  trackEvent: function (name: any, properties: any) {
    RNFreshchat.trackEvent(name, properties);
  },

  notifyAppLocaleChange: function () {
    RNFreshchat.notifyAppLocaleChange();
  },

  addEventListener: function (type: string, handler: (event: any) => void) {
    if (!emitter) {
      emitter = new NativeEventEmitter(RNFreshchat);
    }
    const listener = emitter.addListener(type, handler);
    let shouldStartNativeListener = false;
    if (!_eventHandlers[type]) {
      _eventHandlers[type] = new Map();
      shouldStartNativeListener = true;
    }

    _eventHandlers[type].set(handler, listener);
    if (shouldStartNativeListener) {
      enableNativeListenerForType(type, true);
    }
  },

  // removeEventListener: function (type, handler) {
  //     if (!_eventHandlers[type].has(handler)) {
  //         return;
  //     }
  //     _eventHandlers[type].get(handler).remove();
  //     _eventHandlers[type].delete(handler);
  //
  //     if (_eventHandlers[type].size === 0) {
  //         _eventHandlers[type] = undefined;
  //         enableNativeListenerForType(type, false);
  //     }
  // },

  removeEventListeners: function (type: string) {
    if (!_eventHandlers[type]) {
      return;
    }

    const eventSubscriptionsMap = _eventHandlers[type];
    if (eventSubscriptionsMap) {
      eventSubscriptionsMap.forEach(subscription => {
        if (subscription) {
          subscription.remove();
        }
      });
    }
    //TODO 类型
    _eventHandlers[type] = new Map();
    enableNativeListenerForType(type, false);
  },

  transformPushNotificationIOSPayloadToNativePayload: function (reactPayload: {
    _data: any;
    _alert: any;
    _badgeCount: any;
  }) {
    var nativePayload = reactPayload._data;

    var load = {
      alert: reactPayload._alert,
      badge: reactPayload._badgeCount,
      sound: 'default',
    };
    var apsPayload = {aps: load};
    var payload = Object.assign({}, apsPayload, nativePayload);
    return payload;
  },

  // isAppActiveWhenReceivingNotification: function (nativePayload) {
  //     if (nativePayload.isActive !== undefined) {
  //         return nativePayload.isActive;
  //     } else {
  //         return false;
  //     }
  // },
};

export default FreshchatJSWrapper;
