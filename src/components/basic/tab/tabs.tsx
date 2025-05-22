import {
  View,
  StyleProp,
  ViewStyle,
  LayoutChangeEvent,
  StyleSheet,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import React, {useEffect, useState, useReducer, Reducer} from 'react';
import theme from '@/style';
import {NativeTouchableOpacity} from '../touchable-opacity';
import Text from '../text';
import LinearGradient from '../linear-gradient';
import globalStore from '@/services/global.state';
import {SafeAny} from '@/types';

export interface TabsOptionItem {
  // 用于展示的内容，可进行自定义
  label: string | React.ReactNode | ((active: boolean) => React.ReactNode);
  // 实际结果
  value: string;
}

export type LayoutType = 'left' | 'flex' | 'between';

export interface TabsProps {
  // 标签页配置
  tabOptions: TabsOptionItem[];
  style?: StyleProp<ViewStyle>;
  // 内部标签摆放方式 left 从左到右，直接使用自带宽度布局 flex 每一个宽度都一样
  layout?: LayoutType;
  // 如果内部内容宽度超出要展示mask，该mask的宽度，默认80
  maskWidth?: number;
  // 底侧标记宽度
  indicatorWidth?: number;
  // 底侧标记高度
  indicatorHeight?: number;
  indicatorBottom?: number;

  // 外侧左右padding
  outPadding?: number;
  // 两个tab item内部间距
  innerGap?: number;

  labelContainerStyle?: StyleProp<ViewStyle>;
  value?: string;
  onChange?: (value: string) => void;
}

/**
 * 标签页
 */
const Tabs: React.FC<TabsProps> = ({
  maskWidth = 80,
  tabOptions,
  indicatorWidth = 17,
  indicatorHeight = 4,
  indicatorBottom = theme.paddingSize.s,
  layout = 'left',
  style,
  value,
  labelContainerStyle,
  outPadding = theme.paddingSize.l,
  innerGap = theme.paddingSize.xxl,
  onChange,
}) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(globalStore.screenWidth);
  const [innerWidth, setInnerWidth] = useState(0);
  const [tabsWidth, setTabsWidth] = useReducer<
    Reducer<number[], {index?: number; value: number | number[]}>
  >((state, action) => {
    if (action.index == null) {
      if (typeof action.value !== 'number') {
        return action.value;
      }
      return state;
    }
    if (typeof action.value === 'number') {
      const _state = [...state];
      _state[action.index] = action.value;
      return _state;
    }
    return state;
  }, []);
  const aref = useAnimatedRef<Animated.ScrollView>();
  const scrollLeft = useSharedValue(0);
  const indicatorLeft = useSharedValue(theme.paddingSize.l);
  const tabsStyle = StyleSheet.create({
    container: {
      height: 48,
    },
    maskView: {
      width: maskWidth,
    },
  });
  const indicatorStyle = useAnimatedStyle(
    () => ({
      width: indicatorWidth,
      height: indicatorHeight,
      bottom: indicatorBottom,
      left: withTiming(indicatorLeft.value),
    }),
    [indicatorLeft, indicatorWidth, indicatorHeight, indicatorBottom],
  );
  const leftMaskStyle = useAnimatedStyle(() => {
    const transitionWidth = Math.min(innerWidth - containerWidth, maskWidth);
    return {
      width: maskWidth,
      opacity:
        transitionWidth <= 0
          ? 0
          : scrollLeft.value > transitionWidth
          ? 1
          : interpolate(
              scrollLeft.value,
              [0, transitionWidth],
              [0, 1],
              Extrapolation.CLAMP,
            ),
      left: 0,
      zIndex: 1,
    };
  }, [scrollLeft, maskWidth, containerWidth, innerWidth]);

  const rightMaskStyle = useAnimatedStyle(() => {
    const transitionWidth = Math.min(innerWidth - containerWidth, maskWidth);

    return {
      width: maskWidth,
      opacity:
        transitionWidth <= 0
          ? 0
          : innerWidth - containerWidth - scrollLeft.value > transitionWidth
          ? 1
          : interpolate(
              scrollLeft.value,
              [
                innerWidth - containerWidth - transitionWidth,
                innerWidth - containerWidth,
              ],
              [1, 0],
              Extrapolation.CLAMP,
            ),
      right: 0,
      zIndex: 1,
    };
  }, [scrollLeft, maskWidth, containerWidth, innerWidth]);
  useEffect(() => {
    if (layout === 'left') {
      const calcOffset =
        tabsWidth.slice(0, tabIndex).reduce((s, x) => s + x, 0) +
        innerGap * tabIndex +
        outPadding;
      indicatorLeft.value =
        calcOffset + (tabsWidth[tabIndex] - indicatorWidth) / 2;
      let scrollResult =
        calcOffset + tabsWidth[tabIndex] / 2 - containerWidth / 2;
      scrollResult = Math.max(scrollResult, 0);
      scrollTo(aref, scrollResult, 0, true);
    } else if (layout === 'flex') {
      const calcOffset = tabsWidth
        .slice(0, tabIndex)
        .reduce((s, x) => s + x, 0);
      indicatorLeft.value = calcOffset + tabsWidth[tabIndex] / 2;
    } else if (layout === 'between') {
      const middleWidth =
        (containerWidth -
          tabsWidth.reduce((s, x) => s + x, 0) -
          outPadding * 2) /
        (tabsWidth.length - 1);
      const calcOffset = tabsWidth
        .slice(0, tabIndex)
        .reduce((s, x) => s + x + middleWidth, 0);
      indicatorLeft.value = calcOffset + tabsWidth[tabIndex] / 2;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabIndex, tabsWidth, indicatorWidth, containerWidth, layout]);
  const handleContainerLayout: (event: LayoutChangeEvent) => void = e => {
    setContainerWidth(e.nativeEvent.layout.width);
  };
  const handleInnerLayout: (event: LayoutChangeEvent) => void = e => {
    setInnerWidth(e.nativeEvent.layout.width);
  };
  const handleChangeTab = (_tabIndex: number) => {
    setTabIndex(_tabIndex);
    onChange?.(tabOptions[_tabIndex].value);
  };
  const handleTabItemLayout = (e: LayoutChangeEvent, index: number) => {
    setTabsWidth({
      index,
      value: e.nativeEvent.layout.width,
    });
  };
  const handler = useAnimatedScrollHandler(e => {
    scrollLeft.value = e.contentOffset.x;
  });
  useEffect(() => {
    const index = tabOptions.findIndex(item => item.value === value);
    setTabIndex(Math.max(index, 0));
  }, [tabOptions, value]);
  useEffect(() => {
    setTabsWidth({
      value: Array(tabOptions.length)
        .fill(0)
        .map(() => 0),
    });
  }, [tabOptions.length]);
  return (
    <View
      onLayout={handleContainerLayout}
      style={[
        theme.flex.col,
        theme.position.rel,
        theme.borderRadius.s,
        tabsStyle.container,
        style,
      ]}>
      <Animated.ScrollView
        horizontal
        ref={aref as SafeAny}
        onScroll={handler}
        showsHorizontalScrollIndicator={false}>
        <View
          style={[
            theme.flex.row,
            {paddingHorizontal: outPadding},
            theme.position.rel,
            layout === 'flex' || layout === 'between'
              ? [{width: containerWidth}]
              : null,
            layout === 'between' ? theme.flex.between : null,
          ]}
          onLayout={handleInnerLayout}>
          {tabOptions.map((item, index) => (
            <NativeTouchableOpacity
              onPress={() => handleChangeTab(index)}
              onLayout={e => handleTabItemLayout(e, index)}
              key={item.value}
              style={[
                theme.flex.center,
                layout === 'left' && index !== 0
                  ? {marginLeft: innerGap}
                  : null,
                layout === 'flex' ? theme.flex.flex1 : null,
                labelContainerStyle,
              ]}>
              {!!item.label &&
                (typeof item.label === 'string' ? (
                  <Text
                    white
                    fontSize={theme.fontSize.m}
                    blod={index === tabIndex}>
                    {item.label}
                  </Text>
                ) : typeof item.label === 'function' ? (
                  item.label(tabIndex === index)
                ) : (
                  item.label
                ))}
            </NativeTouchableOpacity>
          ))}
          <Animated.View
            style={[
              indicatorStyle,
              theme.position.abs,
              theme.background.primary,
            ]}
          />
        </View>
      </Animated.ScrollView>
      <Animated.View
        style={[leftMaskStyle, theme.position.abs, theme.fill.fillH]}
        pointerEvents="none">
        <LinearGradient
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          colors={['#FFFFFFFF', '#FFFFFF00']}
          style={[theme.fill.fill]}
        />
      </Animated.View>
      <Animated.View
        style={[rightMaskStyle, theme.position.abs, theme.fill.fillH]}
        pointerEvents="none">
        <LinearGradient
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          colors={['#FFFFFF00', '#FFFFFFFF']}
          style={[theme.fill.fill]}
        />
      </Animated.View>
    </View>
  );
};

export default Tabs;
