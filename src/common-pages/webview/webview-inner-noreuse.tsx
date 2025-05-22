import globalStore from '@services/global.state';
import {BasicObject, SafeAny} from '@types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
} from 'react';
import {useMemo, useRef} from 'react';
import {VERSION_CODE, errorLog, goBack, goCS, goTo, navigateTo} from '@/utils';
import envConfig from '@utils/env.config';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {Linking} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {useTranslation} from 'react-i18next';
import Spin from '@/components/basic/spin';
import WebView, {WebViewMessageEvent} from 'react-native-webview';
import Refresh from '@/components/basic/error-pages/refresh';
import theme from '@/style';
import {bankPageTemplate} from './bank-page.template';

interface WebViewOptions {
  title: string;
  rightNode?: React.JSX.Element | null;
  /** 如果涉及自由外链，则传这一个，那么urlPrefix就失效了 */
  originUrl?: string;
  /** 如果不涉及自由外链，则传这一个 */
  urlPrefix?: string;
  /** 内部网页向外部通信后其他需要额外处理的内容 */
  onMessage?: (data: string | BasicObject) => void;
  /** 当 WebView 加载成功或失败时调用的函数 */
  onLoadEnd?: (type?: 'success' | 'failed') => void;
}

export interface WebViewInnerRef {
  goBack: () => void;
}

const WebViewInnerNoReuse: React.ForwardRefRenderFunction<
  WebViewInnerRef,
  WebViewOptions
