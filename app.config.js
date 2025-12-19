/**
 * Expo Configuration
 * JavaScript version for EAS Build compatibility
 */

module.exports = ({ config }) => {
  const existingPlugins = config.plugins ?? []
  
  // 读取环境变量
  const appEnv = process.env.NODE_ENV || 'development'

  return {
    ...config,
    ios: {
      ...config.ios,
      privacyManifests: {
        NSPrivacyAccessedAPITypes: [
          {
            NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryUserDefaults",
            NSPrivacyAccessedAPITypeReasons: ["CA92.1"],
          },
        ],
      },
    },
    android: {
      ...config.android,
      edgeToEdgeEnabled: false,
    },
    // 传递环境变量到应用
    extra: {
      ...config.extra,
      appEnvironment: appEnv,
    },
    // Expo Updates 配置 - 生产环境启用
    updates: {
      url: "https://u.expo.dev/781589ef-0937-4906-a236-5deac80db17b",
      enabled: true,
      checkAutomatically: "ON_LOAD",
      fallbackToCacheTimeout: 0,
    },
    // 运行时版本配置
    runtimeVersion: "1.0.6",
    plugins: [
      ...existingPlugins, 
      "expo-font"
    ],
  }
}
