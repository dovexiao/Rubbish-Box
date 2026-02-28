import { Toast } from '@ant-design/react-native';
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useAppNavigation } from '@/hooks/useAppNavigation';
interface NoDevicesProps {
  unreadCount?: number;
  hasDevice?: boolean;
}

const NoDevices: React.FC<NoDevicesProps> = ({ hasDevice = false }) => {
  const navigation = useAppNavigation();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>欢迎使用　泊刻地锁</Text>
      {hasDevice ? (
        <View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              Toast.show({
                content: '跳转组合设备',
              });
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
    fontSize: 20,
    fontWeight: '500',
    marginTop: 102,
  },
  contentBox: {
    alignItems: 'center',
  },
  addImage: {
    width: 120,
    height: 120,
    marginTop: 24,
    marginBottom: 12,
  },
  combineBtn: {
    paddingVertical: 13,
    paddingHorizontal: 46,
    backgroundColor: '#333',
    borderRadius: 12,
    marginTop: 60,
    marginBottom: 48,
  },
  combineBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '400',
  },
  tips: {
    color: '#999',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
  },
});

export default NoDevices;
