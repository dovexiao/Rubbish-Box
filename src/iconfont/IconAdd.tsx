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

let IconAdd: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M585.142857 438.857143V73.142857H438.857143v365.714286H73.142857v146.285714h365.714286v365.714286h146.285714V585.142857h365.714286V438.857143H585.142857z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </Svg>
  );
};

IconAdd.defaultProps = {
  size: 18,
};

IconAdd = React.memo ? React.memo(IconAdd) : IconAdd;

export default IconAdd;
