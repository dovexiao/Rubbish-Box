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

let IconAHeadfor16Grey1: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M396.032 256c0 8.128 3.2 16 8.96 21.76L639.36 512l-234.24 234.24a30.72 30.72 0 0 0 43.392 43.52l249.984-249.984q11.52-11.52 11.52-27.776t-11.52-27.776L448.448 234.304A30.72 30.72 0 0 0 396.032 256z"
        fill={getIconColor(color, 0, '#999999')}
      />
    </Svg>
  );
};

IconAHeadfor16Grey1.defaultProps = {
  size: 18,
};

IconAHeadfor16Grey1 = React.memo ? React.memo(IconAHeadfor16Grey1) : IconAHeadfor16Grey1;

export default IconAHeadfor16Grey1;
