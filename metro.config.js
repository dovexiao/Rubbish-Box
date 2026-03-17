const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { resolve } = require('metro-resolver');
const path = require('path');

const isHarmonyPlatform = platformName =>
  platformName !== 'ios' && platformName !== 'android';

// 尝试加载 Harmony（RNOH）专用的 Metro 配置；
// 若未安装 @react-native-oh/react-native-harmony，则静默跳过，避免影响现有 Android/iOS 开发。
let harmonyConfig = {};
try {
  // eslint-disable-next-line global-require
  const {
    createHarmonyMetroConfig,
  } = require('@react-native-oh/react-native-harmony/metro.config');
  harmonyConfig = createHarmonyMetroConfig({
    reactNativeHarmonyPackageName: '@react-native-oh/react-native-harmony',
  });
} catch (e) {
  // 未安装 Harmony 相关依赖时直接忽略
}

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

// 先合并默认配置与 Harmony 配置，保证 Harmony 自带的 resolver 生效
const baseConfig = mergeConfig(defaultConfig, harmonyConfig);

// 在此基础上应用项目自定义配置（额外模块映射、shim 等）
const previousResolver = baseConfig.resolver || {};
const previousResolveRequest = previousResolver.resolveRequest;

const extraNodeModules = {
  ...(previousResolver.extraNodeModules || null),
  'react-native-gesture-handler': path.resolve(
    __dirname,
    'node_modules/react-native-gesture-handler',
  ),
};

baseConfig.watchFolders = [path.resolve(__dirname)];

baseConfig.resolver = {
  ...previousResolver,
  extraNodeModules,
  unstable_enableSymlinks: true,
  // 针对特定平台/模块做定制解析
  resolveRequest(context, moduleName, platform) {
    // Harmony 平台下，用 JS shim 替代部分依赖原生模块的库，避免 NativeModule 为空时报错
    if (isHarmonyPlatform(platform)) {
      if (moduleName === 'react-native-svg') {
        // Harmony 上暂时没有原生 SVG 实现，使用 JS 占位 shim，保证图标至少有可见形态
        return resolve(
          {
            ...context,
            resolveRequest: null,
          },
          path.resolve(__dirname, 'src/harmony/svg-shim.tsx'),
          platform,
        );
      }

      if (moduleName === 'react-native-gesture-handler') {
        return resolve(
          {
            ...context,
            resolveRequest: null,
          },
          path.resolve(__dirname, 'src/harmony/gesture-handler-shim.tsx'),
          platform,
        );
      }

      if (moduleName === 'react-native-safe-area-context') {
        // Harmony 上使用 JS 版 safe-area-context，避免依赖 RNCSafeAreaProvider 原生组件
        return resolve(
          {
            ...context,
            resolveRequest: null,
          },
          path.resolve(__dirname, 'src/harmony/safe-area-context-shim.tsx'),
          platform,
        );
      }

      if (moduleName === 'react-native-reanimated') {
        // Harmony 上使用本地 JS shim，避免依赖原生 Reanimated
        return resolve(
          {
            ...context,
            resolveRequest: null,
          },
          path.resolve(__dirname, 'src/harmony/reanimated-shim.ts'),
          platform,
        );
      }

      if (moduleName === 'react-native-linear-gradient') {
        // Harmony 上用 JS 版 LinearGradient，避免 BVLinearGradient 原生组件缺失
        return resolve(
          {
            ...context,
            resolveRequest: null,
          },
          path.resolve(__dirname, 'src/harmony/linear-gradient-shim.tsx'),
          platform,
        );
      }

      if (moduleName === 'react-native-screens') {
        // Harmony 上用 JS 版 screens 占位实现，避免 RNSScreenStackHeaderConfig 等原生组件缺失
        return resolve(
          {
            ...context,
            resolveRequest: null,
          },
          path.resolve(__dirname, 'src/harmony/screens-shim.tsx'),
          platform,
        );
      }

      if (moduleName === 'react-native-wechat-lib') {
        // Harmony 上使用微信 SDK JS shim，避免加载库内部对 NativeModules.WeChat 的直接访问导致崩溃
        return resolve(
          {
            ...context,
            resolveRequest: null,
          },
          path.resolve(__dirname, 'src/harmony/wechat-lib-shim.ts'),
          platform,
        );
      }

      if (moduleName === 'react-native-amap3d') {
        // Harmony 上使用地图 SDK JS shim，避免 requireNativeComponent('AMapView') 崩溃
        return resolve(
          {
            ...context,
            resolveRequest: null,
          },
          path.resolve(__dirname, 'src/harmony/amap3d-shim.tsx'),
          platform,
        );
      }

      if (moduleName === '@react-native-async-storage/async-storage') {
        // Harmony 上统一重定向到持久化 shim，避免第三方/业务直接 import 原生 AsyncStorage 时崩溃
        return resolve(
          {
            ...context,
            resolveRequest: null,
          },
          path.resolve(__dirname, 'src/harmony/async-storage-shim.ts'),
          platform,
        );
      }

      if (moduleName === 'react-native-vision-camera') {
        // Harmony 下屏蔽原始的 react-native-vision-camera 避免解析报错
        return resolve(
          {
            ...context,
            resolveRequest: null,
          },
          path.resolve(
            __dirname,
            'node_modules/@react-native-ohos/react-native-vision-camera/src/index.tsx',
          ),
          platform,
        );
      }

      if (moduleName === 'react-native-view-shot') {
        // Harmony 平台：重新定向到含有 TurboModule 兼容的鸿蒙专用 npm 包，保持所有 React 层验证逻辑
        return resolve(
          {
            ...context,
            resolveRequest: null,
          },
          path.resolve(
            __dirname,
            'node_modules/@react-native-oh-tpl/react-native-view-shot/src/index.js',
          ),
          platform,
        );
      }
    }

    // 强制 axios 在 React Native 中使用 browser bundle，避免引用 Node 的 crypto 等内置模块
    if (moduleName === 'axios') {
      return resolve(
        {
          ...context,
          // 避免递归调用自定义 resolveRequest
          resolveRequest: null,
        },
        'axios/dist/browser/axios.cjs',
        platform,
      );
    }

    if (typeof previousResolveRequest === 'function') {
      return previousResolveRequest(context, moduleName, platform);
    }

    return resolve(context, moduleName, platform);
  },
};

module.exports = baseConfig;
