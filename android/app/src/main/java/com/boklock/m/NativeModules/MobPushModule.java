package com.boklock.m.NativeModules;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Message;
import android.provider.Settings;
import android.text.TextUtils;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationManagerCompat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.Promise;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.boklock.m.NativeModules.MobPush.Honor.Honor;
import com.boklock.m.NativeModules.MobPush.Honor.HonorPushReceiver;
import com.boklock.m.NativeModules.MobPush.Huawei.Huawei;
import com.boklock.m.NativeModules.MobPush.Huawei.HuaweiPushReceiver;
import com.boklock.m.NativeModules.MobPush.VoiceSpeaker;
import com.boklock.m.NativeModules.MobPush.VoiceSynthesize;
import com.mob.MobSDK;
import com.mob.pushsdk.MobPush;
import com.mob.pushsdk.MobPushCallback;
import com.mob.pushsdk.MobPushCustomMessage;
import com.mob.pushsdk.MobPushLocalNotification;
import com.mob.pushsdk.MobPushNotifyMessage;
import com.mob.pushsdk.MobPushReceiver;
import com.mob.tools.utils.Hashon;
import com.mob.tools.utils.UIHandler;
import com.boklock.m.NativeModules.MobPush.CollectionUtils;
import com.boklock.m.NativeModules.MobPush.MobPushLogger;
import com.boklock.m.NativeModules.MobPush.ObjectUtils;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;


public class MobPushModule extends ReactContextBaseJavaModule {
  private VoiceSpeaker mVoiceSpeaker;
  private MobPushReceiver cacheMobPushReceiver;
  private HuaweiPushReceiver cacheHuaweiPushReceiver;
  private HonorPushReceiver cacheHonorPushReceiver;

  private final ReactApplicationContext reactContext;
  public static final String POST_NOTIFICATIONS="android.permission.POST_NOTIFICATIONS";
  private final Hashon hashon;
  public static final int MSG_UI = (int) System.currentTimeMillis();

  public MobPushModule(ReactApplicationContext reactContext) {
      super(reactContext);
      this.reactContext = reactContext;
      hashon = new Hashon();
      mVoiceSpeaker = VoiceSpeaker.getInstance(reactContext);
      mVoiceSpeaker.setPlayRatio(0.9f);
      mVoiceSpeaker.setPlaySpeed(1.2f);
      mVoiceSpeaker.setMinMaxPlayEnd(100, 1500);
  }

    private static boolean sInited = false;

    private void initIfNeeded() {
      if (!sInited) {
        try {
          MobSDK.init(reactContext);
          sInited = true;
        } catch (Throwable t) {
          MobPushLogger.getInstance().e("MobSDK.init failed: " + String.valueOf(t));
        }
      }
    }

  @NonNull
  @Override
  public String getName() {
      return "MobPushModule";
  }

  /**
   * 隐私协议接口
   *
   */
  @ReactMethod
  public void submitPolicyGrantResult(boolean agree) {
      MobPushLogger.getInstance().d("submitPolicyGrantResult agree=" + agree);
      if (agree) {
        initIfNeeded();
      }
      MobSDK.submitPolicyGrantResult(agree);
  }

