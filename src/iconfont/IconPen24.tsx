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

let IconPen24: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M664.746667 165.632l199.893333 199.850667q12.970667 12.970667 12.970667 31.317333t-12.970667 31.317333l-90.624 90.624-54.314667-54.314666L787.328 396.8l-153.856-153.856-70.613333 70.613333 117.077333 117.077334v0.042666l91.050667 91.093334-54.272 54.272-71.168-71.210667-137.002667-136.96-225.792 225.749333-5.12 159.018667 159.018667-5.12 222.72-222.805333 54.357333 54.314666-231.893333 231.850667q-12.373333 12.373333-29.866667 12.970667l-206.506667 6.656q-19.2 0.64-32.768-12.928t-12.928-32.768l6.656-206.506667q0.554667-17.493333 12.970667-29.866667l382.72-382.805333q13.013333-12.970667 31.36-12.970667t31.317333 12.970667z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </Svg>
  );
};

IconPen24.defaultProps = {
  size: 18,
};

IconPen24 = React.memo ? React.memo(IconPen24) : IconPen24;

export default IconPen24;
