/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useRef} from 'react';
import {Animated, Easing, StyleSheet} from 'react-native';

const BreatheImage = () => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.15,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.Image
      source={require('@/assets/gif/daillybonus.gif')}
      style={[styles.icon, {transform: [{translateX: 5}, {scale}]}]}
    />
  );
};

const styles = StyleSheet.create({
  icon: {
    width: 48,
    height: 16,
    position: 'absolute',
    top: -5,
    left: '50%',
  },
});

export default BreatheImage;
