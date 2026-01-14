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

let IconShare: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M891.776 576v72.512q0 100.736-71.232 171.968-71.232 71.232-171.968 71.232H375.552q-100.736 0-171.968-71.232-71.232-71.232-71.232-171.968V375.488q0-100.736 71.232-171.968 71.232-71.232 171.968-71.232H448a38.4 38.4 0 0 1 0 76.8H375.552q-68.928 0-117.696 48.704-48.704 48.768-48.704 117.696v273.024q0 68.928 48.704 117.696 48.768 48.704 117.696 48.704h273.024q68.928 0 117.696-48.704 48.704-48.768 48.704-117.696V576a38.4 38.4 0 0 1 76.8 0z"
        fill={getIconColor(color, 0, '#333333')}
      />
      <Path
        d="M640 132.288h208.192q18.048 0 30.72 12.736 12.8 12.8 12.8 30.72V384a38.4 38.4 0 0 1-76.8 0V263.424L475.136 603.2a38.4 38.4 0 1 1-54.336-54.336l339.84-339.84H640a38.4 38.4 0 0 1 0-76.8z"
        fill={getIconColor(color, 1, '#333333')}
      />
    </Svg>
  );
};

IconShare.defaultProps = {
  size: 18,
};

IconShare = React.memo ? React.memo(IconShare) : IconShare;

export default IconShare;
