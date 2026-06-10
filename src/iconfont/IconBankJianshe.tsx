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

let IconBankJianshe: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M657.194667 118.144Q587.008 38.272 521.258667 37.76q157.610667-68.181333 299.52 73.728l150.528 150.528q10.24 8.789333 9.216 13.994667-2.176 10.24-8.106667 20.778666l-68.906667 66.048L657.066667 118.144h0.085333z m295.893333 425.130667q12.8-2.858667 19.029333 1.536c5.973333 4.309333 5.162667 6.528 5.12 9.557333-11.690667 250.538667-218.88 450.048-466.944 450.048-251.733333 0-466.901333-207.872-466.901333-467.413333 0-230.698667 163.541333-424.149333 389.290667-461.354667 25.301333-4.096 90.666667-9.514667 150.186666 49.962667l281.045334 279.637333-96.426667 97.92q-13.653333 12.16-23.125333 9.728-10.197333-2.730667-18.773334-12.672l-208.725333-208.896a9.472 9.472 0 0 0-13.269333 0l-237.354667 236.8a9.472 9.472 0 0 0 0 13.312l236.970667 236.373333a9.344 9.344 0 0 0 13.269333 0l223.146667-222.122666q10.24-8.576 13.909333-10.197334 5.546667-2.517333 18.517333-2.218666H953.088z"
        fill={getIconColor(color, 0, '#0E3484')}
      />
    </Svg>
  );
};

IconBankJianshe.defaultProps = {
  size: 18,
};

IconBankJianshe = React.memo ? React.memo(IconBankJianshe) : IconBankJianshe;

export default IconBankJianshe;
