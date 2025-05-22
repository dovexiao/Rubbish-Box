/* eslint-disable react-native/no-inline-styles */
import DetailNavTitle from '@/components/business/detail-nav-title';
import theme from '@/style';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ActivityIndicator, FlatList, RefreshControl, View} from 'react-native';
import Text from '@basicComponents/text';
import {LazyImageLGBackground} from '@basicComponents/image';
import {
  getMessageListService,
  NotificationItem,
  readAllMessageService,
  readMessageService,
  delMessageInfo,
} from './notification.service';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import {goBack, goTo} from '@/utils';
import {useTranslation} from 'react-i18next';
import useNotificationStore from '@/store/useNotificationStore';
import NotificationTabs from './components/notification-tabs';
import {useShallow} from 'zustand/react/shallow';
import useInfiniteScroll from '../hooks/load-more.hooks';
import LazyImage from '@/components/basic/image/lazy-image';
import dayjs from 'dayjs';
import NoData from '@/components/basic/error-pages/no-data';
import {DropdownMenu} from '@/components/basic/Dropdown';
import globalStore from '@/services/global.state';

const moreIcon = require('@/assets/icons/check_more.webp');
const rightIcon = require('@/assets/icons/chevron_right.webp');

const MESSAGE_FLAT_LIST_ID = 'message-flat-list-id';

