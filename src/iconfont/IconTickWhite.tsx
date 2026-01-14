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

let IconTickWhite: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M768 412.16a51.2 51.2 0 0 1-15.0016 36.2496L504.32 697.1392q-18.0224 18.0224-43.4688 18.0224t-43.4688-18.0224l-146.3296-146.3296a51.2 51.2 0 0 1 72.3968-72.3968L460.8 595.8144l219.8016-219.8016A51.2 51.2 0 0 1 768 412.16z"
        fill={getIconColor(color, 0, '#FFFFFF')}
      />
    </Svg>
  );
};

IconTickWhite.defaultProps = {
  size: 18,
};

IconTickWhite = React.memo ? React.memo(IconTickWhite) : IconTickWhite;

export default IconTickWhite;
