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

let IconMultiplication: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 356.864L223.890286 68.681143A109.714286 109.714286 0 1 0 68.681143 223.963429L356.937143 512 68.754286 800.036571a109.714286 109.714286 0 1 0 155.062857 155.282286L512 667.062857l288.036571 288.036572 0.073143 0.146285a109.714286 109.714286 0 0 0 155.209143-155.209143h-0.146286L667.136 512l288.109714-288.036571A109.714286 109.714286 0 1 0 800.182857 68.681143L512 356.937143z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </Svg>
  );
};

IconMultiplication.defaultProps = {
  size: 18,
};

IconMultiplication = React.memo ? React.memo(IconMultiplication) : IconMultiplication;

export default IconMultiplication;
