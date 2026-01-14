package com.boklock.m.NativeModules.MobPush.Huawei;

import android.content.Context;

import com.huawei.hms.push.RemoteMessage;

public interface HuaweiPushReceiver {
  void onNotifyMessageReceive(Context var1, RemoteMessage var2);
}
