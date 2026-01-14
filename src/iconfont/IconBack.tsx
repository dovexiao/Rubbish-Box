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

let IconBack: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M682.666667 170.666667a42.666667 42.666667 0 0 1-12.501334 30.165333L358.997333 512l311.168 311.125333a42.666667 42.666667 0 1 1-60.330666 60.373334l-338.346667-338.346667q-13.738667-13.696-13.738667-33.152t13.781334-33.194667l338.304-338.304A42.666667 42.666667 0 0 1 682.666667 170.666667z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </Svg>
  );
};

IconBack.defaultProps = {
  size: 18,
};

IconBack = React.memo ? React.memo(IconBack) : IconBack;

export default IconBack;
