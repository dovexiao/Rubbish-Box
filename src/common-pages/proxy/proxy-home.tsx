import React, {useState, useMemo, useCallback} from 'react';
import theme from '@style';
import {
  View,
  ScrollView,
  RefreshControl,
  Image,
  StyleSheet,
} from 'react-native';
import {goBack, toAgentApply} from '@utils';
import InvitationCode from './components/invitation-code';
import SubEntry from './components/sub-entry';
import i18n from '@i18n';
import {getAgentInfo} from './proxy.service';
import HomeUserInfo from './components/home-user-info';
import {useInnerStyle} from './proxy.hooks';
import globalStore from '@/services/global.state';
import {AgentInfo} from './proxy.type';
import {useShare} from '../hooks/share.hooks';
import DetailNavTitle from '@/components/business/detail-nav-title';
import {useFocusEffect, useRoute} from '@react-navigation/native';
import {LazyImageLGBackground} from '@basicComponents/image';

const agentRuleImg = require('@/assets/imgs/proxy/agentrule.webp'); // <-- 引入图片

const ProxyHome = () => {
  const {
    size: {screenHeight},
    whiteAreaStyle,
  } = useInnerStyle();
  const route = useRoute();
  const [agentInfo, setAgentInfo] = useState<AgentInfo>();
  const {code, doShare, initShare, copy} = useShare();
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
        <View>
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
        <View style={styles.bottomImgView}>
          <Image
            source={agentRuleImg}
            style={{width: '100%', height: 2333}}
            resizeMode="contain"
          />
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
  },
});
