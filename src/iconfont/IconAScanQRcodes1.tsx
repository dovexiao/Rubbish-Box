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

let IconAScanQRcodes1: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M121.6 368.64V204.8q0-34.4576 24.3712-58.8288T204.8 121.6h163.84a32 32 0 0 1 0 64H204.8q-19.2 0-19.2 19.2v163.84a32 32 0 0 1-64 0zM655.36 121.6H819.2q34.4576 0 58.88 24.3712 24.32 24.3712 24.32 58.8288v163.84a32 32 0 0 1-64 0V204.8q0-19.2-19.2-19.2h-163.84a32 32 0 0 1 0-64zM185.6 655.36a32 32 0 0 0-64 0V819.2q0 34.4576 24.3712 58.88 24.3712 24.32 58.8288 24.32h163.84a32 32 0 0 0 0-64H204.8q-19.2 0-19.2-19.2v-163.84zM870.4 623.36a32 32 0 0 0-32 32V819.2q0 19.2-19.2 19.2h-128a32 32 0 0 0 0 64H819.2q34.4576 0 58.8288-24.3712T902.4 819.2v-163.84a32 32 0 0 0-32-32zM614.4 544H409.6a32 32 0 0 1 0-64h204.8a32 32 0 0 1 0 64z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </Svg>
  );
};

IconAScanQRcodes1.defaultProps = {
  size: 18,
};

IconAScanQRcodes1 = React.memo ? React.memo(IconAScanQRcodes1) : IconAScanQRcodes1;

export default IconAScanQRcodes1;
