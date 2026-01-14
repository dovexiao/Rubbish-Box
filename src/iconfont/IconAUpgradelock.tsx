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

let IconAUpgradelock: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M889.6 791.594667V891.733333a32 32 0 0 0 64 0V409.813333q0-128.213333-90.624-218.88-90.666667-90.624-218.88-90.624H379.904q-128.170667 0-218.837333 90.624Q70.4 281.6 70.4 409.813333v481.877334a32 32 0 0 0 64 0v-129.962667l0.042667-67.157333V409.813333q0-101.717333 71.893333-173.653333Q278.186667 164.352 379.904 164.352h264.192q101.717333 0 173.653333 71.893333Q889.6 308.053333 889.6 409.813333v381.781334z m-0.426667-29.994667v-67.157333Q700.757333 636.16 512 636.16q-188.672 0-377.130667 58.325333v67.157334Q323.541333 700.117333 512 700.117333q188.458667 0 377.173333 61.482667z"
        fill={getIconColor(color, 0, '#333333')}
      />
      <Path
        d="M481.28 483.541333h70.826667q47.36 0 80.896-33.493333 33.493333-33.493333 33.493333-80.853333 0-47.36-33.493333-80.853334-33.493333-33.493333-80.853334-33.493333h-102.186666q-13.696 0-23.381334 9.642667-9.685333 9.685333-9.685333 23.381333v265.813333a32 32 0 1 0 64 0V318.805333h71.253333q20.821333 0 35.584 14.72 14.762667 14.762667 14.762667 35.626667t-14.762667 35.626667q-14.762667 14.72-35.584 14.72h-70.826666v64z"
        fill={getIconColor(color, 1, '#333333')}
      />
    </Svg>
  );
};

IconAUpgradelock.defaultProps = {
  size: 18,
};

IconAUpgradelock = React.memo ? React.memo(IconAUpgradelock) : IconAUpgradelock;

export default IconAUpgradelock;
