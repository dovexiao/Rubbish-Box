import Config from 'react-native-config';
import HarmonyAmapShim from '@/harmony/amap3d-shim';
import HarmonyAmapNative, {
  isHarmonyNativeMapAvailable,
} from '@/harmony/harmony-amap';
import { IS_HARMONY } from '@/constants';

// 统一封装高德地图模块，确保 Harmony 等缺原生实现的平台使用 JS shim。
type MapModuleShape = {
  AMapSdk: {
    init: (apiKey?: string) => void;
    getCurrentKey?: () => string | undefined;
  };
  MapType: typeof HarmonyAmapShim.MapType;
  MapView: typeof HarmonyAmapShim.MapView;
  Marker: typeof HarmonyAmapShim.Marker;
};

const readConfigString = (key: string): string | undefined => {
  if (typeof Config !== 'object' || Config == null) {
    return undefined;
  }
  const bag = Config as unknown as Record<string, unknown>;
  const value = bag[key];
  return typeof value === 'string' ? value : undefined;
};

const rawHarmonyFlag = readConfigString('HARMONY_NATIVE_MAP');
const harmonyFlagNormalized = rawHarmonyFlag?.trim().toLowerCase();
const harmonyNativeFeatureForcedShim =
  harmonyFlagNormalized === 'false' ||
  harmonyFlagNormalized === 'off' ||
  harmonyFlagNormalized === 'shim';
// 默认开启原生地图，只有明确设置为 off/shim 时才退回 JS shim
const harmonyNativeFeatureEnabled = !harmonyNativeFeatureForcedShim;

let cachedModule: MapModuleShape | null = null;
let hasWarnedFallback = false;

const loadMapModule = (): MapModuleShape => {
  if (cachedModule) {
    return cachedModule;
  }

  if (IS_HARMONY) {
    if (harmonyNativeFeatureEnabled && isHarmonyNativeMapAvailable()) {
      cachedModule = HarmonyAmapNative as MapModuleShape;
    } else {
      if (__DEV__) {
        if (harmonyNativeFeatureForcedShim) {
          console.log(
            '[amap3d-adapter] Harmony native map forced to shim via HARMONY_NATIVE_MAP flag',
          );
        } else if (!isHarmonyNativeMapAvailable()) {
          console.warn(
            '[amap3d-adapter] Harmony native map unavailable, falling back to shim',
          );
        }
      }
      cachedModule = HarmonyAmapShim as MapModuleShape;
    }
    return cachedModule;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    cachedModule = require('react-native-amap3d') as MapModuleShape;
    return cachedModule;
  } catch (error) {
    if (__DEV__ && !hasWarnedFallback) {
      console.warn(
        '[amap3d-adapter] react-native-amap3d unavailable, using Harmony shim instead.',
        error,
      );
      hasWarnedFallback = true;
    }
    cachedModule = HarmonyAmapShim as MapModuleShape;
    return cachedModule;
  }
};

const mapModule = loadMapModule();

export const MapView = mapModule.MapView;
export const Marker = mapModule.Marker;
export const MapType = mapModule.MapType;
export const AMapSdk = mapModule.AMapSdk;

export const isUsingHarmonyMapShim = (): boolean =>
  IS_HARMONY &&
  (harmonyNativeFeatureForcedShim || !isHarmonyNativeMapAvailable());
