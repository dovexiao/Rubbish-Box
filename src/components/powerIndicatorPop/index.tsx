import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Image, Text, View } from 'react-native';
import PopCenter, { type PopCenterRef } from '@/components/PopCenter';
import Flex from '@/components/Flex';
import Popup from '../Popup';
import { px, fontSize } from '@/utils/ui';

export type PowerIndicatorPopRef = PopCenterRef;

const titleList = [
  '手动打开地锁摆臂（建议角度：90°≤摆臂角度≤120°）',
  '钥匙解锁后打开锁盖',
  '按照下图连接电池电源线，地锁发出“滴滴、滴滴、滴滴”提示音即通电成功',
  '等待5-10秒，地锁发出短促“滴哩哩”提示音即为4G联网成功，若未听到该提示音请重新尝试电源线连接（步骤3）（请务必确认入网成功，否则无法绑定地锁）',
  '钥匙关锁后关闭锁盖',
  '手动将摆臂归位（摆臂角度：0°）',
];

const PowerIndicatorPop = forwardRef<PowerIndicatorPopRef>(
  function PowerIndicatorPop(_props, ref) {
    const [visible, setVisible] = useState(false);

    useImperativeHandle(ref, () => ({
      open: () => setVisible(true),
      close: () => setVisible(false),
    }));

    return (
      <Popup
        visible={visible}
        onClose={() => setVisible(false)}
        title="通电指南"
        maskClosable
        showClose
      >
        <View style={{ marginTop: px(10), paddingHorizontal: px(24) }}>
          <Flex direction="column">
            <Text
              style={{
                fontSize: fontSize(12),
                fontWeight: 'bold',
                color: '#333333',
                lineHeight: px(20),
              }}
            >
              操作方法
            </Text>
            <View style={{ marginBottom: px(16) }}>
              {titleList.map((item, index) => (
                <Text
                  key={index}
                  style={{
                    fontSize: fontSize(12),
                    color: '#333333',
                    lineHeight: px(17),
                  }}
                >
                  {index + 1}. {item}
                </Text>
              ))}
            </View>
            <Flex
              direction="column"
              justify="center"
              align="center"
              style={{ marginTop: px(16) }}
            >
              <Image
                source={{
                  uri: 'https://g.18qjz.cn/img/boklock/power_Indicator.png',
                }}
                style={{
                  width: px(327),
                  aspectRatio: px(327) / px(132),
                }}
                resizeMode="contain"
              />
            </Flex>
          </Flex>
        </View>
      </Popup>
    );
  },
);

export default PowerIndicatorPop;
