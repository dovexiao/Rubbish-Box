import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Flex from '../Flex';

interface NoDevicesProps {
  unreadCount?: number;
  hasDevice?: boolean;
}

const NoDevices: React.FC<NoDevicesProps> = ({
  unreadCount = 0,
  hasDevice = false,
}) => {
  return (
    <View style={styles.container}>
      <Flex align="center" justify="center" style={styles.header}>
        <Text style={styles.headerTitle}>暂无设备</Text>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{unreadCount}</Text>
          </View>
        )}
      </Flex>
      <View style={styles.contentBox}>
        <Text style={styles.tips}>请前往添加或绑定设备</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ff4d4f',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contentBox: {
    marginTop: 24,
    alignItems: 'center',
  },
  tips: {
    color: '#999',
    fontSize: 16,
  },
});

export default NoDevices;
