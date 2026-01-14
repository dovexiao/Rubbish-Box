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

let IconPark1: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M614.4 631.5008H409.6a25.6 25.6 0 0 1 0-51.2h204.8a25.6 25.6 0 0 1 0 51.2z"
        fill={getIconColor(color, 0, '#333333')}
      />
      <Path
        d="M205.5168 385.6896l14.4384-38.8096h-28.16a25.6 25.6 0 0 1 0-51.2h47.2576l17.7152-47.6672A102.4 102.4 0 0 1 352.768 181.3504h318.5152a102.4 102.4 0 0 1 95.9488 66.56l17.7152 47.5136H819.2a25.6 25.6 0 0 1 0 51.2h-15.1552l13.824 37.12 0.768 1.9456H819.2a102.4 102.4 0 0 1 102.4 102.4V716.8a51.2 51.2 0 0 1-51.1488 51.2v-54.8864H870.4V488.0896q0-21.1968-15.0016-36.1984T819.2 436.8896h-34.7136l-21.9136-54.9376-43.3152-116.1216q-5.632-15.0016-18.7392-24.1664-13.1584-9.1136-29.184-9.1136H352.768q-16.0768 0-29.2352 9.1136-13.1584 9.216-18.7904 24.2176l-43.8784 117.8624h501.9136l21.1456 53.1456H204.8q-21.1968 0-36.1984 15.0016T153.6 488.0896V716.8h716.3392v51.2H844.8v28.3136a25.6 25.6 0 0 1-51.2 0V768h-563.2v28.3136a25.6 25.6 0 0 1-51.2 0V768H153.6a51.2 51.2 0 0 1-51.2-51.2V488.0896a102.4 102.4 0 0 1 102.4-102.4h0.7168z"
        fill={getIconColor(color, 1, '#333333')}
      />
    </Svg>
  );
};

IconPark1.defaultProps = {
  size: 18,
};

IconPark1 = React.memo ? React.memo(IconPark1) : IconPark1;

export default IconPark1;
