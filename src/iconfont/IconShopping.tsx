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

let IconShopping: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M166.0928 246.4256q3.7376-52.736 42.496-88.7808 38.656-36.0448 91.5456-36.0448h423.7312q52.8896 0 91.5968 36.0448t42.496 88.7808l36.5056 512q4.1984 58.368-35.6864 101.1712-39.8336 42.8032-98.3552 42.8032H263.5776q-58.5216 0-98.3552-42.8032-39.8848-42.8032-35.6864-101.1712l36.5568-512z m63.8464 4.5568l-36.608 512q-2.1504 30.5664 18.7392 52.992 20.8384 22.4256 51.5072 22.4256h496.8448q30.6688 0 51.5072-22.4256 20.8896-22.4256 18.7392-52.992l-36.608-512q-1.9456-27.648-22.2208-46.4896-20.2752-18.8928-47.9744-18.8928H300.1344q-27.648 0-47.9744 18.8928-20.2752 18.8416-22.2208 46.4896z"
        fill={getIconColor(color, 0, '#333333')}
      />
      <Path
        d="M397.6704 391.2704a51.2 51.2 0 1 0-62.976 12.544q11.264 47.9232 48.4864 85.0944Q436.5312 542.3104 512 542.3104t128.8192-53.4016q37.1712-37.1712 48.4864-85.0944a51.2 51.2 0 1 0-62.976-12.5952q-7.68 29.3888-30.72 52.48-34.6624 34.6112-83.6096 34.6112t-83.5584-34.6112q-23.04-23.04-30.72-52.4288z"
        fill={getIconColor(color, 1, '#333333')}
      />
    </Svg>
  );
};

IconShopping.defaultProps = {
  size: 18,
};

IconShopping = React.memo ? React.memo(IconShopping) : IconShopping;

export default IconShopping;
