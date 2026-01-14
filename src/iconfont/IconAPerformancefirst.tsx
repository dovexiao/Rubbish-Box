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

let IconAPerformancefirst: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M248.32 528.704a6.4 6.4 0 0 0 4.992 10.432h186.88a6.4 6.4 0 0 1 6.4 7.616l-73.984 384.32c-1.28 6.4 6.976 10.368 11.2 5.312l407.296-482.752a6.4 6.4 0 0 0-4.864-10.496H598.976a6.4 6.4 0 0 1-6.4-6.912l29.696-356.16a6.4 6.4 0 0 0-11.392-4.48L248.32 528.64z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </Svg>
  );
};

IconAPerformancefirst.defaultProps = {
  size: 18,
};

IconAPerformancefirst = React.memo ? React.memo(IconAPerformancefirst) : IconAPerformancefirst;

export default IconAPerformancefirst;
