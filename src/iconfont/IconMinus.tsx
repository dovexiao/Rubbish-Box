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

let IconMinus: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M73.142857 438.857143m0 0l877.714286 0q0 0 0 0l0 146.285714q0 0 0 0l-877.714286 0q0 0 0 0l0-146.285714q0 0 0 0Z"
        fill={getIconColor(color, 0, '#CCCCCC')}
      />
    </Svg>
  );
};

IconMinus.defaultProps = {
  size: 18,
};

IconMinus = React.memo ? React.memo(IconMinus) : IconMinus;

export default IconMinus;
