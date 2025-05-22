/* eslint-disable react-hooks/rules-of-hooks */
import {ComponentProps, useEffect, useRef} from 'react';
import {Platform, ScrollView} from 'react-native';

const MOMENTUM_SCROLL_END_THROTTLE_MILLISECONDS = 200;

export default function useWebScrollEvents<
  Props extends Partial<ComponentProps<typeof ScrollView>>,
>(props: Props): Props {
  if (Platform.OS === 'web') {
    const momentumScrollEndTimer = useRef<any>();

    useEffect(function cleanup() {
      return () => {
        clearTimeout(momentumScrollEndTimer.current);
      };
    }, []);

    return {
      ...props,
      onScroll(e) {
        props.onScroll?.(e);
        if (props.onMomentumScrollEnd) {
          clearTimeout(momentumScrollEndTimer.current);
          momentumScrollEndTimer.current = setTimeout(() => {
            props.onMomentumScrollEnd?.(e);
          }, MOMENTUM_SCROLL_END_THROTTLE_MILLISECONDS);
        }
        if (props.onMomentumScrollBegin) {
          clearTimeout(momentumScrollEndTimer.current);
          momentumScrollEndTimer.current = setTimeout(() => {
            props.onMomentumScrollBegin?.(e);
          }, MOMENTUM_SCROLL_END_THROTTLE_MILLISECONDS);
        }
      },
    };
  }
  return props;
}
