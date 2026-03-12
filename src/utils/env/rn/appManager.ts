import { NativeModules, Platform, Linking } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { getVersion, getAppVer } from '@/services/common';
import {
  getStorage,
  setStorage,
  isVersionBefore,
  compareVersion,
  showLoading,
  hideLoading,
} from '@/utils';
import { DEPLOY_ENV, DEPLOY_VERSION } from '@/config';
import { thirdRequest } from '../../request';

const IOS_PLATFORM = Platform.OS === 'ios';
const IS_ANDROID = Platform.OS === 'android';
const IS_HARMONY = !IOS_PLATFORM && !IS_ANDROID;

let RNFetchBlob: any = null;
let RNRestart: any = null;
if (IOS_PLATFORM || IS_ANDROID) {
  try {
    RNFetchBlob = require('rn-fetch-blob').default || require('rn-fetch-blob');
    RNRestart =
      require('react-native-restart').default ||
      require('react-native-restart');
  } catch (e) {
    console.warn('Native modules load failed', e);
  }
}

const { AppModule }: any = NativeModules;

export const appPush: any = () => {};

enum UPDATE_STATUS {
  INIT,
  CHECKING,
  DOWNLOAD_FINISH,
  UNZIPING,
}

const appUpdateInfo: {
  status: UPDATE_STATUS;
  url: string;
  updateType?: 'app' | 'bundle';
} = {
  status: UPDATE_STATUS.INIT,
  url: '',
  updateType: undefined,
};

const APP_UPDATE_SKIP_KEY = 'APP_UPDATE_SKIP_INFO';
const APP_UPDATE_PENDING_INSTALL_KEY = 'APP_UPDATE_PENDING_INSTALL';

//把字节转换成正常文件大小
function getFilesize(size: number) {
  if (!size) return '';
  const num = 1024.0; //byte
  if (size < num) return size + 'B';
  if (size < num ** 2) return (size / num).toFixed(1) + 'KB'; //kb
  if (size < Math.pow(num, 3)) return (size / num ** 2).toFixed(1) + 'MB'; //M
  if (size < num ** 4) return (size / num ** 3).toFixed(1) + 'G'; //G
  return (size / num ** 4).toFixed(1) + 'T'; //T
}
function initAppUpdateInfo() {
  appUpdateInfo.url = '';
  appUpdateInfo.updateType = undefined;
  appUpdateInfo.status = UPDATE_STATUS.INIT;
}
async function onHotUpdateReady(callback: (bundleZipFile?: string) => void) {
  if (IS_HARMONY || !RNFetchBlob) {
    callback();
    return;
  }
  const client = IOS_PLATFORM ? 'ios' : 'android';
  const vInfo = await getVersion({ client });
  try {
    const versionFile = AppModule.dirPath + '/boklock/bundle/version';
    const hasLocalVersion = await RNFetchBlob.fs.exists(versionFile);
    const localVersion = hasLocalVersion
      ? (await RNFetchBlob.fs.readFile(versionFile, 'utf8'))
          .split(/\r?\n/)[0]
          ?.trim()
      : undefined;
    const currentVersion = localVersion || DEPLOY_VERSION;
    if (
      vInfo.success &&
      vInfo.data &&
      currentVersion &&
      isVersionBefore(currentVersion, vInfo.data)
    ) {
      const bundleZipFile = AppModule.dirPath + '/boklock/boklock.zip';
      RNFetchBlob.config({ path: bundleZipFile })
        .fetch(
          'GET',
          `https://g.18qjz.cn/${DEPLOY_ENV}/sbqfc-fed/boklock/${client}/${vInfo.data}/build/boklock.zip`,
        )
        // .progress({interval: 250}, (received, total) => {
        //   const percent = (received / total) * 100
        //   callback?.onProgress(
        //     getFilesize(received),
        //     getFilesize(total),
        //     parseInt(percent.toString()),
        //   )
        // })
        .then(() => {
          callback(bundleZipFile);
        })
        .catch(() => {
          callback();
        });
    } else {
      callback();
    }
  } catch {
    callback();
  }
}

async function checkAppVersionByApi(checkStorage: boolean): Promise<
  | false
  | {
      id: number;
      version: string;
      content: string;
      packageUrl?: string;
      forceUpdate: number;
      isLast?: boolean;
    }
