import React, {useMemo, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import theme from '@/style';
import LazyImage from '@basicComponents/image/lazy-image';
import {getUserRechargeType} from '@/common-pages/recharge/recharge.service';

interface RechargeInfo {
  first_recharge?: {
    image: string;
  };
  recharge?: {
    image: string;
  };
}

const RechargeCheckBoxes = () => {
  const [rechargeInfo, setRechargeInfo] = useState<RechargeInfo | null>(null);

  //查看用户充值类型展示
  const fetchUserRechargeType = async () => {
    try {
      const userRechargeTypeRes = await getUserRechargeType();
      setRechargeInfo(userRechargeTypeRes as RechargeInfo);
      console.log('[用户充值类型展示]:', userRechargeTypeRes);
    } catch (e: unknown) {
      console.error('Error fetching RechargeType', e);
    }
  };

  React.useEffect(() => {
    fetchUserRechargeType();
  }, []);

  const renderTriangleIndicator = () => (
    <View style={styles.triangleContainer}>
      <View style={styles.checkmarkContainer}>
        <LazyImage
          width={16}
          height={16}
          imageUrl={require('@assets/imgs/checkmark.webp')}
        />
      </View>
    </View>
  );

  // const isFirstRecharge = rechargeInfo && 'first_recharge' in rechargeInfo;

  // const firstRechargeImg = useMemo(() => {
  //   if (isFirstRecharge) {
  //     return rechargeInfo.first_recharge?.image || '';
  //   }
  //   return '';
  // }, [rechargeInfo, isFirstRecharge]);

  const rechargeImg = useMemo(() => {
    if (rechargeInfo) {
      return rechargeInfo.recharge?.image || '';
    }
    return '';
  }, [rechargeInfo]);

  const renderBonusCard = () => {
    return (
      <>
        {/*{isFirstRecharge && (*/}
        {/*  <NativeTouchableOpacity activeOpacity={0.8}>*/}
        {/*    <View*/}
        {/*      style={[*/}
        {/*        styles.contentContainer,*/}
        {/*        isFirstRecharge && styles.selectedBorder,*/}
        {/*      ]}>*/}
        {/*      <LazyImage imageUrl={firstRechargeImg} width={140} height={80} />*/}
        {/*      {isFirstRecharge && renderTriangleIndicator()}*/}
        {/*    </View>*/}
        {/*  </NativeTouchableOpacity>*/}
        {/*)}*/}
        <NativeTouchableOpacity activeOpacity={0.8}>
          <View
            style={[
              styles.contentContainer,
              // !isFirstRecharge && styles.selectedBorder,
              styles.selectedBorder,
            ]}>
            <LazyImage imageUrl={rechargeImg} width={140} height={80} />
            {/*{!isFirstRecharge && renderTriangleIndicator()}*/}
            {renderTriangleIndicator()}
          </View>
        </NativeTouchableOpacity>
      </>
    );
  };

  return (
    <View
      style={[
        styles.container,
        theme.padding.l,
        {marginTop: 12, paddingBottom: 0},
      ]}>
      {renderBonusCard()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
  },
  contentContainer: {
    borderRadius: 10,
    width: 140,
    height: 80,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  selectedBorder: {
    borderColor: '#62dc00',
  },
  triangleContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderLeftWidth: 21,
    borderRightWidth: 21,
    borderTopWidth: 12,
    borderBottomWidth: 12,
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: '#62dc00',
    borderBottomColor: '#62dc00',
  },
  checkmarkContainer: {
    position: 'absolute',
    top: -3,
    left: 1,
  },
});

export default RechargeCheckBoxes;
