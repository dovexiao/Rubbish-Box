import config from '@/utils/env.config';
import React from 'react';
import theme from '@style';
import DetailNavTitle from '@businessComponents/detail-nav-title';
import {useWebView} from '../hooks/webview.hooks';
import {LazyImageLGBackground} from '@/components/basic/image';
import {View} from 'react-native';

const MineClearance = () => {
  const urlPrefix = `${config.vueH5Url}/mineClearance`;
  const handleMessage = (data: any) => {
    let dataObj = JSON.parse(data);
    console.log(dataObj);
  };
  const {render, goBack} = useWebView({
    urlPrefix,
    onMessage: handleMessage,
  });

  return (
    <LazyImageLGBackground style={[theme.fill.fill, theme.flex.col]}>
      <DetailNavTitle
        title={'Mine Clearance'}
        hideServer={true}
        hideAmount={!!config.vueH5Url}
        onBack={() => goBack()}
      />
      <View style={[theme.flex.flex1]}>{render}</View>
    </LazyImageLGBackground>
  );
};

export default MineClearance;
