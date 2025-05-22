import React from 'react';
import {ViewProps} from 'react-native';
const CurrentLinearGradient =
  require('react-native-web-linear-gradient').default;

export interface LinearGradientProps extends ViewProps {
  colors: string[];
  start?: {x: number; y: number};
  end?: {x: number; y: number};
  locations?: number[];
  useAngle?: boolean;
  angleCenter?: {x: number; y: number};
  angle?: number;
}

const LinearGradient: React.FC<LinearGradientProps> = props => {
  return <CurrentLinearGradient {...props} />;
};

export default LinearGradient;
