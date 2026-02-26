import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, ViewProps } from 'react-native';

/**
 * Harmony 平台下的 react-native-amap3d 简易 shim。
 *
 * 目标：
 * - 避免 requireNativeComponent('AMapView') 在 Harmony 报错；
 * - 维持基础 API 形状，保证业务页面可渲染、不崩溃；
 * - 仅在 metro.config 中对 harmony 生效，不影响 Android / iOS。
 */

export const MapType = {
  Standard: 'standard',
  Satellite: 'satellite',
  Navi: 'navi',
  Bus: 'bus',
};

export const AMapSdk = {
  init: (_apiKey?: string) => {},
};

export interface MapViewProps extends ViewProps {
  mapType?: string;
  initialCameraPosition?: {
    target?: { latitude?: number; longitude?: number };
    zoom?: number;
  };
  zoomGesturesEnabled?: boolean;
  rotateGesturesEnabled?: boolean;
  tiltGesturesEnabled?: boolean;
  zoomControlsEnabled?: boolean;
  scaleControlsEnabled?: boolean;
  compassEnabled?: boolean;
}

export type MapViewRef = {
  moveCamera: (
    _camera: {
      target?: { latitude?: number; longitude?: number };
      zoom?: number;
    },
    _duration?: number,
  ) => void;
};

export const MapView = forwardRef<MapViewRef, MapViewProps>(
  ({ children, style, ...rest }, ref) => {
    const containerRef = useRef<View>(null);

    useImperativeHandle(ref, () => ({
      moveCamera: () => {},
    }));

    return (
      <View ref={containerRef} style={style} {...rest}>
        {children}
      </View>
    );
  },
);

MapView.displayName = 'HarmonyAMapViewShim';

export interface MarkerProps extends ViewProps {
  position?: { latitude?: number; longitude?: number };
  icon?: {
    uri?: string;
    width?: number;
    height?: number;
  };
  title?: string;
}

export const Marker: React.FC<MarkerProps> = () => null;

const AMapShim = {
  AMapSdk,
  MapType,
  MapView,
  Marker,
};

export default AMapShim;
