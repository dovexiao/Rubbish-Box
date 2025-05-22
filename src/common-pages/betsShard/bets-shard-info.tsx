/* eslint-disable react-native/no-inline-styles */
import {BetsSharBackgroundColor, Logo, MEGADREAM} from './bets-shard.variable';
import {View} from 'react-native';
import Text from '@basicComponents/text';
import {
  basicColor,
  borderRadius,
  flex,
  fontColor,
  fontSize,
  margin,
  padding,
} from '@/components/style';
import React from 'react';
import LazyImage from '@/components/basic/image';
import {SafeAny} from '@/types';
import dayjs from 'dayjs';
export function nativeTransformMoney(
  number: number | string | undefined,
  fixed = 2,
) {
  const money = !number
    ? 0
    : typeof number === 'string'
    ? Number(number)
    : number;
  return money.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: fixed,
  });
}
const BetsShardInfo = ({
  backgroundColor = '#FFECAB',
  borderTopRadius = 12,
  borderBottomRadius = 0,
  result = (
    <View style={[flex.flex, flex.centerByCol, flex.between, flex.row]}>
      <Text
        color={basicColor.dark}
        fontSize={fontSize.s}
        blod
        fontFamily="fontInter">
        Won
      </Text>
      <Text
        style={[margin.leftxxs]}
        color={basicColor.primary}
        fontSize={fontSize.xl}
        blod
        fontFamily="fontDin">
        ₹150.0
      </Text>
    </View>
  ),
  orderInfo,
}: SafeAny) => {
  return (
    <View
      style={[
        {
          width: '100%',
          height: 208,
          backgroundColor: backgroundColor,
          borderTopLeftRadius: borderTopRadius,
          borderTopRightRadius: borderTopRadius,
          borderBottomLeftRadius: borderBottomRadius,
          borderBottomRightRadius: borderBottomRadius,
          padding: 12,
        },
      ]}>
      <View
        style={[
          margin.lrl,
          flex.flex,
          flex.centerByCol,
          flex.between,
          flex.row,
        ]}>
        <View style={[{width: 94, height: 2}, BetsSharBackgroundColor]} />
        <View style={[flex.flex, flex.centerByCol, flex.row]}>
          <View
            style={[
              {width: 32, height: 32, overflow: 'hidden'},
              margin.lrxxs,
              borderRadius.m,
            ]}>
            <LazyImage
              imageUrl={Logo}
              occupancy="#0000"
              width={32}
              height={32}
            />
          </View>
          <LazyImage
            imageUrl={MEGADREAM}
            occupancy="#0000"
            width={68}
            height={14}
          />
        </View>
        <View style={[{width: 94, height: 2}, BetsSharBackgroundColor]} />
      </View>
      <View
        style={[
          margin.tbl,
          flex.flex,
          flex.centerByCol,
          flex.between,
          flex.row,
        ]}>
        <View style={[flex.row, flex.centerByCol]}>
          <View
            style={[
              {width: 48, height: 48, overflow: 'hidden'},
              borderRadius.xl,
            ]}>
            <LazyImage
              imageUrl={orderInfo?.gameIconUrl}
              occupancy="#0000"
              width={48}
              height={48}
            />
          </View>
          <View style={[padding.leftl]}>
            <View>
              <Text
                color={fontColor.main}
                fontSize={fontSize.m}
                blod
                fontFamily="fontInter">
                {orderInfo?.gameName}
              </Text>
            </View>
            <View style={[margin.topxxs, flex.row]}>
              <Text
                color={fontColor.accent}
                fontSize={fontSize.s}
                fontFamily="fontInter">
                Draw time
              </Text>
              <Text
                style={[margin.lefts]}
                color={basicColor.dark}
                fontSize={fontSize.s}
                fontFamily="fontInter">
                {dayjs(orderInfo?.openTime).format('DD-MM hh:mm A')}
              </Text>
            </View>
          </View>
        </View>
        <View>
          <Text
            color={fontColor.accent}
            fontSize={fontSize.s}
            fontFamily="fontInter">
            Payment
          </Text>
          <Text
            color={fontColor.main}
            fontSize={fontSize.m}
            blod
            fontFamily="fontInter"
            style={[
              margin.topxxs,
              {
                textAlign: 'right',
              },
            ]}>
            ₹50.0
          </Text>
        </View>
      </View>
      <View
        style={[
          margin.tbl,
          padding.tbl,
          {borderTopWidth: 1, borderColor: '#D8B892'},
        ]}>
        <View style={[flex.flex, flex.centerByCol, flex.between, flex.row]}>
          <Text
            fontSize={fontSize.s}
            fontFamily="fontInter"
            color={fontColor.accent}>
            Betting time
          </Text>
          <Text
            fontSize={fontSize.s}
            fontFamily="fontInter"
            color={basicColor.dark}>
            {dayjs(orderInfo?.createTime).format('DD-MM-YYYY hh:mm A')}
          </Text>
        </View>
        <View
          style={[
            flex.flex,
            flex.centerByCol,
            flex.between,
            flex.row,
            margin.topl,
          ]}>
          <Text
            fontSize={fontSize.s}
            color={fontColor.accent}
            fontFamily="fontInter">
            Result
          </Text>
          {result}
        </View>
      </View>
    </View>
  );
};
export default BetsShardInfo;