> = (options, outRef) => {
  const {i18n} = useTranslation();
  const {originUrl, urlPrefix, onMessage, onLoadEnd, title, rightNode} =
    options;
  const ref = useRef<SafeAny>(null);
  const topWindowUrl = useMemo(() => {
    if (globalStore.isWeb) {
      return window.location.origin;
    }
    return 'android';
  }, []);
  const [token, setToken] = useState(globalStore.token);
  const [innerGoBack, setInnerGoBack] = useState(false);
  const [navWebviewCanGoback, setNavWebviewCanGoback] =
    useState<boolean>(false);

  const processData = (data: string | BasicObject) => {
    if (!data) {
      return;
    }
    if (typeof data === 'string') {
      if (data === 'gotoservice') {
        goCS();
        return;
      }
      if (data === 'paid:success') {
        goTo('PaidSuccess');
        return;
      }
      if (data === 'back') {
        handleGoBack();
        return;
      }
      if (data === 'innerback') {
        setInnerGoBack(true);
        return;
      }
      if (data === 'login') {
        // 在webview返回login后，如果关闭会陷入无限login，这情况传入backPage改变跳转
        goTo('Login', {
          backPage: globalStore.homePage,
        });
        return;
      }
      if (data.startsWith('login:back')) {
        const parmas = data.split('_')[1];
        if (parmas) {
          const _data = JSON.parse(parmas) as BasicObject;
          goTo('Login', {
            backPage: _data.backPage,
            successPage: _data.successPage,
            sucessPageParams: _data.sucessPageParams,
          });
        } else {
          goTo('Login');
        }
      }
      if (data === 'globalLoading:show') {
        globalStore.globalLoading.next(true);
        return;
      }
      if (data === 'globalLoading:hide') {
        globalStore.globalLoading.next(false);
        return;
      }
      if (data === 'update:amount') {
        if (globalStore.token) {
          globalStore.updateAmount.next();
        }
        return;
      }
      if (data.startsWith('router:')) {
        const paramsJsonStr = data.substring('router:'.length);
        try {
          const params = JSON.parse(paramsJsonStr);
          goTo(params.name, params.params);
        } catch (e) {
          errorLog('error', e);
        }
        return;
      }
      if (data.startsWith('origin:')) {
        const origin = data.substring('origin:'.length);
        navigateTo(origin);
        return;
      }
      if (data.startsWith('webview-router:')) {
        // TODO 这里似乎用不到了
        const path = data.substring('webview-router:'.length);
        goTo('WebView', {header: true, path, isReactH5: '0'});
        return;
      }
      if (data.startsWith('openwindow:')) {
        Linking.openURL(data.substring('openwindow:'.length));
        return;
      }
      if (data.startsWith('copy:')) {
        Clipboard.setString(data.substring('copy:'.length));
        globalStore.globalSucessTotal(i18n.t('copy-success'));
        return;
      }
    }
    onMessage?.(data);
  };

  const handleMessage = (e: WebViewMessageEvent | MessageEvent) => {
    if (!e) {
      return;
    }
    const data = globalStore.isWeb
      ? (e as MessageEvent).data
      : (e as WebViewMessageEvent).nativeEvent.data;
    processData(data);
  };

  const handleGoBack = (path?: string) => {
    // 如果有特定的回退路径，则使用该路径
    if (globalStore.token) {
      globalStore.updateAmount.next();
    }
    if (path) {
      goTo(path);
      return;
    }
    if (globalStore.isWeb) {
      if (innerGoBack) {
        window.history.back();
      } else {
        goBack();
      }
      return;
    }
    if (innerGoBack && navWebviewCanGoback) {
      ref.current.goBack();
      return;
    }
    goBack();
  };

  const closeReuseWebView = () => {
    globalStore.updateReuseWebViewSub.next({
      url: '',
    });
  };

  const getToken = useCallback(() => {
    // if (globalStore.isWeb) {
    //   ref.current && (ref.current.src = ref.current.src);
    // } else {
    //   ref.current?.reload();
    // }
    // 防止web端刷新该页面后，token来不及获取，故此处会异步重新获取token

    if (globalStore.isWeb) {
      window.addEventListener('message', handleMessage);
      setToken(localStorage.getItem('token'));
    } else {
      AsyncStorage.getItem('token').then(res => {
        if (res) {
          setToken(res);
        } else {
          setToken('');
        }
      });
    }
    return () => {
      if (globalStore.isWeb) {
        window.removeEventListener('message', handleMessage);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(getToken);

  const url = useMemo(() => {
    if (originUrl) {
      return originUrl;
    }
    if (urlPrefix) {
      return `${urlPrefix}${
        urlPrefix.indexOf('?') > -1 ? '&' : '?'
      }topWindowUrl=${topWindowUrl}${
        token ? `&token=${token}` : '&logout=1'
      }&api=${envConfig.baseUrl}&${
        envConfig.induswinUrl ? `induswinApi=${envConfig.induswinUrl}&` : ''
      }raceApi=${envConfig.racecarUrl}&lang=${globalStore.lang}&currency=${
        globalStore.currency
      }&channel=${
        globalStore.channel || (globalStore.isAndroid ? 'android' : 'h5')
      }&packageId=${globalStore.packageId}&packageInfo=${
        globalStore.packageInfo
      }&visitor=${globalStore.visitor}&versionCode=${
        globalStore.isAndroid ? VERSION_CODE : '999'
      }`;
    }
    return '';
  }, [originUrl, token, topWindowUrl, urlPrefix]);

  useImperativeHandle(
    outRef,
    () => {
      return {
        goBack: handleGoBack,
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [pageLoading, setPageLoading] = React.useState(true);
  const triggleMsg = (e: WebViewMessageEvent | MessageEvent) => {
    const data = globalStore.isWeb
      ? (e as MessageEvent).data
      : (e as WebViewMessageEvent).nativeEvent.data;
    if (data === 'pageLoading:show') {
      setPageLoading(true);
      return;
    }
    if (data === 'pageLoading:hide') {
      setPageLoading(false);
      return;
    }
    globalStore.reuseWebViewCbSub.next({
      type: 'onMessage',
      value: e,
    });
  };

  const navigation = useNavigation();
  React.useEffect(() => {
    globalStore.setReuseWebViewSub.next({
      title,
      rightNode: rightNode,
      url,
    });
    const sub = globalStore.reuseWebViewCbSub.subscribe(res => {
      switch (res.type) {
        case 'onBack':
          handleGoBack();
          break;
        case 'onLoadEnd':
          onLoadEnd?.(res.value);
          break;
        case 'onMessage':
          handleMessage(res.value);
          break;
        case 'onNavigationStateChange':
          res.value && setNavWebviewCanGoback(res.value.canGoBack);
          break;
      }
    });
    if (globalStore.isWeb) {
      window.addEventListener('message', triggleMsg);
    }
    navigation.addListener('blur', () => {
      globalStore.triggleReuseWebViewCbSub.next(false);
    });
    navigation.addListener('focus', () => {
      globalStore.triggleReuseWebViewCbSub.next(true);
    });

    return () => {
      sub.unsubscribe();
      closeReuseWebView();
      if (globalStore.isWeb) {
        window.removeEventListener('message', triggleMsg);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Spin loading={pageLoading} style={[theme.flex.flex1]}>
      {globalStore.isWeb ? (
        url && (
          <iframe
            ref={ref}
            src={url}
            height={'100%'}
            width={'100%'}
            // eslint-disable-next-line react-native/no-inline-styles
            style={{
              borderWidth: 0,
              flex: 1,
              display: 'flex',
            }}
            onError={() => {
              globalStore.reuseWebViewCbSub.next({
                type: 'onLoadEnd',
                value: 'failed',
              });
              globalStore.showReuseWebViewLoadingPage.next({
                show: false,
                type: '',
              });
            }}
            onLoad={() => {
              globalStore.reuseWebViewCbSub.next({
                type: 'onLoadEnd',
                value: 'success',
              });
              globalStore.showReuseWebViewLoadingPage.next({
                show: false,
                type: '',
              });
              setPageLoading(false);
            }}
            allow="autoplay; clipboard-read; clipboard-write"
          />
        )
      ) : (
        <WebView
          ref={ref}
          source={url ? {uri: url} : {html: bankPageTemplate}}
          cacheEnabled={true}
          collapsable={false}
          cacheMode={'LOAD_NO_CACHE'}
          domStorageEnabled={true}
          style={[
            theme.flex.flex1,
            {
              backgroundColor: theme.basicColor.transparent,
            },
          ]}
          renderError={() => (
            <Refresh
              style={[theme.background.lightGrey]}
              onTryAgain={() => {
                ref.current?.reload();
              }}
            />
          )}
          onLoadEnd={() => {
            setPageLoading(false);
            globalStore.reuseWebViewCbSub.next({
              type: 'onLoadEnd',
              value: 'success',
            });
            globalStore.showReuseWebViewLoadingPage.next({
              show: false,
              type: '',
            });
          }}
          onError={() => {
            globalStore.reuseWebViewCbSub.next({
              type: 'onLoadEnd',
              value: 'failed',
            });
          }}
          onMessage={triggleMsg}
          onNavigationStateChange={e => {
            globalStore.reuseWebViewCbSub.next({
              type: 'onNavigationStateChange',
              value: e,
            });
          }}
        />
      )}
    </Spin>
  );
};

export default forwardRef(WebViewInnerNoReuse);
