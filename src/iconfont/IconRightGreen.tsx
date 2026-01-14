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

let IconRightGreen: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M38.619429 514.048a475.428571 475.428571 0 1 0 950.857142 0 475.428571 475.428571 0 1 0-950.857142 0Z"
        fill={getIconColor(color, 0, '#37C22A')}
      />
      <Path
        d="M796.818286 398.848a54.857143 54.857143 0 0 1-16.091429 38.765714L515.364571 702.902857q-19.748571 19.748571-47.835428 19.748572t-47.908572-19.748572L275.236571 558.518857a54.857143 54.857143 0 0 1 77.604572-77.531428l114.688 114.614857 235.593143-235.52a54.857143 54.857143 0 0 1 93.622857 38.765714z"
        fill={getIconColor(color, 1, '#FFFFFF')}
      />
    </Svg>
  );
};

IconRightGreen.defaultProps = {
  size: 18,
};

IconRightGreen = React.memo ? React.memo(IconRightGreen) : IconRightGreen;

export default IconRightGreen;