  /**
   * 通知回调
   */
  @ReactMethod
  public void addPushReceiver() {
    MobPushLogger.getInstance().d("addListener");
    if (cacheMobPushReceiver == null) {
      cacheMobPushReceiver = new MobPushReceiver() {
        @Override
        public void onCustomMessageReceive(Context context, MobPushCustomMessage mobPushCustomMessage) {
          MobPushLogger.getInstance().d("onCustomMessageReceive");
          String customMessage = hashon.fromObject(mobPushCustomMessage);
          final WritableMap map = Arguments.createMap();
          map.putBoolean("success", true);
          map.putString("res", customMessage);
          map.putString("error", null);
          sendEvent(reactContext, "onCustomMessageReceive", map);
        }

        @Override
        public void onNotifyMessageReceive(Context context, MobPushNotifyMessage mobPushNotifyMessage) {
          MobPushLogger.getInstance().d("onNotifyMessageReceive");
          String notifyMessage = hashon.fromObject(mobPushNotifyMessage);
          final WritableMap map = Arguments.createMap();
          map.putBoolean("success", true);
          map.putString("res", notifyMessage);
          map.putString("error", null);
          HashMap<String, String> extrasMap = mobPushNotifyMessage.getExtrasMap();

          sendEvent(reactContext, "onNotifyMessageReceive", map);
          if (Objects.equals(extrasMap.get("type"), "payVoiceNotice")) {
            mVoiceSpeaker.putQueue(new VoiceSynthesize()
              .prefix(extrasMap.get("payType"))
              .numString(extrasMap.get("amount"))
              .build());
          } else if (extrasMap.get("pushData") != null) {
            String data = extrasMap.get("pushData");
            Gson g = new Gson();
            JsonObject myData = g.fromJson(data, JsonObject.class);
            if (Objects.equals(myData.get("type").getAsString(), "payVoiceNotice")) {
              mVoiceSpeaker.putQueue(new VoiceSynthesize()
                .prefix(myData.get("payType").getAsString())
                .numString(myData.get("amount").getAsString())
                .build());
            }

          }
        }

        @Override
        public void onNotifyMessageOpenedReceive(Context context, MobPushNotifyMessage mobPushNotifyMessage) {
          MobPushLogger.getInstance().d("onNotifyMessageOpenedReceive");
          String notifyMessage = hashon.fromObject(mobPushNotifyMessage);
          final WritableMap map = Arguments.createMap();
          map.putBoolean("success", true);
          map.putString("res", notifyMessage);
          map.putString("error", null);
          sendEvent(reactContext, "onNotifyMessageOpenedReceive", map);

          MobPushLogger.getInstance().d("onNotifyMessageOpenedReceive: 点击推送消息");
          // 获取推送扩展参数中的 scheme_url
          HashMap<String, String> extrasMap = mobPushNotifyMessage.getExtrasMap();
          String schemeUrl = extrasMap != null ? extrasMap.get("scheme_url") : null;
          
          // 匹配 boklock://message 时，发送跳转事件到RN层
          if ("boklock://message".equals(schemeUrl)) {
            MobPushLogger.getInstance().d("匹配到消息页面Scheme，发送跳转事件");
            WritableMap jumpMap = Arguments.createMap();
            jumpMap.putString("pagePath", "/pages/user/message/index");
            sendEvent(reactContext, "jumpToPage", jumpMap);
            
            // 唤醒App主Activity（确保点击推送能打开App）
            Intent mainIntent = reactContext.getPackageManager()
                    .getLaunchIntentForPackage(reactContext.getPackageName());
            if (mainIntent != null) {
              mainIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED);
              context.startActivity(mainIntent);
            }
          }
        }

        @Override
        public void onTagsCallback(Context context, String[] tags, int operation, int errorCode) {
          MobPushLogger.getInstance().d("onTagsCallback");
          WritableMap params = Arguments.createMap();
          WritableArray tagArray = Arguments.createArray();
          if (ObjectUtils.nonNull(tags)) {
            for (String tag : tags) {
              tagArray.pushString(tag);
            }
          }
          if (errorCode == 0) {
            params.putBoolean("success", true);
          } else {
            params.putBoolean("success", false);
          }
          params.putArray("res", tagArray);
          params.putInt("operation", operation);
          params.putInt("error", errorCode);
          sendEvent(reactContext, "onTagsCallback", params);
        }

        @Override
        public void onAliasCallback(Context context, String alias, int operation, int errorCode) {
          MobPushLogger.getInstance().d("onAliasCallback");
          WritableMap params = Arguments.createMap();
          if (errorCode == 0) {
            params.putBoolean("success", true);
          } else {
            params.putBoolean("success", false);
          }
          params.putString("alias", alias);
          params.putInt("operation", operation);
          params.putInt("errorCode", errorCode);
          sendEvent(reactContext, "onAliasCallback", params);
        }
      };
      MobPush.addPushReceiver(cacheMobPushReceiver);
    }
    if (cacheHuaweiPushReceiver == null) {
      cacheHuaweiPushReceiver = (context, message) -> {
        MobPushLogger.getInstance().d("onHuaweiNotifyMessageReceive");
        Map<String, String> extrasMap = message.getDataOfMap();

        MobPushLogger.getInstance().d("get Data: " + message.getData()
          + "\n getFrom: " + message.getFrom()
          + "\n getTo: " + message.getTo()
          + "\n getMessageId: " + message.getMessageId()
          + "\n getSentTime: " + message.getSentTime()
          + "\n getDataMap: " + message.getDataOfMap()
          + "\n getMessageType: " + message.getMessageType()
          + "\n getTtl: " + message.getTtl());

        if (Objects.equals(extrasMap.get("type"), "payVoiceNotice")) {
          mVoiceSpeaker.putQueue(new VoiceSynthesize()
            .prefix(extrasMap.get("payType"))
            .numString(extrasMap.get("amount"))
            .build());
        }
      };
      Huawei.setReceiver(cacheHuaweiPushReceiver);
    }
    if (cacheHonorPushReceiver == null) {
      cacheHonorPushReceiver = (context, message) -> {
        MobPushLogger.getInstance().d("onHonorNotifyMessageReceive");
        String data = message.getData();
        MobPushLogger.getInstance().d("get Data: " + data);
        Gson g = new Gson();
        JsonObject myData = g.fromJson(data, JsonObject.class);

        if (Objects.equals(myData.get("type").getAsString(), "payVoiceNotice")) {
          MobPushLogger.getInstance().d("荣耀开始播放");
          mVoiceSpeaker.putQueue(new VoiceSynthesize()
            .prefix(myData.get("payType").getAsString())
            .numString(myData.get("amount").getAsString())
            .build());
        }
      };
      Honor.setReceiver(cacheHonorPushReceiver);
    }
  }

  @ReactMethod
  public void removePushReceiver(Integer count) {
    MobPushLogger.getInstance().d("removePushReceiver");
    //共用，所以不做处理
//    if (cacheMobPushReceiver != null) {
//      MobPush.removePushReceiver(cacheMobPushReceiver);
//    }
  }

  // 推送服务接口
    /**
     * 获取rid
     *
     * @param callback
     */
    @ReactMethod
    public void getRegistrationID(final Callback callback) {
        MobPushLogger.getInstance().d("call getRegistrationID");
        MobPush.getRegistrationId(new MobPushCallback<String>() {
            private boolean callbackInvoked = false;
            @Override
            public void onCallback(final String s) {
                final WritableMap map = Arguments.createMap();
                map.putBoolean("success", true);
                map.putString("res", s);
                map.putString("error", null);
                if (!TextUtils.isEmpty(s)) {
                    sendEvent(reactContext, "registrationId", map);
                }
                if (ObjectUtils.nonNull(callback)) {
                    synchronized (this) {
                        if (!callbackInvoked) {
                            callbackInvoked = true;
                            callback.invoke(map);
                        }
                    }
                }
            }
        });
    }

  /**
   * 获取DeviceToken
   *
   * @param callback
   */
  @ReactMethod
  public void getDeviceToken(final Callback callback) {
    MobPushLogger.getInstance().d("call getDeviceToken");
    MobPush.getDeviceToken(new MobPushCallback<String>() {
      private boolean callbackInvoked = false;
      @Override
      public void onCallback(final String s) {
        final WritableMap map = Arguments.createMap();
        map.putBoolean("success", true);
        map.putString("res", s);
        map.putString("error", null);
        if (ObjectUtils.nonNull(callback)) {
          synchronized (this) {
            if (!callbackInvoked) {
              callbackInvoked = true;
              callback.invoke(map);
            }
          }
        }
      }
    });
  }

  /**
   * 获取tcpStatus
   *
   * @param callback
   */
  @ReactMethod
  public void checkTcpStatus(final Callback callback) {
    MobPushLogger.getInstance().d("call checkTcpStatus");
    MobPush.checkTcpStatus(new MobPushCallback<Boolean>() {
      private boolean callbackInvoked = false;
      @Override
      public void onCallback(final Boolean s) {
        final WritableMap map = Arguments.createMap();
        map.putBoolean("success", true);
        map.putBoolean("res", s);
        map.putString("error", null);
        if (ObjectUtils.nonNull(callback)) {
          synchronized (this) {
            if (!callbackInvoked) {
              callbackInvoked = true;
              callback.invoke(map);
            }
          }
        }
      }
    });
  }

  /**
   * 判断通知是否开启
   *
   * @param callback 回调通知开启状态
   */
  @ReactMethod
  public void isPushStopped(final Callback callback) {
    MobPushLogger.getInstance().d("isPushStopped");
    MobPush.isPushStopped(new MobPushCallback<Boolean>() {
      private boolean callbackInvoked = false;
      @Override
      public void onCallback(Boolean aBoolean) {
        final WritableMap map = Arguments.createMap();
        map.putBoolean("success", true);
        map.putBoolean("res", aBoolean);
        map.putString("error", null);
        if (ObjectUtils.nonNull(callback)) {
          synchronized (this) {
            if (!callbackInvoked) {
              callbackInvoked = true;
              callback.invoke(map);
            }
          }
        }
      }
    });
  }

    /**
     * 停止推送
     */
    @ReactMethod
    public void stopPush() {
        MobPushLogger.getInstance().d("stopPush");
        MobPush.stopPush();
    }

    /**
     * 开启推送
     */
    @ReactMethod
    public void restartPush() {
        MobPushLogger.getInstance().d("restartPush");
        MobPush.restartPush();
    }

    // 别名接口

    @ReactMethod
    public void setAlias(String alias) {
        MobPushLogger.getInstance().d("setAlias");
        MobPush.setAlias(alias);
    }

    @ReactMethod
    public void getAlias() {
        MobPushLogger.getInstance().d("getAlias");
        MobPush.getAlias();
    }

    @ReactMethod
    public void deleteAlias() {
        MobPushLogger.getInstance().d("deleteAlias");
        MobPush.deleteAlias();
    }

    // 标签接口

    @ReactMethod
    public void addTags(ReadableMap array) {
        MobPushLogger.getInstance().d("addTags");
        ReadableArray arrayArray = array.getArray("tags");
        String[] tags = new String[arrayArray.size()];
        if (CollectionUtils.isEmpty(arrayArray)) {
            return;
        }
        for (int i = 0; i < arrayArray.size(); i++) {
            tags[i] = arrayArray.getString(i);
        }
        MobPush.addTags(tags);
    }

    @ReactMethod
    public void getTags() {
        MobPushLogger.getInstance().d("getTags");
        MobPush.getTags();
    }

    @ReactMethod
    public void replaceTags() {
        MobPushLogger.getInstance().d("replaceTags");
    }

    @ReactMethod
    public void deleteTags(ReadableMap map) {
        MobPushLogger.getInstance().d("deleteTags");
        ReadableArray arrayArray = map.getArray("tags");
        String[] tags = new String[arrayArray.size()];
        if (CollectionUtils.isEmpty(arrayArray)) {
            return;
        }
        for (int i = 0; i < arrayArray.size(); i++) {
            tags[i] = arrayArray.getString(i);
        }
        MobPush.deleteTags(tags);
    }

    @ReactMethod
    public void cleanTags() {
        MobPushLogger.getInstance().d("cleanAllTags");
        MobPush.cleanTags();
    }

    // 本地通知接口
    @ReactMethod
    public void addLocalNotification(ReadableMap readableMap, final Callback callback) {
      MobPushLogger.getInstance().d("addLocalNotification");
      MobPushLocalNotification localNotification = new MobPushLocalNotification();
      if (readableMap.hasKey("title")) {
        localNotification.setTitle(readableMap.getString("title"));
      }
      if (readableMap.hasKey("content")) {
        localNotification.setContent(readableMap.getString("content"));
      }

      if (readableMap.hasKey("voice")) {
        localNotification.setVoice(readableMap.getBoolean("voice"));
      }

      if (readableMap.hasKey("shake")) {
        localNotification.setShake(readableMap.getBoolean("shake"));
      }

      if (readableMap.hasKey("light")) {
        localNotification.setLight(readableMap.getBoolean("light"));
      }

      if (readableMap.hasKey("allowBubbles")) {
        localNotification.setAllowBubbles(readableMap.getBoolean("allowBubbles"));
      }

      if (readableMap.hasKey("lockscreenVisible")) {
        localNotification.setLockscreenVisible(readableMap.getBoolean("lockscreenVisible"));
      }

      if (readableMap.hasKey("imagePath")) {
        localNotification.setImagePath(readableMap.getString("imagePath"));
      }

      if (readableMap.hasKey("image")) {
        localNotification.setImage(readableMap.getString("image"));
      }

      if (readableMap.hasKey("icon")) {
        localNotification.setIcon(readableMap.getString("icon"));
      }

      if (readableMap.hasKey("customStyleType")) {
        localNotification.setCustomStyleType(readableMap.getInt("customStyleType"));
      }

      if (readableMap.hasKey("style")) {
        localNotification.setStyle(readableMap.getInt("style"));
      }

      if (readableMap.hasKey("androidBadgeType")) {
        localNotification.setAndroidBadgeType(readableMap.getInt("androidBadgeType"));
      }

      if (readableMap.hasKey("androidBadge")) {
        localNotification.setAndroidBadge(readableMap.getInt("androidBadge"));
      }

      if (readableMap.hasKey("importance")) {
        localNotification.setImportance(readableMap.getInt("importance"));
      }
      if (readableMap.hasKey("category")) {
        localNotification.setCategory(readableMap.getString("category"));
      }
      if (readableMap.hasKey("notificationId")) {
        localNotification.setNotificationId(readableMap.getInt("notificationId"));
      }

      MobPush.addLocalNotification(localNotification, new MobPushCallback<Boolean>() {
        private boolean callbackInvoked = false;
        @Override
        public void onCallback(Boolean aBoolean) {
          final WritableMap map = Arguments.createMap();
          map.putBoolean("success", true);
          map.putBoolean("res", aBoolean);
          map.putString("error", null);
          if (ObjectUtils.nonNull(callback)) {
            synchronized (this) {
              if (!callbackInvoked) {
                callbackInvoked = true;
                callback.invoke(map);
              }
            }
          }
        }
      });
    }

    @ReactMethod
    public void removeLocalNotification(Integer notificationId, final Callback callback) {
      MobPushLogger.getInstance().d("removeLocalNotification");

      MobPush.removeLocalNotification(notificationId, new MobPushCallback<Boolean>() {
        private boolean callbackInvoked = false;
        @Override
        public void onCallback(Boolean aBoolean) {
          final WritableMap map = Arguments.createMap();
          map.putBoolean("success", true);
          map.putBoolean("res", aBoolean);
          map.putString("error", null);
          if (ObjectUtils.nonNull(callback)) {
            synchronized (this) {
              if (!callbackInvoked) {
                callbackInvoked = true;
                callback.invoke(map);
              }
            }
          }
        }
      });
    }

    @ReactMethod
    public void clearLocalNotifications(final Callback callback) {
      MobPushLogger.getInstance().d("clearLocalNotifications");
      MobPush.clearLocalNotifications(new MobPushCallback<Boolean>() {
        private boolean callbackInvoked = false;
        @Override
        public void onCallback(Boolean aBoolean) {
          final WritableMap map = Arguments.createMap();
          map.putBoolean("success", true);
          map.putBoolean("res", aBoolean);
          map.putString("error", null);
          if (ObjectUtils.nonNull(callback)) {
            synchronized (this) {
              if (!callbackInvoked) {
                callbackInvoked = true;
                callback.invoke(map);
              }
            }
          }
        }
      });
    }


    // 角标接口

    @ReactMethod
    public void setShowBadge(final boolean badgeCount) {
        MobPushLogger.getInstance().d("setShowBadge");
        MobPush.setShowBadge(badgeCount);
    }

    @ReactMethod
    public void setBadgeCounts(final int counts) {
      MobPushLogger.getInstance().d("setShowBadge");
      MobPush.setBadgeCounts(counts);
    }

    @ReactMethod
    public void getShowBadge(final Callback callback) {
      MobPushLogger.getInstance().d("getShowBadge");
      MobPush.getShowBadge(new MobPushCallback<Boolean>() {
        private boolean callbackInvoked = false;
        @Override
        public void onCallback(Boolean aBoolean) {
          final WritableMap map = Arguments.createMap();
          map.putBoolean("success", true);
          map.putBoolean("res", aBoolean);
          map.putString("error", null);
          if (ObjectUtils.nonNull(callback)) {
            synchronized (this) {
              if (!callbackInvoked) {
                callbackInvoked = true;
                callback.invoke(map);
              }
            }
          }
        }
      });
    }

  // 通知栏接口
  @ReactMethod
  public void setNotificationMaxCount(final int counts) {
    MobPushLogger.getInstance().d("setNotificationMaxCount");
    MobPush.setNotificationMaxCount(counts);
  }

  @ReactMethod
  public void getNotificationMaxCount(final Callback callback) {
    MobPushLogger.getInstance().d("getNotificationMaxCount");
    MobPush.getNotificationMaxCount(new MobPushCallback<Integer>() {
      private boolean callbackInvoked = false;
      @Override
      public void onCallback(Integer s) {
        final WritableMap map = Arguments.createMap();
        map.putBoolean("success", true);
        map.putInt("res", s);
        map.putString("error", null);
        if (ObjectUtils.nonNull(callback)) {
          synchronized (this) {
            if (!callbackInvoked) {
              callbackInvoked = true;
              callback.invoke(map);
            }
          }
        }
      }
    });
  }

  // 通知权限接口

  /**
   * 判断通知权限是否开启
   *
   * @param callback 回调通知开启状态
   */
  @ReactMethod
  public void isNotificationsEnabled(final Callback callback) {
    MobPushLogger.getInstance().d("isNotificationsEnabled");
    MobPush.isNotificationsEnabled(new MobPushCallback<Boolean>() {
      private boolean callbackInvoked = false;
      @Override
      public void onCallback(Boolean aBoolean) {
        final WritableMap map = Arguments.createMap();
        map.putBoolean("success", true);
        map.putBoolean("res", aBoolean);
        map.putString("error", null);
        if (ObjectUtils.nonNull(callback)) {
          synchronized (this) {
            if (!callbackInvoked) {
              callbackInvoked = true;
              callback.invoke(map);
            }
          }
        }
      }
    });
  }

  /**
   * 开启通知权限
   */
  @ReactMethod
  public void openNotifications() {
    MobPushLogger.getInstance().d("openNotifications");
    if (Build.VERSION.SDK_INT >= 33) {
      if (ActivityCompat.checkSelfPermission(reactContext, POST_NOTIFICATIONS) == PackageManager.PERMISSION_DENIED) {
        if (!ActivityCompat.shouldShowRequestPermissionRationale(reactContext.getCurrentActivity(), POST_NOTIFICATIONS)) {
          enableNotification();
        }else{
          ActivityCompat.requestPermissions(reactContext.getCurrentActivity(), new String[]{POST_NOTIFICATIONS},100);
        }
      }
    } else {
      boolean enabled = NotificationManagerCompat.from(reactContext).areNotificationsEnabled();
      if (!enabled) {
        enableNotification();
      }
    }
  }

  /**
   * 关闭通知轮训开关
   */
  @ReactMethod
  public void stopNotificationMonitor() {
    MobPushLogger.getInstance().d("stopNotificationMonitor");
    MobPush.stopNotificationMonitor();
  }

  /**
   * 开启通知轮训开关
   */
  @ReactMethod
  public void startNotificationMonitor() {
    MobPushLogger.getInstance().d("startNotificationMonitor");
    MobPush.startNotificationMonitor();
  }

  /**
   * 设置通知忽扰静音
   */
  @ReactMethod
  public void setSilenceTime(int startHour, int startMinute, int endHour, int endMinute) {
    MobPushLogger.getInstance().d("setSilenceTime");
    MobPush.setSilenceTime(startHour, startMinute, endHour, endMinute);
  }

  /**
   * 点击通知是否启动主页
   */
  @ReactMethod
  public void setClickNotificationToLaunchMainActivity(Boolean isLaunch) {
    MobPushLogger.getInstance().d("setClickNotificationToLaunchMainActivity");
    MobPush.setClickNotificationToLaunchMainActivity(isLaunch);
  }


  private void sendEvent(ReactContext reactContext, String eventName, WritableMap params) {
      reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
  }
  private void enableNotification() {
    Intent localIntent = new Intent();
    //直接跳转到应用通知设置的代码：
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {//8.0及以上
      localIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      localIntent.setAction("android.settings.APPLICATION_DETAILS_SETTINGS");
      localIntent.setData(Uri.fromParts("package", reactContext.getPackageName(), null));
    } else if (android.os.Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {//5.0以上到8.0以下
      localIntent.setAction("android.settings.APP_NOTIFICATION_SETTINGS");
      localIntent.putExtra("app_package", reactContext.getPackageName());
      localIntent.putExtra("app_uid", reactContext.getApplicationInfo().uid);
    } else if (android.os.Build.VERSION.SDK_INT == Build.VERSION_CODES.KITKAT) {//4.4
      localIntent.setAction(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
      localIntent.addCategory(Intent.CATEGORY_DEFAULT);
      localIntent.setData(Uri.parse("package:" + reactContext.getPackageName()));
    } else {
      //4.4以下没有从app跳转到应用通知设置页面的Action，可考虑跳转到应用详情页面,
      localIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      if (Build.VERSION.SDK_INT >= 9) {
        localIntent.setAction("android.settings.APPLICATION_DETAILS_SETTINGS");
        localIntent.setData(Uri.fromParts("package", reactContext.getPackageName(), null));
      } else if (Build.VERSION.SDK_INT <= 8) {
        localIntent.setAction(Intent.ACTION_VIEW);
        localIntent.setClassName("com.android.settings", "com.android.setting.InstalledAppDetails");
        localIntent.putExtra("com.android.settings.ApplicationPkgName", reactContext.getPackageName());
      }
    }
    reactContext.startActivity(localIntent);
  }

  @ReactMethod
  public void getInitialNotification(Promise promise) {
    android.app.Activity currentActivity = getCurrentActivity();
    if (currentActivity != null) {
      android.content.Intent intent = currentActivity.getIntent();
      if (intent != null && intent.hasExtra("pushData")) {
        String pushData = intent.getStringExtra("pushData");
        WritableMap map = Arguments.createMap();
        map.putBoolean("success", true);
        map.putString("res", pushData);
        map.putString("error", null);
        promise.resolve(map);
        intent.removeExtra("pushData");
        return;
      }
    }
    promise.resolve(null);
  }
}
