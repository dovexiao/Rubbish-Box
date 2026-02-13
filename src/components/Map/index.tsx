import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { MapType, MapView, Marker } from 'react-native-amap3d';
import { PermissionsAndroid, Platform } from 'react-native';
import IconFont from '@/iconfont';
import { initAMapSdk, initAMapGeolocation, getCurrentLocation } from '@/utils';
import styles from './styles';

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

export default function MapComponent(props: MapComponentProps) {
  const { style, address, longitude, latitude, markers, onClick } = props;

  const [makersList, setMakersList] = useState<any[]>([]);
  const [locationReady, setLocationReady] = useState(false);
  const userLocationInfo = useRef<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const mapRef = useRef<any>(null);

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
      console.error('地图初始化/定位失败:', error);
    } finally {
      setLocationReady(true);
    }
  };

  useEffect(() => {
    initAMapSdk();
    createMakers();
    initLocation();
    return () => {
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    createMakers();
  }, [markers]);

  if (!locationReady) {
    return (
      <View style={[styles.loading, style]}>
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  const centerLat = latitude ?? userLocationInfo.current?.latitude;
  const centerLng = longitude ?? userLocationInfo.current?.longitude;

  const content = (
    <View style={styles.mapContainer}>
      <View style={styles.mapContent}>
        <MapView
          mapType={MapType.Navi}
          ref={mapRef}
          compassEnabled={false}
          zoomGesturesEnabled={false}
          rotateGesturesEnabled={false}
          tiltGesturesEnabled={false}
          scaleControlsEnabled={false}
          zoomControlsEnabled={false}
          initialCameraPosition={{
            target: {
              latitude: centerLat ?? 0,
              longitude: centerLng ?? 0,
            },
            zoom: 16,
          }}
        >
          {makersList.map(
            item =>
              item.position && (
                <Marker
                  key={item.id}
                  position={item.position}
                  icon={item.icon}
                />
              ),
          )}
        </MapView>
      </View>
      <View style={styles.addressContainer}>
        <IconFont name="location" size={12} color="#ccc" />
        <Text style={styles.addressText} numberOfLines={1}>
          {address ?? '暂无'}
        </Text>
      </View>
    </View>
  );

  if (onClick) {
    return (
      <TouchableOpacity
        activeOpacity={1}
        style={[styles.mapContainer, style]}
        onPress={onClick}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.mapContainer, style]}>{content}</View>;
}
