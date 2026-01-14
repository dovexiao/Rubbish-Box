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

let IconAPowermanagement: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M793.161143 260.498286v539.721143q0 51.236571-36.205714 87.478857-36.205714 36.205714-87.442286 36.205714H354.669714q-51.2 0-87.442285-36.205714-36.205714-36.205714-36.205715-87.478857V275.419429q0-51.273143 36.205715-87.478858t87.442285-36.205714h329.691429q45.092571 0 76.946286 31.817143 31.853714 31.890286 31.853714 76.946286z m-54.857143 539.721143V260.498286q0-22.308571-15.798857-38.144-15.798857-15.798857-38.144-15.798857H354.669714q-28.525714 0-48.64 20.150857-20.187429 20.187429-20.187428 48.676571v524.836572q0 28.525714 20.187428 48.676571 20.114286 20.150857 48.64 20.150857h314.843429q28.489143 0 48.64-20.150857t20.150857-48.64z"
        fill={getIconColor(color, 0, '#333333')}
      />
      <Path
        d="M576 304.896a27.428571 27.428571 0 0 1-4.022857 14.336l-109.421714 178.578286h141.348571q18.212571 0 27.099429 15.908571 8.923429 15.872-0.585143 31.451429l-131.584 214.747428a27.428571 27.428571 0 0 1-46.811429-28.672l109.421714-178.578285h-141.348571q-18.212571 0-27.099429-15.908572-8.923429-15.872 0.585143-31.451428l131.584-214.710858a27.428571 27.428571 0 0 1 50.834286 14.299429z"
        fill={getIconColor(color, 1, '#333333')}
      />
      <Path
        d="M374.272 114.870857V111.542857c0-26.587429 21.577143-48.128 48.128-48.128h178.761143c26.587429 0 48.128 21.577143 48.128 48.128v3.328h-275.017143z"
        fill={getIconColor(color, 2, '#333333')}
      />
    </Svg>
  );
};

IconAPowermanagement.defaultProps = {
  size: 18,
};

IconAPowermanagement = React.memo ? React.memo(IconAPowermanagement) : IconAPowermanagement;

export default IconAPowermanagement;
