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

let IconCamera: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M860.416 207.445333h-351.104a95.957333 95.957333 0 0 0-95.786667-95.786666H349.696a95.957333 95.957333 0 0 0-95.786667 95.786666H158.421333a95.957333 95.957333 0 0 0-95.829333 95.829334v510.549333a95.957333 95.957333 0 0 0 95.829333 95.786667h701.994667a95.957333 95.957333 0 0 0 95.829333-95.786667V303.274667a96.170667 96.170667 0 0 0-95.829333-95.829334z m-351.104 542.549334A191.573333 191.573333 0 0 1 317.866667 558.506667a191.573333 191.573333 0 0 1 191.445333-191.445334 191.573333 191.573333 0 0 1 191.488 191.445334 191.573333 191.573333 0 0 1-191.488 191.445333z m303.104-319.104a47.786667 47.786667 0 1 1 0-95.658667 47.786667 47.786667 0 0 1 0 95.658667z"
        fill={getIconColor(color, 0, '#CCCCCC')}
      />
    </Svg>
  );
};

IconCamera.defaultProps = {
  size: 18,
};

IconCamera = React.memo ? React.memo(IconCamera) : IconCamera;

export default IconCamera;
