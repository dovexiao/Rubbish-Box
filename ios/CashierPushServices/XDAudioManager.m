//
//  XDAudioManager.m
//  XDAudioManager
//
//  Created by sanshao on 2024/9/29.
//

#import "XDAudioManager.h"
#import "NotificationServices.h"
#import <AVFoundation/AVFoundation.h>
@implementation XDAudioManager
+ (instancetype)sharedInstance{
    static XDAudioManager *_instance = nil ;
    static dispatch_once_t onceToken ;
    dispatch_once(&onceToken, ^{
        _instance = [[XDAudioManager alloc] init] ;
    }) ;
    return _instance ;
}
/// 获取的金额中每个音频文件的地址数组
/// @param numStr 实际的金额，比如15.4
/// @param prefix 前缀音频文件名（如 "boklock"）
-(NSArray *)getMusicFileArrayWithNum:(NSString *)numStr prefix:(NSString *)prefix
{
    // 获取 Extension 的 Bundle
    NSBundle *extensionBundle = [NSBundle bundleForClass:[self class]];
    NSLog(@"Extension Bundle Path: %@", extensionBundle.bundlePath);

    // 检查所有可用的资源文件
    NSArray *resources = [NSBundle pathsForResourcesOfType:@"mp3" inDirectory:extensionBundle.bundlePath];
    NSLog(@"所有可用的 MP3 文件: %@", resources);

    // 检查传入的参数
    NSLog(@"传入的 prefix: %@", prefix);

    NSString *path = [extensionBundle pathForResource:prefix ofType:@"mp3"];
    NSLog(@"查找的音频文件路径: %@", path);

    NSMutableArray *finalArr = [[NSMutableArray alloc] initWithObjects:path, nil];

    // 获取金额的中文字符串
    NSString *finalStr = [self caculateNumber:numStr];
    NSLog(@"转换后的金额字符串: %@", finalStr);

    for (int i = 0; i < finalStr.length; i++) {
        NSString *str = [finalStr substringWithRange:NSMakeRange(i, 1)];
        NSString *path = [extensionBundle pathForResource:str ofType:@"mp3"];
        NSLog(@"字符 %@ 的音频文件路径: %@", str, path);

        if (path) {
            [finalArr addObject:path];
        } else {
            NSLog(@"警告：找不到字符 %@ 的音频文件", str);
        }
    }

    NSLog(@"最终音频文件数组: %@", finalArr);
    return finalArr;
}

-(NSString *)caculateNumber:(NSString *)numstr {
    NSArray *numberchar = @[@"0",@"1",@"2",@"3",@"4",@"5",@"6",@"7",@"8",@"9"];
    NSArray *inunitchar = @[@"",@"十",@"百",@"千"];
    NSArray *unitname   = @[@"",@"万",@"亿"];

    NSString *valstr =[NSString stringWithFormat:@"%.2f",numstr.doubleValue] ;

    NSString *prefix = @"" ;

    // 将金额分为整数部分和小数部分
    NSString *head = [valstr substringToIndex:valstr.length - 2 - 1] ;
    NSString *foot = [valstr substringFromIndex:valstr.length - 2] ;

//    if (head.length>8) {
//        return nil ;//只支持到千万，抱歉哈
//    }

    // 处理整数部分
    if([head isEqualToString:@"0"]) {
        prefix = @"0" ;
    }
    else {
        NSMutableArray *ch = [[NSMutableArray alloc]init] ;
        for (int i = 0; i < head.length; i++) {
            NSString * str = [NSString stringWithFormat:@"%x",[head characterAtIndex:i]-'0'] ;
            [ch addObject:str] ;
        }

        int zeronum = 0 ;
        for (int i = 0; i < ch.count; i++) {
            NSInteger index = (ch.count-1 - i)%4 ;       //取段内位置
            NSInteger indexloc = (ch.count-1 - i)/4 ;    //取段位置

            if ([[ch objectAtIndex:i]isEqualToString:@"0"]) {
                zeronum ++ ;
            }
            else {
                if (zeronum != 0) {
                    if (index != 3) {
                        prefix=[prefix stringByAppendingString:@"零"];
                    }
                    zeronum = 0;
                }
                if (ch.count >i) {
                    NSInteger numIndex = [[ch objectAtIndex:i]intValue];
                    if (numberchar.count >numIndex) {
                        prefix = [prefix stringByAppendingString:[numberchar objectAtIndex:numIndex]] ;
                    }
                }

                if (inunitchar.count >index) {
                    prefix = [prefix stringByAppendingString:[inunitchar objectAtIndex:index]] ;
                }

            }
            if (index == 0 && zeronum < 4) {
                if (unitname.count >indexloc) {
                    prefix = [prefix stringByAppendingString:[unitname objectAtIndex:indexloc]] ;

                }
            }
        }
    }

    //1十开头的改为十
      if([prefix hasPrefix:@"1十"]) {
          prefix = [prefix stringByReplacingOccurrencesOfString:@"1十" withString:@"十"] ;
      }

    //处理小数部分
    if([foot isEqualToString:@"00"]) {
        prefix = [prefix stringByAppendingString:@"元"] ;
    }
    else {
        prefix = [prefix stringByAppendingString:[NSString stringWithFormat:@"点%@元", foot]] ;
    }
    return prefix ;
}

