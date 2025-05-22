import React, {useRef, useEffect, memo, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  Easing,
  // Platform,
} from 'react-native';
import globalStore from '@/services/global.state';
import LazyImage from '@basicComponents/image';
import {gutterLetter} from '@/utils';

interface NoticeBarProps {
  notices: string[];
}

const MessageList = ({notices}: NoticeBarProps) => {
  useRef<ScrollView>(null);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [lengths, setLengths] = useState<number>(0);
  const [lengthArr, setLengthArr] = useState<number[]>([]);
  useEffect(() => {
    const scrollAnimation = () => {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        animatedValue.setValue(0);
        scrollAnimation();
      });
    };

    scrollAnimation();
  }, [animatedValue]);

  useEffect(() => {
    let sum: number = globalStore.screenWidth - 40;
    // const c: number = Platform.OS === 'web' ? 10 : 7.5;
    if (notices && notices.length) {
      const lengthArray: number[] = [globalStore.screenWidth - 40];
      notices.map(item => {
        // const words = item.split(' ');
        // let itemLength = item.length * (words.length > 1 ? c : 12);
        let itemLength: number = gutterLetter(item);
        sum += itemLength;
        lengthArray.push(itemLength);
        return item;
      });
      setLengthArr(lengthArray);
    }
    setLengths(sum);
  }, [notices]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -lengths], // 假设每条消息宽度为屏幕宽
  });
  return (
    <View style={styles.container}>
      <View style={styles.iconView}>
        <LazyImage
          imageUrl={require('@/assets/icons/bell1.webp')}
          width={24}
          height={24}
          radius={12}
          occupancy="transparent"
        />
      </View>
      {lengths > 0 && lengthArr.length > 0 && (
        <View
          style={[
            styles.contentView,
            {
              width: globalStore.screenWidth - 40,
            },
          ]}>
          <Animated.View style={[{transform: [{translateX}]}]}>
            <View
              style={[
                styles.noticeContainer,
                {
                  width: lengths - globalStore.screenWidth + 40,
                  paddingLeft: lengthArr[0],
                },
              ]}>
              {notices.map((notice, index) => (
                <Text
                  numberOfLines={1}
                  key={index}
                  ellipsizeMode={'clip'}
                  style={[
                    styles.noticeText,
                    {
                      minWidth: lengthArr[index + 1],
                    },
                  ]}>
                  {notice}
                </Text>
              ))}
            </View>
          </Animated.View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  iconView: {
    position: 'absolute',
    left: 10,
  },
  container: {
    height: 40,
    overflow: 'hidden',
    backgroundColor: '#003941',
    justifyContent: 'center',
    position: 'relative',
  },
  contentView: {
    marginLeft: 40,
    overflow: 'hidden',
  },
  noticeContainer: {
    flexDirection: 'row',
  },
  noticeText: {
    paddingHorizontal: 10,
    color: '#FFB728FF',
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'monospace', // 使用等宽字体
  },
});

export default memo(MessageList);
