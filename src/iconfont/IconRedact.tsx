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

let IconRedact: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M885.8624 388.7616q0-18.3296-13.0048-31.3344l-199.8336-199.8336q-12.9536-12.9536-31.3344-12.9536-18.3296 0-31.2832 12.9536l-382.7712 382.7712q-12.3904 12.3904-12.9536 29.9008l-6.656 206.4896q-0.6656 19.2 12.9024 32.768t32.768 12.9536l206.4896-6.656q17.5104-0.5632 29.9008-12.9536l226.4064-226.4064-54.1184-54.528-217.4976 217.5488-158.976 5.12 5.12-159.0272 350.72-350.72 153.856 153.9072-132.864 132.8128 54.1184 54.528 156.0064-156.0064q13.0048-13.0048 13.0048-31.3344z"
        fill={getIconColor(color, 0, '#999999')}
      />
      <Path
        d="M716.9024 467.5072l-54.272 54.3232-153.9072-153.856 54.272-54.272 153.9072 153.8048z"
        fill={getIconColor(color, 1, '#999999')}
      />
    </Svg>
  );
};

IconRedact.defaultProps = {
  size: 18,
};

IconRedact = React.memo ? React.memo(IconRedact) : IconRedact;

export default IconRedact;
