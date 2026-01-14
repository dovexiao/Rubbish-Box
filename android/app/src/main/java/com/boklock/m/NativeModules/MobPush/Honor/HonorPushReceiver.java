package com.boklock.m.NativeModules.MobPush.Honor;

import android.content.Context;

import com.hihonor.push.sdk.HonorPushDataMsg;

public interface HonorPushReceiver {
  void onNotifyMessageReceive(Context var1, HonorPushDataMsg var2);
}
