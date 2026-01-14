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

let IconSelected: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 998.4a486.4 486.4 0 1 1 0-972.8 486.4 486.4 0 0 1 0 972.8z m240.9984-549.9904a51.2 51.2 0 0 0-72.3968-72.3968L460.8 595.8144 343.3984 478.4128a51.2 51.2 0 0 0-72.3968 72.3968l146.3296 146.3808q18.0224 17.92 43.4688 17.92t43.4688-17.92l248.7296-248.832z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </Svg>
  );
};

IconSelected.defaultProps = {
  size: 18,
};

IconSelected = React.memo ? React.memo(IconSelected) : IconSelected;

export default IconSelected;
