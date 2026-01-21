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

let IconAAdd12: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M469.333333 768V256h85.333334v512h-85.333334z"
        fill={getIconColor(color, 0, '#333333')}
      />
      <Path
        d="M256 469.333333h512v85.333334H256v-85.333334z"
        fill={getIconColor(color, 1, '#333333')}
      />
    </Svg>
  );
};

IconAAdd12.defaultProps = {
  size: 18,
};

IconAAdd12 = React.memo ? React.memo(IconAAdd12) : IconAAdd12;

export default IconAAdd12;
