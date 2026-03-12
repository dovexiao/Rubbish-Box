import { Platform } from 'react-native';

const isHarmonyPlatform = Platform.OS !== 'ios' && Platform.OS !== 'android';
let Clipboard: any = null;

try {
  if (isHarmonyPlatform) {
    const mod = require('@react-native-clipboard/clipboard');
    Clipboard = mod?.default ?? mod;
  } else {
    // Android/iOS 回退到 RN 内置剪贴板避免原生没链接崩溃
    const RN = require('react-native');
    Clipboard = RN.Clipboard;

    // 如果没有，再作为最低备选静默 fallback 一次尝试
    if (!Clipboard || typeof (Clipboard as any).setString !== 'function') {
      try {
        const fallbackMod = require('@react-native-clipboard/clipboard');
        Clipboard = fallbackMod?.default ?? fallbackMod;
      } catch (fallbackErr) {}
    }
  }
} catch (e) {
  console.warn('Clipboard shim init failed:', e);
}

export default Clipboard;
