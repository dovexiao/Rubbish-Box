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

let IconAHeadfor12: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M341.333333 256a42.666667 42.666667 0 0 0 12.458667 30.208L579.669333 512 353.877333 737.792a42.666667 42.666667 0 1 0 60.330667 60.416l249.941333-250.026667q15.018667-14.933333 15.018667-36.181333t-15.018667-36.181333l-250.026666-250.026667A42.666667 42.666667 0 0 0 341.333333 256z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </Svg>
  );
};

IconAHeadfor12.defaultProps = {
  size: 18,
};

IconAHeadfor12 = React.memo ? React.memo(IconAHeadfor12) : IconAHeadfor12;

export default IconAHeadfor12;
