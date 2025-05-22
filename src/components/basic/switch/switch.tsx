import React from 'react';
import {StyleProp, StyleSheet, ViewStyle} from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  SharedValue,
} from 'react-native-reanimated';
import {NativeTouchableOpacity} from '../touchable-opacity';
import theme from '@style';

const Switch = ({
  value,
  onPress,
  style,
  duration = 400,
  trackColors = {
    on: theme.basicColor.primary15,
    off: theme.basicColor.primary60,
  },
}: {
  value: SharedValue<boolean>;
  onPress: () => void;
  style: StyleProp<ViewStyle>;
  duration?: number;
  trackColors?: {
    on: string;
    off: string;
  };
}) => {
  const height = useSharedValue(0);
  const width = useSharedValue(0);

  const trackAnimatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      Number(value.value),
      [0, 1],
      [trackColors?.off, trackColors?.on],
    );
    const colorValue = withTiming(color, {duration});

    return {
      backgroundColor: colorValue,
    };
  }, [value]);

  const thumbAnimatedStyle = useAnimatedStyle(() => {
    const moveValue = interpolate(
      Number(value.value),
      [0, 1],
      [0, width.value - height.value],
    );
    const translateValue = withTiming(moveValue, {duration});

    return {
      transform: [{translateX: translateValue}],
    };
  }, [value]);

  return (
    <NativeTouchableOpacity onPress={onPress}>
      <Animated.View
        onLayout={e => {
          height.value = e.nativeEvent.layout.height;
          width.value = e.nativeEvent.layout.width;
        }}
        style={[switchStyles.track, style, trackAnimatedStyle]}>
        <Animated.View style={[switchStyles.thumb, thumbAnimatedStyle]} />
      </Animated.View>
    </NativeTouchableOpacity>
  );
};

export default Switch;

const switchStyles = StyleSheet.create({
  track: {
    alignItems: 'flex-start',
    padding: 4,
    borderRadius: 20,
  },
  thumb: {
    height: '100%',
    aspectRatio: 1,
    backgroundColor: 'white',
    borderRadius: 20,
  },
});
