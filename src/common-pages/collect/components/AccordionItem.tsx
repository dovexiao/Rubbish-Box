import React from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface AccordionItemProps {
  isExpanded: SharedValue<boolean>;
  viewKey: string;
  style?: StyleProp<ViewStyle>;
  duration?: number;
  children: React.ReactNode;
}

const AccordionItem = ({
  isExpanded,
  viewKey,
  style,
  children,
  duration = 500,
}: AccordionItemProps) => {
  const height = useSharedValue(0);

  const derivedHeight = useDerivedValue(
    () =>
      withTiming(height.value * Number(isExpanded.value), {
        duration,
      }),
    [height, isExpanded],
  );
  const bodyStyle = useAnimatedStyle(
    () => ({
      height: derivedHeight.value,
    }),
    [derivedHeight],
  );

  return (
    <Animated.View
      key={`accordionItem_${viewKey}`}
      // eslint-disable-next-line react-native/no-inline-styles
      style={[{width: '100%', overflow: 'hidden'}, bodyStyle, style]}>
      <View
        onLayout={e => {
          height.value = e.nativeEvent.layout.height + 20;
        }}
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          width: '100%',
          position: 'absolute',
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 10,
          marginTop: 10,
        }}>
        {children}
      </View>
    </Animated.View>
  );
};

export default AccordionItem;
