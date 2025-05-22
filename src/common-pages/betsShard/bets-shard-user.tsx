/* eslint-disable react-native/no-inline-styles */

import {View} from 'react-native';
import Text from '@basicComponents/text';
import {basicColor, flex, fontSize} from '@/components/style';
import {getVipRender} from '@/components/business/vip';
import React from 'react';
import LazyImage from '@/components/basic/image';
import {AxiosResponse} from 'axios';
import {SafeAny} from '@/types';
export interface userInfoObj extends AxiosResponse {
  level: 7;
  userAvatar: 'https://lottery-india.oss-ap-south-1.aliyuncs.com/manager/d0ba712abfc6401eb366b860796c5e82.png';
  userInviteCode: 'ZPZVOW';
  userName: 'because';
}
const BetsShardUser = ({userInfo}: SafeAny) => {
  const option = getVipRender(userInfo?.level ? userInfo?.level : 1);
  return (
    <View style={[flex.flex, flex.center, flex.row]}>
      <View
        style={[
          {
            width: 40,
            height: 40,
            overflow: 'hidden',
            borderRadius: 40,
            borderWidth: 1,
            borderColor: '#fff',
          },
        ]}>
        <LazyImage
          imageUrl={userInfo?.userAvatar ? userInfo?.userAvatar : ''}
          occupancy="#0000"
          width={40}
          height={40}
        />
      </View>

      <Text
        color={basicColor.white}
        fontSize={fontSize.m}
        blod
        fontFamily="fontInter"
        style={{
          marginLeft: 12,
          marginRight: 8,
        }}>
        {userInfo?.userName}
      </Text>
      {option.smallFn(20)}
    </View>
  );
};
export default BetsShardUser;
