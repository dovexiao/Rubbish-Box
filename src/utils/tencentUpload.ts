import { Platform } from 'react-native';
// @ts-ignore
import dayjs from 'dayjs';
import { getCosKey } from '@/services/common';
import { CreateFetchResponse } from './http';
import { DEPLOY_ENV } from '@/config';

const REGION = 'ap-shanghai';
const BUCKET = 'sbqfc-1307862547';

const isNativeMobile = Platform.OS === 'android' || Platform.OS === 'ios';
const isDev = typeof __DEV__ !== 'undefined' && __DEV__;

let Cos: any = null;
let cosInitialized = false;
let transferManagerReady = false;
if (isNativeMobile) {
  try {
    // 仅在 Android / iOS 平台按需加载原生 COS SDK，避免鸿蒙等平台导入时报错
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    const cosModule = require('react-native-cos-sdk');
    Cos = cosModule?.default ?? cosModule;
  } catch (e) {
    console.warn('react-native-cos-sdk is not available:', e);
  }
}

/**
 * 生成随机数字
 * @param min 最小值
 * @param max 最大值
 * @returns 随机数字
 */
function randomNum(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 腾讯云 COS 上传（内部实现）
 * @param options 上传选项
 * @returns Promise<CreateFetchResponse & { index?: number }>
 */
export default function tencentUpload(options: {
  file: any;
  filename: string;
  index: number;
  randomFileName?: boolean;
  appointName?: string;
  folderName?: string;
}) {
  const { index } = options;
  const resolveFailed = (
    resolve: (res: CreateFetchResponse<any> & { index?: number }) => void,
    data: any,
    message = '请求异常',
    code = 599,
  ) => {
    if (isDev) {
      console.warn('[COS_UPLOAD_FAIL]', { message, data });
    }
    resolve({
      code,
      success: false,
      data,
      message,
      index,
      header: {},
    } as any);
  };

  // 鸿蒙等非 Android / iOS 平台暂不支持原生 COS SDK，直接返回失败结果，避免触发 NativeModule 链接错误
  if (!isNativeMobile) {
    return Promise.resolve({
      code: 599,
      success: false,
      data: null,
      message: '当前平台暂不支持文件上传',
      index,
      header: {},
    } as any);
  }

  if (!Cos) {
    return Promise.resolve({
      code: 599,
      success: false,
      data: null,
      message: '上传模块未正确加载',
      index,
      header: {},
    } as any);
  }

  const {
    file,
    filename,
    appointName,
    folderName,
    randomFileName = true,
  } = options;

  return new Promise(
    (
      resolve: (res: CreateFetchResponse<any> & { index?: number }) => void,
    ) => {
      void (async () => {
        try {
          if (typeof Cos?.initWithSessionCredentialCallback !== 'function') {
            return resolveFailed(
              resolve,
              null,
              '上传模块版本不兼容，请检查 react-native-cos-sdk',
            );
          }

          if (!cosInitialized) {
            try {
              await Cos.initWithSessionCredentialCallback(async () => {
                const res: any = await getCosKey({});
                if (res?.success) {
                  const {
                    tmpSecretId,
                    tmpSecretKey,
                    sessionToken,
                    startTime,
                    expiredTime,
                  } = res.data || {};
                  return {
                    tmpSecretId,
                    tmpSecretKey,
                    startTime,
                    expiredTime,
                    sessionToken,
                  };
                }
                throw new Error(
                  res?.message || res?.msg || '获取临时密钥失败',
                );
              });
              cosInitialized = true;
            } catch (error: any) {
              const errorMessage = String(error?.message || error || '');
              if (errorMessage.includes('inited before')) {
                cosInitialized = true;
              } else {
                return resolveFailed(
                  resolve,
                  error,
                  errorMessage || 'COS 初始化失败',
                );
              }
            }
          }

          const hasRegisterDefaultTransferManger =
            typeof Cos?.registerDefaultTransferManger === 'function';
          const hasRegisterDefaultTransferManager =
            typeof Cos?.registerDefaultTransferManager === 'function';
          const hasGetDefaultTransferManger =
            typeof Cos?.getDefaultTransferManger === 'function';
          const hasGetDefaultTransferManager =
            typeof Cos?.getDefaultTransferManager === 'function';

          if (
            (!hasRegisterDefaultTransferManger &&
              !hasRegisterDefaultTransferManager) ||
            (!hasGetDefaultTransferManger && !hasGetDefaultTransferManager)
          ) {
            return resolveFailed(
              resolve,
              null,
              '上传模块方法不可用，请检查 react-native-cos-sdk',
            );
          }

          const serviceConfig = {
            region: REGION,
            isDebuggable: true,
            isHttps: true,
          };
          const transferConfig = {
            forceSimpleUpload: false,
            divisionForUpload: 2097152,
            sliceSizeForUpload: 1048576,
            enableVerification: true,
          };

          if (!transferManagerReady) {
            try {
              if (hasRegisterDefaultTransferManger) {
                await Cos.registerDefaultTransferManger(
                  serviceConfig,
                  transferConfig,
                );
              } else {
                await Cos.registerDefaultTransferManager(
                  serviceConfig,
                  transferConfig,
                );
              }
              transferManagerReady = true;
            } catch (error: any) {
              const errorMessage = String(error?.message || error || '');
              if (
                errorMessage.includes('registered') ||
                errorMessage.includes('exist') ||
                errorMessage.includes('already')
              ) {
                transferManagerReady = true;
              } else {
                return resolveFailed(
                  resolve,
                  error,
                  errorMessage || '上传管理器注册失败',
                );
              }
            }
          }

          const cosTransferManger = hasGetDefaultTransferManger
            ? Cos.getDefaultTransferManger()
            : Cos.getDefaultTransferManager();
          if (!cosTransferManger || typeof cosTransferManger.upload !== 'function') {
            return resolveFailed(resolve, null, '上传管理器初始化失败');
          }

          let _uploadId: string | undefined = undefined;
          const ext = '.' + filename.substring(filename.lastIndexOf('.') + 1);
          const date = dayjs();
          const initFloder = `${date.get('year')}${date.get('month') + 1}${date.get(
            'date',
          )}${date.get('hour')}${date.get('minute')}${date.get('second')}`;
          const folder = folderName ? `${folderName}/${initFloder}` : initFloder;

          const deployEnv = DEPLOY_ENV || 'dev';
          const path = (
            appointName
              ? `img/${deployEnv}/${appointName}`
              : `img/${deployEnv}/${folder}/${
                  randomFileName ? randomNum(10000, 100000) + ext : filename
                }`
          ).replace(/[\u4E00-\u9FFF\u0020]/g, '');

          await cosTransferManger.upload(BUCKET, path, file, {
            uploadId: _uploadId,
            resultListener: {
              successCallBack: () => {
                resolve({
                  code: 200,
                  success: true,
                  data: {
                    Location: `${BUCKET}.cos.${REGION}.myqcloud.com/${path}`,
                    url: file,
                  },
                  message: '',
                  index,
                  header: {},
                });
              },
              failCallBack: (clientError?: any, serviceError?: any) => {
                resolveFailed(
                  resolve,
                  {
                    clientError,
                    serviceError,
                  },
                  serviceError?.message || clientError?.message || '请求异常',
                );
              },
            },
            initMultipleUploadCallback: (
              _bucket: string,
              _cosKey: string,
              uploadId: string,
            ) => {
              _uploadId = uploadId;
            },
            stateCallback: (_state: any) => {},
            progressCallback: (_complete: number, _target: number) => {},
          });
        } catch (error: any) {
          resolveFailed(resolve, error, error?.message || '上传失败');
        }
      })();
    },
  );
}
