/* eslint-disable react-native/no-inline-styles */
import {COLORS, DICES, DIGIT} from './bets-shard.variable';
import {View, StyleSheet} from 'react-native';
import {basicColor, flex, padding} from '@/components/style';
import React from 'react';
import LazyImage, {LazyImageBackground} from '@/components/basic/image';
const styles = StyleSheet.create({
  container: {
    columnGap: 2,
  },
});
import Text from '@basicComponents/text';
import ResultItem from './result-item';
import {BasicObject, SafeAny} from '@/types';
import {useRoute} from '@react-navigation/native';
const BetsShardtable = ({orderInfo}: SafeAny) => {
  const {params} = useRoute<SafeAny>();

  const {gameCode} = params;
  const getABC = (indexCode: string) => {
    if (!indexCode) {
      return [];
    }
    const abcAndNum = indexCode.split('=');
    const abcArr = abcAndNum[0].split('');
    const numArr = abcAndNum[1].split('');
    const res = abcArr.map((item: string, index: number) => {
      const obj = {} as BasicObject;
      obj.key = item;
      obj.value = numArr[index];
      return obj;
    });
    return res;
  };
  const gameType = [
    '',
    'AnkOpen',
    'AnkClose',
    'Jodi',
    'SPOpen',
    'SPColse',
    'DPOpen',
    'DPClose',
    'TPOpen',
    'TPClose',
    'HSAOpen',
    'HSAClose',
    'FS',
  ];

  const getNumberEle = (item: any) => {
    if (gameCode === 'color') {
      if (item.selectValue) {
        let bg = item.selectValue;
        if (item.selectType === 2) {
          const text = bg === 'g' ? 'GREEN' : bg === 'r' ? 'RED' : 'VIOLET';
          return (
            <LazyImageBackground
              occupancy="transparent"
              width={28}
              height={28}
              style={[flex.center]}
              imageUrl={COLORS[bg]}>
              <Text
                fontSize={7}
                color={basicColor.white}
                fontFamily="fontDin"
                fontWeight="bold">
                {text}
              </Text>
            </LazyImageBackground>
          );
        } else {
          if (['1', '3', '7', '9'].includes(item.selectValue)) {
            bg = 'g';
          } else if (['2', '4', '6', '8'].includes(item.selectValue)) {
            bg = 'r';
          } else if (item.selectValue === '0') {
            bg = 'rv';
          } else {
            bg = 'gv';
          }
          return (
            <LazyImageBackground
              occupancy="transparent"
              width={28}
              height={28}
              style={[flex.center]}
              imageUrl={COLORS[bg]}>
              <Text
                fontSize={14}
                color={basicColor.white}
                fontFamily="fontDin"
                fontWeight="bold">
                {item.selectValue}
              </Text>
            </LazyImageBackground>
          );
        }
      }
      return null;
    }
    if (gameCode === 'kerala') {
      return (
        <View>
          <Text fontSize={14} color={basicColor.dark} fontFamily="fontInter">
            {item.number}
          </Text>
        </View>
      );
    }
    if (gameCode === 'pick3') {
      const abcData = getABC(item.number);
      return (
        <View style={[flex.row, flex.centerByCol, styles.container]}>
          {abcData.map((pie, i) => (
            <LazyImageBackground
              occupancy="transparent"
              key={i}
              style={[flex.center]}
              width={24}
              height={24}
              imageUrl={DIGIT[pie.key]}>
              <Text fontFamily="fontInterBold">{pie.value}</Text>
            </LazyImageBackground>
          ))}
        </View>
      );
    }
    if (gameCode === 'matka') {
      // const abcData = getABC(item.number);
      return (
        <View style={[flex.flex1, flex.row]}>
          <View>
            <Text size="medium">{gameType[item.gameType]}</Text>
            <Text size="medium" blod>
              {item.digits}
            </Text>
          </View>
        </View>
      );
    }
    if (gameCode === 'dice') {
      const toNumber = Number(item.number);
      let numberArr = [];
      switch (item.playType) {
        case 'Single':
          return (
            <LazyImage
              occupancy="transparent"
              width={32}
              height={32}
              imageUrl={DICES[item?.number?.toLowerCase()]}
            />
          );
        case 'Sum':
          if (isNaN(toNumber)) {
            return (
              <LazyImage
                occupancy="transparent"
                width={32}
                height={32}
                imageUrl={DICES[item?.number?.toLowerCase()]}
              />
            );
          } else {
            return (
              <LazyImageBackground
                occupancy="transparent"
                width={32}
                height={32}
                style={[flex.center]}
                imageUrl={DICES.ball}>
                <Text fontSize={17} fontFamily="fontDin" fontWeight="bold">
                  {item.number}
                </Text>
              </LazyImageBackground>
            );
          }
        case 'Pair':
          numberArr = item.number.split('');
          return (
            <View style={[flex.row]}>
              {numberArr.map((pie: string, i: number) => (
                <LazyImage
                  key={i}
                  occupancy="transparent"
                  width={16}
                  height={16}
                  imageUrl={DICES[pie]}
                />
              ))}
            </View>
          );
        case 'Triple':
          if (isNaN(toNumber)) {
            return (
              <View style={[flex.row]}>
                <View style={[flex.centerByCol]}>
                  <LazyImage
                    occupancy="transparent"
                    width={16}
                    height={16}
                    imageUrl={DICES[item?.number?.toLowerCase()]}
                  />
                  <View style={[flex.row]}>
                    {['any', 'any'].map((pie: string, i: number) => (
                      <LazyImage
                        key={i}
                        occupancy="transparent"
                        width={16}
                        height={16}
                        imageUrl={DICES[item?.number?.toLowerCase()]}
                      />
                    ))}
                  </View>
                </View>
              </View>
            );
          } else {
            numberArr = item.number.split('');
            return (
              <View style={[flex.row]}>
                <View style={[flex.centerByCol]}>
                  <LazyImage
                    occupancy="transparent"
                    width={16}
                    height={16}
                    imageUrl={DICES[numberArr[0]]}
                  />
                  <View style={[flex.row]}>
                    {numberArr.slice(1).map((pie: string, i: number) => (
                      <LazyImage
                        key={i}
                        occupancy="transparent"
                        width={16}
                        height={16}
                        imageUrl={DICES[pie]}
                      />
                    ))}
                  </View>
                </View>
              </View>
            );
          }
      }
    }
  };
  return (
    <View style={[padding.lrl]}>
      <ResultItem gametype />
      <View
        style={[{height: 265, overflow: 'scroll', backgroundColor: '#fff'}]}>
        {orderInfo &&
          orderInfo?.list?.map((item: SafeAny, index: number) => {
            return (
              <ResultItem
                gametype
                backgroundColor={index % 2 !== 0 ? '#F8F9FF' : '#fff'}
                number={getNumberEle(item)}
                payment={
                  <Text color={'#31373D'} fontSize={14} blod>
                    ₹{item?.payment}
                  </Text>
                }
                result={
                  <View style={[flex.end, flex.flex1]}>
                    <Text
                      style={[{textAlign: 'right'}]}
                      fontSize={12}
                      color={'#31373D'}>
                      Won
                    </Text>
                    <Text
                      fontSize={12}
                      color={item?.result > 0 ? '#F15802' : '#000'}
                      blod
                      style={[{textAlign: 'right'}]}>
                      ₹{item?.result ? item?.result : 0}
                    </Text>
                  </View>
                }
              />
            );
          })}
      </View>
    </View>
  );
};
export default BetsShardtable;
