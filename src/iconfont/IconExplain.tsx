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

let IconExplain: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 908.8a396.8 396.8 0 1 0 0-793.6 396.8 396.8 0 0 0 0 793.6z m0-716.8a320 320 0 1 1 0 640 320 320 0 0 1 0-640z"
        fill={getIconColor(color, 0, '#999999')}
      />
      <Path
        d="M473.6 512a38.4 38.4 0 1 1 76.8 0v204.8a38.4 38.4 0 0 1-76.8 0v-204.8z"
        fill={getIconColor(color, 1, '#999999')}
      />
      <Path
        d="M458.7008 358.4a53.2992 53.2992 0 1 0 106.5984 0 53.2992 53.2992 0 1 0-106.5984 0Z"
        fill={getIconColor(color, 2, '#999999')}
      />
    </Svg>
  );
};

IconExplain.defaultProps = {
  size: 18,
};

IconExplain = React.memo ? React.memo(IconExplain) : IconExplain;

export default IconExplain;
