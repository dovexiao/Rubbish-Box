import AppIcon from '@/components/AppIcon';
import React from 'react';
import { View, Text, Image } from 'react-native';
import Flex from '@/components/Flex';
import { INVITE_USE_STATUS } from '@/constants';
import { styles } from './indexStyle';
import { px } from '@/utils/ui';

interface DeviceItemProps {
  data: any;
  active?: boolean;
  onSelect: () => void;
  hasMargin: boolean;
  hasLine: boolean;
}

export const DeviceItem: React.FC<DeviceItemProps> = ({
  data,
  active = true,
  onSelect,
  hasMargin,
  hasLine,
}) => {
  return (
    <Flex
      style={[styles.deviceItem, hasMargin ? styles.mt6 : {}]}
      direction={'column'}
      align={'center'}
      isTouchView
      onPress={onSelect}
    >
      <Flex
        style={styles.deviceItemBox}
        direction={'row'}
        justify={'between'}
        align={'center'}
      >
        <Flex style={{ flex: 1 }} direction={'column'}>
          <Flex>
            <Text style={styles.deviceNameText}>{data?.lockName ?? ''}</Text>
            <Flex
              style={styles.tag}
              direction={'row'}
              justify={'center'}
              align={'center'}
            >
              <Text style={styles.tagText}>
                {INVITE_USE_STATUS[
                  data?.useStatus as keyof typeof INVITE_USE_STATUS
                ] ?? ''}
              </Text>
            </Flex>
          </Flex>
          <Flex style={[{ width: '100%' }, styles.mt18]}>
            {data?.address ? (
              <Flex direction="row" style={{ flex: 1 }} align={'center'}>
                <AppIcon
                  name={'location'}
                  size={px(24)}
                  color="#cccccc"
                ></AppIcon>
                <Text
                  style={[styles.addressText, { flexShrink: 1 }]}
                  numberOfLines={1}
                >
                  {data?.address ?? ''}
                </Text>
              </Flex>
            ) : null}
          </Flex>
        </Flex>
        <Flex
          style={styles.deviceType}
          direction={'column'}
          align={'center'}
          justify={'between'}
        >
          <Text style={styles.deviceTypeText}>
            {data?.groupCount === 1 ? '单个设备' : '组合设备'}
          </Text>
          <Flex align={'end'}>
            <Image
              source={{ uri: data?.imageUrl ?? '' }}
              style={{ width: px(24), height: px(24) }}
            />
            {data?.groupCount !== 1 && (
              <Flex align={'center'}>
                <Text style={styles.deviceUnitText}>x</Text>
                <Text style={styles.deviceCountText}>
                  {data?.groupCount ?? ''}
                </Text>
              </Flex>
            )}
          </Flex>
        </Flex>
        <Image
          style={{ width: px(16), height: px(16), marginLeft: px(8) }}
          source={{
            uri: `https://g.18qjz.cn/img/boklock/${
              active ? 'radio_checked' : 'radio_default'
            }.png`,
          }}
        />
      </Flex>
      {hasLine ? <View style={styles.deviceItemLine} /> : null}
    </Flex>
  );
};