const NotificationPage = () => {
  const {i18n} = useTranslation();
  const {
    messageTypeTabIndex,
    // getUnReadCount,
    getMessageTypeList,
    messageTypeList,
  } = useNotificationStore(
    useShallow(state => ({
      // // getUnReadCount: state.getUnReadCount,
      getMessageTypeList: state.getMessageTypeList,
      messageTypeTabIndex: state.messageTypeTabIndex,
      messageTypeList: state.messageTypeList,
    })),
  );

  const checkMessageType = useMemo(() => {
    return (
      messageTypeList?.find((_, index) => index === messageTypeTabIndex)
        ?.messageType || 0
    );
  }, [messageTypeList, messageTypeTabIndex]);

  const tableRef = useRef<FlatList>(null);

  const pageNoRef = useRef(1);
  const isRefresh = useRef(false);
  const [messageList, setMessageList] = useState<NotificationItem[]>([]);
  const [hasMoreData, setHasMoreData] = useState(true);
  const {onEndReachedCalledDuringMomentum} =
    useInfiniteScroll(MESSAGE_FLAT_LIST_ID);
  const typeList = messageTypeList?.map(item => {
    return item?.messageTypeDataTitle;
  });
  const fetchData = useCallback(
    async (refresh = false) => {
      if (refresh) {
        pageNoRef.current = 1;
        // isRefresh.current = true;
      } else {
        pageNoRef.current = pageNoRef.current + 1;
      }
      const res = await getMessageListService({
        pageNo: pageNoRef?.current,
        messageType: checkMessageType,
      });
      const newListData =
        pageNoRef.current === 1
          ? res?.content
          : [...messageList, ...res?.content];
      setMessageList(newListData);
      setHasMoreData(newListData?.length === res?.totalSize ? false : true);
      isRefresh.current = false;
    },
    [checkMessageType, messageList],
  );

  const refreshList = useCallback(() => {
    if (pageNoRef.current === 1) {
      return;
    }
    fetchData(true);
  }, [fetchData]);

  const loadMore = () => {
    if (hasMoreData && !onEndReachedCalledDuringMomentum.current) {
      fetchData();
      onEndReachedCalledDuringMomentum.current = true;
    }
  };

  useEffect(() => {
    // getUnReadCount();
    getMessageTypeList();
    fetchData(true);
    if (tableRef?.current) {
      tableRef.current?.scrollToOffset({offset: 0, animated: true});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageTypeTabIndex]);

  const toDetail = useCallback(
    async (item: NotificationItem) => {
      try {
        await useNotificationStore.setState({notificationDetail: item});
        await goTo('NotificationDetail');
        await readMessageService(item?.id, item?.messageType);
        // await getUnReadCount();
        await getMessageTypeList();
        await fetchData(true);
      } catch (error) {}
    },
    [getMessageTypeList, fetchData],
  );

  const keyExtractor = useCallback((item: any) => {
    if (item?.id) {
      return item?.id.toString();
    } else {
      return item?.messageContent;
    }
  }, []);

  const ListFooterComponent = useMemo(() => {
    if (messageList?.length === 0) {
      return null;
    }
    if (hasMoreData) {
      return (
        <View style={[theme.flex.center, theme.padding.m]}>
          <ActivityIndicator />
        </View>
      );
    }
    return (
      <View style={[theme.flex.center, theme.padding.m]}>
        <Text style={[theme.font.white]}>Load complete</Text>
      </View>
    );
  }, [hasMoreData, messageList]);

  const deleteClick = (item: any) => {
    if (!item.id) {
      return;
    }
    delMessageInfo(item.id).then(() => {
      globalStore.globalTotal.next({
        type: 'success',
        message: i18n.t('notification.deleteSuccess'),
      });
      // getUnReadCount();
      getMessageTypeList();
      fetchData(true);
    });
  };
  const renderItem = useCallback(
    ({item}: {item: NotificationItem}) => (
      <NativeTouchableOpacity
        style={[theme.background.mainDark, theme.borderRadius.s]}
        onPress={() => toDetail(item)}>
        <View
          style={[
            theme.flex.row,
            theme.flex.centerByCol,
            theme.flex.between,
            theme.padding.lrl,

            {
              height: 32,
              backgroundColor: '#00000032',
            },
          ]}>
          <View style={[theme.flex.row, theme.flex.centerByCol]}>
            <LazyImage imageUrl={item?.messageIcon} width={20} height={20} />
            <Text
              numberOfLines={1}
              fontSize={12}
              color={theme.fontColor.white}
              style={[theme.font.center, theme.margin.leftm]}>
              {typeList[item?.messageType]}
            </Text>
          </View>
          <View style={[theme.flex.row, theme.flex.centerByCol]}>
            <Text
              numberOfLines={1}
              fontSize={12}
              color={theme.fontColor.primaryMain}
              style={[theme.font.center]}>
              {dayjs(item?.sendTime).format('MM:DD hh:mm')}
            </Text>
            {item?.ifRead === 0 ? (
              <View
                style={[
                  theme.icon.xxs,
                  theme.borderRadius.full,
                  theme.background.red,
                  theme.margin.leftm,
                ]}
              />
            ) : null}
          </View>
        </View>
        <View
          style={[
            theme.flex.flex1,
            theme.flex.row,
            theme.flex.between,
            theme.padding.l,
          ]}>
          <View style={[theme.flex.col, theme.flex.flex1, theme.margin.rightl]}>
            <Text
              numberOfLines={1}
              fontSize={16}
              blod
              color={theme.fontColor.white}>
              {item?.messageTitle}
            </Text>
            <Text
              numberOfLines={3}
              fontSize={12}
              color={theme.fontColor.white60}>
              {item?.messageContentOverview}
            </Text>
          </View>
          {item?.messageIcon ? (
            <LazyImage imageUrl={item?.messageIcon} width={60} height={60} />
          ) : null}
        </View>
        <View
          style={[
            theme.flex.row,
            theme.flex.between,
            {
              paddingVertical: theme.paddingSize.xs,
              marginHorizontal: theme.paddingSize.l,
              borderTopWidth: 1,
              borderTopColor: 'rgba(255, 255, 255, 0.2)',
            },
          ]}>
          <View style={[theme.flex.row, theme.flex.centerByCol]}>
            <Text
              style={{marginRight: 5}}
              color={theme.fontColor.white}
              fontSize={13}>
              {i18n.t('notification.detail1')}
            </Text>
            <LazyImage imageUrl={rightIcon} width={15} height={15} />
          </View>
          {/* <View>
            <NativeTouchableOpacity>
              <LazyImage imageUrl={moreIcon} width={20} height={20} />
            </NativeTouchableOpacity>
          </View> */}
          <DropdownMenu
            buttonText={
              <LazyImage imageUrl={moreIcon} width={20} height={20} />
            }
            actions={[
              {
                label: i18n.t('notification.more.delete'),
                onPress: () => deleteClick(item),
              },
            ]}
          />
        </View>
      </NativeTouchableOpacity>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [toDetail],
  );

  const onPressCleanMessage = async () => {
    try {
      await readAllMessageService(checkMessageType);
      await getMessageTypeList();
      await fetchData(true);
      // await getUnReadCount();
    } catch (error) {}
  };

  return (
    <LazyImageLGBackground style={[theme.flex.col]}>
      <DetailNavTitle
        title={i18n.t('notification.title')}
        hideAmount
        hideServer
        onBack={goBack}
        showClean
        onPressClean={onPressCleanMessage}
      />
      <FlatList
        id={MESSAGE_FLAT_LIST_ID}
        ref={tableRef}
        data={messageList}
        scrollEventThrottle={16}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        stickyHeaderIndices={[0]}
        ListHeaderComponent={<NotificationTabs />}
        ListFooterComponent={ListFooterComponent}
        ListEmptyComponent={
          <View style={[theme.borderRadius.l]}>
            <NoData />
          </View>
        }
        refreshControl={
          isRefresh.current ? (
            <RefreshControl
              refreshing={isRefresh.current}
              onRefresh={refreshList}
            />
          ) : undefined
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        contentContainerStyle={[theme.margin.lrl, {gap: 10}]}
        showsVerticalScrollIndicator={false}
        onScroll={() => {
          onEndReachedCalledDuringMomentum.current = false;
        }}
        onMomentumScrollBegin={() => {
          onEndReachedCalledDuringMomentum.current = false;
        }}
      />
    </LazyImageLGBackground>
  );
};

export default NotificationPage;
