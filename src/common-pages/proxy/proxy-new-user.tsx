import theme from '@/style';
import {useInnerStyle} from './proxy.hooks';
import {View, FlatList, RefreshControl, ListRenderItem} from 'react-native';
import React, {useCallback, useState} from 'react';
import DetailNavTitle from '@/components/business/detail-nav-title';
import i18n from '@/i18n';
import {usePaging} from '../hooks/paging.hooks';
// import {defaultHeaderImg} from './proxy.variable';
import globalStore from '@/services/global.state';
import UserCommissionCard from './basic-components/user-commission-card';
import {NoMoreData} from '@/components/basic/default-page';
import {BasicObject, NavigatorScreenProps} from '@/types';
import Text from '@/components/basic/text';
import {goBack, goTo} from '@/utils';
import ErrorInvitePage from './basic-components/error-user-page';
import {defaultHeaderImg} from './proxy.variable';
import {getTodayNewUserList} from './proxy.service';
import {UserContentItem} from './proxy.type';
import {useShare} from '../hooks/share.hooks';
import {useFocusEffect} from '@react-navigation/native';
import {LazyImageLGBackground} from '@/components/basic/image';

const ProxyNewUser = (props: NavigatorScreenProps) => {
  const {
    size: {screenHeight},
  } = useInnerStyle();
  const {route} = props;
  const userCount = (route.params as BasicObject)?.userCount;
  const [refreshing, setRefreshing] = useState(false);
  const {doShare} = useShare(true);
  const {resultList, isEnd, init, refreshNextPage} = usePaging(
    (pageNo, pageSize) => {
      return getTodayNewUserList({
        pageNo,
        pageSize,
      });
    },
    {pageSize: 20},
  );
  useFocusEffect(
    useCallback(() => {
      globalStore.globalLoading.next(true);
      init().finally(() => globalStore.globalLoading.next(false));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );
  const handleRefresh = () => {
    setRefreshing(true);
    init().finally(() => setRefreshing(false));
  };
  const renderItem: ListRenderItem<UserContentItem> = ({item, index}) => {
    return (
      <View style={[theme.margin.btms]} key={index}>
        <UserCommissionCard
          onClick={() =>
            goTo('ProxyCommissionDetailUser', {userId: item.userId})
          }
          avatar={defaultHeaderImg}
          userPhone={item.userPhone}
          lastLogin={item.activeDay}
          amount={item.commissionAmount}
        />
      </View>
    );
  };
  return (
    <LazyImageLGBackground style={[theme.flex.col, {height: screenHeight}]}>
      <DetailNavTitle
        hideServer
        hideAmount
        title={i18n.t('proxy.new-user.title')}
        onBack={goBack}
      />
      {resultList.length > 0 ? (
        <View style={[theme.flex.col, theme.flex.flex1, theme.padding.l]}>
          <View
            style={[theme.flex.row, theme.flex.centerByCol, theme.margin.btml]}>
            <Text
              main
              fontSize={theme.fontSize.m}
              color={theme.fontColor.white}>
              {i18n.t('proxy.new-user.today')}
            </Text>
            <Text
              color={theme.basicColor.primary}
              fontSize={theme.fontSize.m}
              blod
              style={[theme.margin.leftxxs]}>
              {userCount}
            </Text>
          </View>

          <FlatList
            data={resultList}
            renderItem={renderItem}
            onEndReached={refreshNextPage}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
            ListFooterComponent={
              resultList.length && isEnd ? <NoMoreData /> : undefined
            }
          />
        </View>
      ) : (
        <ErrorInvitePage
          content={i18n.t('proxy.new-user.error')}
          buttonTitle={i18n.t('proxy.new-user.invite')}
          onClick={() => doShare()}
        />
      )}
    </LazyImageLGBackground>
  );
};

export default ProxyNewUser;
