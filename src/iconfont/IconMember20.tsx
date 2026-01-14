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

let IconMember20: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 74.6496q110.4384 0 188.5696 78.1312 78.08 78.08 78.08 188.5696 0 110.4384-78.08 188.5696-31.6416 31.6416-68.608 50.432 84.48 22.3744 154.8288 78.0288 118.1696 93.3888 137.8304 233.0112 4.608 32.5632-18.2272 56.6272-21.504 22.6304-53.1456 22.6304H170.5984q-31.6416 0-53.0944-22.6304-22.8352-24.064-18.2784-56.6272 19.6608-139.6224 137.8304-233.0112 70.4-55.6544 154.9312-78.0288-36.9152-18.8416-68.5568-50.432-78.08-78.1312-78.08-188.5696 0-110.4896 78.08-188.5696Q401.5616 74.6496 512 74.6496z m0 64q-83.968 0-143.3088 59.392-59.392 59.392-59.392 143.3088 0 83.968 59.392 143.3088T512 544q83.968 0 143.3088-59.392 59.392-59.3408 59.392-143.2576 0-83.968-59.392-143.36Q595.9168 138.7008 512 138.7008z m-0.0512 490.6496q-134.912 0-235.2128 79.2576-98.048 77.5168-114.1248 191.744-0.3072 2.048 1.28 3.6864 2.56 2.6624 6.7072 2.6624h682.6496q4.1984 0 6.7072-2.6624 1.536-1.6896 1.28-3.6864-16.0768-114.2272-114.1248-191.744-100.2496-79.2576-235.1616-79.2576z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </Svg>
  );
};

IconMember20.defaultProps = {
  size: 18,
};

IconMember20 = React.memo ? React.memo(IconMember20) : IconMember20;

export default IconMember20;
