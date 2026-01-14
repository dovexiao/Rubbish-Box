package com.boklock.m.NativeModules.MobPush.Huawei;


public class Huawei {
  static HuaweiPushReceiver huaweiPushReceiver;
  public static void setReceiver(final HuaweiPushReceiver var0) {
    if (huaweiPushReceiver == null) {
      huaweiPushReceiver = var0;
    }
  }
  public static HuaweiPushReceiver getReceiver() {
    return huaweiPushReceiver;
  }
}
