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

let IconRefresh: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M777.4208 565.248v0.0512a33.792 33.792 0 0 0-0.7168 6.4 33.28 33.28 0 0 0 60.5696 22.4256l93.8496-137.6768a33.28 33.28 0 0 0-54.9888-37.4784l-30.3104 44.4928q-6.0416-41.2672-22.528-80.1792-25.088-59.392-70.8608-105.1136-96.8704-96.8704-233.8816-96.8704-136.96 0-233.8304 96.8704Q187.8528 375.04 187.8528 512q0 137.0112 96.8704 233.8816 96.8704 96.8704 233.8304 96.8704 67.2768 0 128.768-26.0096 59.392-25.088 105.1136-70.8608a33.28 33.28 0 1 0-47.104-47.104q-36.5568 36.608-83.968 56.6784-48.9984 20.736-102.8096 20.736-109.4144 0-186.7776-77.3632Q254.4128 621.4656 254.4128 512q0-109.4144 77.312-186.7776Q409.1904 247.808 518.656 247.808q109.4144 0 186.7776 77.312 36.5568 36.608 56.6272 84.0192 20.736 49.0496 20.736 102.8096 0 27.0336-5.3248 53.248z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </Svg>
  );
};

IconRefresh.defaultProps = {
  size: 18,
};

IconRefresh = React.memo ? React.memo(IconRefresh) : IconRefresh;

export default IconRefresh;
