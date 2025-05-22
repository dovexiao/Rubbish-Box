import React from 'react';
import {View, ViewProps} from 'react-native';

export type AnchorTabItemProps = ViewProps;

const AnchorTabItem: React.FC<AnchorTabItemProps> = props => {
  return <View {...props} />;
};

export default AnchorTabItem;
