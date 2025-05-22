import {useWebView} from '@/common-pages/hooks/webview.hooks';
import DetailNavTitle from '@/components/business/detail-nav-title';
import theme from '@/style';
import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import GameSpin from '@/components/basic/gamespin';
import {getSprotUrl} from '@/services/global.service';
import {useRoute} from '@react-navigation/native';
import {goBack} from '@/utils';

const Sports = () => {
  const {i18n} = useTranslation();
  const [pageLoading, setPageLoading] = React.useState(true);
  const [url, setUrl] = React.useState('');
  const route = useRoute();
  const {render} = useWebView({
    originUrl: url,
    onLoadEnd: () => {
      setTimeout(() => {
        setPageLoading(false);
      }, 500);
    },
  });
  useEffect(() => {
    getSprotUrl().then(_url => {
      setUrl(_url);
    });
  }, []);
  return (
    <View style={[theme.fill.fill, theme.flex.col]}>
      <DetailNavTitle
        onBack={
          route.path && route.path.indexOf('index') > -1 ? undefined : goBack
        }
        title={i18n.t('home.tab.sports')}
        hideServer
      />
      <GameSpin loading={pageLoading}>{render}</GameSpin>
    </View>
  );
};

export default Sports;
