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

let IconADownloadtheApp: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M115.008 835.584V188.416q0-68.416 48.384-116.8 48.384-48.32 116.8-48.32h462.976q68.416 0 116.8 48.32 48.32 48.384 48.32 116.864v647.04q0 68.48-48.384 116.864t-116.8 48.384H280.192q-68.48 0-116.8-48.384-48.384-48.384-48.384-116.8z m64 0q0 41.92 29.632 71.552 29.632 29.632 71.552 29.632h462.912q41.856 0 71.488-29.632 29.632-29.632 29.696-71.552V188.416q0-41.856-29.632-71.488-29.632-29.632-71.488-29.632H280.192q-41.92 0-71.552 29.632-29.632 29.632-29.632 71.488v647.168z"
        fill={getIconColor(color, 0, '#333333')}
      />
      <Path
        d="M634.496 875.136H389.504a32 32 0 0 1 0-64h244.992a32 32 0 0 1 0 64zM483.264 265.088a32 32 0 1 1 64 0v298.496l64.64-64.64a32 32 0 0 1 45.248 45.184l-118.016 118.08q-11.2 11.264-27.136 11.264t-27.136-11.264L366.848 544.128a32 32 0 1 1 45.312-45.248l71.04 71.232 0.064-305.024z"
        fill={getIconColor(color, 1, '#333333')}
      />
    </Svg>
  );
};

IconADownloadtheApp.defaultProps = {
  size: 18,
};

IconADownloadtheApp = React.memo ? React.memo(IconADownloadtheApp) : IconADownloadtheApp;

export default IconADownloadtheApp;
