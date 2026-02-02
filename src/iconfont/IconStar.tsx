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

let IconStar: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M657.2544 316.416a102.4 102.4 0 0 0 50.3296 50.3296l113.7152 52.224c79.5648 36.5056 79.5648 149.5552 0 186.112l-113.664 52.224a102.4 102.4 0 0 0-50.3808 50.2784l-52.224 113.7152c-36.5056 79.5648-149.5552 79.5648-186.112 0l-52.224-113.664a102.4 102.4 0 0 0-50.2784-50.3808l-113.7152-52.224c-79.5648-36.5056-79.5648-149.5552 0-186.112l113.664-52.224a102.4 102.4 0 0 0 50.3808-50.2784l52.224-113.7152c36.5056-79.5648 149.5552-79.5648 186.112 0l52.224 113.664z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </Svg>
  );
};

IconStar.defaultProps = {
  size: 18,
};

IconStar = React.memo ? React.memo(IconStar) : IconStar;

export default IconStar;
