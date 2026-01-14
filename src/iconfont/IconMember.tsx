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

let IconMember: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 74.688q110.464 0 188.544 78.08 78.08 78.08 78.08 188.544 0 110.464-78.08 188.608-31.616 31.616-68.608 50.432 84.608 22.4 155.008 78.08 118.208 93.376 137.856 232.96 4.544 32.64-18.24 56.704-21.504 22.592-53.12 22.592H170.752q-31.68 0-53.12-22.592-22.848-24.064-18.24-56.64 19.648-139.648 137.792-233.024 70.4-55.68 154.88-78.08-36.928-18.816-68.608-50.432-78.08-78.08-78.08-188.608 0-110.464 78.08-188.544Q401.536 74.688 512 74.688z m0 64q-83.968 0-143.36 59.328-59.328 59.392-59.328 143.36 0 83.904 59.392 143.296Q428.032 544 512 544q83.968 0 143.36-59.328 59.328-59.392 59.328-143.36 0-83.904-59.392-143.296Q595.968 138.688 512 138.688z m0.064 490.688q-134.912 0-235.2 79.232-98.048 77.44-114.112 191.744-0.256 1.984 1.28 3.648 2.56 2.688 6.72 2.688h682.688q4.16 0 6.656-2.688 1.6-1.664 1.28-3.648-16-114.24-114.112-191.744-100.288-79.232-235.2-79.232z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </Svg>
  );
};

IconMember.defaultProps = {
  size: 18,
};

IconMember = React.memo ? React.memo(IconMember) : IconMember;

export default IconMember;
