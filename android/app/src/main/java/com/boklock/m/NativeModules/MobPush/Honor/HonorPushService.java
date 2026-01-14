package com.boklock.m.NativeModules.MobPush.Honor;
import com.hihonor.push.sdk.HonorMessageService;
import com.hihonor.push.sdk.HonorPushDataMsg;
import com.boklock.m.NativeModules.MobPush.MobPushLogger;

public class HonorPushService extends HonorMessageService {
  @Override
  public void onNewToken(String pushToken) {
    MobPushLogger.getInstance().d("HONOR:Received token" + pushToken);
  }
  @Override
  public void onMessageReceived(HonorPushDataMsg message) {
    // 判断消息是否为空
    if (message == null) {
      MobPushLogger.getInstance().d("HONOR:Received message entity is null!");
      return;
    }
    MobPushLogger.getInstance().d("HONOR:Received message entity is not null!");
    HonorPushReceiver honorPushReceiver = Honor.getReceiver();

    honorPushReceiver.onNotifyMessageReceive(null, message);

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
