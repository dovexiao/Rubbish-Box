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

let IconCopy1: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M256 736H192q-39.744 0-67.84-28.16-28.16-28.096-28.16-67.84V192q0-39.744 28.16-67.84Q152.192 96 192 96h448q39.744 0 67.84 28.16 28.16 28.096 28.16 67.84v64h-64V192q0-32-32-32H192q-13.248 0-22.656 9.344Q160 178.752 160 192v448q0 13.248 9.344 22.656 9.408 9.344 22.656 9.344h64v64z"
        fill={getIconColor(color, 0, '#333333')}
      />
      <Path
        d="M288 384v448q0 39.744 28.16 67.84 28.096 28.16 67.84 28.16h448q39.744 0 67.84-28.16 28.16-28.096 28.16-67.84V384q0-39.744-28.16-67.84-28.096-28.16-67.84-28.16H384q-39.744 0-67.84 28.16Q288 344.192 288 384zM384 864q-32 0-32-32V384q0-32 32-32h448q32 0 32 32v448q0 32-32 32H384z"
        fill={getIconColor(color, 1, '#333333')}
      />
    </Svg>
  );
};

IconCopy1.defaultProps = {
  size: 18,
};

IconCopy1 = React.memo ? React.memo(IconCopy1) : IconCopy1;

export default IconCopy1;
