package com.boklock.m.NativeModules.MobPush.Honor;


public class Honor {
  static HonorPushReceiver honorPushReceiver;
  public static void setReceiver(final HonorPushReceiver var0) {
    if (honorPushReceiver == null) {
      honorPushReceiver = var0;
    }
  }
  public static HonorPushReceiver getReceiver() {
    return honorPushReceiver;
  }
}
