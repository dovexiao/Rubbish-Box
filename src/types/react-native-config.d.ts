/**
 * react-native-config 类型定义
 * 根据你的 .env 文件中的变量定义类型
 */
declare module 'react-native-config' {
  export interface NativeConfig {
    DEPLOY_VERSION: string | undefined;
    ENV?: string;
    API_BASE_URL?: string;
    API_VERSION?: string;
    ANDROID_PACKAGE_NAME?: string;
    IOS_BUNDLE_ID?: string;
    APP_NAME?: string;
    // 在这里添加其他环境变量
  }

  export const Config: NativeConfig;
  export default Config;
}

