import React from 'react';
import Skeleton from './skeleton';
import {Text} from '@rneui/themed';
import {TouchableOpacity} from 'react-native';

const SkeletonDemo = () => {
  const [loading, setLoading] = React.useState(true);
  return (
    <TouchableOpacity onPress={() => setLoading(!loading)}>
      <Skeleton loading={loading}>
        <Text>123</Text>
        <Text>123</Text>
        <Text>123</Text>
      </Skeleton>
    </TouchableOpacity>
  );
};

export default SkeletonDemo;
