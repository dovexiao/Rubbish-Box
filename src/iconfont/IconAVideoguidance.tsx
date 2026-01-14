/* tslint:disable */
/* eslint-disable */

import React, { FunctionComponent } from 'react';
import { ViewProps } from 'react-native';
import { Svg, GProps, Path } from 'react-native-svg';
import { getIconColor } from './helper';

interface Props extends GProps, ViewProps {
  size?: number;
  color?: string | string[];
}

let IconAVideoguidance: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M70.4 256v512q0 55.68 39.381333 95.018667 39.338667 39.381333 95.018667 39.381333h614.4q55.68 0 95.018667-39.381333 39.381333-39.338667 39.381333-95.018667V256q0-55.68-39.381333-95.018667-39.338667-39.381333-95.018667-39.381333H204.8q-55.68 0-95.018667 39.381333Q70.4 200.32 70.4 256zM204.8 838.4q-70.4 0-70.4-70.4V256q0-70.4 70.4-70.4h614.4q70.4 0 70.4 70.4v512q0 70.4-70.4 70.4H204.8z"
        fill={getIconColor(color, 0, '#333333')}
      />
      <Path
        d="M444.288 698.154667q-17.578667 2.218667-35.157333-7.936-28.8-16.64-28.8-49.877334V383.658667q0-33.237333 28.8-49.877334t57.6 0l222.293333 128.341334q28.8 16.64 28.8 49.92 0 33.237333-28.8 49.834666l-222.293333 128.341334q-11.008 6.357333-22.016 7.850666v-69.034666L647.381333 512l-203.050666-117.248v303.36z"
        fill={getIconColor(color, 1, '#333333')}
      />
    </Svg>
  );
};

IconAVideoguidance.defaultProps = {
  size: 18,
};

IconAVideoguidance = React.memo ? React.memo(IconAVideoguidance) : IconAVideoguidance;

export default IconAVideoguidance;
