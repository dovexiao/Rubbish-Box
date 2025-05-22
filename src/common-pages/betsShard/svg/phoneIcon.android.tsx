import theme from '@/style';
import React from 'react';
import {SvgXml} from 'react-native-svg';
const okSvg = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M17.1923 2.25H6.80769C5.9474 2.25 5.25 2.90478 5.25 3.7125V20.2875C5.25 21.0952 5.9474 21.75 6.80769 21.75H17.1923C18.0526 21.75 18.75 21.0952 18.75 20.2875V3.7125C18.75 2.90478 18.0526 2.25 17.1923 2.25Z" stroke="#262626" stroke-width="2"/>
<path d="M10.9609 5.32812H13.0379" stroke="#262626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9.92285 18.6719H14.0767" stroke="#262626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;
export default () => (
  <SvgXml xml={okSvg} width={theme.iconSize.l} height={theme.iconSize.l} />
);
