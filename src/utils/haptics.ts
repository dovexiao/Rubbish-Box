import {
  NativeModules,
  Platform,
  TurboModuleRegistry,
  Vibration,
} from 'react-native';
import { IS_HARMONY } from '@/constants';

type TriggerOptions = {
  enableVibrateFallback?: boolean;
  ignoreAndroidSystemSettings?: boolean;
};

type HapticFeedbackModule = {
  trigger: (type: string, options?: TriggerOptions) => void;
};

type AppModuleHaptic = {
  triggerUIKitHaptic?: (feedbackType: string) => void;
  triggerUIKitHapticWithSessionRelease?: (feedbackType: string) => void;
};

const HAPTIC_OPTIONS: TriggerOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

const IOS_HAPTIC_TYPE_MAP: Record<string, string> = {
  impactLight: 'light',
  impactMedium: 'medium',
  impactHeavy: 'heavy',
  notificationWarning: 'warning',
  notificationSuccess: 'success',
  selection: 'selection',
};

function vibrateFallback(): void {
  // 鸿蒙环境也完全支持调用基础的 Vibration.vibrate
  if (Platform.OS === 'ios' || Platform.OS === 'android' || IS_HARMONY) {
    Vibration.vibrate(20);
  }
}

function hasNativeHapticModule(): boolean {
  try {
    return (
      TurboModuleRegistry.get('RNHapticFeedback') != null ||
      NativeModules.RNHapticFeedback != null ||
      NativeModules.RNReactNativeHapticFeedback != null ||
      TurboModuleRegistry.get('RNReactNativeHapticFeedback') != null
    );
  } catch {
    return false;
  }
}

function triggerUIKitHapticIOS(rnType: string): void {
  const appModule = NativeModules.AppModule as AppModuleHaptic | undefined;
  const uiType = IOS_HAPTIC_TYPE_MAP[rnType] ?? 'heavy';

  if (appModule?.triggerUIKitHaptic) {
    appModule.triggerUIKitHaptic(uiType);
    return;
  }

  vibrateFallback();
}

function triggerNative(type: string): void {
  if (Platform.OS === 'ios') {
    triggerUIKitHapticIOS(type);
    return;
  }

  if (IS_HARMONY) {
    // 防止尚未链接原生模块时频繁报警告
    if (!hasNativeHapticModule()) {
      vibrateFallback();
      return;
    }

    try {
      const mod =
        require('@react-native-oh-tpl/react-native-haptic-feedback') as {
          trigger?: HapticFeedbackModule['trigger'];
          default?: { trigger?: HapticFeedbackModule['trigger'] };
        };
      const trigger = mod.trigger ?? mod.default?.trigger;
      if (trigger) {
        trigger(type, HAPTIC_OPTIONS);
        return;
      }
    } catch {
      // 鸿蒙环境如果没有安装该库，静默失败
      vibrateFallback();
      return;
    }
  }

  if (!hasNativeHapticModule()) {
    vibrateFallback();
    return;
  }

  const mod = require('react-native-haptic-feedback') as {
    default: HapticFeedbackModule;
  };
  mod.default.trigger(type, HAPTIC_OPTIONS);
}

export function triggerLightHaptic(): void {
  try {
    triggerNative('impactHeavy');
    if (IS_HARMONY) {
      // 鸿蒙原生 haptic 可能未起效果，补充默认的轻震动作兜底
      Vibration.vibrate(25);
    }
  } catch (error) {
    console.warn('[haptics] trigger failed', error);
    vibrateFallback();
  }
}

/** 按住说话：移入/移出取消区时的震动 */
export function triggerHoldToTalkTransitionHaptic(
  _toCancel: boolean,
  recorderActive = false,
): void {
  try {
    if (Platform.OS === 'ios') {
      const appModule = NativeModules.AppModule as AppModuleHaptic | undefined;
      // 录音进行中若 pause/resume 会打断音频采集导致卡顿，改用不占用录音会话的轻反馈
      if (recorderActive && appModule?.triggerUIKitHapticWithSessionRelease) {
        appModule.triggerUIKitHapticWithSessionRelease('light');
        return;
      }
      triggerUIKitHapticIOS(recorderActive ? 'impactLight' : 'impactHeavy');
      return;
    }

    triggerNative(recorderActive ? 'impactLight' : 'impactHeavy');
    Vibration.vibrate(recorderActive ? 15 : 25);
  } catch (error) {
    console.warn('[haptics] hold transition failed', error);
    vibrateFallback();
  }
}

/** @deprecated 请直接使用 triggerLightHaptic */
export function triggerTransitionHaptic(): void {
  triggerLightHaptic();
}
