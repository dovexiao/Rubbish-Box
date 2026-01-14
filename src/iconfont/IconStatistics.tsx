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

let IconStatistics: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 964.266667c249.770667 0 452.266667-202.496 452.266667-452.266667 0-249.770667-202.496-452.266667-452.266667-452.266667C262.229333 59.733333 59.733333 262.229333 59.733333 512c0 249.770667 202.496 452.266667 452.266667 452.266667z m0-819.2a366.933333 366.933333 0 1 1 0 733.866666 366.933333 366.933333 0 0 1 0-733.866666z"
        fill={getIconColor(color, 0, '#333333')}
      />
      <Path
        d="M759.466667 409.6a42.666667 42.666667 0 0 1-10.794667 28.330667l-155.434667 174.933333q-14.250667 16-35.712 16-21.461333 0-35.712-16.042667l-78.08-87.808-104.661333 117.76a42.666667 42.666667 0 1 1-63.744-56.746666l132.693333-149.248q14.250667-16.042667 35.712-16.042667 21.461333 0 35.712 16.042667l78.08 87.808 127.36-143.317334A42.666667 42.666667 0 0 1 759.466667 409.6z"
        fill={getIconColor(color, 1, '#333333')}
      />
    </Svg>
  );
};

IconStatistics.defaultProps = {
  size: 18,
};

IconStatistics = React.memo ? React.memo(IconStatistics) : IconStatistics;

export default IconStatistics;
