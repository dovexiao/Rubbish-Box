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

let IconRise: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M482.742857 804.571429a29.257143 29.257143 0 0 0 58.514286 0V253.476571l169.472 169.508572a29.257143 29.257143 0 0 0 41.398857-41.398857l-216.868571-216.832q-9.618286-9.654857-23.259429-9.654857t-23.259429 9.654857l-216.868571 216.868571a29.257143 29.257143 0 0 0 41.398857 41.325714L482.742857 253.513143V804.571429z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </Svg>
  );
};

IconRise.defaultProps = {
  size: 18,
};

IconRise = React.memo ? React.memo(IconRise) : IconRise;

export default IconRise;
