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

let IconABatterylifepriority: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M217.792 787.328q-21.76 97.664-29.824 105.536h59.52q25.472-59.648 27.648-105.6c2.176-45.888 9.728-224 147.776-359.808q138.048-135.872 237.312-154.88-128.32 47.616-227.648 176.32-99.264 128.704-123.52 307.456 214.144 31.744 325.504-75.52c111.36-107.264 81.28-236.672 120.064-353.472 38.784-116.736 138.048-185.792 147.776-185.792 9.6 0-383.168-65.216-593.472 131.008-210.24 196.224-43.52 300.928-91.136 514.752z"
        fill={getIconColor(color, 0, '#999999')}
      />
    </Svg>
  );
};

IconABatterylifepriority.defaultProps = {
  size: 18,
};

IconABatterylifepriority = React.memo ? React.memo(IconABatterylifepriority) : IconABatterylifepriority;

export default IconABatterylifepriority;
