/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import Text from '@/components/basic/text';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import useHomeStore from '@/store/useHomeStore';
import {useSettingWindowDimensions} from '@/store/useSettingStore';
import theme from '@/style';
import React, {useCallback, useEffect} from 'react';
// import React, {useCallback} from 'react';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
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
  const derivedHeight = useDerivedValue(
    () =>
      withTiming(isShowCategoryTab ? height.value : 0, {
        duration: 500,
      }),
    [isShowCategoryTab],
  );

  const bodyStyle = useAnimatedStyle(
    () => ({
      //之前需求是需要滑动屏幕高度隐藏tab，现在不需要隐藏了，所以把一下这行代码注释掉实现不隐藏tab的效果
      // height: derivedHeight.value,
      height: 42,
    }),
    [derivedHeight],
  );

  //其实应该传id后续看需要修改不
  const onPressItem = useCallback(
    (index: number) => {
      // 需要更改oneCategoryPageIndex和pageTagIndex两个值
      //每次切换oneCategoryPageIndex需要把pageTagIndex重置
      changeIndex({
        oneCategoryPageIndex: index,
        pageTagIndex: -1,
      });
    },
    [changeIndex],
  );

  // useEffect(() => {
  // useHomeStore.setState({isShowCategoryTab: true});
  // }, []);

  useEffect(() => {
    // console.info('=======oneCategoryPageIndex:' + oneCategoryPageIndex);
    useHomeStore.setState({isShowCategoryTab: true});
    useHomeStore.setState({pageTagIndex: -1});
    if (
      oneCategoryPageIndex === 1 ||
      oneCategoryPageIndex === 2 ||
      oneCategoryPageIndex === 3 ||
      oneCategoryPageIndex === 4 ||
      oneCategoryPageIndex === 5 ||
      oneCategoryPageIndex === 6 ||
      oneCategoryPageIndex === 11 ||
      oneCategoryPageIndex === 12
    ) {
      getHomeTagList();
      getCategoryHomeList();
    }
    if (oneCategoryPageIndex === 10) {
      getLotteryPageData();
    }
  }, [
    getCategoryHomeList,
    getHomeTagList,
    getLotteryPageData,
    oneCategoryPageIndex,
  ]);
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
          overflow: 'scroll',
        }}
        horizontal
        showsHorizontalScrollIndicator={false}>
        {tabsList.map(item => {
          if (item.isLogin && login) {
            return (
              <NativeTouchableOpacity
                onPress={() => onPressItem(item?.value)}
                key={item?.value}
                style={[
                  theme.flex.flex1,
                  theme.flex.center,
                  // {
                  //   paddingLeft: 5,
                  //   paddingRight: 5,
                  // },
                  oneCategoryPageIndex === item?.value
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
                  {item?.title}
                </Text>
              </NativeTouchableOpacity>
            );
          } else if (!item.isLogin) {
            return (
              <NativeTouchableOpacity
                onPress={() => onPressItem(item?.value)}
                key={item?.value}
                style={[
                  theme.flex.flex1,
                  theme.flex.center,
                  // {
                  //   paddingLeft: 5,
                  //   paddingRight: 5,
                  // },
                  oneCategoryPageIndex === item?.value
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
                  {item?.title}
                </Text>
              </NativeTouchableOpacity>
            );
          }
        })}
      </ScrollView>
    </Animated.View>
  );
};

export default HomeCategoryPageTabs;
