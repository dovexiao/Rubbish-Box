import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Flex from '@/components/Flex';
import Icon from '@/iconfont';
import { DeviceItemDTO } from './typing';

interface DeviceItemProps {
  data: DeviceItemDTO;
  active?: boolean;
  onSelect: () => void;
  onChangeName?: () => void;
}

export const DeviceItem: React.FC<DeviceItemProps> = ({
  data,
  active = true,
  onSelect,
  onChangeName,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onSelect}
      style={[
        styles.deviceItem,
        styles.defaultBgColor,
        active && styles.deviceItemActive,
        styles.mt24,
      ]}
    >
      <Flex justify="between" align="center" style={{ width: '100%' }}>
        <Flex direction="column" justify="center" align="start">
          <Flex direction="row" align="center">
            <Text style={styles.deviceNameText} numberOfLines={1}>
              {data.lockName}
            </Text>
            <View style={styles.tagContainer}>
              <Text style={styles.tag}>{data.roleName}</Text>
            </View>
          </Flex>
          {data.role === 1 && (
            <TouchableOpacity
              style={{
                marginTop: 10,
                flexDirection: 'row',
                alignItems: 'center',
              }}
              onPress={() => onChangeName?.()}
            >
              <Text style={styles.editText}>编辑</Text>
              <Icon name="pen16" color="#999999" size={16} />
            </TouchableOpacity>
          )}
        </Flex>

        <Flex direction="column" align="center">
          <Text style={styles.deviceTypeText}>
            {data.groupCount === 1 ? '单个设备' : '组合设备'}
          </Text>
          <Flex style={{ marginTop: 14 }} align="center">
            <Image
              source={{ uri: data.imageUrl }}
              style={{ width: 48, height: 28 }}
              resizeMode="contain"
            />
            {data.groupCount !== 1 && (
              <>
                <Icon
                  name="multiplication"
                  color="#333333"
                  size={14}
                  style={{ marginHorizontal: 2 }}
                />
                <Text style={styles.deviceCountText}>{data.groupCount}</Text>
              </>
            )}
          </Flex>
        </Flex>
      </Flex>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  deviceItem: {
    padding: 12,
    borderRadius: 8,
    width: '100%',
  },
  defaultBgColor: {
    backgroundColor: '#F5F7FA',
  },
  deviceItemActive: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
  mt24: {
    marginTop: 12,
  },
  deviceNameText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    maxWidth: 260,
  },
  tagContainer: {
    marginLeft: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
    backgroundColor: '#E6E8EB',
    borderRadius: 4,
  },
  tag: {
    fontSize: 10,
    color: '#666',
  },
  editText: {
    fontSize: 12,
    color: '#999',
    marginRight: 4,
  },
  deviceTypeText: {
    fontSize: 12,
    color: '#999',
  },
  deviceCountText: {
    fontSize: 24,
    color: '#333',
    fontWeight: 'bold',
  },
});
