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

let IconACombinationmanagement: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M337.371429 96.365714h349.696q65.097143 0 97.682285 56.393143l174.811429 302.811429q32.585143 56.429714 0 112.859428l-174.811429 302.811429q-32.548571 56.429714-97.682285 56.429714H337.371429q-65.133714 0-97.718858-56.429714l-174.811428-302.811429q-32.548571-56.429714 0-112.822857l174.811428-302.811428q32.585143-56.429714 97.718858-56.429715z m0 54.857143q-33.462857 0-50.176 28.964572l-174.848 302.811428q-16.749714 29.001143 0 58.002286l174.811428 302.811428q16.749714 29.001143 50.212572 29.001143h349.696q33.462857 0 50.176-29.001143l174.811428-302.811428q16.749714-29.001143 0-57.965714l-174.811428-302.811429q-16.713143-29.001143-50.176-29.001143H337.371429z"
        fill={getIconColor(color, 0, '#333333')}
      />
      <Path
        d="M512.182857 697.490286a185.453714 185.453714 0 1 0 0-370.944 185.453714 185.453714 0 0 0 0 370.944z m0-316.086857a130.596571 130.596571 0 1 1 0 261.229714 130.596571 130.596571 0 0 1 0-261.229714z"
        fill={getIconColor(color, 1, '#333333')}
      />
    </Svg>
  );
};

IconACombinationmanagement.defaultProps = {
  size: 18,
};

IconACombinationmanagement = React.memo ? React.memo(IconACombinationmanagement) : IconACombinationmanagement;

export default IconACombinationmanagement;
