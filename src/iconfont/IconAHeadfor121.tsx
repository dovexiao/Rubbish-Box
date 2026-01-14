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

let IconAHeadfor121: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M395.946667 256a30.72 30.72 0 0 0 8.96 21.76L639.232 512 404.906667 746.24a30.72 30.72 0 0 0 43.52 43.52l249.941333-250.026667q11.52-11.434667 11.52-27.733333 0-16.213333-11.52-27.733333l-250.026667-250.026667A30.72 30.72 0 0 0 395.946667 256z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </Svg>
  );
};

IconAHeadfor121.defaultProps = {
  size: 18,
};

IconAHeadfor121 = React.memo ? React.memo(IconAHeadfor121) : IconAHeadfor121;

export default IconAHeadfor121;
