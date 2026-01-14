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

let IconOrder: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M595.6608 141.9264h29.2864q34.2528 0 34.2528 34.304t-34.304 34.304h-225.792q-14.2336 0-24.2688-10.0864-10.0352-10.0352-10.0352-24.2176 0-14.1824 10.0352-24.2176 10.0352-10.0864 24.2176-10.0864h196.096v-64h-196.096q-40.704 0-69.4784 28.8256-14.2336 14.2336-21.4528 31.3856h-10.5984q-58.2144 0-99.328 41.1648-41.216 41.1648-41.216 99.3792v499.712q0 58.2144 41.1648 99.3792t99.3792 41.1648h428.9536q58.2144 0 99.328-41.1648 41.216-41.1648 41.216-99.328v-499.712q0-58.2656-41.1648-99.4304t-99.3792-41.1648h-6.0416v64h6.0416q31.6928 0 54.1184 22.4256 22.4256 22.4256 22.4256 54.1184v499.712q0 31.744-22.4256 54.1184-22.4256 22.4256-54.1184 22.4256H297.472q-31.6928 0-54.1184-22.4256-22.4256-22.4256-22.4256-54.1184v-499.712q0-31.6928 22.4256-54.1184 22.4256-22.4256 54.1184-22.4256h6.5024q6.4 24.4224 25.6 43.5712 28.7232 28.7744 69.4272 28.7744h225.8944q40.704 0 69.4784-28.7744 19.0976-19.0976 25.4976-43.4688V138.1376h-4.096q-7.168-17.152-21.4016-31.3856-28.7744-28.8256-69.4784-28.8256h-29.2864v64z"
        fill={getIconColor(color, 0, '#333333')}
      />
      <Path
        d="M665.6 492.8H358.4a32 32 0 0 1 0-64h307.2a32 32 0 0 1 0 64zM665.6 646.4H358.4a32 32 0 0 1 0-64h307.2a32 32 0 0 1 0 64z"
        fill={getIconColor(color, 1, '#333333')}
      />
    </Svg>
  );
};

IconOrder.defaultProps = {
  size: 18,
};

IconOrder = React.memo ? React.memo(IconOrder) : IconOrder;

export default IconOrder;
