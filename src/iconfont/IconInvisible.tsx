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

let IconInvisible: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M884.736 830.464l-716.8-716.8a38.4 38.4 0 1 0-54.272 54.272l716.8 716.8a38.4 38.4 0 1 0 54.272-54.272z"
        fill={getIconColor(color, 0, '#333333')}
      />
      <Path
        d="M278.3232 224Q378.0096 166.4 512 166.4q290.6624 0 419.84 271.0528 35.84 75.1104-3.7888 148.6848-53.8112 99.9936-124.416 163.1744l-54.9376-54.8864q63.3856-54.8864 111.7184-144.6912 21.1456-39.2704 2.0992-79.2576Q754.176 243.2 512 243.2q-99.3792 0-176.2304 38.2976L278.3232 224z m180.224 180.224l-48.7424-48.6912a186.88 186.88 0 0 1 258.6624 258.6624l-48.64-48.6912a120.32 120.32 0 0 0-161.28-161.28zM512 857.6q120.1152 0 215.7056-53.76l-57.4976-57.4976q-71.68 34.4576-158.208 34.4576-224 0-348.416-231.0656-21.1456-39.2704-2.0992-79.2576 39.5776-83.0464 97.0752-135.7824L203.6224 279.7568Q137.7792 341.7088 92.16 437.4528q-35.84 75.1104 3.7888 148.6848Q242.176 857.6 512 857.6zM391.68 512c0-13.312 2.1504-26.112 6.144-38.0416l-50.432-50.4832a186.88 186.88 0 0 0 253.1328 253.1328l-50.432-50.432A120.32 120.32 0 0 1 391.68 512z"
        fill={getIconColor(color, 1, '#333333')}
      />
    </Svg>
  );
};

IconInvisible.defaultProps = {
  size: 18,
};

IconInvisible = React.memo ? React.memo(IconInvisible) : IconInvisible;

export default IconInvisible;
