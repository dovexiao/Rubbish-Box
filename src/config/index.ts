/**
 * 环境配置
 * 使用 react-native-config 管理不同环境的配置
 * 通过 .env 文件配置不同环境的变量
 */

import _Config from 'react-native-config';
import StaticConfig from './env.static.json';

// 对于 iOS 和 Android，使用原生的 react-native-config
// 对于鸿蒙没有提供原生模块，则优雅降级为读取打包时注入的 StaticConfig
const Config: any = _Config && _Config.ENV ? _Config : StaticConfig || {};

// 环境类型
export type EnvType = 'development' | 'production' | 'dev' | 'real';

// 1) 先用 .env 里的 ENV
export const ENV: EnvType = (Config.ENV as EnvType) || 'development';

// 2) 部署环境优先用 .env 里的 DEPLOY_ENV，其次根据 ENV 推导
export const DEPLOY_ENV =
  Config.DEPLOY_ENV ||
  (ENV === 'production' || ENV === 'real' ? 'real' : 'dev');
// 获取灰度标识
export const GRAY = Config.GRAY === 'true';

// 获取部署版本号
export const DEPLOY_VERSION = Config.DEPLOY_VERSION || '';

// 获取 API 基础地址（从环境变量读取）
// 根据部署环境自动切换 API 前缀
const BASE_URL_MAP: Record<string, string> = {
  real: 'https://boke-api.18qjz.cn',
  dev: 'https://boke-api-dev.18qjz.cn',
};
export const BASE_URL =
  Config.API_BASE_URL || BASE_URL_MAP[DEPLOY_ENV] || 'https://api.example.com';

// 获取 API 版本
export const API_VERSION = Config.API_VERSION || 'v1';

// 获取 Android 包名
export const ANDROID_PACKAGE_NAME =
  Config.ANDROID_PACKAGE_NAME || 'com.boklock.m.test';

// 获取 iOS Bundle ID
export const IOS_BUNDLE_ID = Config.IOS_BUNDLE_ID || 'com.boklock.dev.m';

// 获取应用名称
export const APP_NAME = Config.APP_NAME || 'boklock';

// 获取高德地图 API Key
export const MAP_KEY_ANDROID = Config.MAP_KEY_ANDROID;
export const MAP_KEY_IOS = Config.MAP_KEY_IOS;
export const MAP_KEY_HARMONY = Config.MAP_KEY_HARMONY || Config.MAP_KEY_OHOS;

// 导出配置对象（方便统一访问）
export const config = {
  env: ENV,
  deployEnv: DEPLOY_ENV,
  gray: GRAY,
  deployVersion: DEPLOY_VERSION,
  baseURL: BASE_URL,
  apiVersion: API_VERSION,
  androidPackageName: ANDROID_PACKAGE_NAME,
  iosBundleId: IOS_BUNDLE_ID,
  appName: APP_NAME,
  mapKeyAndroid: MAP_KEY_ANDROID,
  mapKeyIos: MAP_KEY_IOS,
  mapKeyHarmony: MAP_KEY_HARMONY,
};

// 打印当前环境（开发时方便调试）
if (__DEV__) {
  console.log('=== 环境配置 ===');
  console.log(`当前环境: ${ENV}`);
  console.log(`部署环境: ${DEPLOY_ENV}`);
  console.log(`灰度标识: ${GRAY}`);
  console.log(`部署版本: ${DEPLOY_VERSION}`);
  console.log(`API 地址: ${BASE_URL}`);
  console.log(`API 版本: ${API_VERSION}`);
  console.log(`Android 包名: ${ANDROID_PACKAGE_NAME}`);
  console.log(`iOS Bundle ID: ${IOS_BUNDLE_ID}`);
  console.log(`应用名称: ${APP_NAME}`);
  console.log(`高德地图 Android Key: ${MAP_KEY_ANDROID ? '已配置' : '未配置'}`);
  console.log(`高德地图 iOS Key: ${MAP_KEY_IOS ? '已配置' : '未配置'}`);
  console.log(`高德地图 Harmony Key: ${MAP_KEY_HARMONY ? '已配置' : '未配置'}`);
  console.log('===============');
}
