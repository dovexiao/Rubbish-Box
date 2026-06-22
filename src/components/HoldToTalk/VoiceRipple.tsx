import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { px } from '@/utils/ui';

const RING_CONFIG = [
  { size: px(24), maxScale: 2.4, delay: 0 },
  { size: px(40), maxScale: 1.8, delay: 400 },
  { size: px(56), maxScale: 1.5, delay: 800 },
] as const;

const VoiceRipple = () => {
  const pulseAnims = useRef(
    RING_CONFIG.map(() => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    const animations = pulseAnims.map((anim, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(RING_CONFIG[index].delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ),
    );

    animations.forEach(animation => animation.start());

    return () => {
      animations.forEach(animation => animation.stop());
    };
  }, [pulseAnims]);

  return (
    <View style={styles.container}>
      {RING_CONFIG.map((ring, index) => {
        const scale = pulseAnims[index].interpolate({
          inputRange: [0, 1],
          outputRange: [1, ring.maxScale],
        });
        const opacity = pulseAnims[index].interpolate({
          inputRange: [0, 0.2, 1],
          outputRange: [0.6, 0.45, 0],
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.ring,
              {
                width: ring.size,
                height: ring.size,
                borderRadius: ring.size / 2,
                opacity,
                transform: [{ scale }],
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: px(80),
    height: px(48),
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)',
  },
});

export default VoiceRipple;
