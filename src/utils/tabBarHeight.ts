import { px } from '@/utils/ui';

/** 与 MainTabNavigator tabBarStyle 保持一致 */
export const TAB_BAR_MIN_BOTTOM_INSET = 20;
export const TAB_BAR_BASE_HEIGHT = 60;

/**
 * 按 TabNavigator 样式估算：60 设计稿高度 + 底部安全区（至少 20）
 */
export function getTabBarHeightFallback(bottomInset: number): number {
  return px(TAB_BAR_BASE_HEIGHT + Math.max(bottomInset, TAB_BAR_MIN_BOTTOM_INSET));
}
