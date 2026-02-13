import { NativeModules, Platform, Linking } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import DeviceInfo from 'react-native-device-info';
import RNRestart from 'react-native-restart';
import { getVersion, getAppVer } from '@/services/common';
import {
  getStorage,
  setStorage,
  isVersionBefore,
  compareVersion,
} from '@/utils';
import { thirdRequest } from '../../request';

const IOS_PLATFORM = Platform.OS === 'ios';
const { AppModule } = NativeModules;

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
function getFilesize(size) {
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
async function onHotUpdateReady(callback) {
  const client = Platform.OS === 'ios' ? 'ios' : 'android';
  const vInfo = await getVersion({ client });
  try {
    const versionFile = AppModule.dirPath + '/boklock/bundle/version';
    const hasLocalVersion = await RNFetchBlob.fs.exists(versionFile);
    const localVersion = hasLocalVersion
      ? (await RNFetchBlob.fs.readFile(versionFile, 'utf8'))
          .split(/\r?\n/)[0]
          ?.trim()
      : undefined;
    const currentVersion = localVersion || process.env.DEPLOY_VERSION;
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
          `https://g.18qjz.cn/${process.env.DEPLOY_ENV}/sbqfc-fed/boklock/${client}/${vInfo.data}/build/boklock.zip`,
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
    const client = IOS_PLATFORM ? 'ios' : 'android';
    const currentVersion = DeviceInfo.getVersion() || '';
    const res: any = await getAppVer({
      platform: client,
      version: currentVersion,
    });
    console.log(res, '====');
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
        const skipRes: any = await getStorage({
          key: APP_UPDATE_SKIP_KEY,
        }).catch(() => ({ data: undefined } as any));
        const skipInfo = skipRes?.data as
          | { id?: number; date?: string }
          | undefined;
        const today = new Date().toDateString();
        if (skipInfo?.id === id && skipInfo?.date === today) {
          return false;
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

  // Android：接口返回 APK 下载链接
  const downloadUrl = info.packageUrl;
  if (!downloadUrl) {
    throw new Error('缺少下载链接');
  }

  try {
    const apkFilePath = AppModule.cacheDirPath + '/boklock/boklock.apk';
    await RNFetchBlob.config({ path: apkFilePath }).fetch('GET', downloadUrl);
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
    onUpdateReady: callback => {
      if (appUpdateInfo.status === UPDATE_STATUS.DOWNLOAD_FINISH) {
        callback();
        return;
      }
      if (appUpdateInfo.status !== UPDATE_STATUS.INIT) {
        return;
      }
      appUpdateInfo.status = UPDATE_STATUS.CHECKING;
      if (IOS_PLATFORM && process.env.DEPLOY_ENV === 'real') {
        thirdRequest<any>({
          url: `https://itunes.apple.com/CN/lookup?id=6754637381`,
          method: 'get',
        })
          .then(res => {
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
                onHotUpdateReady(bundleZipFile => {
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
              : process.env.DEPLOY_ENV === 'real'
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
                      .then(res => {
                        function noticeUpdateApp() {
                          appUpdateInfo.url = apkFilePath;
                          appUpdateInfo.updateType = 'app';
                          appUpdateInfo.status = UPDATE_STATUS.DOWNLOAD_FINISH;
                          callback();
                        }
                        // APP之后有很多次热更新，所以这里需要判断APP对应的Bundle是不是最新的
                        onHotUpdateReady(async bundleZipFile => {
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
                                .then(path => {
                                  noticeUpdateApp();
                                })
                                .catch(error => {
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
                  onHotUpdateReady(bundleZipFile => {
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
                Linking.openURL(url).catch(err => {
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
                  .then(path => {
                    initAppUpdateInfo();
                    RNRestart.restart(); // 重启应用
                  })
                  .catch(error => {
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
