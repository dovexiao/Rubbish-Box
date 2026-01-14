import { NavigationContainerRef, CommonActions, StackActions } from '@react-navigation/native';
import Toast from '@ant-design/react-native/lib/toast';

// 导航引用，在 App.tsx 中设置
let navigationRef: NavigationContainerRef<any> | null = null;

/**
 * 设置导航引用
 */
export function setNavigationRef(ref: NavigationContainerRef<any> | null) {
  navigationRef = ref;
}

/**
 * 导航到登录页面
 */
export function navigateToLogin() {
  if (navigationRef?.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      }),
    );
  }
}

/**
 * 导航到首页
 */
export function navigateToHome() {
  if (navigationRef?.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Index' }],
      }),
    );
  }
}

/**
 * 获取当前页面栈（兼容 Taro 风格）
 * 返回当前导航栈的路由信息
 */
export function getCurrentPages(): Array<{ routeName: string; params?: any }> {
  if (!navigationRef?.isReady()) {
    return [];
  }

  try {
    const state = navigationRef.getState();
    return state.routes.map((route) => ({
      routeName: route.name,
      params: route.params,
    }));
  } catch (error) {
    console.error('Failed to get current pages:', error);
    return [];
  }
}

/**
 * 返回上一页（兼容 Taro 风格）
 */
export function navigateBack() {
  const tryNavigate = (retries = 5) => {
    if (navigationRef?.isReady() && navigationRef.canGoBack()) {
      navigationRef.goBack();
    } else if (retries > 0) {
      setTimeout(() => tryNavigate(retries - 1), 100);
    }
  };
  tryNavigate();
}

/**
 * 重新启动到指定页面（兼容 Taro 风格）
 * 清空页面栈并导航到指定页面
 */
export function reLaunch(options: { url: string }) {
  const routeName = parseRouteName(options.url);

  if (!routeName) {
    return;
  }

  // 如果导航引用未准备好，等待一段时间后重试
  const tryNavigate = (retries = 5) => {
    if (navigationRef?.isReady()) {
      try {
        navigationRef.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: routeName }],
          }),
        );
      } catch (error) {
        console.error('Failed to reLaunch:', error);
      }
    } else if (retries > 0) {
      // 等待 100ms 后重试
      setTimeout(() => tryNavigate(retries - 1), 100);
    } else {
      console.warn('Navigation ref is not ready after retries');
    }
  };

  tryNavigate();
}

/**
 * 解析路由名称
 * '/pages/index/index' -> 'Index'
 * '/pages/login/index' -> 'Login'
 * 'Index' -> 'Index' (直接使用)
 */
function parseRouteName(url: string): string | null {
  // 如果已经是路由名称（首字母大写），直接返回
  if (url && url.charAt(0) === url.charAt(0).toUpperCase() && !url.includes('/')) {
    return url;
  }

  // 移除开头的斜杠
  const cleanUrl = url.startsWith('/') ? url.slice(1) : url;

  // 解析路径
  const parts = cleanUrl.split('/');
  if (parts.length >= 2 && parts[0] === 'pages') {
    // 取页面名称（第二个部分）
    const pageName = parts[1];
    // 首字母大写
    return pageName.charAt(0).toUpperCase() + pageName.slice(1);
  }

  // 如果格式不匹配，尝试直接使用（首字母大写）
  if (cleanUrl) {
    return cleanUrl.charAt(0).toUpperCase() + cleanUrl.slice(1);
  }

  return null;
}

