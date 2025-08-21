import {Platform} from 'react-native';
import {BasicObject} from '../types';
import {navigate, navGoBack, errorLog} from '@utils';
import globalStore from '@/services/global.state';
import useUserStore from '@/store/useUserStore';

export const goBack = () => {
  navGoBack();
};

export const checkToken = () => {
  if (globalStore.token) {
    return true;
  } else {
    goTo('Login');
    return false;
  }
};

const objectToQueryString = (obj: BasicObject) => {
  const keyValuePairs = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      keyValuePairs.push(
        encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]),
      );
    }
  }
  return keyValuePairs.join('&');
};

export const goToWithLogin = (router: string, params?: BasicObject) => {
  const token = globalStore.token || useUserStore.getState().token;
  if (!token) {
    goTo('Login');
    return;
  }
  goTo(router, params);
};

/**
 * @param router 路由名称
 * @param params url参数,如果参数中存在对象,在外部转换
 */
export const goTo = (router: string, params?: BasicObject) => {
  // TODO 解决params的类型问题
  if (Platform.OS === 'web') {
    try {
      navigate(router, params);
    } catch (error) {
      requestAnimationFrame(() => {
        const linking = globalStore.getItem('linking') as BasicObject;
        const screens = linking.config.screens as BasicObject;
        let link = '';
        if (params) {
          link = objectToQueryString(params);
        }
        if (screens[router]) {
          link = screens[router] + (link ? '?' + link : '');
        } else if (screens.Index.screens[router]) {
          link = screens.Index.screens[router] + (link ? '?' + link : '');
        } else {
          link = 'index/home';
          errorLog('route not found:', router);
        }
        window.location.href = window.location.origin + '/' + link;
      });
    }
  } else {
    navigate(router, params);
  }
};

/**
 * @param router 路由名称
 * @param params url参数,如果参数中存在对象,在外部转换
 * @param options 额外配置，例如 { replace: true }
 */
