import {StyleSheet, View, Platform} from 'react-native';
import React, {useEffect, useRef, useState, useMemo} from 'react';
import Text from '@basicComponents/text';
import {useScreenSize} from '@/common-pages/hooks/size.hooks';
import theme from '@/style';

interface CountDownProps {
  /** 倒计时，单位：秒 */
  remain: number;
}

const CountDown: React.FC<CountDownProps> = ({remain}) => {
  const remainRef = useRef(remain);
  const {screenWidth} = useScreenSize();
  const [remainTime, setRemainTime] = useState(remain);
  const remainValue = useMemo(() => {
    const hour = Math.floor(remainTime / 3600);
    const minutes = Math.floor(remainTime / 60) % 60;
    const seconds = remainTime % 60;
    return {
      hour: (hour + '').padStart(2, '0'),
      minutes: (minutes + '').padStart(2, '0'),
      seconds: (seconds + '').padStart(2, '0'),
    };
  }, [remainTime]);
  useEffect(() => {
    const timer = setInterval(() => {
      if (remainRef.current > 1) {
        setTimeout(() => {
          remainRef.current--;
          setRemainTime(remainRef.current);
        }, 1000);
      } else {
        clearInterval(timer);
      }
    }, 1000);
    return () => {
      timer && clearInterval(timer);
    };
  }, []);
  useEffect(() => {
    setRemainTime(remain);
    remainRef.current = remain;
  }, [remain]);
  return (
    <View style={[theme.flex.row, theme.flex.centerByCol]}>
      <View
        style={[
          theme.flex.center,
          styles.blackSquare,
          {width: screenWidth * 0.056, height: screenWidth * 0.056},
        ]}>
        <Text
          fontSize={screenWidth * 0.037}
          blod
          style={[theme.font.white, styles.textSpe]}>
          {remainValue.hour}
        </Text>
      </View>
      <Text
        fontSize={screenWidth * 0.037}
        blod
        style={styles.marginHorizonalXXXS}>
        :
      </Text>
      <View
        style={[
          theme.flex.center,
          styles.blackSquare,
          {width: screenWidth * 0.056, height: screenWidth * 0.056},
        ]}>
        <Text
          fontSize={screenWidth * 0.037}
          blod
          style={[theme.font.white, styles.textSpe]}>
          {remainValue.minutes}
        </Text>
      </View>
      <Text
        fontSize={screenWidth * 0.037}
        blod
        style={styles.marginHorizonalXXXS}>
        :
      </Text>
      <View
        style={[
          theme.flex.center,
          styles.blackSquare,
          {width: screenWidth * 0.056, height: screenWidth * 0.056},
        ]}>
        <Text
          fontSize={screenWidth * 0.035}
          blod
          style={[theme.font.white, styles.textSpe]}>
          {remainValue.seconds}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  blackSquare: {
    backgroundColor: '#000000',
    borderRadius: 2.5,
  },
  textSpe: {
    position: 'relative',
    top: Platform.OS === 'android' ? -2 : 0,
  },
  marginHorizonalXXXS: {
    color: '#000000',
    marginHorizontal: 3,
    paddingBottom: Platform.OS === 'android' ? 2 : 0,
  },
});

export default CountDown;
