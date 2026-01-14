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

let IconWrongRed: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M38.619429 514.048a475.428571 475.428571 0 1 0 950.857142 0 475.428571 475.428571 0 1 0-950.857142 0Z"
        fill={getIconColor(color, 0, '#E23030')}
      />
      <Path
        d="M589.531429 512L721.188571 643.657143a54.857143 54.857143 0 0 1-77.604571 77.531428L512 589.604571 380.342857 721.115429a54.857143 54.857143 0 0 1-77.531428-77.531429L434.395429 512 302.811429 380.489143a54.857143 54.857143 0 1 1 77.604571-77.531429L512 434.468571 643.510857 302.811429a54.857143 54.857143 0 0 1 77.531429 77.531428l-131.510857 131.657143z"
        fill={getIconColor(color, 1, '#FFFFFF')}
      />
    </Svg>
  );
};

IconWrongRed.defaultProps = {
  size: 18,
};

IconWrongRed = React.memo ? React.memo(IconWrongRed) : IconWrongRed;

export default IconWrongRed;
