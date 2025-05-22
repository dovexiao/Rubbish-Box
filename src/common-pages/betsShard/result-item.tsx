/* eslint-disable react-native/no-inline-styles */
import {View} from 'react-native';
import {flex, padding} from '@/components/style';
import React from 'react';

import Text from '@basicComponents/text';

const ResultItem = ({
  backgroundColor = '#F8F9FF',
  number = (
    <Text color={'#31373D'} fontSize={12}>
      NUMBER
    </Text>
  ),
  gametype,
  payment = (
    <Text color={'#31373D'} fontSize={12}>
      PARMENT
    </Text>
  ),
  result = (
    <Text style={[{textAlign: 'right'}]} color={'#31373D'} fontSize={12}>
      RESULT
    </Text>
  ),
}: any) => {
  return (
    <View
      style={[
        padding.lrl,
        padding.tbs,
        flex.between,
        flex.row,
        flex.centerByCol,
        {backgroundColor: backgroundColor},
      ]}>
      <View style={[flex.flex1]}> {number}</View>
      {gametype}
      <View style={[{width: 120}, flex.flex1, flex.center]}>{payment}</View>
      <View style={[flex.flex1, flex.end]}>{result}</View>
    </View>
  );
};
export default ResultItem;
