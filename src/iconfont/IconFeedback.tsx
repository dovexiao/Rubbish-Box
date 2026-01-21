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

let IconFeedback: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 174.7456H245.0432q-29.184 0-49.7664 20.6336-20.6336 20.5824-20.6336 49.7664v533.7088q0 29.184 20.6336 49.8176 20.6336 20.5824 49.7664 20.5824h533.76q29.184 0 49.7664-20.5824 20.6336-20.6336 20.6336-49.8176V512a32 32 0 0 1 64 0v266.8544q0 55.7056-39.424 95.0272-39.3216 39.424-94.976 39.424H245.0944q-55.6544 0-95.0272-39.424-39.3728-39.3216-39.3728-95.0272V245.1456q0-55.6544 39.3728-95.0272 39.3728-39.424 95.0272-39.424H512a32 32 0 0 1 0 64z"
        fill={getIconColor(color, 0, '#333333')}
      />
      <Path
        d="M357.376 686.6944l198.0928-46.1824q22.4256-5.2224 38.7072-21.504l322.7648-322.9184q23.6032-23.6032 23.6032-57.0368 0-33.3824-23.6032-56.9856l-86.1696-86.1696q-23.6544-23.6544-57.0368-23.6544-33.4336 0-57.0368 23.6544L393.984 418.7648q-16.3328 16.3328-21.504 38.8096l-45.9264 198.4512a25.6 25.6 0 0 0 30.7712 30.72m183.6032-108.544l-130.0992 30.3104a5.12 5.12 0 0 1-6.144-6.144l30.1056-130.3552q1.0752-4.608 4.4544-8.0384l322.7136-322.816q4.864-4.9152 11.776-4.9152t11.776 4.9152l86.1696 86.1696q4.864 4.864 4.864 11.776 0 6.8608-4.864 11.776l-322.7648 322.8672q-3.3792 3.328-7.9872 4.4032z"
        fill={getIconColor(color, 1, '#333333')}
      />
    </Svg>
  );
};

IconFeedback.defaultProps = {
  size: 18,
};

IconFeedback = React.memo ? React.memo(IconFeedback) : IconFeedback;

export default IconFeedback;
