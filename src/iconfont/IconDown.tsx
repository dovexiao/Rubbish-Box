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

let IconDown: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M541.257143 219.428571a29.257143 29.257143 0 1 0-58.514286 0v551.094858l-169.472-169.508572a29.257143 29.257143 0 0 0-41.398857 41.398857l216.868571 216.832q9.618286 9.654857 23.259429 9.654857t23.259429-9.654857l216.868571-216.868571a29.257143 29.257143 0 0 0-41.398857-41.325714L541.257143 770.486857V219.428571z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </Svg>
  );
};

IconDown.defaultProps = {
  size: 18,
};

IconDown = React.memo ? React.memo(IconDown) : IconDown;

export default IconDown;
