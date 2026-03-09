import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleProp,
  ViewStyle,
  Pressable,
  ViewProps,
} from 'react-native';
import {
  MapType,
  MapView,
  Marker,
  isUsingHarmonyMapShim,
} from '@/utils/amap3d-adapter';
import { PermissionsAndroid, Platform } from 'react-native';
import IconFont from '@/iconfont';
import {
  initAMapSdk,
  initAMapGeolocation,
  getCurrentLocation,
  requestHarmonyLocationPermission,
} from '@/utils';
import { IS_HARMONY } from '@/constants';
import type { HarmonyMarker } from '@/harmony/harmony-amap';
import styles from './styles';

const INITIAL_HARMONY_MAP_KEY = IS_HARMONY ? initAMapSdk() : undefined;

export interface MapComponentProps {
  className?: string;
  style?: StyleProp<ViewStyle>;
  longitude: number;
  latitude: number;
  address?: string;
  markers?: Array<{
    id: string;
    latitude: number;
    longitude: number;
    name?: string;
    iconPath?: string;
    width?: number;
    height?: number;
  }>;
  onClick?: () => void;
}

type InternalMarker = {
  id: string;
  position?: {
    latitude: number;
    longitude: number;
  };
  title?: string;
  icon?: {
    uri: string;
    width: number;
    height: number;
  };
};

