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

let IconBankYouzheng: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M667.050667 989.141333l64.426666-281.002666h148.608l18.432-97.536H690.346667l-63.914667 284.416h-378.453333l10.837333-49.578667h332.416l66.005333-287.402667h254.165334l18.304-89.173333H613.973333l-60.330666 280.405333h-272.64l10.922666-41.088h214.528l50.090667-239.317333H338.048l12.970667-51.498667h330.922666l38.101334-147.2h249.386666l19.754667-90.666666h-312.234667l-41.045333 143.658666H367.744l14.378667-55.936h217.088l41.6-137.216h358.229333l19.84-95.146666h-421.077333l-34.730667 143.146666H341.504l-66.389333 290.858667H54.613333L5.12 704.64h226.389333l-59.477333 284.501333h495.018667zM82.901333 609.109333l11.946667-49.536h166.485333l-14.378666 49.536H82.901333z m225.450667 0l10.837333-49.536h164.565334l-10.410667 49.536H308.352z"
        fill={getIconColor(color, 0, '#108C3E')}
      />
    </Svg>
  );
};

IconBankYouzheng.defaultProps = {
  size: 18,
};

IconBankYouzheng = React.memo ? React.memo(IconBankYouzheng) : IconBankYouzheng;

export default IconBankYouzheng;
