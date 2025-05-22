import theme from '@/style';
import React from 'react';
import {SvgXml} from 'react-native-svg';
const okSvg = `
<svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none">
    <path
      d="M1.99968 7.33358L5.85153 11.4817L13.333 4.00024"
      stroke="white"
      stroke-width="2.66667"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
`;
export default () => (
  <SvgXml xml={okSvg} width={theme.iconSize.l} height={theme.iconSize.l} />
);