export default function MapComponent(props: MapComponentProps) {
  const { style, address, longitude, latitude, markers, onClick } = props;

  const [makersList, setMakersList] = useState<InternalMarker[]>([]);
  const [locationReady, setLocationReady] = useState(false);
  const hasInitLocation = useRef(false);
  const [harmonyApiKey, setHarmonyApiKey] = useState<string | undefined>(
    INITIAL_HARMONY_MAP_KEY,
  );
  const userLocationInfo = useRef<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const mapRef = useRef<any>(null);
  const [isHarmonyMapUnavailable, setIsHarmonyMapUnavailable] = useState(
    isUsingHarmonyMapShim(),
  );

  useEffect(() => {
    if (!IS_HARMONY || !isHarmonyMapUnavailable) {
      return;
    }
    const timer = setInterval(() => {
      if (!isUsingHarmonyMapShim()) {
        setIsHarmonyMapUnavailable(false);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isHarmonyMapUnavailable]);

  const renderCardContent = (mapSection: ReactNode) => (
    <>
      <View style={styles.mapContent}>{mapSection}</View>
      <View style={styles.addressContainer}>
        <IconFont name="location" size={12} color="#ccc" />
        <Text style={styles.addressText} numberOfLines={1}>
          {address ?? '暂无'}
        </Text>
      </View>
    </>
  );

  const renderCard = (mapSection: ReactNode) => {
    const rippleProps =
      Platform.OS === 'android'
        ? { android_ripple: { color: 'rgba(0,0,0,0.08)' } }
        : undefined;

    return (
      <View style={[styles.mapContainer, style]}>
        {renderCardContent(mapSection)}
        {onClick ? (
          <Pressable
            style={styles.mapClickOverlay}
            onPress={onClick}
            {...(rippleProps ?? {})}
          />
        ) : null}
      </View>
    );
  };

  const createMakers = () => {
    const newMakers =
      markers?.map(item => ({
        id: item.id,
        position: {
          latitude: item.latitude,
          longitude: item.longitude,
        },
        title: item.name,
        icon: item.iconPath
          ? {
              uri: item.iconPath,
              width: item.width ?? 32,
              height: item.height ?? 32,
            }
          : undefined,
      })) ?? [];
    setMakersList(newMakers);
  };

  const initLocation = async () => {
    if (isHarmonyMapUnavailable) {
      setLocationReady(true);
      return;
    }

    if (IS_HARMONY) {
      const granted = await requestHarmonyLocationPermission();
      if (!granted) {
        console.warn('[Harmony] 定位权限未授权，跳过定位获取');
        setLocationReady(true);
        return;
      }
    }

    if (Platform.OS === 'android') {
      try {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);
      } catch (e) {
        console.warn('定位权限请求失败:', e);
      }
    }

    try {
      await initAMapGeolocation();
      const position = await getCurrentLocation();
      if (position) {
        userLocationInfo.current = {
          latitude: position.latitude,
          longitude: position.longitude,
        };
      }
    } catch (error) {
      // console.error('地图初始化/定位失败:', error);
    } finally {
      setLocationReady(true);
    }
  };

  useEffect(() => {
    if (isHarmonyMapUnavailable) {
      setLocationReady(true);
      return () => {
        mapRef.current = null;
      };
    }

    const resolvedKey = initAMapSdk();
    if (IS_HARMONY && resolvedKey && resolvedKey !== harmonyApiKey) {
      setHarmonyApiKey(resolvedKey);
    }
    createMakers();
    if (!hasInitLocation.current) {
      hasInitLocation.current = true;
      initLocation();
    }
    return () => {
      mapRef.current = null;
    };
  }, [harmonyApiKey, isHarmonyMapUnavailable]);

  useEffect(() => {
    createMakers();
  }, [markers]);

  const centerLat = latitude ?? userLocationInfo.current?.latitude;
  const centerLng = longitude ?? userLocationInfo.current?.longitude;

  const cameraTarget = useMemo(
    () => ({
      latitude: centerLat ?? 0,
      longitude: centerLng ?? 0,
    }),
    [centerLat, centerLng],
  );

  const mapPointerEvents: ViewProps['pointerEvents'] = IS_HARMONY
    ? 'none'
    : 'auto';

  const isHarmonyNativeMap = IS_HARMONY && !isHarmonyMapUnavailable;
  const useHarmonySafeMode = false; // 原本这里强行设置为 true 会导致鸿蒙原生图标为空，现将其关闭以便传参
  const harmonyMarkers = useMemo<HarmonyMarker[]>(() => {
    if (!isHarmonyNativeMap || useHarmonySafeMode) {
      return [];
    }
    return makersList.reduce<HarmonyMarker[]>((acc, item) => {
      if (!item.position) {
        return acc;
      }
      acc.push({
        id: item.id,
        latitude: item.position.latitude,
        longitude: item.position.longitude,
        title: item.title,
        icon: item.icon,
      });
      return acc;
    }, []);
  }, [isHarmonyNativeMap, makersList, useHarmonySafeMode]);

  useEffect(() => {
    if (!mapRef.current?.moveCamera || centerLat == null || centerLng == null) {
      return;
    }
    mapRef.current.moveCamera({
      target: {
        latitude: centerLat,
        longitude: centerLng,
      },
      zoom: 16,
    });
  }, [centerLat, centerLng, isHarmonyNativeMap]);

  if (isHarmonyMapUnavailable) {
    const fallback = renderCard(
      <View style={styles.mapFallback}>
        <IconFont name="location" size={24} color="#999999" />
        <Text style={styles.mapFallbackText}>
          当前版本暂未启用 Harmony 原生地图
        </Text>
      </View>,
    );
    return fallback;
  }

  if (IS_HARMONY && !harmonyApiKey) {
    return (
      <View style={[styles.loading, style]}>
        <Text style={styles.loadingText}>正在初始化地图密钥...</Text>
      </View>
    );
  }

  if (!locationReady) {
    return (
      <View style={[styles.loading, style]}>
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  const commonMapProps = {
    mapType: isHarmonyNativeMap ? MapType.Standard : MapType.Navi,
    ref: mapRef,
    compassEnabled: false,
    zoomGesturesEnabled: false,
    rotateGesturesEnabled: false,
    tiltGesturesEnabled: false,
    scaleControlsEnabled: false,
    zoomControlsEnabled: false,
    pointerEvents: mapPointerEvents,
    ...(IS_HARMONY && harmonyApiKey ? { apiKey: harmonyApiKey } : {}),
  } as const;

  const harmonyMapProps = isHarmonyNativeMap
    ? {
        center: cameraTarget,
        zoomLevel: 16,
        markers: harmonyMarkers,
        // Native style avoids Harmony lite-tile downloads that currently crash on 404
        mapViewStyle: 'native' as const,
      }
    : {
        initialCameraPosition: {
          target: cameraTarget,
          zoom: 16,
        },
      };

  const shouldRenderMarkerChildren = !isHarmonyNativeMap;

  const mapSection = (
    <MapView
      style={{ flex: 1, width: '100%', height: '100%' }}
      {...commonMapProps}
      {...harmonyMapProps}
    >
      {shouldRenderMarkerChildren
        ? makersList.map(
            item =>
              item.position && (
                <Marker
                  key={item.id}
                  position={item.position}
                  icon={item.icon}
                />
              ),
          )
        : null}
    </MapView>
  );

  return renderCard(mapSection);
}
