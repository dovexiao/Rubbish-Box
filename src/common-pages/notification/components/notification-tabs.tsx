/* eslint-disable react-native/no-inline-styles */
import Tag from '@/components/basic/tag';
import Text from '@/components/basic/text';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import useNotificationStore from '@/store/useNotificationStore';
import theme from '@/style';
import React, {useEffect, memo, useRef, useCallback} from 'react';

import {View, ScrollView, Dimensions} from 'react-native';
import {useShallow} from 'zustand/react/shallow';

const NotificationTabs = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const {messageTypeTabIndex, messageTypeList} = useNotificationStore(
    useShallow(state => ({
      messageTypeTabIndex: state.messageTypeTabIndex,
      messageTypeList: state.messageTypeList,
    })),
  );

  const tabWidths = useRef(new Array(messageTypeList?.length).fill(0)).current;
  const tabOffsets = useRef(new Array(messageTypeList?.length).fill(0)).current;

  const scrollViewHandle = useCallback(() => {
    const currentOffset = tabOffsets[messageTypeTabIndex];
    const currentWidth = tabWidths[messageTypeTabIndex];
    const screenWidth = Dimensions.get('window').width;
    const scrollToX = currentOffset + currentWidth / 2 - screenWidth / 2;
    scrollViewRef.current?.scrollTo({
      x: scrollToX > 0 ? scrollToX : 0,
      animated: true,
    });
  }, [messageTypeTabIndex, tabOffsets, tabWidths]);

  useEffect(() => {
    requestAnimationFrame(() => scrollViewHandle());
  }, [scrollViewHandle]);

  useEffect(() => {
    // 定位到第五个 tab
    if (messageTypeList.length >= 5) {
      useNotificationStore.setState({
        messageTypeTabIndex: messageTypeTabIndex,
      });
      scrollViewHandle();
    }
  }, [messageTypeList, scrollViewHandle, messageTypeTabIndex]);

  const onPressItem = (index: number) => {
    useNotificationStore.setState({
      messageTypeTabIndex: index,
    });
    // scrollViewHandle();
  };

  return (
    <View style={[theme.borderRadius.m, theme.position.rel]}>
      <ScrollView
        ref={scrollViewRef}
        style={[{height: 42, backgroundColor: theme.basicColor.primary15}]}
        contentContainerStyle={{
          alignItems: 'center',
        }}
        horizontal
        showsHorizontalScrollIndicator={false}>
        {messageTypeList?.map((item, index) => (
          <NativeTouchableOpacity
            onPress={() => onPressItem(index)}
            key={item?.id}
            onLayout={event => {
              tabWidths[index] = event.nativeEvent.layout.width;
              tabOffsets[index] = event.nativeEvent.layout.x;
            }}
            style={[theme.position.rel, theme.flex.center, {height: 42}]}>
            <View
              style={[
                theme.flex.center,
                theme.padding.lrl,
                theme.borderRadius.m,
                messageTypeTabIndex === index
                  ? {
                      backgroundColor: theme.basicColor.primary,
                      height: 30,
                    }
                  : {
                      height: 30,
                    },
              ]}>
              <Text
                size="medium"
                blod
                numberOfLines={1}
                color={
                  messageTypeTabIndex === index
                    ? theme.fontColor.white
                    : theme.fontColor.primaryMain
                }>
                {item?.messageTypeDataTitle}
              </Text>
            </View>

            {item?.unreadCount > 0 ? (
              <Tag
                type="badge"
                backgroundColor={theme.backgroundColor.accent}
                content={item?.unreadCount}
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                }}
              />
            ) : null}
          </NativeTouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default memo(NotificationTabs);
