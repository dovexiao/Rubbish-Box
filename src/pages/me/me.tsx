/* eslint-disable prettier/prettier */
import {
  View,
  Platform,
  LayoutChangeEvent,
  RefreshControl,
  Animated,
} from 'react-native';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import React, {useCallback, useRef, useState} from 'react';
import theme from '@style';
import {goTo, goCS} from '@utils'; //toAgentApply,
import Text from '@basicComponents/text';
import {VipProgress} from '@businessComponents/vip';
import {
  MeListItem,
  betsIcon,
  giftcode,
  transactionsIcon,
  updateIcon,
  passwordIcon,
  languagesIcon,
  customerServiceIcon,
  rebateIcon,
} from '@businessComponents/list-item';
import {useConfirm} from '@basicComponents/modal';
import {useLanguageModal} from '@businessComponents/language';
import {useFocusEffect} from '@react-navigation/native';
import globalStore from '@/services/global.state';
import {toLogin} from './me.variable';
import MeUser from './me-user';
import MeAmount from './me-amount';
import MeVip from './me-vip';
import {useVersionModal} from '@/common-pages/hooks/versionmodal.hooks';
import {getVersion} from 'react-native-device-info';
import Spin from '@/components/basic/spin';
import {useTranslation} from 'react-i18next';
import MeRowMenu from './me-row-menu';
import DetailNavTitle from '@businessComponents/detail-nav-title';
import useVipStore, {useVipActions} from '@/store/useVipStore';
import {LazyImageLGBackground} from '@/components/basic/image';
import useUserStore, {useUserActions, useUserInfo} from '@/store/useUserStore';
import useNotificationStore from '@/store/useNotificationStore';
import {useShallow} from 'zustand/react/shallow';
import GiftPop from '@/common-pages/gift-code/gift-pop';
import { getGiftCodeAmount } from '@/pages/me/me.service';
import { useRebateSuccessToast } from '@/common-pages/rebate/rebate-toast.hooks';

const {overflow, padding, font, margin, borderRadius, background} = theme;

