import config from '@/utils/env.config';
import React from 'react';
import theme from '@style';
import DetailNavTitle from '@businessComponents/detail-nav-title';
import {useWebView} from '../hooks/webview.hooks';
import {LazyImageLGBackground} from '@/components/basic/image';
// import {View} from 'react-native';
import Spin from '@basicComponents/spin';
import {goToUrl} from '../game-navigate';

const CheckInPage = () => {
  const urlPrefix = `${config.vueH5Url}/check-in`;
  const [pageLoading, setPageLoading] = React.useState(true);
  const handleMessage = (data: any) => {
    let dataObj = JSON.parse(data);
    if (dataObj?.type === 'checkInRoute') {
      goToUrl(dataObj?.msg);
    }
    if (dataObj?.type === 'codeStateT') {
      setPageLoading(false);
      return;
    }
    if (dataObj?.type === 'codeStateF') {
      setPageLoading(true);
      return;
    }
  };
  const {render, goBack} = useWebView({
    urlPrefix,
    onMessage: handleMessage,
  });

  return (
    <LazyImageLGBackground style={[theme.fill.fill, theme.flex.col]}>
      <DetailNavTitle
        title={'Check In'}
        hideServer={true}
        hideAmount={!!config.vueH5Url}
        onBack={() => goBack()}
      />
      <Spin loading={pageLoading} style={[theme.flex.flex1]}>
        {render}
      </Spin>
    </LazyImageLGBackground>
  );
};

export default CheckInPage;
