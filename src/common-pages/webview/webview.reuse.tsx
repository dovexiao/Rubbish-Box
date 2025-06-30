import Refresh from '@/components/basic/error-pages/refresh';
import DetailNavTitle from '@/components/business/detail-nav-title';
import globalStore from '@/services/global.state';
import theme from '@/style';
import {SafeAny} from '@/types';
import {useResponsiveDimensions} from '@/utils';
import React, {useMemo, useState} from 'react';
import {
  KeyboardAvoidingView,
  View,
  Text,
  Image,
  ImageSourcePropType,
} from 'react-native';
import WebView, {WebViewMessageEvent} from 'react-native-webview';
import {takeUntil} from 'rxjs';
import {bankPageTemplate} from './bank-page.template';
import Spin from '@/components/basic/spin';
import {LinearProgress} from '@rneui/themed';
import {useSettingWindowDimensions} from '@/store/useSettingStore';
const gameLoadingImage: Record<string, ImageSourcePropType> = {
  Dice: require('@/assets/imgs/loading/dice.webp'),
  Color: require('@/assets/imgs/loading/color.webp'),
  Digit: require('@/assets/imgs/loading/digit.webp'),
  Kerala: require('@/assets/imgs/loading/kerala.webp'),
  Matka: require('@/assets/imgs/loading/matka.webp'),
  quick: require('@/assets/imgs/loading/digit.webp'),
};

const ReuseWebView = () => {
  const ref = React.useRef<SafeAny>(null);
  let url = React.useRef('');
  const [finallyUrl, setFinallyUrl] = React.useState('');
  const {width} = useResponsiveDimensions();
  const {screenWidth} = useSettingWindowDimensions();
  const [left, setLeft] = React.useState(width);

  const [title, setTitle] = React.useState('');
  const [rightNode, setRightNode] = React.useState<React.JSX.Element | null>(
    null,
  );
  const [hadCreate, setHadCreate] = React.useState(false);
  const [showGameLoadingView, setShowGameLoadingView] = useState({
    show: false,
    type: '',
  });

  React.useEffect(() => {
    const createSub = globalStore.setReuseWebViewSub
      .pipe(takeUntil(globalStore.appDistory))
      .subscribe(res => {
        setHadCreate(true);
        setTitle(res.title);
        setRightNode(res.rightNode || null);
        clearHistory();
        url.current = res.url;
        setFinallyUrl(url.current);
      });
    const updateSub = globalStore.updateReuseWebViewSub
      .pipe(takeUntil(globalStore.appDistory))
      .subscribe(res => {
        typeof res.title === 'string' &&
          res.title !== title &&
          setTitle(res.title);
        res.rightNode &&
          res.rightNode !== rightNode &&
          setRightNode(res.rightNode || null);
        if (typeof res.url === 'string' && res.url !== url.current) {
          if (res.clear) {
            clearHistory();
          }
          url.current = res.url;
          setFinallyUrl(url.current);
        }
      });
    const triggleSub = globalStore.triggleReuseWebViewCbSub
      .pipe(takeUntil(globalStore.appDistory))
      .subscribe(bool => {
        bool ? setLeft(0) : setLeft(width);
      });

    const showGameLoadingSub = globalStore.showReuseWebViewLoadingPage
      .pipe(takeUntil(globalStore.appDistory))
      .subscribe(res => {
        setShowGameLoadingView({
          show: res?.show,
          type: res.type,
        });
      });
    if (globalStore.isWeb) {
      window.addEventListener('message', triggleMsg);
    }
    return () => {
      createSub.unsubscribe();
      updateSub.unsubscribe();
      triggleSub.unsubscribe();
      showGameLoadingSub.unsubscribe();
      if (globalStore.isWeb) {
        window.removeEventListener('message', triggleMsg);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearHistory = () => {
    if (!globalStore.isWeb) {
      (ref.current as WebView)?.clearHistory?.();
    }
  };

  React.useEffect(() => {
    if (finallyUrl && left !== 0) {
      setLeft(0);
    } else if (!finallyUrl && left !== width) {
      setLeft(width);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finallyUrl, width]);

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

  const imageSource = useMemo<ImageSourcePropType | string>(() => {
    if (showGameLoadingView.show) {
      let source: ImageSourcePropType | string = '';
      for (const key in gameLoadingImage) {
        if (showGameLoadingView.type.includes(key)) {
          source = gameLoadingImage[key];
        }
      }
      return source;
    }
    return '';
  }, [showGameLoadingView.show, showGameLoadingView.type]);

  return (
    <KeyboardAvoidingView
      style={[
        theme.fill.fill,
        theme.position.abs,
        // eslint-disable-next-line react-native/no-inline-styles
        {
          left: left,
          backgroundColor: '#2B2B2B',
        },
      ]}>
      <DetailNavTitle
        disabled={false}
        titleColor={theme.fontColor.white}
        title={title}
        hideServer
        onBack={() => {
          globalStore.reuseWebViewCbSub.next({type: 'onBack'});
        }}
        rightNode={rightNode}
        iconColor={'white'}
      />
      <Spin loading={pageLoading} style={[theme.flex.flex1]}>
        {globalStore.isWeb
          ? !!finallyUrl && (
              <iframe
                ref={ref}
                src={finallyUrl}
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
          : hadCreate && (
              <WebView
                ref={ref}
                source={
                  finallyUrl ? {uri: finallyUrl} : {html: bankPageTemplate}
                }
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
      {showGameLoadingView.show ? (
        <View
          style={[
            theme.position.abs,
            theme.fill.fill,
            theme.background.mainDark,
          ]}>
          <Image
            source={imageSource as ImageSourcePropType}
            style={[
              theme.fill.fillW,
              {
                width: screenWidth,
                height: (screenWidth * 305) / 375,
                top: 120,
                left: 0,
              },
            ]}
            resizeMode={'stretch'}
          />
          <View
            style={[
              theme.position.abs,
              theme.flex.center,
              // eslint-disable-next-line react-native/no-inline-styles
              {
                bottom: 140,
                width: '80%',
                height: 20,
                borderRadius: 4,
                marginLeft: '10%',
              },
            ]}>
            <Text style={[theme.font.white]}>Loading...</Text>
          </View>

          <View
            style={[
              theme.position.abs,
              theme.padding.s,
              // eslint-disable-next-line react-native/no-inline-styles
              {
                bottom: 100,
                width: '80%',
                marginLeft: '10%',
                backgroundColor: '#0000004D',
                borderRadius: 18,
              },
            ]}>
            <LinearProgress
              style={[
                // eslint-disable-next-line react-native/no-inline-styles
                {
                  width: '100%',
                  height: 18,
                  borderRadius: 10,
                },
              ]}
              value={0.9}
              variant="determinate"
              color="#ff9500"
              trackColor="#0000004D"
            />
          </View>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
};

export default ReuseWebView;
