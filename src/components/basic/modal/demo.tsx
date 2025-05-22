import React, {useEffect} from 'react';
import {Text, View} from 'react-native';
import {useModal} from './modal.hooks';

const ModelDemo = () => {
  const {renderModal, show} = useModal(<Text>123123</Text>, {
    backDropClose: true,
  });
  useEffect(() => {
    show();
  }, [show]);
  return <View>{renderModal}</View>;
};

export default ModelDemo;
