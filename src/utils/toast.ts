import { Toast } from '@ant-design/react-native';

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

  switch (icon) {
    case 'success':
      Toast.success(title, seconds);
      break;
    case 'error':
      Toast.fail(title, seconds);
      break;
    case 'loading':
      // 建议使用 showLoading，兼容 icon = 'loading' 的写法
      showLoading({ title });
      break;
    case 'none':
    default:
      Toast.info(title, seconds);
      break;
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

  // 先移除之前的 loading，避免叠加
  if (globalLoadingKey) {
    Toast.remove(globalLoadingKey);
    globalLoadingKey = null;
  }

  globalLoadingKey = Toast.loading(title, 0);
}

/**
 * 类 Taro.hideLoading
 */
export function hideLoading(): void {
  if (globalLoadingKey) {
    Toast.remove(globalLoadingKey);
    globalLoadingKey = null;
  } else {
    // 兜底：移除所有 Toast，防止遗留
    try {
      Toast.removeAll();
    } catch (e) {
      // ignore
    }
  }
}
