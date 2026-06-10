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

let IconBankTongyong: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M28.586667 380.16v439.466667c0 36.394667 29.525333 65.92 65.92 65.92h834.986666c36.394667 0 65.92-29.525333 65.92-65.92V380.16H28.586667z m421.290666 399.914667a9.301333 9.301333 0 0 1-8.96-11.605334l31.744-123.178666a18.602667 18.602667 0 0 1 18.005334-13.909334h37.461333c6.058667 0 10.538667 5.717333 8.96 11.605334l-31.744 123.136a18.602667 18.602667 0 0 1-18.005333 13.952h-37.461334z m122.88 0a9.301333 9.301333 0 0 1-8.96-11.605334l31.786667-123.178666a18.602667 18.602667 0 0 1 18.005333-13.909334h37.461334c6.058667 0 10.496 5.717333 8.96 11.605334l-31.744 123.136a18.602667 18.602667 0 0 1-18.005334 13.952h-37.461333z m122.922667 0a9.301333 9.301333 0 0 1-8.96-11.605334l31.744-123.178666a18.602667 18.602667 0 0 1 18.005333-13.909334h121.088c6.101333 0 10.538667 5.717333 9.002667 11.605334l-31.786667 123.136a18.602667 18.602667 0 0 1-17.962666 13.952h-121.130667z"
        fill={getIconColor(color, 0, '#0077FD')}
      />
      <Path
        d="M28.586667 335.573333h966.826666V204.373333c0-36.394667-29.525333-65.92-65.92-65.92H94.506667C58.112 138.453333 28.586667 167.978667 28.586667 204.373333v131.2z"
        fill={getIconColor(color, 1, '#00B5FD')}
      />
    </Svg>
  );
};

IconBankTongyong.defaultProps = {
  size: 18,
};

IconBankTongyong = React.memo ? React.memo(IconBankTongyong) : IconBankTongyong;

export default IconBankTongyong;
