import React, {useState, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from '@rneui/themed';

export interface CountDownTimerProps {
  /** 初始时间 - 单位: 秒 */
  initialTime: number;
}

const CountDownTimer = ({initialTime}: CountDownTimerProps) => {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(true); // 控制倒计时是否在运行

  useEffect(() => {
    if (time === 0) return; // 如果时间为 0，停止倒计时

    if (isRunning) {
      const timer = setInterval(() => {
        setTime(prevTime => prevTime - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [time, isRunning]);

  // 计算时分秒
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${padZero(hours)}:${padZero(minutes)}:${padZero(secs)}`;
  };

  // 补零函数，确保时间是两位数
  const padZero = (num: number) => num.toString().padStart(2, '0');

  return (
    <View style={styles.container}>
      <View style={styles.clockContainer}>
        <Text h1 style={styles.timerText}>
          {formatTime(time)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#f4f4f4', // 背景颜色为浅灰色
  },
  clockContainer: {
    backgroundColor: 'black', // 黑色背景
    padding: 20,
    borderRadius: 10, // 圆角
    margin: 20,
    shadowColor: '#000', // 添加阴影效果
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5, // 安卓端的阴影效果
  },
  timerText: {
    color: 'white', // 文字颜色为白色
    fontWeight: 'bold', // 字体加粗
    letterSpacing: 2, // 字母间距
  },
});

export default CountDownTimer;
