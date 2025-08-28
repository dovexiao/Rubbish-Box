import config from '@/utils/env.config';
import React from 'react';
import theme from '@style';
import {useWebView} from '../hooks/webview.hooks';
import {View} from 'react-native';
import {navGoBack} from '@utils';

const NotifyNewPage = () => {
  const urlPrefix = `${config.vueH5Url}/notify`;
  const handleMessage = (data: any) => {
    let dataObj = data;
    if (typeof data === 'string') {
      dataObj = JSON.parse(data);
    }
    if (dataObj?.type === 'router' && dataObj?.msg === 'navGoBack') {
      navGoBack();
    }
  };
  const {render} = useWebView({
    urlPrefix,
    onMessage: handleMessage,
  });

  return <View style={[theme.fill.fill, theme.flex.col]}>{render}</View>;
};

export default NotifyNewPage;
