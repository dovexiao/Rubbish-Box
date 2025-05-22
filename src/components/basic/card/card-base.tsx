import theme from '@style';
import React, {ReactNode} from 'react';
import {View} from 'react-native';

export interface CardBaseProps {
  paddingHorizontal?: number;
  paddingVertical?: number;
  backgroundColor?: string;
  radius?: number;
  children?: ReactNode;
}

const CardBase: React.FC<CardBaseProps> = props => {
  const {
    paddingHorizontal = 0,
    paddingVertical = 0,
    backgroundColor = 'transparent',
    radius = 0,
    children,
  } = props;
  return (
    <View
      style={[
        theme.flex.col,
        theme.overflow.hidden,
        {
          paddingHorizontal,
          paddingVertical,
          backgroundColor,
          borderRadius: radius,
        },
      ]}>
      {children}
    </View>
  );
};

CardBase.displayName = 'Card';

export default CardBase;
