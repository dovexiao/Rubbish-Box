import * as ReactNative from 'react-native';

export interface LinearGradientProps extends ReactNative.ViewProps {
  colors: (string | number)[];
  start?: {x: number; y: number};
  end?: {x: number; y: number};
  locations?: number[];
  useAngle?: boolean;
  angleCenter?: {x: number; y: number};
  angle?: number;
}
