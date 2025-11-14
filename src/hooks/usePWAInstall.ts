import {useEffect, useState} from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{outcome: 'accepted' | 'dismissed'; platform: string}>;
}

export default function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false); // ✅ 新增：是否正在安装

  // 捕获 beforeinstallprompt（Chrome/Edge/Android）
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      const evt = e as BeforeInstallPromptEvent;
      console.log('✅ [PWA] 捕获到 beforeinstallprompt');
      setDeferredPrompt(evt);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // 检测是否已安装
  useEffect(() => {
    const checkInstalled = () => {
      const standalone = window.matchMedia(
        '(display-mode: standalone)',
      ).matches;
      const iosStandalone = (window.navigator as any).standalone === true;

      const installed = standalone || iosStandalone;
      setIsInstalled(installed);
      if (installed) setCanInstall(false);
    };

    checkInstalled();

    const onAppInstalled = () => {
      console.log('🎉 [PWA] installed');
      setIsInstalled(true);
      setCanInstall(false);
      setIsInstalling(false);
    };

    window.addEventListener('appinstalled', onAppInstalled);
    return () => window.removeEventListener('appinstalled', onAppInstalled);
  }, []);

  // 手动显示安装提示
  const showInstallPrompt = async () => {
    if (!deferredPrompt) {
      // console.warn('⚠️ [PWA] 没有可用的安装提示');
      return;
    }

    try {
      setIsInstalling(true); // ✅ 进入“正在安装”状态
      deferredPrompt.prompt();
      const {outcome} = await deferredPrompt.userChoice;
      // console.log('📦 [PWA] 用户选择:', outcome);

      if (outcome === 'accepted') {
        // console.log('✅ [PWA] 用户接受安装');
      } else {
        // console.log('❌ [PWA] 用户取消安装');
      }
    } finally {
      // 不论成功或失败都重置状态
      setDeferredPrompt(null);
      setCanInstall(false);
      setIsInstalling(false);
    }
  };

  return {
    canInstall, // 是否可以安装
    isInstalled, // 是否已安装
    isInstalling, // 是否正在安装中
    showInstallPrompt, // 触发安装
  };
}
