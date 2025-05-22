import theme from '@/style';
import {SVGProps} from '@/types';
import React from 'react';
import {SvgXml} from 'react-native-svg';

const SelectedSvg = ({color, width, height}: SVGProps) => {
  const SGV = React.useMemo(
    () => `
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M1.5 5.5L4.38889 8.61111L10 3" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>

    
  `,
    [color],
  );
  return (
    <SvgXml
      xml={SGV}
      width={width || theme.iconSize.l}
      height={height || theme.iconSize.l}
    />
  );
};

export default SelectedSvg;
