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

let IconLocation: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M591.274667 910.933333Q853.333333 620.288 853.333333 455.082667a341.333333 341.333333 0 1 0-682.666666 0q0 165.205333 262.058666 455.850666a105.728 105.728 0 0 0 158.549334 0z m-79.36-598.101333a142.250667 142.250667 0 1 1 0 284.416 142.250667 142.250667 0 0 1 0-284.416z"
        fill={getIconColor(color, 0, '#C6C9D1')}
      />
    </Svg>
  );
};

IconLocation.defaultProps = {
  size: 18,
};

IconLocation = React.memo ? React.memo(IconLocation) : IconLocation;

export default IconLocation;
