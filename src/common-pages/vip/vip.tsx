import theme from '@/style';
import React, {useMemo, useEffect, useState} from 'react';
import {View} from 'react-native';
import {useInnerStyle} from './vip.hooks';
import VipCardList from './vip-card-list';
// import VipTableList from './vip-table-list';
import DetailNavTitle from '@businessComponents/detail-nav-title';
import {debounce, goBack, goTo, goToWithLogin} from '@/utils';
import {
  VipProgressInfo,
  getVipRender,
  maxVipLevel,
} from '@/components/business/vip';
import RechargeButton from '@/components/business/recharge-button';
import {
  IVipConfigItem,
  IVipItem,
  postVipConfig,
  postVipInfo,
} from '@/services/global.service';
import globalStore from '@/services/global.state';
import {useTranslation} from 'react-i18next';
import {LazyImageLGBackground} from '@basicComponents/image';
import VipClubList from '@/common-pages/vip-club/vip-club-list';
import MeUser from '@/pages/me/me-user';
import {useToken, useUserInfo} from '@/store/useUserStore';
import useVipStore from '@/store/useVipStore';

const Vip = () => {
  const {i18n} = useTranslation();
  const {vipStyle} = useInnerStyle();
  const [vipList, setVipList] = useState<IVipItem[]>([]);
  const [vipConfigList, setVipConfigList] = useState<IVipConfigItem[]>([]);
  const [checkIndex, setCheckIndex] = useState(0);
  const {isLogin, token} = useToken();
  console.log('isLogin', isLogin);
  console.log('token', token);
  const user = useUserInfo();
  const {level} = useVipStore(state => state.vipInfo);
  const cards = useMemo(() => {
    const vips = vipList.map(v => v.level);
    return vips.map(lv => getVipRender(lv));
  }, [vipList]);
  const currentLevel = useMemo(() => {
    let lv = 0;
    for (let i = 0; i < vipList.length; i++) {
      const vip = vipList[i];
      lv = vip.level;
      if (vip.statusReached === 0) {
        return Math.min(lv, maxVipLevel);
      }
    }
    return maxVipLevel;
  }, [vipList]);

  const vipInfoList = useMemo<VipProgressInfo[]>(() => {
    return vipList.map(vip => ({
      currentBadge: cards[vip.level].badge,
      nextBadge: cards[Math.min(vip.level + 1, maxVipLevel)].badge,
      current: vip.level <= currentLevel ? vip.amount - vip.diff : 0,
      total: vip.amount,
    }));
  }, [vipList, cards, currentLevel]);

  const rechargeAmount = useMemo(() => {
    if (vipList.length === 0) {
      return 0;
    }
    return (
      vipList[vipList.length - 1].amount - vipList[vipList.length - 1].diff
    );
  }, [vipList]);

  const handleRefresh = () => {
    globalStore.globalLoading.next(true);
    Promise.allSettled([postVipInfo(), postVipConfig()])
      .then(([_listvalue, _config]) => {
        if (_listvalue.status === 'fulfilled') {
          const _list = _listvalue.value;
          setVipList(
            _list.length > maxVipLevel
              ? _list.slice(0, maxVipLevel + 1)
              : _list,
          );
          setCheckIndex(
            _list.findIndex(v => v.rewardReceivingStatus && v.statusReached) +
              1,
          );
        }
        if (_config.status === 'fulfilled') {
          setVipConfigList(_config.value);
        }
      })
      .finally(() => globalStore.globalLoading.next(false));
  };
  useEffect(() => {
    handleRefresh();
  }, []);

  const handleChangeCheckIndex = debounce((index: number) => {
    setCheckIndex(index);
  });
  const toRecharge = () => {
    if (!globalStore.token) {
      goTo('Login');
      return;
    }
    goToWithLogin(i18n.t('home.tab.deposit'));
  };

  return (
    <LazyImageLGBackground
      style={[theme.fill.fillW, theme.flex.col, vipStyle.container]}>
      <DetailNavTitle
        title={i18n.t('vip.title')}
        onBack={() => goBack()}
        hideServer
      />
      <View style={[theme.padding.lrxxl]}>
        <MeUser login={isLogin} user={user} level={level} showNoMenu={false} />
      </View>
      <VipCardList
        vipInfoList={vipInfoList}
        cards={cards}
        vipList={vipList}
        rechargeAmount={rechargeAmount}
        onRecharge={toRecharge}
        onCheck={handleChangeCheckIndex}
        checkIndex={checkIndex}
        currentLevel={currentLevel}
        onRefresh={handleRefresh}
      />
      <VipClubList vipConfigList={vipConfigList} />
      <RechargeButton onRecharge={toRecharge} />
    </LazyImageLGBackground>
  );
};

export default Vip;
