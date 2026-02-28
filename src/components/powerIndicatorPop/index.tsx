import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Image, Text, View } from 'react-native';
import PopCenter, { type PopCenterRef } from '@/components/PopCenter';
import Flex from '@/components/Flex';

export type PowerIndicatorPopRef = PopCenterRef;

const PowerIndicatorPop = forwardRef<PowerIndicatorPopRef>(
  function PowerIndicatorPop(_props, ref) {
    const popRef = useRef<PopCenterRef>(null);

    useImperativeHandle(ref, () => ({
      open: () => popRef.current?.open(),
      close: () => popRef.current?.close(),
    }));

    return (
      <PopCenter
        ref={popRef}
        title="通电指南"
        width={311}
        height={360}
        maskClosable
        confirmText="知道了"
        showCancel={false}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
          <Flex direction="column" align="center">
            <Image
              source={{
                uri: 'https://g.18qjz.cn/img/boklock/power_indicator.png',
              }}
              style={{ width: 220, height: 180, marginBottom: 12 }}
              resizeMode="contain"
            />
            <Text style={{ fontSize: 14, color: '#333333', lineHeight: 20 }}>
              请确认地锁已通电后再进行蓝牙配对与连接
            </Text>
          </Flex>
        </View>
      </PopCenter>
    );
  },
);

export default PowerIndicatorPop;

