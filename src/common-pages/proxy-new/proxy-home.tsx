import React, {useState, useMemo, useCallback} from 'react';
import theme from '@style';
import {View, Text, ScrollView, RefreshControl, StyleSheet} from 'react-native';
import {toAgentApply, goTo} from '@utils'; //goBack
import {goToUrl} from '@/common-pages/game-navigate';
import i18n from '@i18n';
import globalStore from '@/services/global.state';
import {useShare} from '../hooks/share.hooks';
import DetailNavTitle from '@/components/business/detail-nav-title';
import {useFocusEffect} from '@react-navigation/native'; //useRoute
import LazyImage, {LazyImageLGBackground} from '@basicComponents/image'; //
// import HomeUserInfo from './components/home-user-info';
import HomeUserInfo from './components/home-user1-info';
import HomeDataInfo from './components/home-data-info';
// import HomeDataOperation from './components/home-data-operation';
import InvitationCode from './components/invitation-code';
import Table from './components/table';
// import HomeRewards from './components/home-rewards';
// import Button from '@/components/basic/button';
import {ImageUrlType} from '@/components/basic/image';
import {defaultHeaderImg} from './proxy.variable';
import {getTotalUsers, getTodayCommission, getInviteKongArea} from './api';
import {AgentInfo} from './types';
import {usePaging} from './hooks/home';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
// import LinearGradient from '@/components/basic/linear-gradient';
import HomeUser from './components/home-user';

const NewProxyHome = () => {
  // const route = useRoute();
  const {doShare, initShare, code, refreshCode, copy} = useShare();
  const [meAvatar, setMeAvatar] = useState<string>();
  const [refreshing, setRefreshing] = useState(false);
  const [agentInfo, setAgentInfo] = useState<AgentInfo>();
  // const [todayInvite, setTodayInvite] = useState(0);
  const [kongList, setKongList] = useState<Array<any>>();
  const inviteCode = useMemo(() => {
    return code.split('').join('  ');
  }, [code]);
  const init1 = (loading: boolean = false) => {
    // TODO 返回后触发loading会引起webviewreuse的位置错误
    // loading && globalStore.globalLoading.next(true);
    return Promise.allSettled([
      getTotalUsers(),
      getInviteKongArea(2), //金刚区
      // getTodayCommission({pageNo: 1, pageSize: 10}),
      initShare(),
    ])
      .then(([agent, kong]) => {
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
        if (kong.status === 'fulfilled') {
          if (!kong.value) {
            return;
          }
          if (Object.keys(kong.value).length === 0) {
            return;
          }
          setKongList(kong.value);
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
  const resultTopMe = useMemo(() => {
    return {
      headImg: meAvatar || (defaultHeaderImg as ImageUrlType),
    };
  }, [meAvatar]);
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
    resultList,
    init,
    onScroll,
    todayCommissionBet,
    todayCommissionInvite,
    todayCommissionRecharge,
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
          <View
            style={[
              theme.flex.row,
              theme.flex.between,
              theme.flex.centerByCol,
              {
                marginTop: 12,
                marginLeft: 12,
                marginRight: 12,
              },
            ]}>
            {kongList?.map((item, index) => {
              return (
                <View
                  key={item.id || index}
                  style={[
                    theme.flex.row,
                    theme.flex.centerByRow,
                    theme.flex.centerByCol,
                    styles.kongView,
                    {
                      width: '31%',
                      height: 50,
                    },
                  ]}>
                  <NativeTouchableOpacity
                    style={[
                      theme.flex.row,
                      theme.flex.centerByRow,
                      theme.flex.centerByCol,
                      styles.kongBtn,
                    ]}
                    onPress={() => {
                      if (item.routing) {
                        if (item.routing.includes('http')) {
                          goToUrl(item.routing, item.areaName);
                          return;
                        }
                        let name = item.areaName ? item.areaName : '';
                        goTo(item.routing ? item.routing : 'InviteActivity', {
                          type: name.replace(/ /g, ''),
                        });
                      } else {
                      }
                    }}>
                    <LazyImage
                      imageUrl={item.areaIcon}
                      width={30}
                      height={30}
                      radius={12}
                      occupancy="transparent"
                    />
                    <Text numberOfLines={1} style={[styles.kongTextStyle]}>
                      {item.areaName}
                    </Text>
                  </NativeTouchableOpacity>
                </View>
              );
            })}
          </View>
          {/* <HomeDataOperation /> */}
        </View>
        <View style={[styles.inViteView]}>
          <InvitationCode
            code={inviteCode}
            onRefresh={handleUpdateInviteCode}
            onShare={doShare}
            onCopy={() => copy(code)}
          />
        </View>
        {/* <View
          style={[
            theme.flex.flex1,
            {marginTop: 12, marginLeft: 12, marginRight: 12},
          ]}>
          <Button
            onPress={() => {
              goTo('InviteActivity');
            }}
            radius={30}
            size="large"
            title={'Invite friends'}
            titleBold={true}
          />
        </View> */}
        {/*<View style={[{marginBottom: -12}]}>*/}
        {/*  <HomeRewards*/}
        {/*    todayInvite={todayInvite as any}*/}
        {/*    inviteList={inviteList as any}*/}
        {/*    onShare={doShare}*/}
        {/*  />*/}
        {/*</View>*/}
        <Table
          bet={todayCommissionBet}
          invite={todayCommissionInvite}
          recharge={todayCommissionRecharge}
          user={resultList as any}
          me={resultTopMe}
        />
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
});
export default NewProxyHome;
