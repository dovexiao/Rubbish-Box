import React, {forwardRef, useImperativeHandle} from 'react';
import {BackHandler, View} from 'react-native';
import theme from '@/style';
import globalStore from '@/services/global.state';
import {goTo} from '@/utils';
// import {goCS, goTo} from '@/utils';
import {setScratchAuth} from '@/services/global.service';
import {BasicObject, NavigatorScreenProps} from '@/types';
import WebView, {WebViewMessageEvent} from 'react-native-webview';
import {useFocusEffect} from '@react-navigation/native';
import {take} from 'rxjs';
import {FadeInView} from '@basicComponents/animations';
import Spin from '@/components/basic/spin';
import Text from '@/components/basic/text';

const Scratch = forwardRef(
  (
    props: NavigatorScreenProps & {onCanGoBack?: (canGoBack: boolean) => void},
    ref,
  ) => {
    const [scratchToken, setScratchToken] = React.useState<string | null>('');
    const [scratchPath, setScratchPath] = React.useState<string | null>('');
    const [scratchBase, setScratchBase] = React.useState<string | null>('');
    const [pageLoading, setPageLoading] = React.useState(true);
    const [canGoBack, setCanGoBack] = React.useState<boolean>(false);
    const webViewRef = React.useRef<WebView>(null);
    const setToken = () => {
      const _url = globalStore.getItem('scratchUrl') as string,
        _token = globalStore.getItem('scratchToken') as string;
      setScratchToken(_token);
      setScratchBase(_url);
      if (!_token || !_url) {
        setScratchAuth();
      }
    };
    React.useEffect(() => {
      globalStore.tokenSubject.pipe(take(1)).subscribe(token => {
        // 如果刷新可能首次token为null,所以要获取两次
        // 如果第二次还没有,说明未登录
        if (token) {
          setToken();
        } else {
          globalStore.tokenSubject.pipe(take(1)).subscribe(_token => {
            setToken();
          });
        }
      });
    }, []);
    React.useEffect(() => {
      if (scratchToken && scratchBase) {
        const _url =
          scratchBase +
          '/' +
          scratchPath +
          `?userId=${scratchToken}&topwindowurl=${
            globalStore.isWeb ? window.location.origin : 'android'
          }${
            (props.route.params as BasicObject)?.hideInnerTitle
              ? '&hideInnerTitle=1'
              : ''
          }`;
        if (_url !== finalUrl) {
          setFinalUrl(_url);
        }
        if (globalStore.isWeb) {
          window.addEventListener('message', handleMessage);
        }
        return () => {
          if (globalStore.isWeb) {
            window.removeEventListener('message', handleMessage);
          }
        };
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scratchBase, scratchPath, scratchToken]);
    useFocusEffect(() => {
      const globalSToken = globalStore.getItem('scratchToken') as string | null;
      if (globalSToken && scratchToken && scratchToken !== globalSToken) {
        setFinalUrl('');
        setScratchToken(globalSToken);
      }
      setScratchPath((props.route.params as BasicObject)?.path || '');
      if (!props.onCanGoBack) {
        const exitApp = () => {
          if (canGoBack) {
            webViewRef.current!.goBack();
          } else {
            BackHandler.exitApp();
          }
          return true;
        };
        globalStore.isAndroid &&
          BackHandler.addEventListener('hardwareBackPress', exitApp);
        return () => {
          globalStore.isAndroid &&
            BackHandler.removeEventListener('hardwareBackPress', exitApp);
        };
      }
    });

    useImperativeHandle(ref, () => ({
      webViewRef,
    }));

    const goLogin = () => {
      globalStore.token = null;
      globalStore.userInfo = null;
      globalStore.asyncRemoveItem('scratchToken');
      globalStore.asyncRemoveItem('scratchUrl');
      goTo('Login');
      return;
    };

    const handleMessage = (e: WebViewMessageEvent | MessageEvent) => {
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
      if (data === 'update:amount') {
        if (globalStore.token) {
          globalStore.updateAmount.next();
        }
        return;
      }
      if (data === 'scratch-detail-back') {
        goTo('Home');
      } else if (data === 'login') {
        goLogin();
      }
    };

    const [finalUrl, setFinalUrl] = React.useState('');

    if (globalStore.isWeb) {
      const webStyle = {borderWidth: 0};
      return (
        <Spin loading={pageLoading} style={[theme.fill.fill, theme.flex.col]}>
          {finalUrl ? (
            <iframe
              src={finalUrl}
              height={'100%'}
              width={'100%'}
              style={webStyle}
            />
          ) : (
            <View />
          )}
        </Spin>
      );
    }

    return (
      <FadeInView>
        <Spin loading={pageLoading} style={[theme.fill.fill]}>
          {finalUrl && (
            <WebView
              ref={webViewRef}
              source={{
                uri: finalUrl,
              }}
              cacheEnabled={true}
              collapsable={false}
              cacheMode={'LOAD_NO_CACHE'}
              domStorageEnabled={true}
              renderError={(errorDomain, errorCode, errorDesc) => (
                <View>
                  <Text>Load Error, Please exit and retry</Text>
                  <Text>{errorDomain}</Text>
                  <Text>{errorCode}</Text>
                  <Text>{errorDesc}</Text>
                </View>
              )}
              onMessage={handleMessage}
              onNavigationStateChange={e => {
                setCanGoBack(e.canGoBack);
                props.onCanGoBack?.(e.canGoBack);
              }}
              style={[theme.flex.flex1]}
            />
          )}
        </Spin>
      </FadeInView>
    );
  },
);

export default Scratch;
