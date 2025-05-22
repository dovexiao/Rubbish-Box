/* eslint-disable react-native/no-inline-styles */
import theme from '@style';
import {flex, position} from '@/components/style';

import React, {forwardRef, useImperativeHandle, useState} from 'react';
import {Modal, View} from 'react-native';

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
import BetsShardInvite from './bets-shard-invite';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import LinearGradient from '@basicComponents/linear-gradient';
import {topBg2} from './bets-shard.variable';
import LazyImage from '@/components/basic/image';
import {SafeAny} from '@/types';

const BetsShardModal = forwardRef((props: SafeAny, ref: any) => {
  const [modalVisible, setModalVisible] = useState(false);
  useImperativeHandle(ref, () => ({
    showModal: () => setModalVisible(true),
  }));
  return (
    <Modal
      visible={modalVisible}
      animationType="fade"
      transparent={true}
      style={[
        {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 22,
        },
      ]}>
      <View
        style={[
          {
            backgroundColor: theme.basicColor.primary10,
            borderRadius: 12,
            height: '100%',
          },
          flex.flex1,
          flex.center,
          flex.flex,
        ]}>
        <NativeTouchableOpacity
          style={[{width: '100%', height: '100%'}]}
          onPress={() => setModalVisible(false)}
        />

        <View
          style={[position.abs, {backgroundColor: '#fff', borderRadius: 12}]}>
          <LinearGradient
            style={[
              {
                width: '100%',
                height: 67,
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
              },
              position.abs,
            ]}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            colors={[theme.basicColor.primary30, theme.basicColor.primary60]}
          />
          <View style={[{margin: 8}]}>
            <BetsShardInvite
              code={false}
              downloadBtn={'Confirm'}
              topBgEle={
                <LazyImage
                  imageUrl={topBg2}
                  occupancy="#0000"
                  width={'100%'}
                  height={67}
                />
              }
              setModalVisible={() => {
                setModalVisible(false);
              }}
              userInviteCode={props?.userInviteCode}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
});
export default BetsShardModal;
