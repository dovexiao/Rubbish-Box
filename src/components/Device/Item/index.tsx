import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import Flex from '@/components/Flex';
import { DeviceItemProps } from './typing';
import { styles } from './style';
import AppIcon from '@/components/AppIcon';
import { px } from '@/utils/ui';

export const DeviceItem: React.FC<DeviceItemProps> = ({
  data,
  active = true,
  onSelect,
  onChangeName,
}) => {
  data.count = [null, undefined].includes(data.count as any)
    ? data.groupCount
    : data.count;
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
            <View style={styles.tagBox}>
              <View style={styles.tagContainer}>
                <Text style={styles.tag}>{data.roleName}</Text>
              </View>
              {!!data.isGateway && (
                <Flex style={[styles.tagContainer, styles.gatewayTagContainer]}>
                  <Text style={[styles.tag, styles.gatewayTag]}>433网关</Text>
                </Flex>
              )}
            </View>
          </Flex>
          {data.role === 1 && (
            <TouchableOpacity
              style={{
                marginTop: px(10),
                flexDirection: 'row',
                alignItems: 'center',
              }}
              onPress={event => {
                event.stopPropagation();
                onChangeName?.(event);
              }}
            >
              <Text style={styles.editText}>编辑</Text>
              <AppIcon name="pen16" color="#999999" size={px(16)} />
            </TouchableOpacity>
          )}
        </Flex>

        <Flex direction="column" align="center">
          <Text style={styles.deviceTypeText}>
            {data.count === 1 ? '单个设备' : '组合设备'}
          </Text>
          <Flex style={{ marginTop: px(14) }} align="center">
            {data.imageUrl && data.imageUrl !== 'null' ? (
              <Image
                source={{ uri: data.imageUrl }}
                style={{ width: px(48), height: px(28) }}
                resizeMode="contain"
              />
            ) : (
              <View
                style={{
                  width: px(48),
                  height: px(28),
                  borderRadius: px(4),
                  backgroundColor: '#E6E8EB',
                }}
              />
            )}
            {data.count !== 1 && (
              <>
                <AppIcon
                  name="multiplication"
                  color="#333333"
                  size={px(6)}
                  style={{ marginHorizontal: px(2) }}
                />
                <Text style={styles.deviceCountText}>{data.count}</Text>
              </>
            )}
          </Flex>
        </Flex>
      </Flex>
    </TouchableOpacity>
  );
};
