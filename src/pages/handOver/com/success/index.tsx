import React, { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { reLaunch, setStorage } from '@/utils';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { styles } from './style';

export default function Success() {
  const navigation = useAppNavigation();
  const [backNum, setBackNum] = useState(3);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBackNum(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearTimeout(timer);
  }, [backNum]);

  useEffect(() => {
    if (backNum !== 0) return;
    void setStorage({ key: 'pageType', data: 'reload' });
    reLaunch('Index');
  }, [backNum, navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Image
          style={styles.icon}
          source={{ uri: 'https://g.18qjz.cn/img/boklock/success.png' }}
          resizeMode="contain"
        />
        <Text style={styles.title}>移交成功</Text>
      </View>
      <Text style={styles.text}>{`${backNum}s后返回首页`}</Text>
    </View>
  );
}
