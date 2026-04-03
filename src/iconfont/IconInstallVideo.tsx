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

let IconInstallVideo: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M70.4 256v512q0 55.6544 39.3728 95.0272 39.3728 39.3728 95.0272 39.3728h614.4q55.6544 0 95.0272-39.3728 39.3728-39.3728 39.3728-95.0272V256q0-55.6544-39.3728-95.0272-39.3728-39.3728-95.0272-39.3728H204.8q-55.6544 0-95.0272 39.3728-39.3728 39.3728-39.3728 95.0272z m84.6336 561.7664q-20.6336-20.5824-20.6336-49.7664V256q0-29.184 20.6336-49.7664 20.5824-20.6336 49.7664-20.6336h614.4q29.184 0 49.7664 20.6336 20.6336 20.5824 20.6336 49.7664v512q0 29.184-20.6336 49.7664-20.5824 20.6336-49.7664 20.6336H204.8q-29.184 0-49.7664-20.6336z"
        fill={getIconColor(color, 0, '#333333')}
      />
      <Path
        d="M419.2256 672.768q41.5744 23.9616 83.1488 0l153.6-88.7296q41.6256-24.0128 41.6256-72.0384 0-48.0256-41.6256-72.0384l-153.6-88.6784q-41.5744-24.064-83.1488 0-41.6256 24.0128-41.6256 72.0384v177.3568q0 48.0256 41.6256 72.0384z m204.8-144.128l-153.6 88.6784q-9.6256 5.5296-19.2512 0-9.5744-5.5296-9.5744-16.64V423.3216q0-11.1104 9.6256-16.64 9.5744-5.5296 19.1488 0l153.6 88.6784q9.6256 5.5296 9.6256 16.64 0 11.1104-9.6256 16.64z"
        fill={getIconColor(color, 1, '#333333')}
      />
    </Svg>
  );
};

IconInstallVideo.defaultProps = {
  size: 18,
};

IconInstallVideo = React.memo ? React.memo(IconInstallVideo) : IconInstallVideo;

export default IconInstallVideo;
