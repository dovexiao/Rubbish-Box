import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
  PermissionsAndroid,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import {
  MapType,
  MapView,
  Marker,
  isUsingHarmonyMapShim,
} from '@/utils/amap3d-adapter';
import AppIcon from '@/components/AppIcon';
import { PageContainer } from '@/components';
import {
  initAMapSdk,
  initAMapGeolocation,
  getCurrentLocation,
  requestHarmonyLocationPermission,
} from '@/utils';
import { IS_HARMONY } from '@/constants';
import type { HarmonyMarker } from '@/harmony/harmony-amap';
import styles from './styles';

const EARTH_RADIUS = 6378137;
const toRad = (deg: number) => (deg * Math.PI) / 180;

const calcDistanceMeters = (
  lat1?: number,
  lng1?: number,
  lat2?: number,
  lng2?: number,
) => {
  if (
    typeof lat1 !== 'number' ||
    typeof lng1 !== 'number' ||
    typeof lat2 !== 'number' ||
    typeof lng2 !== 'number'
  ) {
    return undefined;
  }

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(EARTH_RADIUS * c);
};

const formatDistance = (distance?: number) => {
  if (typeof distance !== 'number' || Number.isNaN(distance)) {
    return '--';
  }
  if (distance > 1000) {
    const km = distance / 1000;
    const kmText = km >= 10 ? Math.round(km).toString() : km.toFixed(1);
    return `${kmText}km`;
  }

  return `${distance}m`;
};

interface AddressInfoItem {
  lockId: string;
  lockName: string;
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

type RouteParams = {
  addressInfo?: string | AddressInfoItem[];
};

export default function DeviceAddressScreen() {
  const route = useRoute<any>();
  const rawAddressInfo = route.params?.addressInfo;

  const [locationReady, setLocationReady] = useState(false);
  const userLocationInfo = useRef<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const mapRef = useRef<any>(null);
  const isMountedRef = useRef<boolean>(true);
  const mapKeyRef = useRef<string>(`map-${Date.now()}-${Math.random()}`);
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

  // 处理 addressInfo，可能是字符串或数组
  const addressInfo = useMemo(() => {
    if (!rawAddressInfo) return null;
    if (Array.isArray(rawAddressInfo)) return rawAddressInfo;
    if (typeof rawAddressInfo === 'string') {
      try {
        return JSON.parse(rawAddressInfo);
      } catch {
        return null;
      }
    }
    return rawAddressInfo;
  }, [rawAddressInfo]);

  const initLocation = async () => {
    if (!isMountedRef.current) return;

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
      if (position && isMountedRef.current) {
        userLocationInfo.current = {
          latitude: position.latitude,
          longitude: position.longitude,
        };
      }
    } catch (error) {
      console.error('定位失败:', error);
    } finally {
      if (isMountedRef.current) {
        setLocationReady(true);
      }
    }
  };

  const markers = useMemo(() => {
    const newAddressList = Array.isArray(addressInfo)
      ? addressInfo.map(item => ({
          id: item.lockId,
          position: {
            latitude: item.latitude,
            longitude: item.longitude,
          },
          icon: {
            uri: 'https://g.18qjz.cn/img/boklock/device_icon.png',
            width: 36,
            height: 36,
          },
        }))
      : [];
    return [...newAddressList];
  }, [addressInfo]);

  const isHarmonyNativeMap = IS_HARMONY && !isHarmonyMapUnavailable;
  const harmonyMarkers = useMemo<HarmonyMarker[]>(() => {
    if (!isHarmonyNativeMap) return [];
    const _markers: HarmonyMarker[] = markers.map(item => ({
      id: String(item.id),
      latitude: item.position.latitude,
      longitude: item.position.longitude,
      icon: item.icon,
    }));
    if (userLocationInfo.current) {
      _markers.push({
        id: '000',
        latitude: userLocationInfo.current.latitude,
        longitude: userLocationInfo.current.longitude,
        icon: {
          uri: 'https://g.18qjz.cn/img/boklock/local_icon.png',
          width: 24,
          height: 37,
        },
      });
    }
    return _markers;
  }, [isHarmonyNativeMap, markers, userLocationInfo.current]);

  const handleLocate = useCallback(() => {
    if (mapRef.current && userLocationInfo.current) {
      try {
        mapRef.current.moveCamera(
          {
            target: {
              latitude: userLocationInfo.current.latitude,
              longitude: userLocationInfo.current.longitude,
            },
            zoom: 16,
          },
          1000,
        );
      } catch (error) {
        console.error('移动地图失败:', error);
      }
    }
  }, []);

  const openAMapNavigation = useCallback(
    (latitude: number, longitude: number) => {
      const scheme =
        Platform.OS === 'ios'
          ? `iosamap://path?sourceApplication=app&dlat=${latitude}&dlon=${longitude}&t=0`
          : `amapuri://route/plan/?dlat=${latitude}&dlon=${longitude}&dev=0&t=0`;
      const webUrl = `https://uri.amap.com/navigation?to=${longitude},${latitude},&mode=car&src=reactnative`;

      if (IS_HARMONY) {
        // 鸿蒙系统上直接尝试唤起高德地图，如果未安装（报错）则退级到网页版
        Linking.openURL(scheme).catch(() => {
          Linking.openURL(webUrl).catch(err => console.error('导航失败', err));
        });
      } else {
        Linking.canOpenURL(scheme)
          .then(supported => {
            if (supported) {
              Linking.openURL(scheme);
            } else {
              Linking.openURL(webUrl);
            }
          })
          .catch(err => console.error('导航失败', err));
      }
    },
    [],
  );

