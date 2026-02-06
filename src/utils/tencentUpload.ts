import { Platform } from 'react-native';
// @ts-ignore
import dayjs from 'dayjs';
import { getCosKey } from '@/services/common';
import { CreateFetchResponse } from './http';

const REGION = 'ap-shanghai';
const BUCKET = 'sbqfc-1307862547';

const isNativeMobile = Platform.OS === 'android' || Platform.OS === 'ios';

let Cos: any = null;
if (isNativeMobile) {
  try {
    // 仅在 Android / iOS 平台按需加载原生 COS SDK，避免鸿蒙等平台导入时报错
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    Cos = require('react-native-cos-sdk');
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
    async (
      resolve: (res: CreateFetchResponse<any> & { index?: number }) => void,
    ) => {
      Cos.initWithSessionCredentialCallback(async () => {
        // 异步获取临时密钥
        const res = await getCosKey({});
        if (res.success) {
          const {
            tmpSecretId,
            tmpSecretKey,
            sessionToken,
            startTime,
            expiredTime,
          } = res.data;
          const sessionCredentials = {
            tmpSecretId: tmpSecretId,
            tmpSecretKey: tmpSecretKey,
            startTime: startTime,
            expiredTime: expiredTime,
            sessionToken: sessionToken,
          };
          return sessionCredentials;
        } else {
          resolve({
            code: 599,
            success: false,
            data: res,
            message: '请求异常',
            index,
            header: {},
          });
          throw res.message;
        }
      });

      const serviceConfig = {
        region: REGION,
        isDebuggable: true,
        isHttps: true,
      };
      const transferConfig = {
        forceSimpleUpload: false, // 是否强制使用简单上传
        divisionForUpload: 2097152, // 设置大于等于 2M 的文件进行分块上传
        sliceSizeForUpload: 1048576, // 设置默认分块大小为 1M
        enableVerification: true, // 分片上传时是否整体校验
      };
      await Cos.registerDefaultTransferManger(serviceConfig, transferConfig);
      // 获取默认 COS TransferManger
      const cosTransferManger = Cos.getDefaultTransferManger();

      // 若存在初始化分块上传的 UploadId，则赋值对应的 uploadId 值用于续传；否则，赋值 undefined
      let _uploadId: string | undefined = undefined;
      const ext = '.' + filename.substring(filename.lastIndexOf('.') + 1);
      const date = dayjs();
      const initFloder = `${date.get('year')}${date.get('month') + 1}${date.get(
        'date',
      )}${date.get('hour')}${date.get('minute')}${date.get('second')}`;
      const folder = folderName ? `${folderName}/${initFloder}` : initFloder;
      const initMultipleUploadCallBack = (
        bucket: string,
        cosKey: string,
        uploadId: string,
      ) => {
        // 用于下次续传上传的 uploadId
        _uploadId = uploadId;
      };

      const deployEnv = 'dev';
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
            resolve({
              code: 599,
              success: false,
              data: clientError || serviceError,
              message: '请求异常',
              index,
              header: {},
            });
          },
        },
        initMultipleUploadCallback: initMultipleUploadCallBack,
        stateCallback: (state: any) => {
          console.log(state);
          // todo notify transfer state
        },
        progressCallback: (complete: number, target: number) => {
          // todo notify transfer state
          console.log(complete, target);
        },
      });
    },
  );
}
