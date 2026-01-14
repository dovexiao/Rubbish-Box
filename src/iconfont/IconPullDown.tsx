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

let IconPullDown: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M213.845333 458.24a76.8 76.8 0 0 1 61.952-122.282667h472.405334a76.8 76.8 0 0 1 61.952 122.282667L573.866667 779.776a76.8 76.8 0 0 1-123.733334 0L213.845333 458.24z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </Svg>
  );
};

IconPullDown.defaultProps = {
  size: 18,
};

IconPullDown = React.memo ? React.memo(IconPullDown) : IconPullDown;

export default IconPullDown;
