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

let IconAHeadfor16Grey: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M341.44 256c0 11.264 4.48 22.144 12.48 30.08l-0.064 0.064L579.648 512 353.92 737.856a42.56 42.56 0 1 0 60.224 60.224l0.064 0.064 249.984-249.92q14.976-15.04 14.976-36.224 0-21.184-14.976-36.224L414.144 225.92A42.56 42.56 0 0 0 341.376 256z"
        fill={getIconColor(color, 0, '#C6C9D1')}
      />
    </Svg>
  );
};

IconAHeadfor16Grey.defaultProps = {
  size: 18,
};

IconAHeadfor16Grey = React.memo ? React.memo(IconAHeadfor16Grey) : IconAHeadfor16Grey;

export default IconAHeadfor16Grey;
