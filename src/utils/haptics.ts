import {
  NativeModules,
  Platform,
  TurboModuleRegistry,
  Vibration,
} from 'react-native';

type TriggerFn = (
  type: string,
  options?: {
    enableVibrateFallback?: boolean;
    ignoreAndroidSystemSettings?: boolean;
  },
) => void;

let hapticAvailable: boolean | null = null;
let triggerFn: TriggerFn | null | undefined;

function detectHapticModule(): boolean {
  if (hapticAvailable !== null) {
    return hapticAvailable;
  }

  try {
    hapticAvailable =
      TurboModuleRegistry.get('RNHapticFeedback') != null ||
      TurboModuleRegistry.get('HapticFeedbackNativeModule') != null ||
      NativeModules.RNHapticFeedback != null;
  } catch {
    hapticAvailable = false;
  }

  return hapticAvailable;
}

function getTriggerFn(): TriggerFn | null {
  if (triggerFn !== undefined) {
    return triggerFn;
  }

  if (!detectHapticModule()) {
    triggerFn = null;
    return triggerFn;
  }

  try {
    const mod = require('@react-native-oh-tpl/react-native-haptic-feedback') as {
      trigger?: TriggerFn;
      default?: { trigger?: TriggerFn };
    };

    triggerFn = mod.trigger ?? mod.default?.trigger ?? null;
  } catch {
    triggerFn = null;
  }

  return triggerFn;
}

function vibrateFallback(): void {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    Vibration.vibrate(20);
  }
}

export function triggerLightHaptic(): void {
  try {
    const trigger = getTriggerFn();
    if (trigger) {
      trigger('impactLight', {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
      return;
    }

    vibrateFallback();
  } catch {
    vibrateFallback();
  }
}
