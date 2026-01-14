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

let IconClose: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 451.669333L286.165333 225.834667a42.666667 42.666667 0 1 0-60.330666 60.330666L451.669333 512l-225.834666 225.834667a42.666667 42.666667 0 1 0 60.330666 60.330666L512 572.330667l225.792 225.792a42.666667 42.666667 0 1 0 60.373333-60.288L572.330667 512l225.792-225.792a42.666667 42.666667 0 1 0-60.288-60.373333L512 451.669333z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </Svg>
  );
};

IconClose.defaultProps = {
  size: 18,
};

IconClose = React.memo ? React.memo(IconClose) : IconClose;

export default IconClose;
