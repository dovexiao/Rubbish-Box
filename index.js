/**
 * @format
 */

import { AppRegistry, Platform, TurboModuleRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// 仅在原生 Android / iOS 上初始化依赖原生模块的库
if (Platform.OS === 'android' || Platform.OS === 'ios') {
  // 手势处理（依赖原生模块），Harmony 等平台不加载，避免 NativeModule 为空
  // eslint-disable-next-line global-require
  require('react-native-gesture-handler');

  // Reanimated 在部分非 Android / iOS 平台（如 Harmony）可能没有原生实现
  // eslint-disable-next-line global-require
  require('react-native-reanimated');
}

// Harmony 等非原生微信平台：为缺失的 WechatLibTurboModule 提供安全兜底，避免启动直接崩溃
if (
  Platform.OS !== 'ios' &&
  Platform.OS !== 'android' &&
  TurboModuleRegistry &&
  typeof TurboModuleRegistry.getEnforcing === 'function'
) {
  const originalGetEnforcing =
    TurboModuleRegistry.getEnforcing.bind(TurboModuleRegistry);
  // 覆盖 getEnforcing，只对 WechatLibTurboModule 做特殊处理
  TurboModuleRegistry.getEnforcing = name => {
    if (name === 'WechatLibTurboModule') {
      // 返回一个空实现，所有方法要么返回 false，要么抛出“当前平台不支持”错误
      return {
        registerApp: () => Promise.resolve(false),
        isWXAppInstalled: () => Promise.resolve(false),
        sendAuthRequest: async () => {
          throw new Error('WeChat SDK is not supported on Harmony platform');
        },
        launchMiniProgram: async () => {
          throw new Error(
            'WeChat MiniProgram is not supported on Harmony platform',
          );
        },
      };
    }
    return originalGetEnforcing(name);
  };
}

AppRegistry.registerComponent(appName, () => App);
