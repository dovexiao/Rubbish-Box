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

let IconBankGongshang: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M794.154667 547.84v222.421333h-246.186667v-71.893333h167.552v-82.048h-167.594667V394.069333h167.594667V318.72h-167.594667V246.784h246.186667v222.293333h-167.552v75.306667h167.594667v3.498667zM512 10.666667C788.906667 10.666667 1013.333333 235.093333 1013.333333 512S788.906667 1013.333333 512 1013.333333 10.666667 788.906667 10.666667 512 235.093333 10.666667 512 10.666667z m0 99.413333c-221.994667 0-401.834667 179.925333-401.834667 401.92A401.792 401.792 0 0 0 512 913.877333 401.834667 401.834667 0 0 0 913.877333 512c0-221.994667-179.882667-401.92-401.834666-401.92H512z m-36.181333 136.704V318.72H308.266667v75.349333h167.552v222.250667H308.266667v82.048h167.552v71.893333H229.717333V544.426667H397.226667v-75.349334H229.717333V246.784h246.186667-0.085333z"
        fill={getIconColor(color, 0, '#D62629')}
      />
    </Svg>
  );
};

IconBankGongshang.defaultProps = {
  size: 18,
};

IconBankGongshang = React.memo ? React.memo(IconBankGongshang) : IconBankGongshang;

export default IconBankGongshang;
