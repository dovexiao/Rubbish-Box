import React from 'react';

// iOS/Android 打包时用于屏蔽 @react-native-ohos/react-native-vision-camera 的代码gen/TS 解析错误。
// 由于业务在非 Harmony 平台不会真正使用该模块，保持这些导出为最小占位即可。

export const Camera = React.forwardRef<any, any>(() => null);

export const useCameraDevice = () => null;
export const useCameraPermission = () => ({ hasPermission: false });
export const useCodeScanner = () => undefined;
export const useCameraFormat = () => undefined;
export const useFrameProcessor = () => undefined;

export default {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
  useCameraFormat,
  useFrameProcessor,
};

