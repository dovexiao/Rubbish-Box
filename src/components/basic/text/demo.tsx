import React from 'react';
import Text from './text';
import {View} from 'react-native';

const TextDemo = () => {
  return (
    <View>
      <Text>Native Light</Text>
      <Text fontFamily="fontDin">Native Light</Text>
      <Text fontFamily="fontInter">Native Light</Text>
      <Text fontFamily="fontInterBold">Native Light</Text>
    </View>
  );
};

export default TextDemo;
