import React, {useState, useMemo, useCallback} from 'react';
import theme from '@style';
import {View, ScrollView, RefreshControl} from 'react-native';
import {goBack, setDataForSettled, toAgentApply} from '@utils';
import InvitationCode from './components/invitation-code';
import SubEntry from './components/sub-entry';
import EarningsChart, {EarnMeItem} from './components/earnings-chart';
import i18n from '@i18n';
import {
  getAgentInfo,
  getBannerList,
  getTodayEarningsChart,
} from './proxy.service';
import HomeBanner from './components/home-banner';
import HomeUserInfo from './components/home-user-info';
import {useInnerStyle} from './proxy.hooks';
import globalStore from '@/services/global.state';
import {
  AgentInfo,
  BannerListItem,
  TodayEarningsChartItemRes,
} from './proxy.type';
import {defaultHeaderImg} from './proxy.variable';
import {ImageUrlType} from '@/components/basic/image';
import {useShare} from '../hooks/share.hooks';
import DetailNavTitle from '@/components/business/detail-nav-title';
import {useFocusEffect, useRoute} from '@react-navigation/native';
import {LazyImageLGBackground} from '@basicComponents/image';

const ProxyHome = () => {
  const {
    size: {screenHeight},
    whiteAreaStyle,
  } = useInnerStyle();
  const route = useRoute();
  const [agentInfo, setAgentInfo] = useState<AgentInfo>();
  const [inited, setInited] = useState(false);
  const {code, refreshCode, doShare, initShare, copy} = useShare();
  const [topUser, setTopUser] = useState<TodayEarningsChartItemRes[]>([]);
  const [topMe, setTopMe] = useState<EarnMeItem>();
  const [meAvatar, setMeAvatar] = useState<string>();
  const [bannerList, setBannerList] = useState<BannerListItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const inviteCode = useMemo(() => {
    return code.split('').join('  ');
  }, [code]);
  const init = (loading: boolean = false) => {
    // TODO 返回后触发loading会引起webviewreuse的位置错误
    loading && globalStore.globalLoading.next(true);
    return Promise.allSettled([
      getAgentInfo(),
      getTodayEarningsChart(),
      getBannerList(),
      initShare(),
    ])
      .then(([agent, chart, banner]) => {
        setInited(true);
        if (agent.status === 'fulfilled') {
          if (!agent.value) {
            return;
          }
          if (Object.keys(agent.value).length === 0) {
            toAgentApply();
            return;
          }
          const {userAvatar} = agent.value;
          setAgentInfo(agent.value);
          setMeAvatar(userAvatar);
        }
        if (chart.status === 'fulfilled') {
          setTopUser(chart.value.earningsChartList);
          const {rank, exceed, commissionAmount} = chart.value;
          setTopMe({
            rank,
            exceed,
            commissionAmount,
          });
        }
        setDataForSettled(setBannerList, banner);
      })
      .finally(() => loading && globalStore.globalLoading.next(false));
  };

  const resultTopMe = useMemo(() => {
    return {
      ...topMe,
      headImg: meAvatar || (defaultHeaderImg as ImageUrlType),
    };
  }, [meAvatar, topMe]);

  const isFrist = React.useRef(false);
  const doInit = useCallback(() => {
    init(!isFrist);
    isFrist.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useFocusEffect(doInit);

  const handleRefresh = () => {
    setRefreshing(true);
    init().finally(() => setRefreshing(false));
  };

  const handleUpdateInviteCode = async () => {
    globalStore.globalLoading.next(true);
    refreshCode().finally(() => globalStore.globalLoading.next(false));
  };
  return (
    <LazyImageLGBackground
      style={[
        theme.fill.fill,
        theme.flex.col,
        {
          height: screenHeight,
        },
      ]}>
      <DetailNavTitle
        hideServer
        hideAmount
        onBack={(route.path || '').indexOf('index') > -1 ? undefined : goBack}
        title={i18n.t('proxy.title')}
        iconColor="white"
        titleColor={theme.fontColor.white}
      />
      <ScrollView
        style={[theme.flex.col]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        {(!inited || bannerList.length > 0) && (
          <HomeBanner bannerList={bannerList} />
        )}
        <View
          style={
            inited && bannerList.length === 0 ? [theme.margin.topl] : null
          }>
          <HomeUserInfo info={agentInfo} />
        </View>
        <InvitationCode
          code={inviteCode}
          onRefresh={handleUpdateInviteCode}
          onShare={doShare}
          onCopy={() => copy(code)}
        />
        <SubEntry
          userId={agentInfo?.userId}
          agentLevel={agentInfo?.agentLevel}
        />
        <EarningsChart user={topUser} me={resultTopMe} />
        <View style={[theme.fill.fillW, whiteAreaStyle.area]} />
      </ScrollView>
    </LazyImageLGBackground>
  );
};

export default ProxyHome;
