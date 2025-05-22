import config from '@/utils/env.config';
import React from 'react';
import theme from '@style';
import DetailNavTitle from '@businessComponents/detail-nav-title';
import {useWebView} from '../hooks/webview.hooks';
import {LazyImageLGBackground} from '@/components/basic/image';
// import {View} from 'react-native';
import Spin from '@basicComponents/spin';
import {goTo} from '@utils';

const PiggyPotPage = () => {
  const urlPrefix = `${config.vueH5Url}/piggyPot`;
  const [pageLoading, setPageLoading] = React.useState(true);
  const handleMessage = (data: any) => {
    let dataObj = JSON.parse(data);
    if (dataObj?.type === 'codeStateT') {
      setPageLoading(false);
      return;
    }
    if (dataObj?.type === 'codeStateF') {
      setPageLoading(true);
      return;
    }
    if (dataObj?.type === 'isToken') {
      goTo(dataObj?.msg);
      return;
    }
    if (dataObj?.type === 'invitRoute') {
      goTo(dataObj?.msg);
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
        title={'Piggy Pot'}
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

export default PiggyPotPage;
