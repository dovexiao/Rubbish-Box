import config from '@/utils/env.config';
import React, {ReactNode, useState} from 'react';
import {useWebView} from '../hooks/webview.hooks';
import DetailNavTitle from '@businessComponents/detail-nav-title';
import {BasicObject, NavigatorScreenProps} from '@/types';
import {errorLog, goTo} from '@/utils';
import globalStore from '@/services/global.state';
import {FadeInView} from '@basicComponents/animations';
import Spin from '@/components/basic/spin';
import theme from '@/style';
// import {BackHandler} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {toGame} from '../game-navigate';
import {useTranslation} from 'react-i18next';

const LiveCasino = (
  props: NavigatorScreenProps & {renderAmount?: ReactNode},
) => {
  const {i18n} = useTranslation();
  const {route, renderAmount} = props;
  const link = (route.params as BasicObject)?.link;
  const table = (route.params as BasicObject)?.table;
  // categoryId在Singam和Dailylotto都是默认6为Live Casino，故这里如果未传入则先使用默认值
  const categoryId = (route.params as BasicObject)?.categoryId || '6';
  const secondPage = (route.params as BasicObject)?.secondPage;
  const [title, setTitle] = useState('Live Casino');
  const [back, setBack] = useState(secondPage ? 1 : 0);
  const [pageLoading, setPageLoading] = React.useState(true);
  const backToFirstPage = () => {
    if (globalStore.isWeb) {
      goTo('Live');
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
  const urlPrefix = `${config.reactH5Url}/live-casino${
    categoryId ? `?categoryId=${categoryId}` : ''
  }${
    link && table ? `${categoryId ? '?' : '&'}link=${link}&table=${table}` : ''
  }`;
  const {render, goBack} = useWebView({
    urlPrefix,
    onMessage: handleMessage,
    onLoadEnd: type => {
      if (type === 'failed') {
        setPageLoading(false);
      }
    },
  });
  React.useEffect(() => {
    globalStore.token && globalStore.updateAmount.next();
  }, []);

  useFocusEffect(() => {
    if (globalStore.isAndroid) {
      /* const exitApp = () => {
        BackHandler.exitApp();
        return true;
      };
      BackHandler.addEventListener('hardwareBackPress', exitApp);
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', exitApp);
      }; */
    }
  });

  return (
    <FadeInView>
      {title && (
        <DetailNavTitle
          title={title}
          titleColor={theme.fontColor.main}
          containerStyle={[theme.background.white]}
          hideServer={true}
          hideAmount
          rightNode={renderAmount}
          onBack={
            back === 1
              ? () => goBack()
              : back === 2
              ? () => backToFirstPage()
              : undefined
          }
        />
      )}
      <Spin
        loading={pageLoading}
        style={[
          theme.flex.flex1,
          // eslint-disable-next-line react-native/no-inline-styles
          {
            position: 'relative',
            zIndex: 0,
            backgroundColor: theme.basicColor.transparent,
          },
        ]}>
        {render}
      </Spin>
    </FadeInView>
  );
};

export default LiveCasino;
