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

let IconAHeadfor201: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M395.9296 256a30.72 30.72 0 0 0 9.0112 21.7088L639.232 512l-234.2912 234.2912a30.72 30.72 0 0 0 43.4688 43.4176l249.9584-249.9584q11.4688-11.4688 11.4688-27.7504 0-16.2816-11.4688-27.7504L448.4096 234.2912A30.72 30.72 0 0 0 395.9296 256z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </Svg>
  );
};

IconAHeadfor201.defaultProps = {
  size: 18,
};

IconAHeadfor201 = React.memo ? React.memo(IconAHeadfor201) : IconAHeadfor201;

export default IconAHeadfor201;
