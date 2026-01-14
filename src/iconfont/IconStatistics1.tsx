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

let IconStatistics1: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 953.6c243.882667 0 441.6-197.717333 441.6-441.6 0-243.882667-197.717333-441.6-441.6-441.6C268.117333 70.4 70.4 268.117333 70.4 512c0 243.882667 197.717333 441.6 441.6 441.6z m0-819.2a377.6 377.6 0 1 1 0 755.2 377.6 377.6 0 0 1 0-755.2z"
        fill={getIconColor(color, 0, '#333333')}
      />
      <Path
        d="M748.8 409.6a32 32 0 0 1-8.106667 21.248l-155.434666 174.933333q-11.093333 12.416-27.733334 12.416-16.682667 0-27.733333-12.458666L443.733333 509.013333l-112.64 126.72a32 32 0 0 1-47.786666-42.538666l132.693333-149.333334q11.093333-12.416 27.733333-12.416t27.733334 12.458667l86.058666 96.768 135.338667-152.277333a32 32 0 0 1 55.936 21.248z"
        fill={getIconColor(color, 1, '#333333')}
      />
    </Svg>
  );
};

IconStatistics1.defaultProps = {
  size: 18,
};

IconStatistics1 = React.memo ? React.memo(IconStatistics1) : IconStatistics1;

export default IconStatistics1;
