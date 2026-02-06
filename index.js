/**
 * @format
 */

import { AppRegistry, Platform } from 'react-native';
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

AppRegistry.registerComponent(appName, () => App);
