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

let IconVisible: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 698.88a186.88 186.88 0 1 0 0-373.76 186.88 186.88 0 0 0 0 373.76z m0-307.2a120.32 120.32 0 1 1 0 240.64 120.32 120.32 0 0 1 0-240.64z"
        fill={getIconColor(color, 0, '#333333')}
      />
      <Path
        d="M931.84 437.4528q35.84 75.1104-3.7888 148.6848Q781.8752 857.6 512 857.6q-269.8752 0-416.0512-271.4624Q56.32 512.5632 92.16 437.4528 221.3376 166.4 512 166.4t419.84 271.0528z m-69.3248 33.024Q754.176 243.2 512 243.2T161.4848 470.528q-19.0464 39.936 2.048 79.2064Q288 780.8 512 780.8q224 0 348.416-231.0656 21.1456-39.2704 2.0992-79.2576z"
        fill={getIconColor(color, 1, '#333333')}
      />
    </Svg>
  );
};

IconVisible.defaultProps = {
  size: 18,
};

IconVisible = React.memo ? React.memo(IconVisible) : IconVisible;

export default IconVisible;
