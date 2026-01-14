/**
 * 应用更新 Hook
 * 在应用启动时检查更新
 */

import { useEffect, useCallback } from 'react';
import appUpdate from '@/utils/appUpdate';
import { Alert, Platform } from 'react-native';

export function useAppUpdate() {
  const checkUpdate = useCallback(() => {
    const updateManager = appUpdate();

    updateManager.onUpdateReady(() => {
      const updateInfo = updateManager.getUpdateInfo();

      if (updateInfo.hasUpdate) {
        const updateType = updateInfo.updateType === 'app' ? '应用更新' : '热更新';
        
        Alert.alert(
          '发现新版本',
          `检测到新的${updateType}，是否立即更新？`,
          [
            {
              text: '稍后',
              style: 'cancel',
            },
            {
              text: '立即更新',
              onPress: () => {
                updateManager.applyUpdate();
              },
            },
          ],
        );
      }
    });
  }, []);

  useEffect(() => {
    // 应用启动时检查更新（延迟 2 秒，避免影响启动速度）
    const timer = setTimeout(() => {
      checkUpdate();
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [checkUpdate]);

  return {
    checkUpdate,
  };
}

