import { Toast } from '@ant-design/react-native';
import eventCenter from './eventCenter';

export type ToastIcon = 'success' | 'error' | 'loading' | 'none';

export interface ShowToastOptions {
  title: string;
  icon?: ToastIcon;
  duration?: number; // 毫秒，默认 1500，与 Taro 保持一致
}

let globalLoadingKey: any | null = null;
/**
 * 类 Taro.showToast
 *
 * 示例：
 *  showToast({ title: '保存成功', icon: 'success' })
 *  showToast({ title: '出错了', icon: 'error', duration: 2000 })
 */
export function showToast(options: ShowToastOptions | string): void {
  const opts: ShowToastOptions =
    typeof options === 'string' ? { title: options } : options;

  const { title, icon = 'none', duration = 1500 } = opts;
  const seconds = duration / 1000;

  if (icon === 'loading') {
    showLoading({ title });
    return;
  }

  // 如果是没有 icon 的情况，走我们封装的无遮挡全局 Modal Toast
  if (icon === 'none') {
    eventCenter.trigger('global_show_toast', { title, icon, duration });
    return;
  }

  // 如果有 icon，退回到 @ant-design/react-native 旧逻辑
  if (icon === 'success') {
    Toast.success({ content: title, duration: seconds });
  } else if (icon === 'error') {
    Toast.fail({ content: title, duration: seconds });
  } else {
    Toast.info({ content: title, duration: seconds });
  }
}

export interface ShowLoadingOptions {
  title?: string;
}

/**
 * 类 Taro.showLoading
 *
 * 示例：
 *  showLoading({ title: '加载中...' })
 */
export function showLoading(options?: ShowLoadingOptions): void {
  const title = options?.title ?? '加载中...';

  // 移出基于 Toast 的老逻辑
  if (globalLoadingKey) {
    Toast.remove(globalLoadingKey);
    globalLoadingKey = null;
  }

  // 触发全局高层级 Modal loading
  eventCenter.trigger('global_show_loading', { title });
}

/**
 * 类 Taro.hideLoading
 */
export function hideLoading(): void {
  if (globalLoadingKey) {
    Toast.remove(globalLoadingKey);
    globalLoadingKey = null;
  }
  // 隐藏全局高层级 Modal loading
  eventCenter.trigger('global_hide_loading');

  // 兜底：移除所有 Toast，防止遗留
  try {
    Toast.removeAll();
  } catch (e) {
    // ignore
  }
}
