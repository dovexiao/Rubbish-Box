/*
 * @Author: zdb zhiubo_1@163.com
 * @Date: 2025-09-30 13:40:38
 * @LastEditors: zdb zhiubo_1@163.com
 * @LastEditTime: 2025-10-08 14:20:29
 * @FilePath: /xhtx-app/xhtx/src/config/api.ts
 * @Description: 
 */
/**
 * API配置文件
 * 包含API地址和请求超时等配置
 */

import { SERVER_BASE_URL, UPLOAD_BASE_URL, IS_DEV, IS_PROD, IS_TEST } from "./env"

// 导出当前环境的API基础URL
export const API_BASE_URL = SERVER_BASE_URL

// 上传文件的基础URL
export const UPLOAD_API_URL = UPLOAD_BASE_URL

// API请求超时时间（毫秒）
export const API_TIMEOUT = 15000

// OCR 请求超时时间（OCR处理耗时较长，需要更长的超时时间）
export const OCR_TIMEOUT = 30000000 // 60秒

// API版本（根据实际后端接口调整）
export const API_VERSION = ""

// 完整的API URL（如果后端有版本前缀）
export const API_URL = API_VERSION ? `${API_BASE_URL}/${API_VERSION}` : API_BASE_URL

// 请求头配置
export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  "Accept": "application/json",
}

export default {
  API_BASE_URL,
  UPLOAD_API_URL,
  API_TIMEOUT,
  API_VERSION,
  API_URL,
  DEFAULT_HEADERS,
  IS_DEV,
  IS_PROD,
  IS_TEST,
}