> {
  try {
    const client = IS_HARMONY ? 'harmony' : IOS_PLATFORM ? 'ios' : 'android';
    const currentVersion = DeviceInfo.getVersion() || '';
    const res: any = await getAppVer({
      platform: client,
      version: currentVersion,
    });
    if (!res?.success || !res?.data) return false;
    const info = res.data as any;
    const id = info.id;
    const serverVersion: string | undefined = info.version;
    const content: string = info.content || '';
    const packageUrl: string | undefined = info.packageUrl;
    const forceUpdate: number = info.forceUpdate ?? 0;
    const isLast: boolean | undefined =
      typeof info.isLast === 'boolean' ? info.isLast : undefined;

    // 后端判断是否为最新版本
    if (isLast === true) return false;
    if (!serverVersion) return false;

    // 非强制更新时，检查今天是否已经点击过“暂不更新”
    if (!forceUpdate && checkStorage) {
      try {
        const skipInfo: any = await getStorage({
          key: APP_UPDATE_SKIP_KEY,
        }).catch(() => undefined);

        const now = Date.now();

        // 兼容旧版的 date 逻辑以及新版的 timestamp 逻辑
        if (skipInfo?.id === id) {
          if (skipInfo?.timestamp) {
            // 需要严格等到第二天 0 点以后才提醒
            // 比如 2月10日晚上23点点的，过了0点变成了2月11日，这就意味着可再次提示了
            const lastDate = new Date(skipInfo.timestamp).toDateString();
            const todayDate = new Date(now).toDateString();
            if (lastDate === todayDate) {
              return false; // 还在同一天，不弹
            }
          } else if (skipInfo?.date) {
            const today = new Date().toDateString();
            if (skipInfo.date === today) {
              return false; // 还在同一天，不弹
            }
          }
        }
      } catch {}
    }

    return {
      id,
      version: serverVersion,
      content,
      packageUrl,
      forceUpdate,
      isLast,
    };
  } catch (e) {
    console.warn('checkAppVersionByApi error:', e);
    return false;
  }
}

// 基于 /boke/appver/version 的点击更新逻辑：
// - Android：使用接口返回的 APK 下载地址下载到本地并安装
// - iOS：直接跳转到 App Store
// - Harmony: 直接跳转到应用市场或者下载链接
async function applyAppVerUpdateByApi(info: {
  version: string;
  content: string;
  packageUrl?: string;
  forceUpdate?: number | boolean;
}) {
  if (IOS_PLATFORM) {
    // iOS 侧接口不返回下载链接，这里统一跳转到 App Store
    const appStoreUrl = 'https://apps.apple.com/cn/app/id6754637381';
    try {
      // 记录一次待安装标记，返回应用时用于提示用户完成安装
      try {
        await setStorage({
          key: APP_UPDATE_PENDING_INSTALL_KEY,
          data: { version: info.version || '' },
        });
      } catch {}
      await Linking.openURL(appStoreUrl);
    } catch (e) {
      throw new Error('跳转 App Store 失败,请检查网络后重试');
    }
    return;
  }

  // 鸿蒙：不支持静默下载安装包，而是使用返回的 scheme url (如华为应用市场链接) 跳转去安装应用
  // 鸿蒙包上架华为应用市场后，让后端在 packageUrl 里返回 store://appgallery.huawei.com/app/detail?id=APPID 或者 appmarket://details?id=APPID
  if (IS_HARMONY) {
    const marketUrl = info.packageUrl;
    if (!marketUrl) {
      throw new Error('缺少鸿蒙更新链接');
    }
    try {
      try {
        await setStorage({
          key: APP_UPDATE_PENDING_INSTALL_KEY,
          data: { version: info.version || '' },
        });
      } catch {}
      await Linking.openURL(marketUrl);
    } catch (e) {
      throw new Error('跳转应用市场失败');
    }
    return;
  }

  // Android：接口返回 APK 下载链接
  const downloadUrl = info.packageUrl;
  if (!downloadUrl) {
    throw new Error('缺少下载链接');
  }

  try {
    showLoading({ title: '下载中...' });
    const apkFilePath = AppModule.cacheDirPath + '/boklock/boklock.apk';
    let lastPercent = 0;

    await RNFetchBlob.config({ path: apkFilePath })
      .fetch('GET', downloadUrl)
      .progress({ interval: 250 }, (received: string, total: string) => {
        const receivedNum = Number(received);
        const totalNum = Number(total);
        if (totalNum > 0) {
          const percent = Math.floor((receivedNum / totalNum) * 100);
          if (percent !== lastPercent) {
            lastPercent = percent;
            // console.log(
            //   `[AppUpdate] 当前下载进度: ${percent}% (${receivedNum}/${totalNum})`,
            // );
            // 此处准备了进度值，后续可替换为进度条 UI
          }
        } else {
          console.log(`[AppUpdate] 已下载: ${receivedNum} bytes`);
        }
      });

    hideLoading();
    const apkFileExist = await RNFetchBlob.fs.exists(apkFilePath);
    if (!apkFileExist) {
      throw new Error('APK 文件不存在，下载失败');
    }
    // 下载成功，记录一次待安装标记，返回应用时用于提示用户完成安装
    try {
      await setStorage({
        key: APP_UPDATE_PENDING_INSTALL_KEY,
        data: { version: info.version || '' },
      });
    } catch {}
    AppModule.installApk(apkFilePath);
  } catch (e) {
    hideLoading();
    throw new Error('下载或安装失败,请检查网络后重试');
  }
}

