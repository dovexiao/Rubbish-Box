/* eslint-disable react-native/no-inline-styles */
import {
  LinearGradientBetsSharColor,
  shardImg,
  Subtract,
} from './bets-shard.variable';
import {View, ImageBackground} from 'react-native';
import globalStore from '@/services/global.state';
import Text from '@basicComponents/text';
import {
  basicColor,
  borderRadius,
  flex,
  fontColor,
  fontSize,
  margin,
  padding,
  position,
} from '@/components/style';
import React, {useEffect, useRef, useState} from 'react';
import LazyImage from '@/components/basic/image';

import {SafeAny} from '@/types';
import LinearGradient from '@basicComponents/linear-gradient';
import BetsShardModal from './bets-shard-modal';
import BetsShardUser, {userInfoObj} from './bets-shard-user';
import BetsShardInfo from './bets-shard-info';
import BetsShardInvite from './bets-shard-invite';
import {getUserInfo} from './bets-shard-service';
import theme from '@style';
const BetsShardHome = ({params, orderInfo}: SafeAny) => {
  const BetsShardModalRef: SafeAny = useRef(null);
  const [userInfo, setUserInfo] = useState<userInfoObj>();
  useEffect(() => {
    const {userId, packageId} = params;
    getUserInfo({userId, packageId}).then((res: SafeAny) => {
      setUserInfo(res);
    });
  }, [params]);
  return (
    <View>
      <ImageBackground
        style={[
          {
            width: globalStore.screenWidth,
            height: globalStore.screenHeight,
          },
          position.rel,
        ]}
        source={{uri: shardImg}}
      />
      <View style={[padding.xxl, position.abs, {top: 56, width: '100%'}]}>
        <LinearGradient
          style={[
            {width: '100%'},
            padding.tbxs,
            padding.lrxxl,
            {
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              borderBottomLeftRadius: 12,
              borderBottomRightRadius: 12,
            },
          ]}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
          colors={LinearGradientBetsSharColor}>
          <BetsShardUser params={params} userInfo={userInfo} />
          <View style={[flex.flex, flex.center, flex.row, margin.tops]}>
            <Text
              color={basicColor.white}
              fontSize={fontSize.l}
              blod
              fontFamily="fontInter">
              I'm luck today!
            </Text>
          </View>
          <View style={[flex.flex, flex.center, flex.row, margin.topxxs]}>
            <Text
              color={basicColor.dark}
              fontSize={fontSize.s}
              blod
              style={[margin.rightxxs]}
              fontFamily="fontInter">
              Won
            </Text>
            <Text
              color={
                orderInfo?.wonAmount > 0 ? basicColor.primary : fontColor.main
              }
              fontSize={fontSize.xl}
              blod
              fontFamily="fontDin">
              ₹{orderInfo?.wonAmount}
            </Text>
          </View>
        </LinearGradient>
        <BetsShardInfo
          orderInfo={orderInfo}
          result={
            <Text
              style={[margin.leftxxs]}
              color={
                orderInfo?.wonAmount > 0 ? basicColor.primary : fontColor.main
              }
              fontSize={fontSize.xl}
              blod
              fontFamily="fontDin">
              ₹{orderInfo?.wonAmount}
            </Text>
          }
        />
        <View style={[{marginTop: -1}]}>
          <LazyImage
            imageUrl={Subtract}
            occupancy="#0000"
            width={'100%'}
            height={24}
          />
        </View>
        <View
          style={[
            {
              backgroundColor: theme.basicColor.primary10,
            },
            margin.topl,
            borderRadius.xl,
          ]}>
          <BetsShardInvite
            width={'100%'}
            userInviteCode={userInfo?.userInviteCode}
            close={true}
          />
        </View>
      </View>
      <BetsShardModal ref={BetsShardModalRef} />
    </View>
  );
};
export default BetsShardHome;
