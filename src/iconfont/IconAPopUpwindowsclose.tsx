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

let IconAPopUpwindowsclose: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M870.4 512a358.4 358.4 0 1 1-716.8 0 358.4 358.4 0 0 1 716.8 0z m-51.2 0a307.2 307.2 0 1 0-614.4 0 307.2 307.2 0 0 0 614.4 0z m-179.2-102.4a25.6 25.6 0 0 1-7.5264 18.0736L548.1984 512l84.2752 84.3264a25.6 25.6 0 1 1-36.1984 36.1984L512 548.1984l-84.3264 84.3264a25.6 25.6 0 0 1-36.1984-36.1984L475.8016 512 391.5264 427.6736a25.6 25.6 0 0 1 36.1984-36.1984L512 475.8016l84.2752-84.3264A25.6 25.6 0 0 1 640 409.6z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </Svg>
  );
};

IconAPopUpwindowsclose.defaultProps = {
  size: 18,
};

IconAPopUpwindowsclose = React.memo ? React.memo(IconAPopUpwindowsclose) : IconAPopUpwindowsclose;

export default IconAPopUpwindowsclose;
