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

let IconAPreviouspage: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M628.053333 256a30.72 30.72 0 0 1-8.96 21.76L384.768 512l234.325333 234.24a30.72 30.72 0 0 1-43.52 43.52l-249.941333-250.026667Q314.112 528.298667 314.112 512q0-16.213333 11.52-27.733333l250.026667-250.026667A30.72 30.72 0 0 1 628.053333 256z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </Svg>
  );
};

IconAPreviouspage.defaultProps = {
  size: 18,
};

IconAPreviouspage = React.memo ? React.memo(IconAPreviouspage) : IconAPreviouspage;

export default IconAPreviouspage;
