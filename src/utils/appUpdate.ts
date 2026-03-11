/**
 * 应用更新检查模块
 * 支持 App 更新和 Bundle 热更新
 */

import { NativeModules, Platform, Linking } from 'react-native';
// Harmony 等非 Android/iOS 平台上没有 react-native-fs 原生实现，这里只在原生平台按需加载
// 避免在鸿蒙环境中因 NativeModules.RNFS 为空导致导入阶段直接抛错
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type * as RNFSType from 'react-native-fs';
import DeviceInfo from 'react-native-device-info';
import RNRestart from 'react-native-restart';
import { zip, unzip } from 'react-native-zip-archive';
import { compareVersion, getFilesize } from './version';
import { getVersion } from '@/services/common';
import Config from 'react-native-config';
// 在 RN 环境中使用 axios 的 browser 版 bundle，避免加载 node 版依赖 crypto
// eslint-disable-next-line @typescript-eslint/no-var-requires
const axios: any =
  require('axios/dist/browser/axios.cjs') as typeof import('axios');

const IOS_PLATFORM = Platform.OS === 'ios';

// 按平台懒加载 RNFS，避免在鸿蒙环境中导入 react-native-fs 时报错
let RNFS: any = null;
if (Platform.OS === 'ios' || Platform.OS === 'android') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  RNFS = require('react-native-fs');
}

// 原生模块接口
interface AppModuleInterface {
  dirPath: string;
  cacheDirPath: string;
  getDirPath(): Promise<string>;
  getCacheDirPath(): Promise<string>;
  unzip(zipPath: string, destPath: string, encoding: string): Promise<string>;
  installApk(apkPath: string): void;
}

// 获取原生模块
const AppModuleNative = NativeModules.AppModule as AppModuleInterface | null;

// 获取目录路径的辅助函数
async function getAppDirPath(): Promise<string> {
  if (AppModuleNative?.getDirPath) {
    return await AppModuleNative.getDirPath();
  }
  if (!RNFS) {
    throw new Error('react-native-fs is not available on this platform');
  }
  return RNFS.DocumentDirectoryPath;
}

async function getAppCacheDirPath(): Promise<string> {
  if (AppModuleNative?.getCacheDirPath) {
    return await AppModuleNative.getCacheDirPath();
  }
  if (!RNFS) {
    throw new Error('react-native-fs is not available on this platform');
  }
  return RNFS.CachesDirectoryPath;
}

// 蒲公英 API Key（已在配置中）
const PGYER_API_KEY = '5974674521be3a02a72a22e0a4e87105';

// 蒲公英 App Key 配置
const PGYER_APP_KEYS = {
  ios: '4a10361daa4d3de2036ffbf155d8b5b5',
  android: {
    dev: '7df7e1ddc167c26ba719ff2ad896c37b',
    real: '79662c89cc735315aad5c5410e33b320',
  },
};

// iOS App Store ID
const IOS_APP_STORE_ID = '6738300051';

enum UPDATE_STATUS {
  INIT,
  CHECKING,
  DOWNLOAD_FINISH,
  UNZIPING,
}

interface AppUpdateInfo {
  status: UPDATE_STATUS;
  url: string;
  updateType?: 'app' | 'bundle';
}

const appUpdateInfo: AppUpdateInfo = {
  status: UPDATE_STATUS.INIT,
  url: '',
  updateType: undefined,
};

/**
 * 初始化更新信息
 */
function initAppUpdateInfo() {
  appUpdateInfo.url = '';
  appUpdateInfo.updateType = undefined;
  appUpdateInfo.status = UPDATE_STATUS.INIT;
}

/**
 * 检查 Bundle 热更新
 */
async function onHotUpdateReady(callback: (bundleZipFile?: string) => void) {
  const client = Platform.OS === 'ios' ? 'ios' : 'android';
  const deployEnv = Config.ENV || (__DEV__ ? 'development' : 'production');

  try {
    // 获取版本信息
    const vInfo: any = await getVersion({ client });

    const dirPath = await getAppDirPath();
    const versionFile = `${dirPath}/boklock/bundle/version`;
    const hasLocalVersion = await RNFS.exists(versionFile);
    const localVersion = hasLocalVersion
      ? (await RNFS.readFile(versionFile, 'utf8')).split(/\r?\n/)[0]?.trim()
      : undefined;

    const currentVersion =
      localVersion || Config.DEPLOY_VERSION || DeviceInfo.getVersion();

    if (
      vInfo &&
      vInfo.version &&
      currentVersion &&
      compareVersion(currentVersion).isBefore(vInfo.version)
    ) {
      const bundleZipFile = `${dirPath}/boklock/boklock.zip`;

      // 下载 Bundle 文件
      const downloadUrl = `https://g.18qjz.cn/${deployEnv}/sbqfc-fed/boklock/${client}/${vInfo.version}/build/boklock.zip`;

      const downloadResult = await RNFS.downloadFile({
        fromUrl: downloadUrl,
        toFile: bundleZipFile,
      }).promise;

      if (downloadResult.statusCode === 200) {
        callback(bundleZipFile);
      } else {
        callback();
      }
    } else {
      callback();
    }
  } catch (error) {
    console.error('Hot update check error:', error);
    callback();
  }
}

/**
 * 检查蒲公英更新
 */
