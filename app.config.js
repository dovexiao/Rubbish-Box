/**
 * Expo Configuration
 * JavaScript version for EAS Build compatibility
 */

module.exports = ({ config }) => {
  const existingPlugins = config.plugins ?? []

  return {
    ...config,
    ios: {
      ...config.ios,
      // This privacyManifests is to get you started.
      // See Expo's guide on apple privacy manifests here:
      // https://docs.expo.dev/guides/apple-privacy/
      // You may need to add more privacy manifests depending on your app's usage of APIs.
      // More details and a list of "required reason" APIs can be found in the Apple Developer Documentation.
      // https://developer.apple.com/documentation/bundleresources/privacy-manifest-files
      privacyManifests: {
        NSPrivacyAccessedAPITypes: [
          {
            NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryUserDefaults",
            NSPrivacyAccessedAPITypeReasons: ["CA92.1"], // CA92.1 = "Access info from same app, per documentation"
          },
        ],
      },
    },
    android: {
      ...config.android,
      edgeToEdgeEnabled: false,
    },
    // Expo Updates 配置 - 生产环境启用
    updates: {
      url: "https://u.expo.dev/781589ef-0937-4906-a236-5deac80db17b",
      enabled: true,
      checkAutomatically: "ON_LOAD",
      fallbackToCacheTimeout: 0,
    },
    // 运行时版本配置 - bare workflow需要手动设置版本号
    runtimeVersion: "1.0.3",
    // EAS Build配置将在初始化后自动添加
    plugins: [
      ...existingPlugins, 
      "expo-font"
    ],
  }
}
