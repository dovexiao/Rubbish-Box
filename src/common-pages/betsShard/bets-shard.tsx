import {View} from 'react-native';

import React, {useEffect, useState} from 'react';

import BetsShardHome from './bets-shard-home';

import {useRoute} from '@react-navigation/native';
import {SafeAny} from '@/types';
import {getShareOrder} from './bets-shard-service';
import BetsShardWinning from './bets-shard-winning';

const BetsShard = () => {
  const {params} = useRoute<SafeAny>();
  const [orderInfo, setOrderInfo] = useState<SafeAny>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const {userId, packageId, gameCode, issNo, yearMonth, orderGroup} = params;
    setLoading(true);

    getShareOrder({
      userId,
      packageId,
      gameCode,
      issNo,
      yearMonth,
      orderGroup,
    }).then((res: SafeAny) => {
      setLoading(false);
      let typeList = [];
      if (gameCode === 'dice') {
        typeList = res.typeList;
        typeList.map((item: SafeAny) => {
          item.number = item.number;
          item.payment = item.amount;
          item.result = item.awardAmount;
        });
        res.list = typeList;
      }
      if (gameCode === 'color') {
        typeList = res.subsetList;
        typeList.map((item: SafeAny) => {
          item.number = item.number;
          item.payment = item.amount;
          item.result = item.awardAmount;
        });
        res.list = typeList;
      }
      if (gameCode === 'kerala') {
        typeList = res.userWonList;
        typeList.map((item: SafeAny) => {
          item.number = item.wonCode;
          item.payment = item.lotteryPrice;
          item.result = item.isWin;
        });
        res.list = typeList;
      }
      if (gameCode === 'pick3') {
        typeList = res.codeLists;
        typeList.map((item: SafeAny) => {
          item.number = item.indexCode;
          item.payment = item.pickAmount + '*' + item.pickCount;
          item.result = item.codeWinAmount;
        });
        res.list = typeList;
      }
      if (gameCode === 'matka') {
        typeList = res.userDigits;
        typeList.map((item: SafeAny) => {
          item.number = item.digits;
          item.payment = item.points;
          item.result = item.wonAmount ? item.wonAmount : 0;
        });
        res.list = typeList;
      }
      setOrderInfo(res);
    });
  }, [params]);
  return (
    <View>
      {orderInfo?.totalAmount > 0 || loading ? (
        <BetsShardWinning params={params} orderInfo={orderInfo} />
      ) : (
        <BetsShardHome params={params} orderInfo={orderInfo} />
      )}
    </View>
  );
};
export default BetsShard;
