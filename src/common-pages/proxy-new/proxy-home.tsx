import React, {useState, useMemo, useCallback} from 'react';
import theme from '@style';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  // Image,
} from 'react-native';
import {toAgentApply} from '@utils'; //goBack
import i18n from '@i18n';
import globalStore from '@/services/global.state';
import {useShare} from '../hooks/share.hooks';
import DetailNavTitle from '@/components/business/detail-nav-title';
import {useFocusEffect} from '@react-navigation/native'; //useRoute
import {LazyImageLGBackground} from '@basicComponents/image'; //
import HomeUserInfo from './components/home-user1-info';
import HomeDataInfo from './components/home-data-info';
import InvitationCode from './components/invitation-code';
import {getTotalUsers, getTodayCommission} from './api';
import {AgentInfo} from './types';
import {usePaging} from './hooks/home';
import HomeUser from './components/home-user';

const NewProxyHome = () => {
  // const basePx = globalStore.screenWidth / 375;
  const {doShare, initShare, code, refreshCode, copy} = useShare();
  const [_meAvatar, setMeAvatar] = useState<string>();
  const [refreshing, setRefreshing] = useState(false);
  const [agentInfo, setAgentInfo] = useState<AgentInfo>();
  // const [todayInvite, setTodayInvite] = useState(0);
  const inviteCode = useMemo(() => {
    return code.split('').join('  ');
  }, [code]);
  const init1 = (loading: boolean = false) => {
    // TODO 返回后触发loading会引起webviewreuse的位置错误
    // loading && globalStore.globalLoading.next(true);
    return Promise.allSettled([
      getTotalUsers(),
      // getInviteKongArea(2), //金刚区
      // getTodayCommission({pageNo: 1, pageSize: 10}),
      initShare(),
    ])
      .then(([agent]) => {
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
      })
      .finally(() => loading && globalStore.globalLoading.next(false));
  };
  useFocusEffect(
    useCallback(() => {
      // globalStore.globalLoading.next(true);
      Promise.allSettled([init()])
        .then(([]) => {})
        .finally(() => globalStore.globalLoading.next(false));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );
  // const resultTopMe = useMemo(() => {
  //   return {
  //     headImg: meAvatar || (defaultHeaderImg as ImageUrlType),
  //   };
  // }, [meAvatar]);
  const isFrist = React.useRef(false);
  const doInit = useCallback(() => {
    init1(!isFrist);
    isFrist.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useFocusEffect(doInit);

  const handleRefresh = () => {
    setRefreshing(true);
    init().finally(() => setRefreshing(false));
  };
  const {
    // resultList,
    init,
    onScroll,
    // todayCommissionBet,
    // todayCommissionInvite,
    // todayCommissionRecharge,
  } = usePaging(
    (pageNo, pageSize) => {
      return getTodayCommission({
        pageNo,
        pageSize,
      });
    },
    {pageSize: 10},
  );

  const handleUpdateInviteCode = async () => {
    globalStore.globalLoading.next(true);
    refreshCode().finally(() => globalStore.globalLoading.next(false));
  };
  return (
    <LazyImageLGBackground style={[theme.fill.fill, theme.flex.col]}>
      <DetailNavTitle
        hideServer
        hideAmount
        // onBack={(route.path || '').indexOf('index') > -1 ? undefined : goBack}
        title={i18n.t('newProxy.title')}
        iconColor="white"
        titleColor={theme.fontColor.white}
      />
      <ScrollView
        style={[theme.flex.col]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onScroll={onScroll}>
        <View>
          <HomeUser level={agentInfo?.agentLevel} />
        </View>
        <View>
          <HomeUserInfo info={agentInfo} />
        </View>
        <View style={[theme.margin.topl]}>
          <HomeDataInfo info={agentInfo} />
        </View>
        <View style={[styles.inViteView]}>
          <InvitationCode
            code={inviteCode}
            onRefresh={handleUpdateInviteCode}
            onShare={doShare}
            onCopy={() => copy(code)}
          />
        </View>
        {/*<View style={styles.bottomImgView}>*/}
        {/*  <Image*/}
        {/*    source={agentRuleImg}*/}
        {/*    style={{width: basePx * 375, height: 2333}}*/}
        {/*    resizeMode="contain"*/}
        {/*  />*/}
        {/*</View>*/}
        <View style={[styles.bottomView]} />
        <View style={[styles.bottomView]} />
      </ScrollView>
    </LazyImageLGBackground>
  );
};

const styles = StyleSheet.create({
  bottomView: {
    height: 106,
  },
  inviteLinerBtnStyleL: {
    borderRadius: 8,
  },
  inViteView: {},
  inviteBtnStyle: {
    width: '100%',
    height: 44,
    marginTop: 12,
  },
  kongBtn: {
    width: '100%',
    height: '100%',
  },
  btnStyle: {
    fontSize: 18,
    color: '#fff',
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  kongView: {
    backgroundColor: theme.basicColor.primary10,
    borderRadius: 8,
    paddingTop: 10,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: theme.basicColor.primary50,
  },
  kongTextStyle: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  bottomImgView: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
});
export default NewProxyHome;
