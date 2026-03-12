import Cos from 'react-native-cos-sdk';
// @ts-ignore
import dayjs from 'dayjs';
import { randomNum } from '@/utils';
import { getCosKey } from '@/services/common';
import { DEPLOY_ENV } from '../../../config';

const REGION = 'ap-shanghai';
const BUCKET = 'sbqfc-1307862547';

export default function (options: {
  file: any;
  filename: string;
  index: number;
  randomFileName?: boolean;
  appointName?: string;
  folderName?: string;
}) {
  const {
    file,
    filename,
    index,
    appointName,
    folderName,
    randomFileName = true,
  } = options;
  return new Promise(async (resolve: (res: any) => void) => {
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
          code: '599',
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
      sliceSizeForUpload: 1048576, //设置默认分块大小为 1M
      enableVerification: true, // 分片上传时是否整体校验
    };
    await Cos.registerDefaultTransferManger(serviceConfig, transferConfig);
    // 获取默认 COS TransferManger
    const cosTransferManger = Cos.getDefaultTransferManger();

    //若存在初始化分块上传的 UploadId，则赋值对应的 uploadId 值用于续传；否则，赋值 undefined
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
      //用于下次续传上传的 uploadId
      _uploadId = uploadId;
    };

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
            code: '200',
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
            code: '599',
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
  });
}
