/*
 * @Author: zdb zhiubo_1@163.com
 * @Date: 2025-10-07 11:13:59
 * @LastEditors: zdb zhiubo_1@163.com
 * @LastEditTime: 2025-10-14 14:23:25
 * @FilePath: /xhtx/src/config/env.ts
 * @Description:
 */
/**
 * 环境变量配置文件
 * 对应UniApp项目中的.env配置
 */

// 应用基础配置
export const APP_CONFIG = {
  TITLE: "xhtx",
  PORT: 9000,
  UNI_APPID: "__UNI__C708037",
  WX_APPID: "wxa2abb91f64032a2b",
  PUBLIC_BASE: "/",
}

// 环境类型
export enum Environment {
  DEVELOPMENT = "development",
  TESTING = "testing",
  PRODUCTION = "production",
}

// 当前环境（可以通过构建时设置）
export const CURRENT_ENV = __DEV__ ? Environment.DEVELOPMENT : Environment.PRODUCTION

// API服务器地址配置
const API_URLS = {
  // 测试环境
  [Environment.TESTING]: "http://192.168.31.22:8080",
  // [Environment.TESTING]: "http://8.135.11.47:8000",

  // 生产环境（使用IP地址，域名未配置好）
  [Environment.PRODUCTION]: "http://8.135.11.47:8000",

  // 开发环境
  // [Environment.DEVELOPMENT]: "http://8.135.11.47:8000",
  [Environment.DEVELOPMENT]: "http://192.168.31.22:8080",
  // [Environment.DEVELOPMENT]: "https://xiaohetx.cn",

}

// 上传地址配置
const UPLOAD_URLS = {
  [Environment.TESTING]: "http://8.135.11.47:8000/AppStart/Protected/image_upload/",
  [Environment.PRODUCTION]: "http://8.135.11.47:8000/AppStart/Protected/image_upload/",
  [Environment.DEVELOPMENT]: "http://8.135.11.47:8000/AppStart/Protected/image_upload/",
}

// 微信小程序专用配置
const WEIXIN_API_URLS = {
  develop: "https://ukw0y1.laf.run",
  trial: "https://ukw0y1.laf.run",
  release: "https://ukw0y1.laf.run",
}

const WEIXIN_UPLOAD_URLS = {
  develop: "https://ukw0y1.laf.run/upload",
  trial: "https://ukw0y1.laf.run/upload",
  release: "https://ukw0y1.laf.run/upload",
}

// 代理配置
export const PROXY_CONFIG = {
  ENABLED: true,
  PREFIX: "/AppStart",
}

// 导出当前环境的配置
export const SERVER_BASE_URL = API_URLS[CURRENT_ENV]
export const UPLOAD_BASE_URL = UPLOAD_URLS[CURRENT_ENV]

// 微信小程序配置（如果需要）
export const WEIXIN_CONFIG = {
  API_URLS: WEIXIN_API_URLS,
  UPLOAD_URLS: WEIXIN_UPLOAD_URLS,
}

// 环境判断
export const IS_DEV = CURRENT_ENV === Environment.DEVELOPMENT
export const IS_TEST = CURRENT_ENV === Environment.TESTING
export const IS_PROD = CURRENT_ENV === Environment.PRODUCTION

export default {
  APP_CONFIG,
  CURRENT_ENV,
  SERVER_BASE_URL,
  UPLOAD_BASE_URL,
  WEIXIN_CONFIG,
  PROXY_CONFIG,
  IS_DEV,
  IS_TEST,
  IS_PROD,
}
