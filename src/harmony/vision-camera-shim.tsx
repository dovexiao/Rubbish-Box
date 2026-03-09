import React from 'react';
import { IS_HARMONY } from '@/constants';

let _camera: any = {};

if (IS_HARMONY) {
  _camera = require('@react-native-ohos/react-native-vision-camera');
} else {
  _camera = require('react-native-vision-camera');
}

export type CodeType = 'qr' | 'ean-13' | 'ean-8' | string;

const NativeCamera = _camera.Camera;

type NativeCameraProps = React.ComponentProps<typeof NativeCamera>;

const HarmonyCamera = React.forwardRef<any, NativeCameraProps>((props, ref) => {
  if (!IS_HARMONY) return <NativeCamera ref={ref} {...props} />;

  // Harmony-specific fix:
  // The Harmony camera view enters SCAN mode only when codeScanner is set and
  // photo/video outputs are not enabled at the same time.
  const scanModeProps = props.codeScanner
    ? {
        preview: true,
        photo: false,
        video: false,
        audio: false,
        isMirrored: false,
      }
    : null;

  return <NativeCamera ref={ref} {...props} {...scanModeProps} />;
});

HarmonyCamera.displayName = 'VisionCameraShim';

// Keep Android/iOS fully transparent to avoid cross-platform regressions.
export const Camera = IS_HARMONY ? HarmonyCamera : NativeCamera;

export const useCameraDevice = _camera.useCameraDevice;
export const useCameraPermission = _camera.useCameraPermission;
export const useCodeScanner = _camera.useCodeScanner;
export const useCameraFormat = _camera.useCameraFormat;
export const useFrameProcessor = _camera.useFrameProcessor;
