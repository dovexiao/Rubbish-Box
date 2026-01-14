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

let IconArrows1: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M609.92 286.08l187.52 187.456q1.216 1.216 2.304 2.496a47.872 47.872 0 0 1 0 71.936q-1.088 1.28-2.304 2.496l-187.52 187.52a48 48 0 1 1-67.84-67.968l110.08-110.016H256a48 48 0 0 1 0-96h396.16L542.08 353.92a48 48 0 0 1 67.84-67.84z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </Svg>
  );
};

IconArrows1.defaultProps = {
  size: 18,
};

IconArrows1 = React.memo ? React.memo(IconArrows1) : IconArrows1;

export default IconArrows1;
