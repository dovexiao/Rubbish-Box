//
//  XDAudioManager.h
//  XDAudioManager
//
//  Created by sanshao on 2024/9/29.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface XDAudioManager : NSObject
+ (instancetype)sharedInstance;
-(NSArray *)getMusicFileArrayWithNum:(NSString *)numStr prefix:(NSString *)prefix;
- (void)mergeAVAssetWithSourceURLs:(NSArray *)sourceURLsArr
                trimEndMilliseconds:(NSInteger)trimEndMilliseconds
                        completed:(void (^)(NSString * soundName,NSURL * soundsFileURL)) completed;
@end

NS_ASSUME_NONNULL_END
