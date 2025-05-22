/* eslint-disable react-native/no-inline-styles */
import {background, flex, fontColor, margin} from '@/components/style';
import React, {forwardRef, useImperativeHandle, useRef} from 'react';
import {View} from 'react-native';
import Text from '@basicComponents/text';

const tableLeft = {
  width: 130,
  height: 40,
  backgroundColor: '#D8E2E7',
  marginRight: 2,
};
export const tableLeftNew = {
  ...tableLeft,
  backgroundColor: '#F1F5F8',
};
import LinearGradient from '@basicComponents/linear-gradient';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
export const SuccessIcon = require('@components/assets/icons/success.webp');
import LazyImage from '@/components/basic/image';
import Drawer, {DrawerRef} from '@/components/basic/drawer/drawer';
import {SafeAny} from '@/types';

const boxRadius = {
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
};
const ModalContent = forwardRef((props: SafeAny, ref: any) => {
  const drawerRef = useRef<DrawerRef>(null);

  useImperativeHandle(ref, () => ({
    showModal: () => {
      drawerRef.current?.open();
    },
  }));
  return (
    <Drawer ref={drawerRef} mode="bottom" contentBackgroundColor="#0000">
      <View style={[background.white, boxRadius, {width: '100%', height: 449}]}>
        <View
          style={[flex.center, flex.flex, {height: 449, position: 'relative'}]}>
          <LazyImage
            imageUrl={SuccessIcon}
            occupancy="#0000"
            width={84}
            height={84}
          />
          <Text
            style={[{marginTop: 24}]}
            color={'#009B22'}
            fontSize={20}
            fontWeight={'bold'}>
            Registration Success
          </Text>
          <View style={[{width: 280, marginTop: 48}]}>
            <Text
              color={fontColor.second}
              fontSize={14}
              style={[{textAlign: 'center'}]}>
              Download the app
            </Text>
            <Text
              color={fontColor.second}
              fontSize={14}
              style={[{textAlign: 'center'}]}>
              and log in to receive gifts
            </Text>
          </View>
          <View
            style={[
              flex.center,
              {
                backgroundColor: '#DB0000',
                width: 311,
                height: 48,
                borderRadius: 30,
                overflow: 'hidden',
              },
              margin.topl,
            ]}>
            <LinearGradient
              style={[{width: '100%', height: 48}, flex.center]}
              start={{x: 0, y: 1}}
              end={{x: 0, y: 0}}
              colors={['#8700DA', '#7000FF']}>
              <NativeTouchableOpacity
                onPress={() => {
                  // 这里一定是web才有,所以不用做判断
                  const apkUrl =
                    'https://lottery-india.oss-accelerate.aliyuncs.com/dailylotto/dailylotto.apk';
                  location.href = apkUrl;
                  drawerRef.current?.close();
                  props?.setModalVisible();
                }}>
                <Text fontSize={16} color={'#fff'} fontWeight="bold">
                  Download
                </Text>
              </NativeTouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </View>
    </Drawer>
  );
});
export default ModalContent;
