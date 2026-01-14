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

let IconAPowersupply: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 269.44a32 32 0 0 0-32 32v134.912a32 32 0 0 0 64 0V301.44a32 32 0 0 0-32-32zM308.992 524.864a32 32 0 0 0-11.712 43.712l67.84 117.568a32 32 0 0 0 55.488-32l-67.84-117.568a32 32 0 0 0-43.776-11.712zM715.008 524.864a32 32 0 0 1 11.712 43.712l-67.84 117.568a32 32 0 0 1-55.488-32l67.84-117.568a32 32 0 0 1 43.776-11.712z"
        fill={getIconColor(color, 0, '#333333')}
      />
      <Path
        d="M512 966.4A451.008 451.008 0 1 0 512 64.384 451.008 451.008 0 0 0 512 966.4zM512 128.384A387.008 387.008 0 1 1 512 902.4 387.008 387.008 0 0 1 512 128.384z"
        fill={getIconColor(color, 1, '#333333')}
      />
    </Svg>
  );
};

IconAPowersupply.defaultProps = {
  size: 18,
};

IconAPowersupply = React.memo ? React.memo(IconAPowersupply) : IconAPowersupply;

export default IconAPowersupply;
