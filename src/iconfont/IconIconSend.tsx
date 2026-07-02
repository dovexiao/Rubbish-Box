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

let IconIconSend: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 1013.333333c276.906667 0 501.333333-224.426667 501.333333-501.333333S788.906667 10.666667 512 10.666667 10.666667 235.093333 10.666667 512 235.093333 1013.333333 512 1013.333333z m0-938.666666c241.493333 0 437.333333 195.84 437.333333 437.333333S753.493333 949.333333 512 949.333333 74.666667 753.493333 74.666667 512 270.506667 74.666667 512 74.666667z"
        fill={getIconColor(color, 0, '#333333')}
      />
      <Path
        d="M544 375.893333l116.053333 116.053334a32 32 0 0 0 45.226667-45.226667l-167.637333-167.68q-10.624-10.624-25.642667-10.624t-25.642667 10.666667l-167.68 167.637333a32 32 0 1 0 45.269334 45.226667l116.053333-116.053334V725.333333a32 32 0 0 0 64 0V375.893333z"
        fill={getIconColor(color, 1, '#333333')}
      />
    </Svg>
  );
};

IconIconSend.defaultProps = {
  size: 18,
};

IconIconSend = React.memo ? React.memo(IconIconSend) : IconIconSend;

export default IconIconSend;
