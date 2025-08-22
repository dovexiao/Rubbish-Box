import config from '@/utils/env.config';
import React, {useState} from 'react'; //{ useState }linshi
import theme from '@style';
import {useWebView} from '../hooks/webview.hooks';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {navGoBack, goTo, goToWithLogin} from '@utils';
import {useRoute, RouteProp} from '@react-navigation/native';
import {useFocusEffect} from '@react-navigation/native'; // linshi

// 定义路由参数的类型
type RootStackParamList = {
  NewWebViewGame: {
    type: string;
    params: string;
  };
};

type NewWebViewGameRouteProp = RouteProp<RootStackParamList, 'NewWebViewGame'>;

const NewWebViewGame = () => {
  const {i18n} = useTranslation();
  // 使用 useRoute 钩子获取路由参数
  const route = useRoute<NewWebViewGameRouteProp>();
  const {type, params} = route.params;
  const [refreshKey, setRefreshKey] = useState(Date.now()); // linshi

  // 新增页面聚焦监听 linshi
  useFocusEffect(
    React.useCallback(() => {
      // 每次进入页面时更新时间戳
      setRefreshKey(Date.now());
    }, []),
  );

  const urlPrefix = `${config.vueH5Url}/${type}?${params}&timestamp=${refreshKey}`; //&timestamp=${refreshKey} linshi

  const handleMessage = (data: any) => {
    let dataObj = data;
    if (typeof data === 'string') {
      dataObj = JSON.parse(data);
    }
    if (dataObj?.type === 'router' && dataObj?.msg === 'navGoBack') {
      navGoBack();
    }
    if (dataObj?.type === 'router' && dataObj?.msg === 'Recharge') {
      goToWithLogin(i18n.t('home.tab.deposit'));
    }
    if (dataObj?.type === 'router' && dataObj?.msg === 'Login') {
      goTo('Login');
    }
  };
  const {render} = useWebView({
    urlPrefix,
    onMessage: handleMessage,
  });

  return <View style={[theme.fill.fill, theme.flex.col]}>{render}</View>;
};

export default NewWebViewGame;