  useEffect(() => {
    isMountedRef.current = true;

    // 使用全局初始化函数，避免重复初始�?
    if (isHarmonyMapUnavailable) {
      setLocationReady(true);
    } else {
      initAMapSdk();
      initLocation();
    }

    return () => {
      isMountedRef.current = false;
      // 只清理引用，不手动销毁地�?
      mapRef.current = null;
    };
  }, [isHarmonyMapUnavailable]);

  // 页面隐藏时（返回首页时）
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      // 清理引用，避免与首页�?MapView 冲突
      mapRef.current = null;
    };
  }, []);

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      style={styles.container}
      pageNavProps={{
        text: '地图',
        showBack: true,
        background: '#FFFFFF',
      }}
    >
      <View style={styles.mapContainer}>
        <View style={styles.mapContent}>
          {isHarmonyMapUnavailable ? (
            <View style={styles.mapFallback}>
              <AppIcon name="location" color="#999999" size={32} />
              <Text style={styles.mapFallbackText}>
                Harmony 版本暂不支持地图展示
              </Text>
            </View>
          ) : (
            <>
              <MapView
                style={{
                  flex: 1,
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  zIndex: 1,
                }}
                key={mapKeyRef.current}
                ref={mapRef}
                mapType={MapType.Navi}
                compassEnabled={false}
                rotateGesturesEnabled={false}
                tiltGesturesEnabled={false}
                scaleControlsEnabled={false}
                zoomControlsEnabled={false}
                {...(isHarmonyNativeMap
                  ? {
                      center: {
                        latitude:
                          addressInfo?.[0]?.latitude ||
                          userLocationInfo.current?.latitude ||
                          39.9042,
                        longitude:
                          addressInfo?.[0]?.longitude ||
                          userLocationInfo.current?.longitude ||
                          116.4074,
                      },
                      zoomLevel: 12,
                      markers: harmonyMarkers,
                      mapViewStyle: 'native',
                    }
                  : {
                      initialCameraPosition: {
                        target: {
                          latitude:
                            addressInfo?.[0]?.latitude ||
                            userLocationInfo.current?.latitude ||
                            39.9042,
                          longitude:
                            addressInfo?.[0]?.longitude ||
                            userLocationInfo.current?.longitude ||
                            116.4074,
                        },
                        zoom: 12,
                      },
                    })}
              >
                {!isHarmonyNativeMap &&
                  !!markers.length &&
                  markers.map((item: any) => (
                    <Marker
                      key={item.id}
                      position={item.position}
                      icon={item.icon}
                    />
                  ))}

                {!isHarmonyNativeMap && userLocationInfo.current && (
                  <Marker
                    key={'000'}
                    position={{
                      latitude: userLocationInfo.current.latitude,
                      longitude: userLocationInfo.current.longitude,
                    }}
                    icon={{
                      uri: 'https://g.18qjz.cn/img/boklock/local_icon.png',
                      width: 24,
                      height: 37,
                    }}
                  />
                )}
              </MapView>
              <TouchableOpacity
                style={styles.locateIcon}
                onPress={handleLocate}
                activeOpacity={0.7}
              >
                <AppIcon name="location1" color="#000000" size={24} />
              </TouchableOpacity>
            </>
          )}
        </View>
        <View style={styles.addressContainer}>
          <View style={styles.addressContainerInner}>
            <View style={styles.addressTitle}>
              <Text style={styles.addressTitleText}>地锁位置</Text>
            </View>
            {addressInfo?.length ? (
              <ScrollView
                style={styles.addressList}
                showsVerticalScrollIndicator={addressInfo.length > 1}
              >
                {addressInfo.map((item: AddressInfoItem, index: number) => {
                  const isLast = index === addressInfo.length - 1;
                  return (
                    <View
                      key={item.lockId}
                      style={[
                        styles.addressItem,
                        isLast && styles.addressItemLast,
                      ]}
                    >
                      <View style={styles.addressItemName}>
                        <Text style={styles.addressItemNameText}>
                          {item.lockName}
                        </Text>
                      </View>
                      <View style={styles.addressItemAddress}>
                        <Text
                          style={styles.addressItemAddressText}
                          numberOfLines={1}
                        >
                          {item.formattedAddress}
                        </Text>
                      </View>
                      <View style={styles.addressItemSpace}>
                        <Text style={styles.addressItemSpaceText}>
                          {`距您${formatDistance(
                            calcDistanceMeters(
                              userLocationInfo.current?.latitude,
                              userLocationInfo.current?.longitude,
                              item.latitude,
                              item.longitude,
                            ),
                          )}`}
                        </Text>
                      </View>
                      <View style={styles.addressItemButtonContainer}>
                        <TouchableOpacity
                          style={[
                            styles.addressItemButton,
                            styles.addressItemButtonRight,
                          ]}
                          onPress={() =>
                            openAMapNavigation(item.latitude, item.longitude)
                          }
                          activeOpacity={0.7}
                        >
                          <Text style={styles.addressItemButtonRightText}>
                            导航
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            ) : (
              <View style={styles.addressEmpty}>
                <Text style={styles.addressEmptyText}>暂无地锁位置</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      {!locationReady && !isHarmonyMapUnavailable && (
        <View
          style={[
            styles.loading,
            {
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 99,
            },
          ]}
        >
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      )}
    </PageContainer>
  );
}
