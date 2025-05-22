import {BasicObject, SafeAny} from '@types';
import config from '@/utils/env.config';
import theme from '@style';
import {View, Linking} from 'react-native';
import React, {useEffect, useState} from 'react';
import globalStore from '@/services/global.state';
import DetailNavTitle from '@businessComponents/detail-nav-title';
import Spin from '@basicComponents/spin';
import {goTo} from '@utils';
import {useWebView} from '../hooks/webview.hooks';
import {getRenderHtml} from '@/services/globalState';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import Text from '@/components/basic/text';
import useCollectStore from '@/store/useCollectStore';

const DetailWebView = (props: SafeAny) => {
  const {route} = props;
  const {
    path,
    originUrl,
    //获取PG html代码
    originHtml: toPageOriginHtml = false,
    header,
    headerTitle,
    hideAmount,
    showBottomBtn = false,
    showCollect = false,
    //底部按钮存在时传入的跳转链接
    link: linkAddress = '',
    // hideServer = true,
    // serverRight = false,
  } = route.params;
  const urlPrefix = `${config.reactH5Url}${path}`;
  const [title, setTitle] = useState<string>(headerTitle);
  const [pageLoading, setPageLoading] = React.useState(true);
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
    if (data.startsWith?.('scratch:')) {
      goTo('Scratch', {
        path: data.substring('scratch:'.length),
      });
    }
  };
  useEffect(() => {
    // 令webview不因为未登录导致强制跳转登录（不通过配置backPage）
    if (globalStore.token) {
      globalStore.updateAmount.next();
    }
    return () => {
      if (useCollectStore.getState().openGameId) {
        useCollectStore.getState().closeGameReport();
      }
    };
  }, []);

  useEffect(() => {
    setTitle(headerTitle);
  }, [headerTitle]);

  // const handleGoBack = () => {
  //   ref.current?.goBack();

  const {render, goBack} = useWebView({
    originUrl,
    urlPrefix,
    originHtml: toPageOriginHtml ? getRenderHtml() : '',
    onMessage: handleMessage,
    onLoadEnd: () => {
      setPageLoading(false);
    },
  });

  const onPressJoinUs = () => {
    if (globalStore.isWeb) {
      return window.open(linkAddress, '_blank');
    }
    Linking.openURL(linkAddress);
  };

  return (
    <View style={[theme.fill.fill, theme.flex.col]}>
      {header && (
        <DetailNavTitle
          title={title}
          disabled={false}
          containerStyle={[theme.background.mainDark]}
          titleColor={theme.fontColor.white}
          hideServer={true}
          hideAmount={hideAmount}
          showCollect={showCollect}
          onBack={() => goBack()}
          iconColor={'white'}
        />
      )}
      <Spin loading={pageLoading} style={[theme.flex.flex1]}>
        {render}
      </Spin>
      {showBottomBtn ? (
        <NativeTouchableOpacity
          style={[
            theme.fill.fillW,
            theme.flex.center,
            theme.padding.lrl,
            // eslint-disable-next-line react-native/no-inline-styles
            {
              height: 50,
              backgroundColor: '#00000032',
            },
          ]}
          onPress={onPressJoinUs}>
          <View
            style={[
              theme.fill.fillW,
              theme.flex.center,
              theme.borderRadius.m,
              // eslint-disable-next-line react-native/no-inline-styles
              {
                height: 40,
              },
            ]}>
            <Text white blod>
              Join Us Now
            </Text>
          </View>
        </NativeTouchableOpacity>
      ) : null}
    </View>
  );
};

export default DetailWebView;
