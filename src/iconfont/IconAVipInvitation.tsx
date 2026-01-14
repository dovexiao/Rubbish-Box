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

let IconAVipInvitation: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M652.8 278.592H371.2a32 32 0 0 1 0-64h281.6a32 32 0 0 1 0 64zM558.912 423.936H371.136a32 32 0 0 1 0-64h187.776a32 32 0 0 1 0 64z"
        fill={getIconColor(color, 0, '#333333')}
      />
      <Path
        d="M151.488 412.288V132.288q0-30.976 21.888-52.8Q195.2 57.6 226.176 57.6h571.712q30.912 0 52.8 21.888 21.888 21.824 21.888 52.8l-0.064 279.424-67.008 29.504q3.008-2.816 3.008-7.552v-301.44q0-4.352-3.072-7.488-3.136-3.2-7.552-3.2H226.176q-10.688 0-10.688 10.752v301.376q0 6.784 6.144 9.6l21.888 10.24 263.936 120.96q2.112 1.024 4.224 1.024v74.048l-295.04-137.92-80-36.672q-5.312-2.432-10.24 0.704-4.928 3.2-4.928 8.96v364.48q0 22.08 15.68 37.696 15.616 15.616 37.696 15.616h674.112q22.08 0 37.76-15.616 15.552-15.616 15.552-37.76V484.672q0-5.76-4.864-8.96-4.928-3.2-10.24-0.704l-68.608 31.424-292.928 136.96-13.312 6.272V575.488q1.984-0.064 4.032-0.96l275.328-126.208 10.368-4.864 71.296-31.424q30.208-8.448 58.624 9.728 34.304 22.08 34.304 62.848v364.48q0 48.64-34.368 82.944-34.368 34.368-82.944 34.368H174.848q-48.64 0-83.008-34.368-34.368-34.368-34.368-82.944V484.608q0-40.768 34.368-62.848 28.8-18.496 59.648-9.472z"
        fill={getIconColor(color, 1, '#333333')}
      />
    </Svg>
  );
};

IconAVipInvitation.defaultProps = {
  size: 18,
};

IconAVipInvitation = React.memo ? React.memo(IconAVipInvitation) : IconAVipInvitation;

export default IconAVipInvitation;
