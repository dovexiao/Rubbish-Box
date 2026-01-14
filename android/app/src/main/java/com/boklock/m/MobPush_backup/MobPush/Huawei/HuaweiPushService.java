package com.boklock.m.NativeModules.MobPush.Huawei;
import com.huawei.hms.push.HmsMessageService;
import com.huawei.hms.push.RemoteMessage;
import com.boklock.m.NativeModules.MobPush.MobPushLogger;

public class HuaweiPushService extends HmsMessageService {
  @Override
  public void onMessageReceived(RemoteMessage message) {
    // 判断消息是否为空
    if (message == null) {
      MobPushLogger.getInstance().d("HUAWEI:Received message entity is null!");
      return;
    }
    MobPushLogger.getInstance().d("HUAWEI:Received message entity is not null!");
    HuaweiPushReceiver huaweiPushReceiver = Huawei.getReceiver();

    huaweiPushReceiver.onNotifyMessageReceive(null, message);

    //    Boolean judgeWhetherIn10s = false;
    //    // 如果消息在10秒内没有处理，需要您自己创建新任务处理
    //    if (judgeWhetherIn10s) {
    //      startWorkManagerJob(message);
    //    } else {
    //      // 10秒内处理消息
    //      processWithin10s(message);
    //    }
  }
}
