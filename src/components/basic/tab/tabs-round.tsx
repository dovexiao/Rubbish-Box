import {View, StyleProp, ViewStyle, StyleSheet} from 'react-native';
import Animated from 'react-native-reanimated';
import React, {useMemo} from 'react';
import theme from '@/style';
import {NativeTouchableOpacity} from '../touchable-opacity';
import Text from '../text';

export interface TabsRoundOptionItem {
  // 用于展示的内容，可进行自定义
  label: string | React.ReactNode | ((active: boolean) => React.ReactNode);
  // 实际结果
  value: string | number;
}

export interface TabsProps {
  // 标签页配置
  tabOptions: TabsRoundOptionItem[];
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  value?: string | number;
  onChange?: (value: string | number) => void;
}

const ParentComponent = ({
  children,
  scroll,
}: {
  children: React.ReactNode;
  scroll: boolean;
}) => {
  return scroll ? (
    <Animated.ScrollView
      contentContainerStyle={[theme.flex.centerByCol]}
      horizontal
      showsHorizontalScrollIndicator={false}>
      {children}
    </Animated.ScrollView>
  ) : (
    <View
      style={[
        theme.flex.row,
        theme.flex.centerByCol,
        theme.flex.between,
        theme.padding.lrl,
        theme.background.black50,
        theme.borderRadius.s,
        tabsStyle.container,
      ]}>
      {children}
    </View>
  );
};

const TabsRoundScroll: React.FC<TabsProps> = ({
  tabOptions,
  style,
  scroll = false,
  value,
  onChange,
}) => {
  const memoIndex = useMemo(() => {
    return Math.max(
      tabOptions.findIndex(item => item.value === value),
      0,
    );
  }, [tabOptions, value]);

  const handleChangeTab = (_tabIndex: number) => {
    onChange?.(tabOptions[_tabIndex].value);
  };

  return (
    <View style={[tabsStyle.container, theme.borderRadius.s, style]}>
      <ParentComponent scroll={scroll}>
        {tabOptions.map((item, index) => (
          <NativeTouchableOpacity
            onPress={() => handleChangeTab(index)}
            key={item.value}
            style={[
              theme.flex.center,
              index === memoIndex
                ? // eslint-disable-next-line react-native/no-inline-styles
                  {
                    paddingHorizontal: 8,
                    ...theme.borderRadius.s,
                    backgroundColor: theme.basicColor.newBgInOne,
                    height: 34,
                  }
                : // eslint-disable-next-line react-native/no-inline-styles
                  {
                    paddingHorizontal: 8,
                    height: 34,
                  },
            ]}>
            {!!item.label &&
              (typeof item.label === 'string' ? (
                <Text
                  color={
                    index === memoIndex
                      ? theme.fontColor.white
                      : theme.fontColor.primaryMain
                  }
                  size="medium"
                  blod={index === memoIndex}>
                  {item.label}
                </Text>
              ) : typeof item.label === 'function' ? (
                item.label(memoIndex === index)
              ) : (
                item.label
              ))}
          </NativeTouchableOpacity>
        ))}
      </ParentComponent>
    </View>
  );
};

const tabsStyle = StyleSheet.create({
  container: {
    height: 42,
  },
});

export default TabsRoundScroll;
