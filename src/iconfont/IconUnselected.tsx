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

let IconUnselected: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 998.4a486.4 486.4 0 1 0 0-972.8 486.4 486.4 0 0 0 0 972.8z m0-891.7504a405.3504 405.3504 0 1 1 0 810.7008 405.3504 405.3504 0 0 1 0-810.7008z"
        fill={getIconColor(color, 0, '#E1E1E1')}
      />
    </Svg>
  );
};

IconUnselected.defaultProps = {
  size: 18,
};

IconUnselected = React.memo ? React.memo(IconUnselected) : IconUnselected;

export default IconUnselected;
