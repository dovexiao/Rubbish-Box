/* eslint-disable prettier/prettier */
import DetailNavTitle from '@/components/business/detail-nav-title';
import theme from '@/style';
import React, {useEffect} from 'react';
import {ScrollView, View} from 'react-native';

import {LazyImageLGBackground} from '@basicComponents/image';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import {goTo, goBack, goCS} from '@/utils'; //goCS

import {useTranslation} from 'react-i18next';
import useNotificationStore from '@/store/useNotificationStore';
import {MessageTypeDataResponse} from './notification.service';
import LazyImage from '@/components/basic/image/lazy-image';
import Text from '@/components/basic/text';
import Tag from '@/components/basic/tag';
import dayjs from 'dayjs';
import NotificationHeader from './components/notification-header';
import globalStore from '@/services/global.state';

const NotificationPage = () => {
  const {i18n} = useTranslation();

  const {feedbackUnReadCount} = useNotificationStore(
    state => state.unReadMessageCount,
  );
  const {messageTypeList, getUnReadCount, getMessageTypeList} =
    useNotificationStore();

  useEffect(() => {
    getUnReadCount();
    getMessageTypeList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPressItem = (index: number) => {
    useNotificationStore.setState({
      messageTypeTabIndex: index,
    });
    goTo('NotificationList');
  };

  const renderItem = (
    item: MessageTypeDataResponse,
    index: number,
    onPress?: () => void,
  ) => {
    return (
      <NativeTouchableOpacity
        key={item?.id}
        style={[
          theme.flex.row,
          theme.flex.centerByCol,
          // eslint-disable-next-line react-native/no-inline-styles
          {height: 62},
        ]}
        onPress={() => {
          if (onPress) {
            return onPress();
          }
          onPressItem(index);
        }}>
        <LazyImage
          imageUrl={item?.messageTypeDataIcon}
          width={36}
          height={36}
        />
        <View
          style={[
            theme.flex.flex1NoHidden,
            theme.flex.centerByRow,
            theme.margin.leftxs,
            // eslint-disable-next-line react-native/no-inline-styles
            {height: 62, marginLeft: 12},
          ]}>
          <View style={[theme.flex.row, theme.flex.between]}>
            <Text fontSize={15} blod color={theme.fontColor.white}>
              {item?.messageTypeDataTitle}
            </Text>
            <Text fontSize={12} color={theme.fontColor.primaryMain}>
              {item?.lastSendTime
                ? dayjs(item?.lastSendTime).format('MM:DD hh:mm')
                : ''}
            </Text>
          </View>
          <View style={[theme.flex.row, theme.flex.between]}>
            <Text
              fontSize={12}
              numberOfLines={1}
              color={theme.fontColor.primaryMain}>
              {item?.lastMessageContent}
            </Text>
            {item?.unreadCount > 0 ? (
              <Tag
                style={[
                  // eslint-disable-next-line react-native/no-inline-styles
                  {
                    width: 16,
                    height: 16,
                    position: 'absolute',
                    right: 0,
                  },
                ]}
                type="badge"
                content={item?.unreadCount}
                backgroundColor={theme.backgroundColor.accent}
              />
            ) : null}
          </View>
        </View>
      </NativeTouchableOpacity>
    );
  };

  return (
    <LazyImageLGBackground
      fullHeight={true}
      style={[theme.flex.col]}
      subtractBottomTabHeight>
      <DetailNavTitle
        title={i18n.t('notification.title')}
        hideAmount
        hideServer
        onBack={goBack}
        showClean={false}
        onPressClean={() => {}}
      />
      {globalStore.isAndroid ? <NotificationHeader /> : null}
      <ScrollView style={[theme.flex.flex1]}>
        <View
          style={[
            theme.background.mainDark,
            theme.margin.lrl,
            theme.borderRadius.s,
            theme.padding.lrl,
          ]}>
          {messageTypeList?.map((item, index) => {
            return renderItem(item, index);
          })}
        </View>
        <View
          style={[
            theme.background.mainDark,
            theme.margin.l,
            theme.borderRadius.s,
            theme.padding.lrl,
          ]}>
          {renderItem(
            {
              lastMessageContent: i18n.t('other.feedBackMessageText'),
              lastSendTime: 123123,
              lastSendUserId: 123,
              messageType: 10,
              messageTypeDataIcon: require('@assets/icons/feedback.webp'),
              messageTypeDataTitle: i18n.t('other.feedBackMessage'),
              packageId: 1,
              unreadCount: feedbackUnReadCount,
              id: 0,
            },
            1,
            () => {
              goTo('FeedBackPage');
            },
          )}
          {/* {renderItem(
            {
              lastMessageContent:
                'Cash rewards for participating in the survey',
              lastSendTime: 0,
              lastSendUserId: 123,
              messageType: 10,
              messageTypeDataIcon: require('@assets/icons/feedback.webp'),
              messageTypeDataTitle: 'Questionnaire',
              packageId: 1,
              unreadCount: 0,
              id: 0,
            },
            1,
            () => {},
          )}
          {renderItem(
            {
              lastMessageContent: 'You can find answers to your questions here',
              lastSendTime: 0,
              lastSendUserId: 123,
              messageType: 10,
              messageTypeDataIcon: require('@assets/icons/feedback.webp'),
              messageTypeDataTitle: 'Frequently asked questions',
              packageId: 1,
              unreadCount: 0,
              id: 0,
            },
            1,
            () => {},
          )} */}
        </View>
        <NativeTouchableOpacity
          onPress={goCS}
          style={[
            theme.flex.row,
            theme.flex.centerByCol,
            theme.background.primary,
            theme.margin.lrl,
            theme.flex.center,
            theme.gap.l,
            {height: 40, borderRadius: 20},
          ]}>
          <LazyImage
            imageUrl={require('@components/assets/icons/service.webp')}
            width={20}
            height={20}
          />
          <Text white>{`Contact ${i18n.t('me.bottom.customer')}`}</Text>
        </NativeTouchableOpacity>
      </ScrollView>
    </LazyImageLGBackground>
  );
};

export default NotificationPage;
