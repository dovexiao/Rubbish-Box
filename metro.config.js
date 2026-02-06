const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { resolve } = require('metro-resolver');
const path = require('path');

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
    if (platform === 'harmony') {
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

      if (moduleName === '@react-native-async-storage/async-storage') {
        return resolve(
          {
            ...context,
            resolveRequest: null,
          },
          path.resolve(__dirname, 'src/harmony/async-storage-shim.ts'),
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

      if (moduleName === 'react-native-svg') {
        // Harmony 上用 JS 版 Svg 占位实现，避免 RNSVGPath 等原生组件缺失
        return resolve(
          {
            ...context,
            resolveRequest: null,
          },
          path.resolve(__dirname, 'src/harmony/svg-shim.tsx'),
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
