import {useEffect, useState} from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{outcome: 'accepted' | 'dismissed'; platform: string}>;
}

export default function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false); // 新增：是否已安装

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      const evt = e as BeforeInstallPromptEvent;
      console.log('✅ 捕获到 beforeinstallprompt');
      setDeferredPrompt(evt);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // 检测是否已安装 PWA
  useEffect(() => {
    const checkInstalled = () => {
      const standalone = window.matchMedia(
        '(display-mode: standalone)',
      ).matches;
      const iosStandalone = (window.navigator as any).standalone === true; // iOS Safari
      setIsInstalled(standalone || iosStandalone);
      if (standalone || iosStandalone) {
        setCanInstall(false); // 已安装就不显示安装按钮
      }
    };

    checkInstalled();

    // 监听 Chrome 桌面 PWA 或 Android 进入 standalone 的变化
    window.addEventListener('appinstalled', () => {
      alert('🎉 PWA has been installed');
      setIsInstalled(true);
      setCanInstall(false);
    });

    return () => window.removeEventListener('appinstalled', () => {});
  }, []);

  const showInstallPrompt = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const {outcome} = await deferredPrompt.userChoice;
    console.log('用户选择：', outcome);
    setDeferredPrompt(null);
    setCanInstall(false);
  };

  return {canInstall, showInstallPrompt, isInstalled};
}
