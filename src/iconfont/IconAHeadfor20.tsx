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

let IconAHeadfor20: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M341.248 256c0 12.288 5.2736 23.9616 14.4896 32.1024L579.6352 512l-223.8976 223.8976a42.752 42.752 0 1 0 60.3648 60.3648l248.0128-248.064q15.0016-15.0016 15.0016-36.1984t-15.0016-36.1984L416.1024 227.7376A42.752 42.752 0 0 0 341.248 256z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </Svg>
  );
};

IconAHeadfor20.defaultProps = {
  size: 18,
};

IconAHeadfor20 = React.memo ? React.memo(IconAHeadfor20) : IconAHeadfor20;

export default IconAHeadfor20;
