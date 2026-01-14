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

let IconPlay: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 921.6a409.6 409.6 0 1 0 0-819.2 409.6 409.6 0 0 0 0 819.2z m0-778.24a368.64 368.64 0 1 1 0 737.28 368.64 368.64 0 0 1 0-737.28z"
        fill={getIconColor(color, 0, '#FFFFFF')}
      />
      <Path
        d="M460.842667 671.658667a40.96 40.96 0 0 1-61.44-35.456V387.84c0-31.573333 34.133333-51.242667 61.44-35.498667l215.04 124.16a40.96 40.96 0 0 1 0 70.954667l-215.04 124.16z"
        fill={getIconColor(color, 1, '#FFFFFF')}
      />
    </Svg>
  );
};

IconPlay.defaultProps = {
  size: 18,
};

IconPlay = React.memo ? React.memo(IconPlay) : IconPlay;

export default IconPlay;
