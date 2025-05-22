import config from '@/utils/env.config';
import React, {useState} from 'react';
import theme from '@style';
import DetailNavTitle from '@businessComponents/detail-nav-title';
import {BasicObject} from '@/types';
import {goTo} from '@/utils';
import Spin from '@basicComponents/spin';
import {useWebView} from '../hooks/webview.hooks';
import {LazyImageLGBackground} from '@/components/basic/image';

const Result = () => {
  const [title, setTitle] = useState<string>('Result');

  const [back, setBack] = useState<number>(0);

  const [pageLoading, setPageLoading] = React.useState(true);
  const handleMessage = (data: string | BasicObject) => {
    if (data.startsWith?.('title:')) {
      // 表示更改标题
      setTitle(data.substring('title:'.length));
      return;
    }
    if (data === 'pageLoading:show') {
      setPageLoading(true);
      return;
    }
    if (data === 'pageLoading:hide') {
      setPageLoading(false);
      return;
    }
    if (data === 'back:show') {
      setBack(1);
      return;
    }
    if (data === 'back:hide') {
      setBack(0);
      return;
    }
    if (data.startsWith?.('scratch:')) {
      goTo('Scratch', {
        path: data.substring('scratch:'.length),
      });
    }
  };
  const urlPrefix = `${config.reactH5Url}/result`;

  const {render, goBack} = useWebView({
    urlPrefix,
    onMessage: handleMessage,
  });

  return (
    <LazyImageLGBackground style={[theme.fill.fill, theme.flex.col]}>
      {title && (
        <DetailNavTitle
          title={title}
          hideServer={true}
          hideAmount={!!config.reactH5Url}
          // back暂时不能去掉，赋一个不可能出现的值让goBack()执行
          onBack={back !== 9999 ? () => goBack() : undefined}
          titleColor={theme.fontColor.white}
        />
      )}
      <Spin loading={pageLoading} style={[theme.flex.flex1]}>
        {render}
        {/* <WebViewInner
          ref={ref}
          urlPrefix={urlPrefix}
          onMessage={handleMessage}
          onLoadEnd={() => {
            setPageLoading(false);
          }}
          title={title}
        /> */}
      </Spin>
    </LazyImageLGBackground>
  );
};

export default Result;
