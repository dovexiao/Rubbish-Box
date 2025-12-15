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

import Constants from 'expo-constants'

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
// 从 expo-constants 读取环境变量
const getEnvironment = (): Environment => {

  // 从 app.config.js 传递的环境变量读取
  const appEnv = Constants.expoConfig?.extra?.appEnvironment as string | undefined
  
  console.log('🌍 当前环境变量:', appEnv)
  
  if (appEnv === 'testing') {
    return Environment.TESTING
  }
  
  if (appEnv === 'production') {
    return Environment.PRODUCTION
  }

  // 默认：开发环境或根据 __DEV__ 判断
  return __DEV__ ? Environment.DEVELOPMENT : Environment.PRODUCTION
}

// API服务器地址配置
const API_URLS = {
  // 测试环境

  [Environment.TESTING]: "http://192.168.31.37:8000",
  // [Environment.TESTING]: "http://8.135.11.47:8000",

  // 生产环境（使用IP地址，域名未配置好）
  // [Environment.PRODUCTION]: "http://8.135.11.47:8000",
  [Environment.PRODUCTION]: "https://xiaohetx.cn",
    // [Environment.PRODUCTION]: "http://47.112.206.205:8000",

  

  // 开发环境
  // [Environment.DEVELOPMENT]: "http://8.135.11.47:8000",
    // [Environment.DEVELOPMENT]: "http://47.112.206.205:8000",
  // [Environment.DEVELOPMENT]: "http://192.168.31.252:8080",
  //  [Environment.DEVELOPMENT]: "http://192.168.217.109:8080",
  [Environment.DEVELOPMENT]: "https://xiaohetx.cn",

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

export const CURRENT_ENV = getEnvironment()

// 导出当前环境的配置
export const SERVER_BASE_URL = API_URLS[CURRENT_ENV]
export const UPLOAD_BASE_URL = UPLOAD_URLS[CURRENT_ENV]

// 打印当前使用的API地址，方便调试
console.log('🌍 当前环境:', CURRENT_ENV)
console.log('📡 API服务器:', SERVER_BASE_URL)

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
