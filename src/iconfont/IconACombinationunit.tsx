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

let IconACombinationunit: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M641.6 552.832l2.368-1.408V290.56L418.048 160 192 290.496v260.928l225.984 130.496 16-9.28 207.04-119.488-61.056-45.76v7.04L418.048 608 256 514.496V327.424l161.984-93.504 161.984 93.504v179.2l61.632 46.208z"
        fill={getIconColor(color, 0, '#333333')}
      />
      <Path
        d="M691.008 408.64l80.96 46.784v187.072L610.048 736l-81.024-46.72-64 36.928 144.96 83.712 225.984-130.496V418.496l-144.96-83.264v73.408z"
        fill={getIconColor(color, 1, '#333333')}
      />
    </Svg>
  );
};

IconACombinationunit.defaultProps = {
  size: 18,
};

IconACombinationunit = React.memo ? React.memo(IconACombinationunit) : IconACombinationunit;

export default IconACombinationunit;
