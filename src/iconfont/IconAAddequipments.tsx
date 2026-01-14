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

let IconAAddequipments: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M511.8976 106.2912q169.472 0 289.28 119.808 119.808 119.808 119.808 289.28 0 169.472-119.808 289.28-119.808 119.808-289.28 119.808-169.472 0-289.28-119.808-119.808-119.808-119.808-289.28 0-169.472 119.808-289.28 119.808-119.808 289.28-119.808z m0 64q-142.9504 0-244.0192 101.0688-101.0688 101.0688-101.0688 244.0192t101.0688 244.0192q101.0688 101.0688 244.0192 101.0688t244.0192-101.0688q101.0688-101.0688 101.0688-244.0192T755.9168 271.36Q654.848 170.2912 511.8976 170.2912z"
        fill={getIconColor(color, 0, '#333333')}
      />
      <Path
        d="M480 358.4a32 32 0 1 1 64 0V479.744h121.1904a32 32 0 1 1 0 64h-121.1904V665.6a32 32 0 1 1-64 0V543.744H357.9904a32 32 0 1 1 0-64h122.0096V358.4z"
        fill={getIconColor(color, 1, '#333333')}
      />
    </Svg>
  );
};

IconAAddequipments.defaultProps = {
  size: 18,
};

IconAAddequipments = React.memo ? React.memo(IconAAddequipments) : IconAAddequipments;

export default IconAAddequipments;
