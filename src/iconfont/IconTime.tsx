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

let IconTime: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M511.8976 924.4672a409.088 409.088 0 1 0 0-818.176 409.088 409.088 0 0 0 0 818.176z m0-754.176a345.088 345.088 0 1 1 0 690.176 345.088 345.088 0 0 1 0-690.176z"
        fill={getIconColor(color, 0, '#333333')}
      />
      <Path
        d="M512 275.2A32 32 0 0 0 480 307.2v251.4944l198.6048 85.0944a32.1024 32.1024 0 0 0 44.544-29.3888 32 32 0 0 0-19.3536-29.3888l-159.7952-68.5056V307.2A32 32 0 0 0 512 275.2z"
        fill={getIconColor(color, 1, '#333333')}
      />
    </Svg>
  );
};

IconTime.defaultProps = {
  size: 18,
};

IconTime = React.memo ? React.memo(IconTime) : IconTime;

export default IconTime;
