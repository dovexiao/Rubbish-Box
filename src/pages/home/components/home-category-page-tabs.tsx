/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import Text from '@/components/basic/text';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import useHomeStore from '@/store/useHomeStore';
import {useSettingWindowDimensions} from '@/store/useSettingStore';
import theme from '@/style';
import React, {useCallback, useEffect} from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {ScrollView} from 'react-native';
import {useShallow} from 'zustand/react/shallow';
import i18n from '@i18n';
import {useToken} from '@/store/useUserStore';

const tabsList = [
  {title: i18n.t('headers.popular'), value: 1, isLogin: false},
  {title: i18n.t('headers.lottery'), value: 10},
  {title: i18n.t('headers.live'), value: 3},
  {title: i18n.t('headers.sport'), value: 2},
];

const HomeCategoryPageTabs = () => {
  const {isLogin: login} = useToken();
  const {screenWidth} = useSettingWindowDimensions();

  const {
    isShowCategoryTab,
    oneCategoryPageIndex,
    changeIndex,
    getLotteryPageData,
    getHomeTagList,
    getCategoryHomeList,
  } = useHomeStore(
    useShallow(state => ({
      isShowCategoryTab: state.isShowCategoryTab,
      oneCategoryPageIndex: state.oneCategoryPageIndex,
      changeIndex: state.setState,
      getLotteryPageData: state.getLotteryPageData,
      getHomeTagList: state.getHomeTagList,
      getCategoryHomeList: state.getCategoryHomeList,
    })),
  );

  const height = useSharedValue(42);

  const bodyStyle = useAnimatedStyle(() => ({
    height: withTiming(isShowCategoryTab ? height.value : 0, {duration: 500}),
  }), [isShowCategoryTab]);

  const onPressItem = useCallback(
    (index: number) => {
      changeIndex({
        oneCategoryPageIndex: index,
        pageTagIndex: -1,
      });
    },
    [changeIndex],
  );

  useEffect(() => {
    const isGameTab = [1, 2, 3, 4, 5, 6, 11, 12].includes(oneCategoryPageIndex);
    const isLotteryTab = oneCategoryPageIndex === 10;

    useHomeStore.setState({
      isShowCategoryTab: true,
      pageTagIndex: -1,
    });

    if (isGameTab) {
      getHomeTagList();
      getCategoryHomeList();
    }

    if (isLotteryTab) {
      getLotteryPageData();
    }
  }, [oneCategoryPageIndex, getHomeTagList, getCategoryHomeList, getLotteryPageData]);

  return (
    <Animated.View style={[theme.margin.lrl, theme.borderRadius.m, bodyStyle]}>
      <ScrollView
        style={[
          theme.borderRadius.m,
          theme.flex.flex1,
          theme.background.transparentP30,
          {height: 42, width: screenWidth - theme.paddingSize.l * 2},
        ]}
        contentContainerStyle={{
          flex: 1,
          alignItems: 'center',
        }}
        horizontal
        showsHorizontalScrollIndicator={false}>
        {tabsList.map(item => {
          if (item.isLogin && !login) return null;

          const isSelected = oneCategoryPageIndex === item.value;

          return (
            <NativeTouchableOpacity
              key={item.value}
              onPress={() => onPressItem(item.value)}
              style={[
                theme.flex.flex1,
                theme.flex.center,
                isSelected
                  ? {
                    ...theme.background.primary,
                    ...theme.borderRadius.l,
                    height: 35,
                  }
                  : {
                    height: 42,
                  },
              ]}>
              <Text size="medium" blod white>
                {item.title}
              </Text>
            </NativeTouchableOpacity>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
};

export default HomeCategoryPageTabs;
