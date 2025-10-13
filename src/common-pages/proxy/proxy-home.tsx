/* eslint-disable react-native/no-inline-styles */
import React, {useState, useMemo, useCallback} from 'react';
import theme from '@style';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Image,
  StyleSheet,
} from 'react-native';
import {toAgentApply} from '@utils'; //
import {goToUrl} from '@/common-pages/game-navigate';
import InvitationCode from './components/invitation-code';
// import SubEntry from './components/sub-entry';
import i18n from '@i18n';
import {getAgentInfo, getAgentLink} from './proxy.service';
import HomeUserInfo from './components/home-user-info';
import {useInnerStyle} from './proxy.hooks';
import globalStore from '@/services/global.state';
import {AgentInfo} from './proxy.type';
import {useShare} from '../hooks/share.hooks';
import DetailNavTitle from '@/components/business/detail-nav-title';
import {useFocusEffect} from '@react-navigation/native'; //, useRoute
import {LazyImageLGBackground} from '@basicComponents/image';
import Button from '@/components/basic/button';

const ProxyHome = () => {
  const {
    size: {screenHeight},
    whiteAreaStyle,
  } = useInnerStyle();
  // const route = useRoute();
  const [agentInfo, setAgentInfo] = useState<AgentInfo>();
  const {code, refreshCode, doShare, initShare, copy} = useShare();
  const [refreshing, setRefreshing] = useState(false);
  const inviteCode = useMemo(() => {
    return code.split('').join('  ');
  }, [code]);
  const init = (loading: boolean = false) => {
    // TODO 返回后触发loading会引起webviewreuse的位置错误
    loading && globalStore.globalLoading.next(true);
    return Promise.allSettled([getAgentInfo(), initShare()])
      .then(([agent]) => {
        if (agent.status === 'fulfilled') {
          if (!agent.value) {
            return;
          }
          if (Object.keys(agent.value).length === 0) {
            toAgentApply();
            return;
          }
          setAgentInfo(agent.value);
        }
      })
      .finally(() => loading && globalStore.globalLoading.next(false));
  };
  const [link, setLink] = useState<any>({});
  const fetchLink = (loading: boolean = false) => {
    loading && globalStore.globalLoading.next(true);
    return Promise.allSettled([getAgentLink()])
      .then(([link]) => {
        if (link.status === 'fulfilled') {
          setLink(link.value);
        }
      })
      .finally(() => loading && globalStore.globalLoading.next(false));
  };
  const onPressButton = (type: number) => {
    if (type === 2) {
      goToUrl(link.wsLink);
    } else {
      goToUrl(link.tgLInk);
    }
  };
  const isFrist = React.useRef(false);
  const doInit = useCallback(() => {
    init(!isFrist);
    fetchLink();
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
  const percent = globalStore.screenWidth / 375;
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
        // onBack={(route.path || '').indexOf('index') > -1 ? undefined : goBack}
        title={i18n.t('proxy.title')}
        iconColor="white"
        titleColor={theme.fontColor.white}
      />
      <ScrollView
        style={[theme.flex.col]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        <View
          style={[
            {
              backgroundColor: theme.basicColor.newBgInOne,
              margin: 12,
              borderRadius: 8,
            },
          ]}>
          <HomeUserInfo info={agentInfo} />
        </View>
        <InvitationCode
          code={inviteCode}
          onRefresh={handleUpdateInviteCode}
          onShare={doShare}
          onCopy={() => copy(code)}
        />
        {/* <SubEntry
          userId={agentInfo?.userId}
          agentLevel={agentInfo?.agentLevel}
        /> */}
        <View style={styles.bottomImgView}>
          <Image
            source={{uri: 'https://www.staticimg007.com/static/agent1.png'}}
            style={{width: '100%', height: 746 * percent}}
            resizeMode="cover"
          />
          <Image
            source={{uri: 'https://www.staticimg007.com/static/agent2.png'}}
            style={{width: '100%', height: 1071 * percent}}
            resizeMode="cover"
          />
          <Image
            source={{uri: 'https://www.staticimg007.com/static/agent3.png'}}
            style={{width: '100%', height: 1149 * percent}}
            resizeMode="cover"
          />
          <View
            style={{
              backgroundColor: '#ffffff',
              position: 'relative',
              top: -2,
              width: globalStore.screenWidth,
            }}>
            <View
              style={[
                theme.flex.row,
                {
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  marginLeft: 16 * percent,
                  marginRight: 12 * percent,
                  backgroundColor: '#FFF7Fb',
                  width: globalStore.screenWidth - 28 * percent,
                  paddingBottom: 10,
                },
              ]}>
              <Button
                style={[
                  {
                    flex: 1,
                    height: 44,
                    marginTop: 10,
                    marginBottom: 20,
                  },
                ]}
                buttonStyle={[{backgroundColor: '#FF493A'}]}
                radius={22}
                onPress={() => {
                  onPressButton(1);
                }}>
                <Text
                  style={[
                    {
                      color: '#FFFFFF',
                      fontSize: theme.fontSize.l,
                      fontWeight: '700',
                    },
                  ]}>
                  Join Telegtam
                </Text>
              </Button>
              <Button
                style={[
                  {
                    flex: 1,
                    height: 44,
                    marginTop: 10,
                    marginBottom: 20,
                    // backgroundColor: '#F7B500',
                  },
                ]}
                buttonStyle={[{backgroundColor: '#F7B500'}]}
                radius={22}
                onPress={() => {
                  onPressButton(2);
                }}>
                <Text
                  style={[
                    {
                      color: '#FFFFFF',
                      fontSize: theme.fontSize.l,
                      fontWeight: '700',
                    },
                  ]}>
                  Join Whatsapp
                </Text>
              </Button>
            </View>
          </View>
        </View>
        {/*<EarningsChart user={topUser} me={resultTopMe} />*/}
        <View style={[theme.fill.fillW, whiteAreaStyle.area]} />
      </ScrollView>
    </LazyImageLGBackground>
  );
};

export default ProxyHome;

const styles = StyleSheet.create({
  bottomImgView: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    // backgroundColor: '#ffffff',
  },
});
