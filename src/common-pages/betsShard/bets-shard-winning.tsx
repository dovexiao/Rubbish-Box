/* eslint-disable react-native/no-inline-styles */
import {
  LinearGradientBetsSharColor,
  shardImg,
  Subtract,
} from './bets-shard.variable';
import {View, ImageBackground, ScrollView} from 'react-native';
import globalStore from '@/services/global.state';
import {
  basicColor,
  flex,
  fontSize,
  padding,
  position,
} from '@/components/style';
import React, {useEffect, useRef, useState} from 'react';
import LazyImage from '@/components/basic/image';

import {SafeAny} from '@/types';
import LinearGradient from '@basicComponents/linear-gradient';
import BetsShardUser, {userInfoObj} from './bets-shard-user';
import BetsShardInfo from './bets-shard-info';
import Text from '@basicComponents/text';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import BetsShardWinningModal from './bets-shard-winning-modal';
import BetsShardtable from './bets-shard-table';
import {getUserInfo} from './bets-shard-service';
const BetsShardWinning = ({params, orderInfo}: SafeAny) => {
  const BetsShardWinningModalRef: SafeAny = useRef(null);
  const [userInfo, setUserInfo] = useState<userInfoObj>();
  useEffect(() => {
    const {userId, packageId} = params;
    getUserInfo({userId, packageId}).then((res: SafeAny) => {
      setUserInfo(res);
    });
  }, [params]);
  return (
    <ScrollView style={[flex.flex1]}>
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
            },
          ]}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
          colors={LinearGradientBetsSharColor}>
          <BetsShardUser userInfo={userInfo} />
        </LinearGradient>
        <BetsShardInfo
          backgroundColor={'#fff'}
          borderTopRadius={0}
          borderBottomRadius={12}
          name={'Color-5 miute'}
          result={
            <Text color={'#31373D'} fontSize={12}>
              To be drawn...
            </Text>
          }
          orderInfo={orderInfo}
        />
        <View
          style={[
            {
              height: 351,
              backgroundColor: '#FFEEB4',
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
            },
          ]}>
          <LinearGradient
            style={[
              {width: '100%'},
              {
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                height: 41,
              },
              flex.center,
            ]}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            colors={['#FFF', 'rgba(255, 255, 255, 0.00)']}>
            <Text fontSize={14} color={'#000'} blod>
              Bets
            </Text>
          </LinearGradient>
          <BetsShardtable orderInfo={orderInfo} />
          <View style={[{marginTop: -1}]}>
            <LazyImage
              imageUrl={Subtract}
              occupancy="#0000"
              width={'100%'}
              height={24}
            />
          </View>
        </View>
      </View>
      <View style={[padding.lrl, position.abs, {bottom: 24, width: '100%'}]}>
        <View
          style={[
            {width: '100%'},
            flex.center,
            {
              height: 48,
              borderRadius: 30,
              overflow: 'hidden',
            },
          ]}>
          <LinearGradient
            style={[
              {
                width: '100%',
                height: 48,
                paddingLeft: 12,
                paddingRight: 12,
              },
              flex.center,
            ]}
            start={{x: 0, y: 1}}
            end={{x: 1, y: 0}}
            colors={['#8700DA', '#7000FF']}>
            <NativeTouchableOpacity
              onPress={() => BetsShardWinningModalRef?.current?.showModal()}>
              <Text
                fontSize={fontSize.l}
                color={basicColor.white}
                fontWeight="bold">
                Register and download
              </Text>
            </NativeTouchableOpacity>
          </LinearGradient>
        </View>
      </View>
      <BetsShardWinningModal
        ref={BetsShardWinningModalRef}
        userInviteCode={userInfo?.userInviteCode}
      />
    </ScrollView>
  );
};
export default BetsShardWinning;
