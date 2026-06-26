import { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { useSafeAreaInsets } from '@/libs/safeAreaContext';
import { tabBarHeightStore } from '@/store/store';
import { getTabBarHeightFallback } from '@/utils/tabBarHeight';

/**
 * 读取 TabBar 高度。实测值由 MainTabNavigator 写入 tabBarHeightStore，
 * 页面侧不再重复测量，避免失败时 fallback 覆盖正确值。
 */
export function useTabBarHeight() {
  const cachedHeight = useAtomValue(tabBarHeightStore);
  const insets = useSafeAreaInsets();

  const tabBarHeight = useMemo(() => {
    return cachedHeight > 0
      ? cachedHeight
      : getTabBarHeightFallback(insets.bottom);
  }, [cachedHeight, insets.bottom]);

  return { tabBarHeight };
}
