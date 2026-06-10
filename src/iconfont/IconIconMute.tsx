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

let IconIconMute: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M64 362.688v298.624a64 64 0 0 0 64 64V362.688h91.52q30.272 0 57.28-13.568L512 231.552v560.896l-235.2-117.632q-27.008-13.44-57.216-13.44H128.64v64h90.88a64 64 0 0 1 28.672 6.72l235.2 117.568A64 64 0 0 0 576 792.448V231.552a64 64 0 0 0-92.608-57.216L248.192 291.84a64 64 0 0 1-28.608 6.784H128a64 64 0 0 0-64 64zM672 320a32 32 0 0 0 7.04 20.032q26.752 33.216 41.472 76.608 15.488 45.44 15.488 95.36t-15.488 95.36q-14.72 43.392-41.472 76.608a32 32 0 0 0 49.92 40.064q33.728-41.984 52.16-96Q800 572.544 800 512t-18.88-116.032q-18.432-54.016-52.16-96A32 32 0 0 0 672 320z"
        fill={getIconColor(color, 0, '#FFFFFF')}
      />
      <Path
        d="M800 192a32 32 0 0 0 8.96 22.208q56.256 58.24 87.04 133.76 32 78.272 32 164.032t-32 164.032q-30.784 75.52-87.04 133.76a32 32 0 0 0 46.08 44.416q64.768-67.072 100.224-153.984Q992 610.368 992 512t-36.736-188.224Q919.808 236.8 855.04 169.792A32 32 0 0 0 800 192z"
        fill={getIconColor(color, 1, '#FFFFFF')}
      />
    </Svg>
  );
};

IconIconMute.defaultProps = {
  size: 18,
};

IconIconMute = React.memo ? React.memo(IconIconMute) : IconIconMute;

export default IconIconMute;
