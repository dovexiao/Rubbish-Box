#import <Foundation/Foundation.h>
#import "SSZipCommon.h"

extern NSString *const SSZipArchiveErrorDomain;
typedef unsigned long uLong;
typedef NS_ENUM(NSInteger, SSZipArchiveErrorCode) {
    SSZipArchiveErrorCodeFailedOpenZipFile             = -1,
    SSZipArchiveErrorCodeFailedOpenFileInZip           = -2,
    SSZipArchiveErrorCodeFileInfoNotLoadable           = -3,
    SSZipArchiveErrorCodeFileContentNotReadable        = -4,
    SSZipArchiveErrorCodeFailedToWriteFile             = -5,
    SSZipArchiveErrorCodeInvalidArguments              = -6,
    SSZipArchiveErrorCodeSymlinkEscapesTargetDirectory = -7,
};

@protocol SSZipArchiveDelegate;

@interface SSZipArchive : NSObject

+ (BOOL)unzipFileAtPath:(NSString *)path
          toDestination:(NSString *)destination
                  error:(NSError **)error;

@end
