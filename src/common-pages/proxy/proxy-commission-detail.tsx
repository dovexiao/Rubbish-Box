import theme from '@/style';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import {RefreshControl, ScrollView, View} from 'react-native';
import {useInnerStyle} from './proxy.hooks';
import DetailNavTitle from '@/components/business/detail-nav-title';
import i18n from '@/i18n';
import {goBack, goTo, toPriceStr} from '@/utils';
import ProxySearch from './components/proxy-search';
import Text from '@/components/basic/text';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {HomeWhiteRightIcon} from './svg.variable';
import globalStore from '@/services/global.state';
import {usePaging} from '../hooks/paging.hooks';
import UserCommissionCard from './basic-components/user-commission-card';
import {NoMoreData} from '@/components/basic/default-page';
import {defaultHeaderImg} from './proxy.variable';
import CommissionRateModal from './components/commission-rate-Modal';
import {BasicObject, NavigatorScreenProps, SafeAny} from '@/types';
import Tabs from './components/tabs';
import {getCommissionDetail, getUserCommissionInfo} from './proxy.service';
import NoData from '@/components/basic/error-pages/no-data';
import {useFocusEffect} from '@react-navigation/native';
import {LazyImageLGBackground} from '@/components/basic/image';
const ProxyCommissionDetail = (props: NavigatorScreenProps) => {
  const {
    size: {screenHeight},
    userInfoStyle,
    whiteAreaStyle,
    commissionDetailStyle,
  } = useInnerStyle();
  const {route} = props;
  const userId = (route.params as BasicObject)?.userId;
  const agentLevel = (route.params as BasicObject)?.agentLevel;

  const [phone, setPhone] = useState('');
  const [searchedPhone, setSearchedPhone] = useState(phone);
  const CommissionRateModalRef: SafeAny = useRef(null);
  const [totalCommission, setTotalCommission] = useState(0);
  const [tier, setTier] = useState(1);
  const handleTabIndex = (str: string) => {
    setTier(+str);
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchedPhone(phone);
    }, 1000);
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [phone]);

  const toRebate = () => {
    CommissionRateModalRef.current.showModal(agentLevel || 1);
  };

  const [refreshing, setRefreshing] = useState(false);

  const {resultList, isEnd, init, onScroll} = usePaging(
    (pageNo, pageSize) => {
      return getCommissionDetail({
        pageNo,
        pageSize,
        phone: searchedPhone,
        grade: tier,
      });
    },
    {pageSize: 20},
  );
  useFocusEffect(
    useCallback(() => {
      globalStore.globalLoading.next(true);
      Promise.allSettled([init(), getUserCommissionInfo(+userId)])
        .then(([, com]) => {
          if (com.status === 'fulfilled') {
            setTotalCommission(+com.value.commissionAmount);
          }
        })
        .finally(() => globalStore.globalLoading.next(false));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchedPhone, tier]),
  );
  const handleRefresh = () => {
    setRefreshing(true);
    init().finally(() => setRefreshing(false));
  };
  const toCommissionDetailUser = (_userId: number) => {
    goTo('ProxyCommissionDetailUser', {userId: _userId});
  };
  return (
    <LazyImageLGBackground style={[theme.flex.col, {height: screenHeight}]}>
      <DetailNavTitle
        hideAmount
        hideServer
        onBack={goBack}
        title={i18n.t('proxy.commission-detail.title')}
      />
      <View style={[theme.flex.flex1, theme.margin.topl]}>
        <ScrollView
          style={[theme.flex.flex1]}
          scrollEventThrottle={16}
          stickyHeaderIndices={[1]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          onScroll={onScroll}>
          <View
            style={[
              theme.margin.topl,
              theme.margin.lrl,
              theme.padding.lrl,
              theme.padding.topl,
              theme.background.mainDark,
              theme.borderRadius.s,
            ]}>
            <ProxySearch searchValue={phone} onSearchValueChange={setPhone} />
            <View
              style={[
                theme.flex.row,
                theme.flex.between,
                theme.flex.centerByCol,
                theme.margin.topl,
                theme.padding.lrl,
                commissionDetailStyle.totalCommission,
              ]}>
              <View style={[theme.flex.col]}>
                <Text white fontSize={theme.fontSize.m}>
                  {i18n.t('proxy.commission-detail.total')}
                </Text>
                <Text
                  white
                  fontFamily="fontInter"
                  fontSize={theme.fontSize.xl}
                  style={[theme.margin.topxxs]}
                  blod>
                  {toPriceStr(totalCommission, {fixed: 2, thousands: true})}
                </Text>
              </View>
              {globalStore.packageId !== 2 && (
                <NativeTouchableOpacity
                  style={[
                    userInfoStyle.rebate,
                    theme.flex.row,
                    theme.flex.centerByCol,
                    theme.padding.lrs,
                    theme.padding.tbxxs,
                    theme.margin.lefts,
                  ]}
                  onPress={toRebate}>
                  <Text
                    color={theme.basicColor.white}
                    fontSize={theme.fontSize.xs}
                    blod>
                    {i18n.t('proxy.home.rebate')}
                  </Text>
                  <HomeWhiteRightIcon width={10} height={10} />
                </NativeTouchableOpacity>
              )}
            </View>
          </View>
          <View
            style={[
              theme.margin.topl,
              theme.margin.lrl,
              theme.background.mainDark,
              theme.position.rel,
              theme.borderRadius.s,
              // eslint-disable-next-line react-native/no-inline-styles
              {
                height: 35,
              },
            ]}>
            <Tabs handleTabIndex={handleTabIndex} />
          </View>
          {/* <View style={[theme.flex.col, theme.padding.l]}>
            {resultList.map((item, index) => {
              return (
                <View style={[theme.margin.btms]} key={index}>
                  <UserCommissionCard
                    avatar={defaultHeaderImg}
                    userPhone={item.userPhone}
                    lastLogin={item.activeDay}
                    amount={+item.commissionAmount}
                    onClick={() => toCommissionDetailUser(item.userId)}
                  />
                </View>
              );
            })}
            {resultList.length && isEnd ? <NoMoreData /> : null}
            {(!resultList || (!resultList.length && isEnd)) && (
              <View style={[theme.padding.tbl, commissionDetailStyle.error]}>
                <NoData />
              </View>
            )}
            <View style={[whiteAreaStyle.area]} />
          </View> */}
          <View style={[theme.flex.col, theme.padding.l]}>
            {Array.isArray(resultList) && resultList.length > 0 ? (
              resultList.map((item, index) => {
                return (
                  <View style={[theme.margin.btms]} key={index}>
                    <UserCommissionCard
                      avatar={defaultHeaderImg}
                      userPhone={item.userPhone}
                      lastLogin={item.activeDay}
                      amount={+item.commissionAmount}
                      onClick={() => toCommissionDetailUser(item.userId)}
                    />
                  </View>
                );
              })
            ) : (
              <View style={[theme.padding.tbl, commissionDetailStyle.error]}>
                <NoData />
              </View>
            )}
            {Array.isArray(resultList) && resultList.length > 0 && isEnd ? (
              <NoMoreData />
            ) : null}
            <View style={[whiteAreaStyle.area]} />
          </View>
        </ScrollView>
      </View>
      <CommissionRateModal ref={CommissionRateModalRef} />
    </LazyImageLGBackground>
  );
};

export default ProxyCommissionDetail;
