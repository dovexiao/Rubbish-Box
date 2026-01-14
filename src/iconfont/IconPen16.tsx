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

let IconPen16: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M655.808 174.848l199.808 199.872q9.216 9.216 9.216 22.272t-9.216 22.272l-97.92 97.92-36.224-36.16 84.032-84.032-171.968-171.968-88.704 88.704L716.8 485.696l0.128-0.128 36.224 36.16-35.84 35.84-86.4-86.336-0.448 0.448-121.856-121.792-238.4 238.464-5.76 177.664 177.728-5.76 234.368-234.304 36.224 36.224-239.936 239.872q-8.768 8.768-21.248 9.216l-206.464 6.656q-13.632 0.384-23.296-9.216-9.6-9.664-9.216-23.296l6.656-206.528q0.384-12.416 9.216-21.248l382.72-382.72q9.28-9.28 22.336-9.28t22.272 9.216z"
        fill={getIconColor(color, 0, '#999999')}
      />
    </Svg>
  );
};

IconPen16.defaultProps = {
  size: 18,
};

IconPen16 = React.memo ? React.memo(IconPen16) : IconPen16;

export default IconPen16;