///在AppGroup中合并音频
/// @param sourceURLsArr 音频文件URL数组
/// @param trimEndMilliseconds 需要在每段音频结尾裁剪的毫秒数
- (void)mergeAVAssetWithSourceURLs:(NSArray *)sourceURLsArr
                 trimEndMilliseconds:(NSInteger)trimEndMilliseconds
                         completed:(void (^)(NSString * soundName,NSURL * soundsFileURL)) completed {
    AVMutableComposition *composition = [AVMutableComposition composition];
    __block CMTime beginTime = kCMTimeZero;

    [sourceURLsArr enumerateObjectsUsingBlock:^(id  _Nonnull audioFileURL, NSUInteger idx, BOOL * _Nonnull stop) {
        AVURLAsset *audioAsset = [AVURLAsset assetWithURL:[NSURL fileURLWithPath:audioFileURL]];
        AVMutableCompositionTrack *audioTrack = [composition addMutableTrackWithMediaType:AVMediaTypeAudio preferredTrackID:0];
        AVAssetTrack *audioAssetTrack = [[audioAsset tracksWithMediaType:AVMediaTypeAudio] firstObject];

        // 计算需要裁剪的时间
        CMTime trimDuration = CMTimeMake(trimEndMilliseconds * 1000000, 1000000000); // 转换毫秒到CMTime
        CMTime originalDuration = audioAsset.duration;
        CMTime newDuration = CMTimeSubtract(originalDuration, trimDuration);

        // 确保不会出现负数时长
        if (CMTimeCompare(newDuration, kCMTimeZero) > 0) {
            [audioTrack insertTimeRange:CMTimeRangeMake(kCMTimeZero, newDuration)
                              ofTrack:audioAssetTrack
                               atTime:beginTime
                               error:nil];
            beginTime = CMTimeAdd(beginTime, newDuration);
        } else {
            // 如果音频时长小于裁剪时长，则使用原始时长
            [audioTrack insertTimeRange:CMTimeRangeMake(kCMTimeZero, originalDuration)
                              ofTrack:audioAssetTrack
                               atTime:beginTime
                               error:nil];
            beginTime = CMTimeAdd(beginTime, originalDuration);
        }
    }];

    //用动态日期会占用空间
//    NSDateFormatter *formater = [[NSDateFormatter alloc] init];
//    [formater setDateFormat:@"yyyy-MM-dd-HH:mm:ss-SSS"];
//    NSString * timeFromDateStr = [formater stringFromDate:[NSDate date]];
//    NSString *outPutFilePath = [NSHomeDirectory() stringByAppendingFormat:@"/tmp/sound-%@.mp4", timeFromDateStr];

    NSURL *groupURL = [[NSFileManager defaultManager] containerURLForSecurityApplicationGroupIdentifier: @"group.nse.com.boklock.m"];
//    NSURL * soundsURL = [groupURL URLByAppendingPathComponent:@"/Library/Sounds/" isDirectory:YES];
    //建立文件夹
    NSURL * soundsURL = [groupURL URLByAppendingPathComponent:@"Library/" isDirectory:YES];
    if (![[NSFileManager defaultManager] contentsOfDirectoryAtPath:soundsURL.path error:nil]) {
        [[NSFileManager defaultManager] createDirectoryAtPath:soundsURL.path withIntermediateDirectories:YES attributes:nil error:nil];
    }
    //建立文件夹
    NSURL * soundsURL2 = [groupURL URLByAppendingPathComponent:@"Library/Sounds/" isDirectory:YES];
    if (![[NSFileManager defaultManager] contentsOfDirectoryAtPath:soundsURL2.path error:nil]) {
        [[NSFileManager defaultManager] createDirectoryAtPath:soundsURL2.path withIntermediateDirectories:YES attributes:nil error:nil];
    }
    // 新建文件名，如果存在就删除旧的
    NSString * soundName = [NSString stringWithFormat:@"sound.m4a"];
    NSString *outPutFilePath = [NSString stringWithFormat:@"Library/Sounds/%@", soundName];
    NSURL * soundsFileURL = [groupURL URLByAppendingPathComponent:outPutFilePath isDirectory:NO];
//    NSString * filePath = soundsURL.absoluteString;
    if ([[NSFileManager defaultManager] fileExistsAtPath:soundsFileURL.path]) {
        [[NSFileManager defaultManager] removeItemAtPath:soundsFileURL.path error:nil];
    }
    //导出合并后的音频文件
    //音频文件目前只找到支持m4a 类型的
    AVAssetExportSession *session = [[AVAssetExportSession alloc]initWithAsset:composition presetName:AVAssetExportPresetAppleM4A];
    // 音频文件输出
    session.outputURL = soundsFileURL;
    session.outputFileType = AVFileTypeAppleM4A; //与上述的`present`相对应
    session.shouldOptimizeForNetworkUse = YES;   //优化网络
    [session exportAsynchronouslyWithCompletionHandler:^{
        if (session.status == AVAssetExportSessionStatusCompleted) {
            NSLog(@"合并成功----%@", outPutFilePath);
            if (completed) {
                completed(soundName,soundsFileURL);
            }
        } else {
            // 其他情况, 具体请看这里`AVAssetExportSessionStatus`.
            NSLog(@"合并失败----%ld", (long)session.status);
            if (completed) {
                completed(@"", nil);
            }
        }
    }];
}
@end
