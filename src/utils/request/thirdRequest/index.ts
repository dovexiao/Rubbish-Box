import type { AxiosRequestConfig } from 'axios';
import type { CreateFetchResponse } from '../../http';
import { thirdRequest as coreThirdRequest } from '../../request';

// 兼容旧版 thirdRequest：内部直接复用 utils/request.ts 导出的 thirdRequest
export default function thirdRequest(
  option: AxiosRequestConfig,
): Promise<CreateFetchResponse<any>> {
  return coreThirdRequest(option);
}
