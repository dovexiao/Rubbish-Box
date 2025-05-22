import theme from '@/style';
import {SafeAny} from '@/types';
import React from 'react';
import {View, StyleSheet, Animated} from 'react-native';

const DownloadProgress = (props: {rate: number | 0}) => {
  const {rate} = props;
  const timeRef = React.useRef<SafeAny>(null);
  const timeCurrent = React.useRef<number | 0>(0);
  const rateAnim = React.useRef(new Animated.Value(0)).current;
  const progressAnim = React.useRef(new Animated.Value(0)).current;
  const [shadowRate, setShadowRate] = React.useState<number>(0);
  React.useEffect(() => {
    compare();
    return () => {
      timeRef.current && clearInterval(timeRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  Animated.timing(progressAnim, {
    toValue: rateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    useNativeDriver: false,
  }).start();

  React.useEffect(() => {
    if (rate < shadowRate) {
      rateAnim.setValue(shadowRate);
    } else {
      rateAnim.setValue(rate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rate, shadowRate]);

  const compare = () => {
    timeRef.current = setInterval(() => {
      if (timeCurrent.current === 2) {
        if (rate < 0.8) {
          setShadowRate(0.8);
        }
      }
      if (timeCurrent.current === 3) {
        if (rate < 0.95) {
          setShadowRate(0.95);
        }
      }
      timeCurrent.current += 1;
    }, 1000);
  };

  return (
    <>
      {rate > 0 ? (
        <View style={styles.container}>
          <Animated.View
            style={[
              styles.inner,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 3,
    backgroundColor: theme.backgroundColor.palegrey,
  },
  inner: {
    height: '100%',
    backgroundColor: theme.backgroundColor.main,
    width: '100%',
  },
});

export default DownloadProgress;
