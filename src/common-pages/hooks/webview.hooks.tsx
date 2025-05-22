import globalStore from '@services/global.state';
import {BasicObject, SafeAny} from '@types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import theme from '@style';
import React, {useCallback, useEffect, useState} from 'react';
import {useMemo, useRef} from 'react';
import WebView, {WebViewMessageEvent} from 'react-native-webview';
import {VERSION_CODE, errorLog, goBack, goTo, navigateTo} from '@/utils';
import envConfig from '@utils/env.config';
import {KeyboardAvoidingView, Linking} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Refresh from '@/components/basic/error-pages/refresh';
import {useTranslation} from 'react-i18next';

interface WebViewOptions {
  /** 如果涉及自由外链，则传这一个，那么urlPrefix就失效了 */
  originUrl?: string;
  /** 如果不涉及自由外链，则传这一个 */
  urlPrefix?: string;
  /** 如果传输html 就执行html */
  originHtml?: string;
  /** 内部网页向外部通信后其他需要额外处理的内容 */
  onMessage?: (data: string | BasicObject) => void;
  /** 当 WebView 加载成功或失败时调用的函数 */
  onLoadEnd?: (type?: 'success' | 'failed') => void;
}
export function useWebView(options: WebViewOptions) {
  const {i18n} = useTranslation();
  const {originUrl, urlPrefix, originHtml, onMessage, onLoadEnd} = options;
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
        }
        return goTo('Login');
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
    onMessage && onMessage(data);
  };

  const handleMessage = (e: WebViewMessageEvent | MessageEvent) => {
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
      // goBack();
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

  const getToken = useCallback(() => {
    // 防止web端刷新该页面后，token来不及获取，故此处会异步重新获取token
    AsyncStorage.getItem('token').then(res => {
      if (res) {
        setToken(res);
      } else {
        setToken('');
      }
    });
    // const iframe = ref.current as HTMLIFrameElement;
    if (globalStore.isWeb) {
      window.addEventListener('message', handleMessage);
    }
    return () => {
      if (globalStore.isWeb) {
        window.removeEventListener('message', handleMessage);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(getToken);

  const url = useMemo(() => {
    if (originHtml) {
      return originHtml;
    }
    if (originUrl) {
      return originUrl;
    }
    // api induswinApi lange token topWindowUrl channel lang packageId packageInfo currency visitor
    if (urlPrefix) {
      const hasQuestion = urlPrefix.indexOf('?') > -1;
      // http://192.168.3.48   192.168.100.58
      return `${urlPrefix}${
        hasQuestion ? '&' : '?'
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
  }, [originHtml, originUrl, token, topWindowUrl, urlPrefix]);

  useEffect(() => {
    if (url.indexOf('stage-api.mysportsfeed.io') > -1) {
      const id = setInterval(() => {
        globalStore.updateAmount.next();
      }, 60000);
      return () => {
        clearInterval(id);
      };
    }
  }, [url]);

  const handleTry = () => {
    ref.current?.reload();
  };

  if (globalStore.isWeb) {
    const webStyle = {
      borderWidth: 0,
      flex: 1,
      display: 'flex',
    };

    let iframeProps: {
      src?: string;
      srcDoc?: string;
    } = {src: url};
    if (originHtml) {
      iframeProps = {
        srcDoc: url,
      };
    }
    return {
      render: (
        <iframe
          ref={ref}
          height={'100%'}
          width={'100%'}
          style={webStyle}
          onError={() => url && onLoadEnd?.('failed')}
          onLoad={() => url && onLoadEnd?.('success')}
          allow="autoplay; clipboard-read; clipboard-write"
          {...iframeProps}
        />
      ),
      goBack: handleGoBack,
    };
  }
  return {
    render: (
      <KeyboardAvoidingView
        behavior="height"
        style={[theme.fill.fill, theme.flex.col]}>
        <WebView
          ref={ref}
          source={originHtml ? {html: originHtml} : {uri: url}}
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
              onTryAgain={handleTry}
            />
          )}
          onLoadEnd={() => url && onLoadEnd?.('success')}
          onError={() => url && onLoadEnd?.('failed')}
          onMessage={handleMessage}
          onNavigationStateChange={navState => {
            setNavWebviewCanGoback(navState.canGoBack);
          }}
        />
      </KeyboardAvoidingView>
    ),
    goBack: handleGoBack,
  };
}
