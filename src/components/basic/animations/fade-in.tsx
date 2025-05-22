import theme from '@/style';
import {useFocusEffect} from '@react-navigation/native';
import React from 'react';
import {Animated, ViewProps} from 'react-native';

const FadeInView = (props: ViewProps) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current; // Initial value for opacity: 0
  const {children, style, ...otherProps} = props;
  useFocusEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    return () => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    };
  });

  return (
    <Animated.View
      {...otherProps}
      style={[
        theme.fill.fill,
        theme.flex.col,
        {
          opacity: fadeAnim,
        },
        style,
      ]}>
      {children}
    </Animated.View>
  );
};
export default FadeInView;
