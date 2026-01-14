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

let IconAOperatingguide: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 966.4A451.008 451.008 0 1 0 512 64.384 451.008 451.008 0 0 0 512 966.4zM512 128.384A387.008 387.008 0 1 1 512 902.4 387.008 387.008 0 0 1 512 128.384z"
        fill={getIconColor(color, 0, '#333333')}
      />
      <Path
        d="M448.832 452.032L336.64 691.072l239.04-112.256 112.256-239.04-239.104 112.256z"
        fill={getIconColor(color, 1, '#333333')}
      />
    </Svg>
  );
};

IconAOperatingguide.defaultProps = {
  size: 18,
};

IconAOperatingguide = React.memo ? React.memo(IconAOperatingguide) : IconAOperatingguide;

export default IconAOperatingguide;
