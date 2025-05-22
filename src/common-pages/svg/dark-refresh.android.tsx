import theme from '@/style';
import React from 'react';
import {SvgXml} from 'react-native-svg';

const xml = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
<circle cx="14" cy="14" r="14" fill="black" fill-opacity="0.3"/>
<path d="M20.2998 8.3999V13.9999" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M7.69922 14.0005V19.6005" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M20.2992 14.0002C20.2992 10.5208 17.4786 7.7002 13.9992 7.7002C12.2193 7.7002 10.6118 8.43833 9.46605 9.6252M7.69922 14.0002C7.69922 17.4796 10.5198 20.3002 13.9992 20.3002C15.6987 20.3002 17.241 19.6273 18.3742 18.5334" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export default () => (
  <SvgXml xml={xml} width={theme.iconSize.xl} height={theme.iconSize.xl} />
);
