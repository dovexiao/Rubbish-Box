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

let IconExit: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 902.4H274.0224q-55.7056 0-95.0784-39.3728-39.3216-39.3728-39.3216-95.0272V256q0-55.6544 39.3216-95.0272 39.424-39.3728 95.0784-39.3728H512a32 32 0 0 1 0 64H274.0224q-29.184 0-49.8176 20.6336-20.5824 20.5824-20.5824 49.7664v512q0 29.184 20.5824 49.7664 20.6336 20.6336 49.8176 20.6336H512a32 32 0 0 1 0 64z"
        fill={getIconColor(color, 0, '#333333')}
      />
      <Path
        d="M684.8 358.4c0 8.4992 3.3792 16.64 9.3696 22.6304l98.9696 98.9696H358.4a32 32 0 0 0 0 64h434.7392l-98.9696 98.9696a32.0512 32.0512 0 0 0 45.2608 45.2608l153.6-153.6a32 32 0 0 0 0-45.2608l-153.6-153.6A32.0512 32.0512 0 0 0 684.8 358.4z"
        fill={getIconColor(color, 1, '#333333')}
      />
    </Svg>
  );
};

IconExit.defaultProps = {
  size: 18,
};

IconExit = React.memo ? React.memo(IconExit) : IconExit;

export default IconExit;