export default () => {
  return {
    // 新接口：仅做版本检测，不直接弹窗
    checkAppVersion: async (config: { checkStorage?: boolean }) => {
      const checkStorage = config?.checkStorage ?? true;
      return checkAppVersionByApi(checkStorage);
    },
    // 新接口：确认更新后的具体执行逻辑
    applyAppVerUpdate: async (info: {
      version: string;
      content: string;
      packageUrl?: string;
      forceUpdate?: number | boolean;
    }) => {
      return applyAppVerUpdateByApi(info);
    },
    onUpdateReady: (callback: () => void) => {
      if (appUpdateInfo.status === UPDATE_STATUS.DOWNLOAD_FINISH) {
        callback();
        return;
      }
      if (appUpdateInfo.status !== UPDATE_STATUS.INIT) {
        return;
      }
      appUpdateInfo.status = UPDATE_STATUS.CHECKING;
      if (IOS_PLATFORM && DEPLOY_ENV === 'real') {
        thirdRequest<any>({
          url: `https://itunes.apple.com/CN/lookup?id=6754637381`,
          method: 'get',
        })
          .then((res: any) => {
            const currentVersion = DeviceInfo.getVersion();
            const onlineVersion = res.data.results?.[0]?.version;
            if (currentVersion && onlineVersion) {
              const needUpdateApp =
                compareVersion(currentVersion).isBefore(onlineVersion);
              if (needUpdateApp) {
                appUpdateInfo.url = res.data.results[0]?.trackViewUrl;
                appUpdateInfo.updateType = 'app';
                appUpdateInfo.status = UPDATE_STATUS.DOWNLOAD_FINISH;
                callback();
              } else {
                // 判断是否需要更新bundle
                onHotUpdateReady((bundleZipFile?: string) => {
                  if (bundleZipFile) {
                    appUpdateInfo.url = bundleZipFile;
                    appUpdateInfo.updateType = 'bundle';
                    appUpdateInfo.status = UPDATE_STATUS.DOWNLOAD_FINISH;
                    callback();
                  } else {
                    initAppUpdateInfo();
                  }
                });
              }
            } else {
              initAppUpdateInfo();
            }
          })
          .catch(() => {
            initAppUpdateInfo();
          });
      } else {
        thirdRequest<any>({
          url: 'https://www.pgyer.com/apiv2/app/check',
          method: 'post',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          data: {
            // 这个暴露没问题
            _api_key: '5974674521be3a02a72a22e0a4e87105',
            // ios的测试环境 android的测试和线上环境
            appKey: IOS_PLATFORM
              ? '3ad9b067ddaa7168d0ca30efbe39e8cb'
              : DEPLOY_ENV === 'real'
              ? '79662c89cc735315aad5c5410e33b320' // TODO boklockreal android apikey
              : '7df7e1ddc167c26ba719ff2ad896c37b', // TODO boklockdev android apikey
          },
        })
          .then(async res => {
            if (res.success && res.data?.data) {
              const currentBuildNo = DeviceInfo.getBuildNumber();
              const onlineBuildNo = res.data.data.buildVersionNo;
              if (currentBuildNo && onlineBuildNo) {
                const needUpdateApp =
                  parseInt(currentBuildNo) < parseInt(onlineBuildNo);
                if (needUpdateApp) {
                  if (IOS_PLATFORM) {
                    appUpdateInfo.url = res.data.data.appURl;
                    appUpdateInfo.updateType = 'app';
                    appUpdateInfo.status = UPDATE_STATUS.DOWNLOAD_FINISH;
                    callback();
                  } else {
                    const apkFilePath =
                      AppModule.cacheDirPath + '/boklock/boklock.apk';
                    RNFetchBlob.config({ path: apkFilePath })
                      .fetch('GET', res.data.data.downloadURL)
                      // .progress({interval: 250}, (received, total) => {
                      //   const percent = (received / total) * 100
                      //   callback?.onProgress(
                      //     getFilesize(received),
                      //     getFilesize(total),
                      //     parseInt(percent.toString()),
                      //   )
                      // })
                      .then((res: any) => {
                        function noticeUpdateApp() {
                          appUpdateInfo.url = apkFilePath;
                          appUpdateInfo.updateType = 'app';
                          appUpdateInfo.status = UPDATE_STATUS.DOWNLOAD_FINISH;
                          callback();
                        }
                        // APP之后有很多次热更新，所以这里需要判断APP对应的Bundle是不是最新的
                        onHotUpdateReady(async (bundleZipFile?: string) => {
                          if (bundleZipFile) {
                            const zipBundleExist = await RNFetchBlob.fs.exists(
                              bundleZipFile,
                            );
                            if (zipBundleExist) {
                              // 先解压再安装
                              AppModule.unzip(
                                bundleZipFile,
                                bundleZipFile.substring(
                                  0,
                                  bundleZipFile.lastIndexOf('/') + 1,
                                ),
                                'UTF-8',
                              )
                                .then((path: any) => {
                                  noticeUpdateApp();
                                })
                                .catch((error: any) => {
                                  noticeUpdateApp();
                                });
                            } else {
                              noticeUpdateApp();
                            }
                          } else {
                            noticeUpdateApp();
                          }
                        });
                      })
                      .catch(() => {
                        initAppUpdateInfo();
                      });
                  }
                } else {
                  // 判断是否需要更新bundle
                  onHotUpdateReady((bundleZipFile?: string) => {
                    if (bundleZipFile) {
                      appUpdateInfo.url = bundleZipFile;
                      appUpdateInfo.updateType = 'bundle';
                      appUpdateInfo.status = UPDATE_STATUS.DOWNLOAD_FINISH;
                      callback();
                    } else {
                      initAppUpdateInfo();
                    }
                  });
                }
              } else {
                initAppUpdateInfo();
              }
            } else {
              initAppUpdateInfo();
            }
          })
          .catch(() => {
            initAppUpdateInfo();
          });
      }
    },
    applyUpdate: async () => {
      if (appUpdateInfo.status === UPDATE_STATUS.UNZIPING) return;
      appUpdateInfo.status = UPDATE_STATUS.UNZIPING;
      try {
        if (appUpdateInfo.url && appUpdateInfo.updateType) {
          const url = appUpdateInfo.url;
          switch (appUpdateInfo.updateType) {
            case 'app':
              if (IOS_PLATFORM) {
                initAppUpdateInfo();
                Linking.openURL(url).catch((err: any) => {
                  console.log(err, 'jump app store err!');
                });
              } else {
                const apkFileExist = await RNFetchBlob.fs.exists(url);
                initAppUpdateInfo();
                apkFileExist && AppModule.installApk(url);
              }
              break;
            case 'bundle':
              const zipBundleExist = await RNFetchBlob.fs.exists(url);
              if (zipBundleExist) {
                // 先解压再安装
                AppModule.unzip(
                  url,
                  url.substring(0, url.lastIndexOf('/') + 1),
                  'UTF-8',
                )
                  .then((path: any) => {
                    initAppUpdateInfo();
                    RNRestart.restart(); // 重启应用
                  })
                  .catch((error: any) => {
                    initAppUpdateInfo();
                    console.error(error);
                  });
              } else {
                initAppUpdateInfo();
              }
              break;
          }
        } else {
          initAppUpdateInfo();
        }
      } catch {
        initAppUpdateInfo();
      }
    },
  };
};
