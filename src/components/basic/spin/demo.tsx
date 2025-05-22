import React from 'react';
import Spin from './spin';
import {Text} from 'react-native';

const SpinDemo = () => {
  return (
    <Spin loading={true}>
      <Text>123</Text>
    </Spin>
  );
};

export default SpinDemo;
