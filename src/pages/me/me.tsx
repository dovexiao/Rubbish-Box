/* eslint-disable prettier/prettier */
import {
  View,
  Platform,
  LayoutChangeEvent,
  RefreshControl,
  Animated,
  Image,
} from 'react-native';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import React, {useCallback, useRef, useState, useEffect} from 'react';
import theme from '@style';
import {goTo, goCS, goToWithLogin} from '@utils'; //toAgentApply,
import Text from '@basicComponents/text';
import {VipProgress} from '@businessComponents/vip';
import {
  MeListItem,
  gamesIcon,
  // collectIcon,
  betsIcon,
  rebateIcon,
  transactionsIcon,
  updateIcon,
  passwordIcon,
  languagesIcon,
  notificationsIcon,
  resultHistoryIcon,
  shopIcon,
  couponIcon,
  customerServiceIcon,
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
import Tag from '@/components/basic/tag';
import DetailNavTitle from '@businessComponents/detail-nav-title';
import useVipStore, {useVipActions} from '@/store/useVipStore';
import {LazyImageLGBackground} from '@/components/basic/image';
import useUserStore, {useUserActions, useUserInfo} from '@/store/useUserStore';
import Button from '@/components/basic/button';
import useNotificationStore from '@/store/useNotificationStore';
import {useShallow} from 'zustand/react/shallow';
import {useSettingWindowDimensions} from '@/store/useSettingStore';
import {appEmail} from '@/services/global.service';
import Clipboard from '@react-native-clipboard/clipboard';

const {overflow, padding, font, margin, borderRadius, background, flex} = theme;

/** TODO 单个文件过大,需要拆解 */
const Me = () => {
  const {i18n} = useTranslation();
  const [login, setLogin] = useState<boolean>(false);

  const {screenWidth} = useSettingWindowDimensions();
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
  const {noticeMap, getNoticeMap, unReadMessageCount, getUnReadCount} =
    useNotificationStore(
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
  const [email, setEmail] = useState<string>('');
  useEffect(() => {
    appEmail()
      .then(res => {
        const str: string = res;
        setEmail(str);
      })
      .finally();
  }, []);

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
    // if (showNoMenu) {
    //   globalStore.globalTotal.next(notYetWarning);
    // }
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

  // const toAgency = () => {
  //   // 开关，后期如果有条件可换成动态flag
  //   const oldFlag = false;
  //   if (!login) {
  //     toLogin();
  //     return;
  //   }
  //   if (user?.isAgent === 1) {
  //     if (oldFlag) {
  //       goTo('ProxyHome');
  //     } else {
  //       goTo('NewProxyHome');
  //     }
  //   } else {
  //     toAgentApply();
  //   }
  // };

  // const toInvitation = () => {
  //   goTo('Invitation');
  // };

  const toRebate = () => {
    if (!login) {
      toLogin();
      return;
    }
    // 跳转commission
    goTo('Rebate');
  };

  const toMyGames = () => {
    goToWithLogin('MyGames');
  };

  // const toMyCollect = () => {
  //   goTo('CollectPage');
  // };

  const toShop = () => {
    goTo('ShoppingPage');
  };

  const toCoupon = () => {
    goTo('CouponPage');
  };

  const toTransactions = () => {
    if (!login) {
      toLogin();
      return;
    }
    goTo('Transactions');
  };

  const toPromotion = () => {
    goTo('PromotionDetail', {id: 4});
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

  const toMyBets = () => {
    if (!login) {
      toLogin();
      return;
    }
    goTo('Bets');
  };

  const toNotify = () => {
    if (!login) {
      goTo('Login');
    } else {
      goTo('Notification');
    }
  };

  const toSetPassword = () => {
    if (!login) {
      toLogin();
      return;
    }
    goTo('SetPassword');
  };

  const toResults = () => {
    goTo('Result');
  };

  const [refreshing, setRefreshing] = useState<boolean>(false);

  const copy = () => {
    Clipboard.setString(email);
    globalStore.globalSucessTotal(i18n.t('share.copy-success'));
  };
  return (
    <LazyImageLGBackground showBottomBG={false} subtractBottomTabHeight>
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
          <NativeTouchableOpacity activeOpacity={1} onPress={toPromotion}>
            <Image
              source={require('@assets/imgs/me/advertisement.webp')}
              style={[{height: 68, width: '100%'}, theme.margin.tops]}
            />
          </NativeTouchableOpacity>
          <View
            style={[
              margin.topl,
              theme.flex.row,
              theme.padding.lrl,
              theme.flex.centerByCol,
              theme.background.mainDark,
              theme.borderRadius.s,
              theme.flex.between,
              // eslint-disable-next-line react-native/no-inline-styles
              {height: 53},
            ]}>
            <View
              style={[
                theme.flex.flex1,
                theme.flex.centerByRow,
                theme.background.mainDark,
                theme.borderRadius.s,
                // eslint-disable-next-line react-native/no-inline-styles
                {height: 53},
              ]}>
              <Text numberOfLines={1} color={'white'}>
                {i18n.t('me.description.youHave')} {noticeMap?.REBATE}{' '}
                {i18n.t('me.description.betRebate')}
              </Text>
              <Text numberOfLines={1} color={theme.fontColor.white60}>
                {i18n.t('me.description.rebate1Description')}
              </Text>
            </View>
            <Button
              title={i18n.t('me.description.drawDown')}
              size="small"
              type="linear-primary"
              radius={30}
              onPress={toRebate}
            />
          </View>
          {/* <MeRowBtn onInvite={toInvitation} onProxy={toAgency} /> */}
          <View style={[]}>
            {/* 列表区域 */}
            <View style={[borderRadius.m, overflow.hidden, margin.topxxxs]}>
              {/* coupon位置调整 */}
              <MeListItem
                icon={couponIcon}
                title={i18n.t('me.bottom.coupon')}
                description={i18n.t('me.description.couponDescription')}
                onPress={toCoupon}
              />
              <MeListItem
                icon={gamesIcon}
                title={i18n.t('me.bottom.games')}
                description={i18n.t('me.description.gamesDescription')}
                onPress={toMyGames}
              />
              {/* <MeListItem
                icon={collectIcon}
                title={i18n.t('me.bottom.collect')}
                description="Get the collect and get bonus rewards"
                onPress={toMyCollect}
              /> */}
              <MeListItem
                icon={rebateIcon}
                title={i18n.t('home.label.rebate')}
                description={i18n.t('me.description.rebateDescription')}
                onPress={toRebate}
                rightContent={
                  noticeMap?.REBATE ? <Tag content={noticeMap?.REBATE} /> : null
                }
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
                icon={resultHistoryIcon}
                title={i18n.t('me.bottom.resultHistory')}
                description={i18n.t('me.description.resultHistoryDescription')}
                onPress={toResults}
              />
              <MeListItem
                icon={shopIcon}
                title={i18n.t('me.bottom.shop')}
                description={i18n.t('me.description.shopDescription')}
                onPress={toShop}
              />
            </View>
            <View
              style={[
                borderRadius.m,
                theme.background.mainDark,
                overflow.hidden,
                margin.topl,
              ]}>
              <MeListItem
                containerStyle={[theme.padding.tbl]}
                icon={notificationsIcon}
                iconSize={18}
                title={i18n.t('me.bottom.notify')}
                rightContent={
                  unReadMessageCount?.messageTotalCount ? (
                    <Tag
                      badgeSize={16}
                      backgroundColor={theme.basicColor.red}
                      content={unReadMessageCount?.messageTotalCount}
                    />
                  ) : null
                }
                mt={0}
                onPress={toNotify}
              />

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
            <View
              style={[
                flex.centerByCol,
                flex.centerByRow,
                // flex.between,
                padding.tbs,
                padding.lrl,
                theme.background.mainDark,
                theme.borderRadius.s,
                // eslint-disable-next-line react-native/no-inline-styles
                {
                  marginTop: 12,
                },
              ]}>
              <Text style={[font.white, font.m, font.bold, font.center]}>
                For any queries and complaints please email us
              </Text>
              <NativeTouchableOpacity onPress={copy}>
                <Text style={[font.red, font.m, font.bold, font.center]}>
                  {email || ''}
                </Text>
              </NativeTouchableOpacity>
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
          <Image
            source={require('@assets/imgs/footer-image.webp')}
            // eslint-disable-next-line react-native/no-inline-styles
            style={[{height: 180, width: screenWidth}]}
          />
        </Animated.ScrollView>
        {/* <MeHeader
          user={user}
          userAreaY={userAreaY}
          login={login}
          scrollAnim={scrollAnim}
          onUser={handleUser}
          showNoMenu={showNoMenu}
        /> */}
      </Spin>

      {renderConfirmModal}
      {renderLanguageModal}
      {versionModal.renderModal}
    </LazyImageLGBackground>
  );
};

export default Me;
