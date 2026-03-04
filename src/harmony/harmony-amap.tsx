import React, {
  PropsWithChildren,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  NativeSyntheticEvent,
  UIManager,
  View,
  ViewProps,
  findNodeHandle,
  requireNativeComponent,
} from 'react-native';

const COMPONENT_NAME = 'HarmonyAmapView';

type LatLng = {
  latitude: number;
  longitude: number;
};

type HarmonyCameraPosition = {
  target?: LatLng;
  zoomLevel?: number;
  zoom?: number;
};

export type HarmonyMarker = {
  id?: string;
  latitude: number;
  longitude: number;
  title?: string;
};

export interface HarmonyMapViewProps extends ViewProps {
  apiKey?: string;
  center?: LatLng;
  zoomLevel?: number;
  mapType?: string;
  markers?: HarmonyMarker[];
  showsUserLocation?: boolean;
  mapViewStyle?: 'lite' | 'native';
  onCameraPositionChange?: (
    event: NativeSyntheticEvent<{
      center?: LatLng;
      zoomLevel?: number;
    }>,
  ) => void;
  onMapLoaded?: () => void;
}

interface HarmonyNativeProps extends HarmonyMapViewProps {
  markers?: HarmonyMarker[];
}

export interface HarmonyMapViewRef {
  moveCamera: (camera: HarmonyCameraPosition) => void;
}

let cachedNativeComponent: React.ComponentClass<HarmonyNativeProps> | null =
  null;
const DEFAULT_AMAP_KEY = '91cd78bf8fd5555e2431651d676f134f';
let currentApiKey: string | undefined = DEFAULT_AMAP_KEY;
let hasWarnedMissingNativeView = false;

const hasNativeViewManager = (): boolean => {
  try {
    if (UIManager.getViewManagerConfig) {
      return !!UIManager.getViewManagerConfig(COMPONENT_NAME);
    }
    return !!(UIManager as unknown as Record<string, unknown>)[COMPONENT_NAME];
  } catch (error) {
    if (__DEV__ && !hasWarnedMissingNativeView) {
      console.warn(
        '[HarmonyAmap] failed to inspect UIManager for HarmonyAmapView',
        error,
      );
      hasWarnedMissingNativeView = true;
    }
    return false;
  }
};

const resolveNativeComponent =
  (): React.ComponentClass<HarmonyNativeProps> | null => {
    if (cachedNativeComponent) {
      return cachedNativeComponent;
    }
    if (!hasNativeViewManager()) {
      return null;
    }
    try {
      cachedNativeComponent =
        requireNativeComponent<HarmonyNativeProps>(COMPONENT_NAME);
      hasWarnedMissingNativeView = false;
      return cachedNativeComponent;
    } catch (error) {
      if (__DEV__ && !hasWarnedMissingNativeView) {
        console.warn(
          '[HarmonyAmap] native component registration incomplete',
          error,
        );
        hasWarnedMissingNativeView = true;
      }
      return null;
    }
  };

const dispatchCommand = (
  target: React.Component | null,
  command: string,
  args: unknown[] = [],
) => {
  const viewId = target ? findNodeHandle(target) : null;
  if (!viewId || !hasNativeViewManager()) {
    return;
  }
  const config = UIManager.getViewManagerConfig
    ? UIManager.getViewManagerConfig(COMPONENT_NAME)
    : null;
  if (!config) {
    return;
  }
  const commandId = config?.Commands?.[command] ?? command;
  UIManager.dispatchViewManagerCommand(viewId, commandId, args);
};

export const MapView = forwardRef<
  HarmonyMapViewRef,
  PropsWithChildren<HarmonyMapViewProps>
>(
  (
    { apiKey, markers, children, mapViewStyle: incomingStyle, ...viewProps },
    ref,
  ) => {
    const nativeRef = useRef<any>(null);
    const [resolveToken, setResolveToken] = useState(0);
    const NativeHarmonyMapView = useMemo(
      () => resolveNativeComponent(),
      [resolveToken],
    );
    const isNativeReady = !!NativeHarmonyMapView;
    const resolvedApiKey = apiKey ?? currentApiKey;
    const markerPayload = useMemo(() => markers ?? [], [markers]);
    // Default to native style to prevent lite-tile preload crashes on Harmony
    const mapViewStyle = incomingStyle ?? 'native';

    useEffect(() => {
      if (isNativeReady) {
        return;
      }
      const interval = setInterval(() => {
        if (resolveNativeComponent()) {
          setResolveToken(token => token + 1);
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }, [isNativeReady]);

    useImperativeHandle(ref, () => ({
      moveCamera: camera => {
        if (!camera || !isNativeReady) return;
        dispatchCommand(nativeRef.current, 'moveCamera', [camera]);
      },
    }));

    if (!isNativeReady || !NativeHarmonyMapView) {
      return (
        <View ref={nativeRef} {...viewProps}>
          {children}
        </View>
      );
    }

    return (
      <NativeHarmonyMapView
        {...viewProps}
        ref={nativeRef}
        apiKey={resolvedApiKey}
        mapViewStyle={mapViewStyle}
        markers={markerPayload}
      >
        {children}
      </NativeHarmonyMapView>
    );
  },
);

MapView.displayName = 'HarmonyMapView';

export const MapType = {
  Standard: 'standard',
  Satellite: 'satellite',
  Navi: 'navi',
  Bus: 'bus',
} as const;

export const Marker: React.FC = () => null;

export const AMapSdk = {
  init: (apiKey?: string) => {
    currentApiKey = apiKey;
  },
  getCurrentKey: () => currentApiKey,
};
export const isHarmonyNativeMapAvailable = (): boolean =>
  cachedNativeComponent !== null || hasNativeViewManager();

const HarmonyAmapModule = {
  MapView,
  Marker,
  MapType,
  AMapSdk,
};

export default HarmonyAmapModule;
