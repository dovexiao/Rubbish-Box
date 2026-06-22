import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { fontSize, px } from '@/utils/ui';
interface NoDevicesProps {
  unreadCount?: number;
  hasDevice?: boolean;
}

const NoDevices: React.FC<NoDevicesProps> = ({ hasDevice }) => {
  const navigation = useAppNavigation();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>欢迎使用　泊刻地锁</Text>
      {hasDevice ? (
        <View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              // navigation.navigate('CombineDevice');
              navigation.navigate('NetWorkMiddle' as any);
            }}
            style={styles.combineBtn}
          >
            <Text style={styles.combineBtnText}>设备组合</Text>
          </TouchableOpacity>
          <Text style={styles.tips}>来组合你的地锁吧！</Text>
        </View>
      ) : (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            navigation.navigate('BindDevice');
          }}
          style={styles.contentBox}
        >
          <Image
            style={styles.addImage}
            source={{
              uri: 'https://g.18qjz.cn/img/boklock/device_add.png',
            }}
          />
          <Text style={styles.tips}>来添加你的第一台地锁吧！</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7fa',
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize(20),
    fontWeight: '500',
    marginTop: px(102),
  },
  contentBox: {
    alignItems: 'center',
  },
  addImage: {
    width: px(120),
    height: px(120),
    marginTop: px(24),
    marginBottom: px(12),
    aspectRatio: 1,
  },
  combineBtn: {
    paddingVertical: px(13),
    paddingHorizontal: px(46),
    backgroundColor: '#333',
    borderRadius: px(12),
    marginTop: px(60),
    marginBottom: px(48),
  },
  combineBtnText: {
    color: '#fff',
    fontSize: fontSize(16),
    fontWeight: '400',
  },
  tips: {
    color: '#999',
    fontSize: fontSize(16),
    fontWeight: '400',
    textAlign: 'center',
  },
});

export default NoDevices;
