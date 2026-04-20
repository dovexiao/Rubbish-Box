import { fontSize, px } from '@/utils/ui';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, ViewProps, StyleSheet, Text } from 'react-native';

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
  init: () => {},
  getCurrentKey: () => undefined,
};

export interface MapViewProps extends ViewProps {
  mapType?: string;
  initialCameraPosition?: {
    target?: { latitude?: number; longitude?: number };
    zoom?: number;
  };
  center?: {
    latitude?: number;
    longitude?: number;
  };
  zoomLevel?: number;
  markers?: Array<{
    id?: string;
    latitude: number;
    longitude: number;
    title?: string;
  }>;
  mapViewStyle?: 'lite' | 'native';
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
      <View ref={containerRef} style={[styles.container, style]} {...rest}>
        <View style={styles.messageWrapper} pointerEvents="none">
          <Text style={styles.title}>Harmony 地图 Shim</Text>
          <Text style={styles.message}>
            当前构建未启用 Harmony 原生地图。请在环境变量设置
            HARMONY_NATIVE_MAP=on 并重新打包 Harmony 项目以加载原生地图。
          </Text>
        </View>
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

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#f7f7f7',
    alignItems: 'center',
    justifyContent: 'center',
    padding: px(16),
  },
  messageWrapper: {
    maxWidth: '90%',
  },
  title: {
    fontSize: fontSize(16),
    fontWeight: 'bold',
    marginBottom: px(8),
    textAlign: 'center',
    color: '#333333',
  },
  message: {
    fontSize: fontSize(14),
    color: '#666666',
    textAlign: 'center',
    lineHeight: px(20),
  },
});
