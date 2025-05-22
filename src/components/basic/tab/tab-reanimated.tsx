import Text from '@/components/basic/text';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import theme from '@/style';
import React, {memo} from 'react';
import Animated from 'react-native-reanimated';

import {StyleProp, View, ViewStyle} from 'react-native';

interface TabReanimatedProps {
  containerStyle?: StyleProp<ViewStyle>;
  index: number;
  tabOptions: {[key: string]: any}[];
  onPressItem: (index: number) => void;
}

const TabReanimated = (props: TabReanimatedProps) => {
  const tabWidths = React.useRef(
    new Array(props?.tabOptions?.length).fill(0),
  ).current;
  const tabOffsets = React.useRef(
    new Array(props?.tabOptions?.length).fill(0),
  ).current;

  // Animated values
  // const derivedTranslateX = useDerivedValue(() => {
  //   return withTiming(tabOffsets[props.index] + tabWidths[props.index] / 2 - 6);
  // }, [tabOffsets, tabWidths, props.index]);

  // const animatedUnderlineStyle = useAnimatedStyle(
  //   () => ({
  //     transform: [{translateX: derivedTranslateX.value || 0}],
  //   }),
  //   [derivedTranslateX],
  // );

  const onPressItem = (index: number) => {
    props.onPressItem(index);
  };

  return (
    <View
      style={[theme.borderRadius.m, theme.position.rel, props?.containerStyle]}>
      <Animated.ScrollView
        style={[
          // eslint-disable-next-line react-native/no-inline-styles
          {height: 36},
        ]}
        // eslint-disable-next-line react-native/no-inline-styles
        contentContainerStyle={{
          alignItems: 'center',
        }}
        horizontal
        showsHorizontalScrollIndicator={false}>
        {props?.tabOptions.map((item, index) => (
          <NativeTouchableOpacity
            onPress={() => onPressItem(index)}
            key={`${item?.id}${index}`}
            onLayout={event => {
              tabWidths[index] = event.nativeEvent.layout.width;
              tabOffsets[index] = event.nativeEvent.layout.x;
            }}
            style={[theme.position.rel, theme.flex.center, {height: 36}]}>
            <View
              style={[
                theme.flex.center,
                theme.padding.lrl,
                theme.borderRadius.m,
                props?.index === index
                  ? {
                      ...theme.background.primary,
                      height: 36,
                    }
                  : {},
              ]}>
              <Text
                size="medium"
                blod
                numberOfLines={1}
                color={theme.fontColor.white}>
                {item?.title}
              </Text>
            </View>
          </NativeTouchableOpacity>
        ))}
      </Animated.ScrollView>
      {/* <Animated.View
        style={[
          // eslint-disable-next-line react-native/no-inline-styles
          {
            position: 'absolute',
            bottom: 0,
            height: 4,
            width: 12,
          },
          theme.background.primary,
          animatedUnderlineStyle,
        ]}
      /> */}
    </View>
  );
};

export default memo(TabReanimated);
