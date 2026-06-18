import { Platform, Vibration } from 'react-native';

type ImpactOptions = {
  enableVibrateFallback?: boolean;
  ignoreAndroidSystemSettings?: boolean;
};

type ImpactFn = (
  type: string,
  intensity?: number,
  options?: ImpactOptions,
) => void;

const isNativeMobile = Platform.OS === 'ios' || Platform.OS === 'android';

function getImpactFn(): ImpactFn | null {
  try {
    const mod = isNativeMobile
      ? require('react-native-haptic-feedback')
      : require('@react-native-oh-tpl/react-native-haptic-feedback');

    if (mod && typeof mod.impact === 'function') {
      return mod.impact as ImpactFn;
    }
  } catch {
    // Ignore and fall back to built-in vibration.
  }

  return null;
}

export function triggerLightHaptic(): void {
  try {
    const impact = getImpactFn();
    console.log(11111);
    if (impact) {
      console.log(22222);

      impact('impactHeavy', 1, {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
      return;
    }

    Vibration.vibrate(20);
  } catch {
    // Ignore failures on unsupported devices.
  }
}
