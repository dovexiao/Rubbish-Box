import React, {useState, useCallback, useEffect} from 'react';
import theme from '@style';
import i18n from '@i18n';
import {View, ScrollView, RefreshControl} from 'react-native';
import DetailNavTitle from '@/components/business/detail-nav-title';
import ProxySearch from '@/common-pages/proxy/components/proxy-search';
import Table from './total-user/user-table';
import Tabs from './total-user/tabs';
import {goBack} from '@utils';
import globalStore from '@/services/global.state';
import {useRoute, useFocusEffect} from '@react-navigation/native';
import {usePaging} from '../hooks';
import {getTotalUser} from '../api';
import {LazyImageLGBackground} from '@/components/basic/image';
// interface UserInfo {
//   userPhone: string;
//   commission: number;
//   createTime: number;
//   type: number;
// }
export type SafeAny = any;
export type BasicObject = {
  [k: string]: SafeAny;
};

const TotalUser = () => {
  const [phone, setPhone] = useState('');
  const [searchedPhone, setSearchedPhone] = useState(phone);
  const route = useRoute();
  const [tier, setTier] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const handleTabIndex = (str: string) => {
    setTier(+str);
    fetchParams = {
      ...fetchParams,
      level: +str,
    };
  };
  let fetchParams = {
    pageNo: 1,
    pageSize: 20,
    userPhone: phone,
    level: tier,
  };

  const handleRefresh = () => {
    setRefreshing(true);
    init().finally(() => setRefreshing(false));
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

  const {resultList, init, onScroll} = usePaging(
    (pageNo, pageSize) => {
      return getTotalUser({
        pageNo,
        pageSize,
        userPhone: searchedPhone,
        level: tier,
      });
    },
    {pageSize: 20},
  );
  useFocusEffect(
    useCallback(() => {
      globalStore.globalLoading.next(true);
      Promise.allSettled([init()])
        .then(([]) => {})
        .finally(() => globalStore.globalLoading.next(false));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchedPhone, tier]),
  );
  return (
    <LazyImageLGBackground style={[theme.fill.fill, theme.flex.col]}>
      <DetailNavTitle
        hideServer
        hideAmount
        onBack={(route.path || '').indexOf('index') > -1 ? undefined : goBack}
        title={i18n.t('newProxy.child.total-users')}
        iconColor="white"
        titleColor={theme.fontColor.white}
      />
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
            theme.background.mainDark,
            theme.margin.l,
            theme.padding.l,
            theme.borderRadius.m,
          ]}>
          <View style={[theme.margin.btml]}>
            <ProxySearch searchValue={phone} onSearchValueChange={setPhone} />
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
        <View
          style={[
            theme.background.mainDark,
            theme.margin.l,
            theme.padding.l,
            theme.borderRadius.m,
          ]}>
          <Table users={resultList as any} />
        </View>
      </ScrollView>
    </LazyImageLGBackground>
  );
};

export default TotalUser;