/** TODO 单个文件过大,需要拆解 */
const Me = () => {
  const {i18n} = useTranslation();
  const [login, setLogin] = useState<boolean>(false);

  const scrollAnim = useRef(new Animated.Value(0)).current;
  const {renderModal: renderConfirmModal, show: confirmShow} = useConfirm();
  const {renderModal: renderLanguageModal, show: languageShow} =
    useLanguageModal();
  const {versionModal, handleUpdate} = useVersionModal(false);

  const [_, setUserAreaY] = useState<number>(0);
  const firstFocus = useRef(true);
  const [pageLoading, setPageLoading] = useState(false);

  const {level, nextValue, diff} = useVipStore(state => state.vipInfo);
  const {setVipConfig, setVipInfo} = useVipActions();
  const user = useUserInfo();
  const {getUserInfo} = useUserActions();
  const {getNoticeMap, getUnReadCount} = useNotificationStore(
    useShallow(state => ({
      noticeMap: state.noticeMap,
      getNoticeMap: state.getNoticeMap,
      unReadMessageCount: state.unReadMessageCount,
      getUnReadCount: state.getUnReadCount,
    })),
  );

  const refresh = useCallback(
    async (token: string | null, showloading = true) => {
      showloading && setPageLoading(true);
      try {
        if (!token) {
          setLogin(false);
          setVipConfig();
        } else {
          setLogin(true);
          setVipInfo();
          getUserInfo();
        }
      } finally {
        setPageLoading(false);
        setRefreshing(false);
      }
    },
    [getUserInfo, setVipConfig, setVipInfo],
  );

  const onFocusEffect = useCallback(() => {
    const sub = globalStore.tokenSubject.subscribe(token => {
      setLogin(!!token);
      refresh(token, firstFocus.current);
      firstFocus.current = false;
      if (token) {
        getNoticeMap();
        getUnReadCount();
        globalStore.amountCheckOut.next();
      }
    });
    const msgSub = globalStore.notificationSubject.subscribe(_countInfo => {});
    return () => {
      sub.unsubscribe();
      msgSub.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);
  useFocusEffect(onFocusEffect);

  const handleUser = () => {
    if (!login) {
      toLogin();
      return;
    }
  };

  const handleMoneyLayout = (e: LayoutChangeEvent) => {
    setUserAreaY(e.nativeEvent.layout.y);
  };

  const handleRefresh = () => {
    if (!login) {
      goTo('Login');
      return;
    }
    refresh(globalStore.token);
  };

  const toVip = () => {
    if (!login) {
      toLogin();
      return;
    }
    goTo('Vip');
  };

  const toTransactions = () => {
    if (!login) {
      toLogin();
      return;
    }
    goTo('Transactions');
  };

  const toInvitation = () => {
    if (!login) {
      toLogin();
      return;
    }
    handleOpenPop();
  };

  const [isGiftPopVisible, setGiftPopVisible] = useState(false);


  const handleOpenPop = () => {
    setGiftPopVisible(true);
  };

  const handleClosePop = () => {
    setGiftPopVisible(false);
  };

  const {show} = useRebateSuccessToast();

  const handleSubmit = async (value: string) => {
    try {
      if (!value) {
        return;
      }
      const res = await getGiftCodeAmount(value);
      show(Number(res));
      handleClosePop(); // 关闭弹窗
    } catch (error) {
      handleClosePop(); // 关闭弹窗
    }
  };

  const toLanguage = () => {
    languageShow();
  };

  const toUpdate = () => {
    // 更新
    handleUpdate();
  };

  const doLogout = () => {
    // logout
    confirmShow(i18n.t('alert.logout'), i18n.t('alert.sureLogout'), () => {
      globalStore.token = null;
      globalStore.userInfo = null;
      // loginOut();
      useUserStore.getState().loginOut();
      toLogin();
    });
  };

  const toRebate = () => {
    if (!login) {
      toLogin();
      return;
    }
    // 跳转commission
    goTo('Rebate');
  };

  const toMyBets = () => {
    if (!login) {
      toLogin();
      return;
    }
    goTo('Bets');
  };

  const toSetPassword = () => {
    if (!login) {
      toLogin();
      return;
    }
    goTo('SetPassword');
  };

  const [refreshing, setRefreshing] = useState<boolean>(false);
  return (
    <LazyImageLGBackground subtractBottomTabHeight>
      {/* TODO 这里的滚动方案需要优化,以及文件过大需要拆分 */}
      <Spin loading={pageLoading} style={[theme.fill.fill, theme.padding.lrl]}>
        <Animated.ScrollView
          onScroll={Animated.event(
            [
              {
                nativeEvent: {
                  contentOffset: {y: scrollAnim},
                },
              },
            ],
            {useNativeDriver: true},
          )}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={1}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                refresh(globalStore.token, false);
              }}
            />
          }>
          <DetailNavTitle hideAmount hideServer title={i18n.t('home.tab.me')} />
          <MeUser
            login={login}
            user={user}
            level={level}
            onUser={handleUser}
            showNoMenu={false}
          />
          <MeVip
            login={login}
            level={level}
            onPress={toVip}
            nextLevelValue={nextValue}
            renderProgress={
              <VipProgress
                currentLevel={level}
                nextCurrentLevel={level + 1}
                current={nextValue - diff}
                total={nextValue}
                hasCurrentText={true}
              />
            }
          />
          <MeAmount onLayout={handleMoneyLayout} onRefresh={handleRefresh} />
          <MeRowMenu />
          <View style={[]}>
            {/* 列表区域 */}
            <View style={[borderRadius.m, overflow.hidden, margin.topxxxs]}>
              {/*<MeListItem*/}
              {/*  icon={gamesIcon}*/}
              {/*  title={i18n.t('me.bottom.games')}*/}
              {/*  description={i18n.t('me.description.gamesDescription')}*/}
              {/*  onPress={toMyGames}*/}
              {/*/>*/}
              {/*<MeListItem*/}
              {/*  icon={transactionsIcon}*/}
              {/*  title={i18n.t('me.bottom.myTransactions')}*/}
              {/*  description={i18n.t('me.description.transactionsDescription')}*/}
              {/*  onPress={toTransfer}*/}
              {/*/>*/}
              <MeListItem
                icon={giftcode}
                title={i18n.t('me.bottom.giftCode')}
                description={i18n.t('me.bottom.giftCode')}
                onPress={toInvitation}
              />
              <MeListItem
                icon={transactionsIcon}
                title={i18n.t('me.bottom.myTransactions')}
                description={i18n.t('me.description.transactionsDescription')}
                onPress={toTransactions}
              />
              <MeListItem
                icon={betsIcon}
                title={i18n.t('me.bottom.myBets')}
                description={i18n.t('me.description.betsDescription')}
                onPress={toMyBets}
              />
              <MeListItem
                icon={rebateIcon}
                title={i18n.t('home.label.rebate')}
                description={i18n.t('me.description.rebateDescription')}
                onPress={toRebate}
              />
            </View>
            <View
              style={[
                borderRadius.m,
                theme.background.black60,
                overflow.hidden,
                margin.topl,
              ]}>
              {/*<MeListItem*/}
              {/*  containerStyle={[theme.padding.tbl]}*/}
              {/*  icon={notificationsIcon}*/}
              {/*  iconSize={18}*/}
              {/*  title={i18n.t('me.bottom.notify')}*/}
              {/*  rightContent={*/}
              {/*    unReadMessageCount?.messageTotalCount ? (*/}
              {/*      <Tag*/}
              {/*        badgeSize={16}*/}
              {/*        backgroundColor={theme.basicColor.red}*/}
              {/*        content={unReadMessageCount?.messageTotalCount}*/}
              {/*      />*/}
              {/*    ) : null*/}
              {/*  }*/}
              {/*  mt={0}*/}
              {/*  onPress={toNotify}*/}
              {/*/>*/}

              <MeListItem
                icon={passwordIcon}
                iconSize={18}
                containerStyle={[theme.padding.tbl]}
                mt={0}
                title={i18n.t('me.bottom.password')}
                onPress={toSetPassword}
              />

              <MeListItem
                containerStyle={[theme.padding.tbl]}
                mt={0}
                iconSize={18}
                icon={languagesIcon}
                title={i18n.t('me.bottom.lang')}
                onPress={toLanguage}
              />
              <MeListItem
                containerStyle={[theme.padding.tbl]}
                mt={0}
                iconSize={18}
                icon={customerServiceIcon}
                title={i18n.t('me.bottom.customer')}
                onPress={goCS}
                hideBottomBorder={Platform.OS === 'android' ? false : true}
              />
              {Platform.OS === 'android' && (
                <MeListItem
                  containerStyle={[theme.padding.tbl]}
                  icon={updateIcon}
                  iconSize={18}
                  title={i18n.t('me.bottom.update')}
                  rightContent={
                    <Text style={[font.secAccent, font.s]}>{getVersion()}</Text>
                  }
                  mt={0}
                  onPress={toUpdate}
                />
              )}
            </View>
            {login && (
              <NativeTouchableOpacity onPress={doLogout}>
                <View
                  style={[
                    background.mainShallow,
                    padding.lrm,
                    padding.tbl,
                    borderRadius.m,
                    overflow.hidden,
                    margin.topl,
                  ]}>
                  <Text style={[font.white, font.m, font.bold, font.center]}>
                    {i18n.t('me.bottom.logout')}
                  </Text>
                </View>
              </NativeTouchableOpacity>
            )}
          </View>
        </Animated.ScrollView>
      </Spin>
      <GiftPop
        visible={isGiftPopVisible}
        onClose={handleClosePop}
        onSubmit={handleSubmit}
      />
      {renderConfirmModal}
      {renderLanguageModal}
      {versionModal.renderModal}
    </LazyImageLGBackground>
  );
};

export default Me;
