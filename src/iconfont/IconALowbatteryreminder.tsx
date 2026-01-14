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

let IconALowbatteryreminder: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M697.6 732.16v84.565333q0 55.68-39.381333 95.018667-39.338667 39.381333-95.018667 39.381333H256q-55.68 0-95.018667-39.381333-39.381333-39.338667-39.381333-95.018667V273.578667q0-55.68 39.381333-95.061334Q200.32 139.093333 256 139.093333h324.736q48.426667 0 82.645333 34.218667 34.218667 34.261333 34.218667 82.645333a32 32 0 1 1-64 0q0-21.888-15.488-37.376t-37.376-15.488H256q-29.141333 0-49.792 20.650667-20.608 20.608-20.608 49.749333v543.189334q0 29.141333 20.608 49.792 20.650667 20.608 49.792 20.608h307.2q29.141333 0 49.792-20.608 20.608-20.650667 20.608-49.792v-84.608a32 32 0 0 1 64 0z"
        fill={getIconColor(color, 0, '#333333')}
      />
      <Path
        d="M697.6 748.714667v-16.554667a32 32 0 1 0-64 0v10.325333a262.485333 262.485333 0 0 1-5.76-510.762666q5.76 10.965333 5.76 24.32a32 32 0 0 0 64 0q0-16.896-4.181333-32a262.4 262.4 0 0 1 4.181333 524.672z m192-262.314667a198.4 198.4 0 1 0-396.8 0 198.4 198.4 0 0 0 396.8 0z"
        fill={getIconColor(color, 1, '#333333')}
      />
      <Path
        d="M256 109.909333V102.4a51.2 51.2 0 0 1 51.2-51.2H512a51.2 51.2 0 0 1 51.2 51.2v7.509333H256zM263.893333 855.210667a51.2 51.2 0 0 1-51.2-51.2V743.253333h393.813334v60.757334a51.2 51.2 0 0 1-51.2 51.2h-291.413334z"
        fill={getIconColor(color, 2, '#333333')}
      />
      <Path
        d="M659.2 368.512a32 32 0 1 1 64 0V486.4a32 32 0 1 1-64 0V368.512z"
        fill={getIconColor(color, 3, '#333333')}
      />
      <Path
        d="M650.752 585.6a40.448 40.448 0 1 0 80.896 0 40.448 40.448 0 1 0-80.896 0Z"
        fill={getIconColor(color, 4, '#333333')}
      />
    </Svg>
  );
};

IconALowbatteryreminder.defaultProps = {
  size: 18,
};

IconALowbatteryreminder = React.memo ? React.memo(IconALowbatteryreminder) : IconALowbatteryreminder;

export default IconALowbatteryreminder;
