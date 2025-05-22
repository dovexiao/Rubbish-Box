import theme from '@/style';
import {SVGProps} from '@/types';
import React from 'react';
import {SvgXml} from 'react-native-svg';
const MeSvg = ({color, width, height}: SVGProps) => {
  const SGV = React.useMemo(
    () => `
    <svg
      viewBox="0 0 24 24"
      fill="${color || theme.basicColor.primary}"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12.001 2.99805C7.02883 2.99805 2.99799 7.02889 2.99799 12.0011C2.99799 16.9732 7.02883 21.0021 11.999 21.0021C16.9692 21.0021 21 16.9712 21 12.0011C21 7.0309 16.9732 2.99805 12.001 2.99805ZM12.001 16.9109C9.4405 16.9109 7.33858 14.9518 7.1113 12.4516C7.08917 12.2103 7.27824 12.0011 7.52162 12.0011H16.4804C16.7218 12.0011 16.9128 12.2103 16.8907 12.4516C16.6634 14.9518 14.5595 16.9109 12.001 16.9109Z"
      />
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

export default MeSvg;