async function checkPgyerUpdate(callback: () => void) {
  const deployEnv = Config.ENV || (__DEV__ ? 'development' : 'production');
  const isReal = deployEnv === 'real' || deployEnv === 'production';

  try {
    const appKey = IOS_PLATFORM
      ? PGYER_APP_KEYS.ios
      : isReal
      ? PGYER_APP_KEYS.android.real
      : PGYER_APP_KEYS.android.dev;

    const response = await axios.post(
      'https://www.pgyer.com/apiv2/app/check',
      new URLSearchParams({
        _api_key: PGYER_API_KEY,
        appKey: appKey,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    if (response.data?.data?.data) {
      const pgyerData = response.data.data.data;
      const currentBuildNo = DeviceInfo.getBuildNumber();
      const onlineBuildNo = pgyerData.buildVersionNo;

      if (currentBuildNo && onlineBuildNo) {
        const needUpdateApp =
          parseInt(currentBuildNo) < parseInt(onlineBuildNo);

        if (needUpdateApp) {
          if (IOS_PLATFORM) {
            appUpdateInfo.url = pgyerData.appURl;
            appUpdateInfo.updateType = 'app';
            appUpdateInfo.status = UPDATE_STATUS.DOWNLOAD_FINISH;
            callback();
          } else {
            // Android 下载 APK
            const cacheDirPath = await getAppCacheDirPath();
            const apkFilePath = `${cacheDirPath}/boklock/boklock.apk`;

            // 确保目录存在
            const apkDir = apkFilePath.substring(
              0,
              apkFilePath.lastIndexOf('/'),
            );
            await RNFS.mkdir(apkDir);

            const downloadResult = await RNFS.downloadFile({
              fromUrl: pgyerData.downloadURL,
              toFile: apkFilePath,
            }).promise;

            if (downloadResult.statusCode === 200) {
              // 检查是否需要先更新 Bundle
              onHotUpdateReady(async bundleZipFile => {
                if (bundleZipFile) {
                  const zipBundleExist = await RNFS.exists(bundleZipFile);
                  if (zipBundleExist) {
                    try {
                      const destPath = bundleZipFile.substring(
                        0,
                        bundleZipFile.lastIndexOf('/') + 1,
                      );
                      // 使用 react-native-zip-archive 解压
                      await unzip(bundleZipFile, destPath);
                    } catch (error) {
                      console.error('Unzip error:', error);
                    }
                  }
                }
                appUpdateInfo.url = apkFilePath;
                appUpdateInfo.updateType = 'app';
                appUpdateInfo.status = UPDATE_STATUS.DOWNLOAD_FINISH;
                callback();
              });
            } else {
              initAppUpdateInfo();
            }
          }
        } else {
          // 检查 Bundle 更新
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
  } catch (error) {
    console.error('Pgyer check error:', error);
    initAppUpdateInfo();
  }
}

/**
 * 检查 App Store 更新（iOS 生产环境）
 */
async function checkAppStoreUpdate(callback: () => void) {
  try {
    const response = await axios.get(
      `https://itunes.apple.com/CN/lookup?id=${IOS_APP_STORE_ID}`,
    );
    const currentVersion = DeviceInfo.getVersion();
    const onlineVersion = response.data.results?.[0]?.version;

    if (currentVersion && onlineVersion) {
      const needUpdateApp =
        compareVersion(currentVersion).isBefore(onlineVersion);

      if (needUpdateApp) {
        appUpdateInfo.url = response.data.results[0]?.trackViewUrl;
        appUpdateInfo.updateType = 'app';
        appUpdateInfo.status = UPDATE_STATUS.DOWNLOAD_FINISH;
        callback();
      } else {
        // 检查 Bundle 更新
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
  } catch (error) {
    console.error('App Store check error:', error);
    initAppUpdateInfo();
  }
}

/**
 * 应用更新模块
 */
export default () => {
  return {
    /**
     * 检查更新
     * @param callback 更新就绪回调
     */
    onUpdateReady: (callback: () => void) => {
      if (appUpdateInfo.status === UPDATE_STATUS.DOWNLOAD_FINISH) {
        callback();
        return;
      }

      if (appUpdateInfo.status !== UPDATE_STATUS.INIT) {
        return;
      }

      appUpdateInfo.status = UPDATE_STATUS.CHECKING;

      const deployEnv = Config.ENV || (__DEV__ ? 'development' : 'production');
      const isReal = deployEnv === 'real' || deployEnv === 'production';

      // iOS 生产环境检查 App Store
      if (IOS_PLATFORM && isReal) {
        checkAppStoreUpdate(callback);
      } else {
        // 其他环境检查蒲公英
        checkPgyerUpdate(callback);
      }
    },

    /**
     * 应用更新
     */
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
                const apkFileExist = await RNFS.exists(url);
                initAppUpdateInfo();
                if (apkFileExist && AppModuleNative?.installApk) {
                  AppModuleNative.installApk(url);
                }
              }
              break;

            case 'bundle':
              const zipBundleExist = await RNFS.exists(url);
              if (zipBundleExist) {
                try {
                  const destPath = url.substring(0, url.lastIndexOf('/') + 1);
                  // 使用 react-native-zip-archive 解压
                  await unzip(url, destPath);
                  initAppUpdateInfo();
                  RNRestart.restart(); // 重启应用
                } catch (error) {
                  initAppUpdateInfo();
                  console.error('Unzip error:', error);
                }
              } else {
                initAppUpdateInfo();
              }
              break;
          }
        } else {
          initAppUpdateInfo();
        }
      } catch (error) {
        console.error('Apply update error:', error);
        initAppUpdateInfo();
      }
    },

    /**
     * 获取更新信息
     */
    getUpdateInfo: () => {
      return {
        hasUpdate: appUpdateInfo.status === UPDATE_STATUS.DOWNLOAD_FINISH,
        updateType: appUpdateInfo.updateType,
        url: appUpdateInfo.url,
      };
    },
  };
};
