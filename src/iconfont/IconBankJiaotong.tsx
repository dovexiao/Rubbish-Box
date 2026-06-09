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

let IconBankJiaotong: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M799.786667 760.362667c-58.325333 1.877333-112.213333 3.754667-170.581334 5.632-36.906667 157.098667-342.314667 114.688-308.309333-84.650667 17.109333-118.101333 176.64-169.685333 275.669333-80.512 21.76 24.576 32.426667 47.445333 39.424 97.450667 48.896-1.92 114.901333-3.754667 163.84-5.674667 2.432-253.994667-286.08-382.933333-502.442666-259.626667-207.402667 118.186667-183.466667 478.165333 33.877333 570.112v5.632c-118.528-2.346667-248.490667-94.122667-276.821333-203.178666l1.621333-585.642667C150.186667 155.904 254.122667 79.232 348.202667 15.274667l11.264 5.632c-6.485333 88.32-2.389333 233.813333 2.816 340.096 59.008-57.173333 98.645333-117.034667 200.448-136.874667 65.578667-12.8 128.341333-5.12 167.893333 8.448 297.216 101.845333 315.733333 485.930667 63.530667 618.112-5.674667 0-17.92 11.093333-27.306667 12.970667 0-1.92 5.888-10.069333 10.368-18.602667l22.613333-84.693333z"
        fill={getIconColor(color, 0, '#1D2087')}
      />
    </Svg>
  );
};

IconBankJiaotong.defaultProps = {
  size: 18,
};

IconBankJiaotong = React.memo ? React.memo(IconBankJiaotong) : IconBankJiaotong;

export default IconBankJiaotong;
