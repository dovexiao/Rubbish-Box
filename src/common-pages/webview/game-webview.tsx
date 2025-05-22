/* eslint-disable prettier/prettier */
import {BasicObject, SafeAny} from '@types';
// import DetailNavTitle from '@/components/business/detail-nav-title';
import {View} from 'react-native';
import React, {useEffect, useState, useRef} from 'react';
import theme from '@style';
import config from '@utils/env.config';
import globalStore from '@/services/global.state';
import {useTranslation} from 'react-i18next';
import WebviewInner, {WebViewInnerRef} from './webview-inner';

type GameType =
  | 'kerala'
  | 'digit'
  | 'color'
  | 'dice'
  | 'matka'
  | 'quick3d'
  | 'stateLottery';

const GameWebView = (props: SafeAny) => {
  const {i18n} = useTranslation();
  const gameMap: Record<
    GameType,
    {
      title: string;
      path: string;
      uni?: boolean;
    }
  > = {
    kerala: {
      title: i18n.t('home.kerala.title'),
      path: '/kerala',
    },
    digit: {
      title: i18n.t('home.digit.title'),
      path: '/digit',
    },
    quick3d: {
      title: 'Quick 3D',
      path: '/quick3d',
    },
    color: {
      title: i18n.t('home.color.title'),
      path: '/color',
    },
    dice: {
      title: i18n.t('home.dice.title'),
      path: '/dice',
    },
    matka: {
      title: i18n.t('home.matka.title'),
      path: '/satta',
    },
    stateLottery: {
      title: i18n.t('home.stateLottery.title'),
      path: '/digit',
    },
  };
  const {route} = props;
  const type: GameType = route.params.type;
  const params = route.params.params;
  const name = route.params.name;
  const gameOption = gameMap[type || 'color'];
  const [title, setTitle] = useState<string>(gameOption.title);
  const urlPrefix = `${config.reactH5Url}${gameOption.path}${
    params ? `?${params}` : ''
  }`;

  const ref = useRef<WebViewInnerRef>(null);
  const handleMessage = (data: string | BasicObject) => {
    console.log('web-view', data);
    setTitle(name);
    return;
    // if (data.startsWith?.('title:')) {
    //   // 表示更改标题
    //   setTitle(data.substring('title:'.length));
    //   return;
    // }
  };
  // const handleGoBack = () => {
  //   debugger;
  //   ref.current?.goBack();
  // };
  useEffect(() => {
    if (globalStore.token) {
      globalStore.updateAmount.next();
    }
  }, [type]);
  return (
    <View style={[theme.fill.fill, theme.flex.col]}>
      {/* <DetailNavTitle
        disabled={false}
        containerStyle={[theme.background.white]}
        title={title}
        titleColor={theme.fontColor.main}
        hideServer={true}
        onBack={() => handleGoBack()}
        iconColor={'black'}
      /> */}
      <WebviewInner
        title={title}
        ref={ref}
        urlPrefix={urlPrefix}
        onMessage={handleMessage}
      />
    </View>
  );
};

export default GameWebView;
