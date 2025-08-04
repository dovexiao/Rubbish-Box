/* eslint-disable */
/* prettier-ignore */
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  View,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import WebView from 'react-native-webview';
import {useRoute} from '@react-navigation/native';
import {getCasinoUrl, getSportUrl} from '@/pages/home/home.service';
import { BasicObject } from "@components/types";
import { useWebView } from "@/common-pages/hooks/webview.hooks";
import config from "@utils/env.config";
import { goTo } from "@utils";
import { toGame } from "@/common-pages/game-navigate";
import { errorLog } from "@components/utils";
import { useTranslation } from "react-i18next";
import globalStore from "@services/global.state";

const {width, height} = Dimensions.get('window');

const CasinoGameWeb = () => {
  const route = useRoute();
  const {id} = route.params as {id: number};
  const {i18n} = useTranslation();

  const [title, setTitle] = useState('Home');
  const [pageLoading, setPageLoading] = React.useState(true);
  const urlPrefix = `${config.reactH5Url}`;
  const secondPage = (route.params as BasicObject)?.secondPage;
  const [back, setBack] = useState(secondPage ? 1 : 0);

  const backToFirstPage = () => {
    if (globalStore.isWeb) {
      goTo('Home');
    } else {
      goBack();
    }
  };

  const handleMessage = (data: string | BasicObject) => {
    if (data === 'pageLoading:show') {
      setPageLoading(true);
      return;
    }
    if (data === 'pageLoading:hide') {
      setPageLoading(false);
      return;
    }
    if (data.startsWith?.('title:')) {
      // 表示更改标题
      setTitle(data.substring('title:'.length));
      return;
    }
    if (data === 'back:show') {
      setBack(1);
      return;
    }
    if (data === 'back:show:first') {
      setBack(2);
      return;
    }
    if (data === 'back:hide') {
      setBack(secondPage ? 1 : 0);
      return;
    }
    // 兼容旧版跳转
    if (data.startsWith?.('live-casino-origin:')) {
      goTo('WebView', {
        header: true,
        hideAmount: true,
        headerTitle: i18n.t('home.live-casino.title'),
        originUrl: data.substring('live-casino-origin:'.length),
      });
      return;
    }
    // 统一新版跳转 之后一律走toGame的方式了，之前的方式依然保留
    if (data.startsWith?.('navigate:')) {
      try {
        const _data = JSON.parse(data.substring('navigate:'.length));
        if (_data.type === 'live-casino-origin') {
          const {url, name} = _data;
          goTo('WebView', {
            header: true,
            hideAmount: true,
            headerTitle: name || i18n.t('home.live-casino.title'),
            originUrl: url,
          });
        } else if (_data.type === 'live-to-game') {
          toGame(_data);
        }
      } catch (e) {
        errorLog('error', e);
      }
    }
  };


  const {render, goBack} = useWebView({
    urlPrefix,
    onMessage: handleMessage,
    onLoadEnd: type => {
      if (type === 'failed') {
        setPageLoading(false);
      }
    },
  });


  const [url, setUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUrl = async () => {
      try {
        const res = id === 99999 ? await getSportUrl() : await getCasinoUrl(id);
        if (res) {
          setUrl(res);
        }
      } catch (error) {
        console.error('Failed to fetch casino URL', error);
        setUrl('');
      }
    };

    fetchUrl();
  }, [id]);

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#F8D72F" />
    </View>
  );

  if (!url) {
    return (
      <View style={styles.loadingContainer}>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        {loading && renderLoading()}
        <iframe
          src={url}
          style={styles.iframe as any}
          frameBorder="0"
          allowFullScreen
          onLoad={() => setLoading(false)}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading && renderLoading()}
      <WebView
        source={{uri: url}}
        startInLoadingState
        style={{flex: 1}}
        onLoadEnd={() => setLoading(false)}
        onBack={
          back === 1
            ? () => goBack()
            : back === 2
              ? () => backToFirstPage()
              : undefined
        }
      />
    </View>
  );
};

export default CasinoGameWeb;

const styles = StyleSheet.create({
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000', // Optional: dim the background
    zIndex: 1,
  },
  container: {
    flex: 1,
  },
  iframe: {
    width: width,
    height: height,
    border: 'none',
  },
});
