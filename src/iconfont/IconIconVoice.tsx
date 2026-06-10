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

let IconIconVoice: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M681.344 406.592a32 32 0 0 1 45.248-45.248L832 466.752l105.344-105.408a32 32 0 0 1 45.248 45.248L877.248 512l105.344 105.408a32 32 0 0 1-45.248 45.248L832 557.248l-105.344 105.408a32 32 0 0 1-45.248-45.248L786.752 512l-105.408-105.408zM64 323.2v298.688a64 64 0 0 0 64 64V323.2h91.52q30.272 0 57.28-13.504L512 192v560.896L276.8 635.392q-27.008-13.504-57.216-13.504H128.64v64h90.88a64 64 0 0 1 28.672 6.72l235.2 117.632A64 64 0 0 0 576 752.96V192.064a64 64 0 0 0-92.608-57.216L248.192 252.416a64 64 0 0 1-28.608 6.784H128a64 64 0 0 0-64 64z"
        fill={getIconColor(color, 0, '#FFFFFF')}
      />
    </Svg>
  );
};

IconIconVoice.defaultProps = {
  size: 18,
};

IconIconVoice = React.memo ? React.memo(IconIconVoice) : IconIconVoice;

export default IconIconVoice;
