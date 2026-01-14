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

let IconSearch: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M682.56 727.808a320 320 0 1 1 45.248-45.248l126.784 126.848a32 32 0 1 1-45.248 45.248l-126.784-126.848zM736 480a256 256 0 1 0-512 0 256 256 0 0 0 512 0z"
        fill={getIconColor(color, 0, '#999999')}
      />
    </Svg>
  );
};

IconSearch.defaultProps = {
  size: 18,
};

IconSearch = React.memo ? React.memo(IconSearch) : IconSearch;

export default IconSearch;
