import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import Flex from '@/components/Flex';
import Icon from '@/iconfont';
import { DeviceItemProps } from './typing';
import { styles } from './style';

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
            {data.imageUrl && data.imageUrl !== 'null' ? (
              <Image
                source={{ uri: data.imageUrl }}
                style={{ width: 48, height: 28 }}
                resizeMode="contain"
              />
            ) : (
              <View
                style={{
                  width: 48,
                  height: 28,
                  borderRadius: 4,
                  backgroundColor: '#E6E8EB',
                }}
              />
            )}
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
