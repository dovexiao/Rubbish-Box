//
//  NotificationServices.m
//  CashierPushServices
//
//  Created by sanshao on 2024/9/29.
//

#import "NotificationServices.h"
#import <AVFoundation/AVFoundation.h>
#import "XDAudioManager.h"

@interface NotificationServices ()

@property (nonatomic, strong) void (^contentHandler)(UNNotificationContent *contentToDeliver);
@property (nonatomic, strong) UNMutableNotificationContent *bestAttemptContent;
@property (nonatomic, strong) NSMutableArray *pendingNotifications;
@property (nonatomic, assign) BOOL isProcessingNotification;

@end

@implementation NotificationServices

+ (void)load {
    NSLog(@"进入 Extension 已加载");
}

- (instancetype)init {
    self = [super init];
    if (self) {
        self.pendingNotifications = [NSMutableArray array];
        self.isProcessingNotification = NO;
        NSLog(@"进入 Extension 已初始化");
    }
    return self;
}

- (void)didReceiveNotificationRequest:(UNNotificationRequest *)request withContentHandler:(void (^)(UNNotificationContent * _Nonnull))contentHandler {
    NSDictionary *notificationInfo = @{
        @"request": request,
        @"contentHandler": contentHandler
    };
    [self.pendingNotifications addObject:notificationInfo];

    if (!self.isProcessingNotification) {
        [self processNextNotification];
    }
}

- (void)processNextNotification {
    if (self.pendingNotifications.count == 0) {
        self.isProcessingNotification = NO;
        return;
    }

    self.isProcessingNotification = YES;
    NSDictionary *notificationInfo = self.pendingNotifications.firstObject;
    [self.pendingNotifications removeObjectAtIndex:0];

    UNNotificationRequest *request = notificationInfo[@"request"];
    self.contentHandler = notificationInfo[@"contentHandler"];
    self.bestAttemptContent = [request.content mutableCopy];

    NSMutableDictionary *dict = [self.bestAttemptContent.userInfo mutableCopy];
    NSLog(@"进入 service notification %@",dict);
    NSString *pushDataString = dict[@"pushData"];
    NSData *pushData = [pushDataString dataUsingEncoding:NSUTF8StringEncoding];
    NSDictionary *pushDataDict = [NSJSONSerialization JSONObjectWithData:pushData options:0 error:nil];
    NSString *amount = pushDataDict[@"amount"];
    NSString *type = pushDataDict[@"type"];
    NSString *payType = pushDataDict[@"payType"];
    if (amount && [amount floatValue] > 0 && [type isEqualToString:@"payVoiceNotice"]) {
        NSLog(@"数量xxx");
        NSArray *instArr = [XDAudioManager.sharedInstance getMusicFileArrayWithNum:amount prefix:payType];
        NSLog(@"数量 %@",instArr);
        [XDAudioManager.sharedInstance mergeAVAssetWithSourceURLs:instArr trimEndMilliseconds:100 completed:^(NSString * _Nonnull soundName, NSURL * _Nonnull soundsFileURL) {
            NSLog(@"数量soundName %@", soundName);
            NSLog(@"soundsFileURL %@", soundsFileURL);

            if(soundName.length == 0){
                self.contentHandler(self.bestAttemptContent);
                return;
            }

            // 检查声音文件是否存在
            BOOL fileExists = [[NSFileManager defaultManager] fileExistsAtPath:soundsFileURL.path];
            NSLog(@"声音文件是否存在: %d", fileExists);

            // 创建声音对象并检查
            UNNotificationSound *sound = [UNNotificationSound soundNamed:soundName];
            NSLog(@"创建的声音对象: %@", sound);

            self.bestAttemptContent.sound = sound;

            // 设置通知的其他属性
            if (@available(iOS 15.0, *)) {
                self.bestAttemptContent.interruptionLevel = UNNotificationInterruptionLevelTimeSensitive;
            }

            // 检查最终的通知内容
            NSLog(@"最终通知内容: %@", self.bestAttemptContent);
            NSLog(@"通知的声音设置: %@", self.bestAttemptContent.sound);

            self.contentHandler(self.bestAttemptContent);

            [self processNextNotification];
        }];
    } else {
        self.contentHandler(self.bestAttemptContent);

        [self processNextNotification];
    }
}

- (void)serviceExtensionTimeWillExpire {
    // Called just before the extension will be terminated by the system.
    // Use this as an opportunity to deliver your "best attempt" at modified content, otherwise the original push payload will be used.
    self.contentHandler(self.bestAttemptContent);
}

@end
