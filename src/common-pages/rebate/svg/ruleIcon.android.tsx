import theme from '@/style';
import React from 'react';
import {SvgXml} from 'react-native-svg';
const ruleSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M22.0796 5.70462L16.4211 0H3.8457C2.74113 0 1.8457 0.895431 1.8457 2V22C1.8457 23.1046 2.74113 24 3.8457 24H20.1534C21.258 24 22.1534 23.1046 22.1534 22V5.70462H22.0796ZM19.4672 5.70462H16.4303V2.64923L19.4672 5.70462ZM20.3047 21.1513C20.3061 21.7046 19.858 22.1538 19.3047 22.1538H4.69186C4.13957 22.1538 3.69186 21.7061 3.69186 21.1538V2.84615C3.69186 2.29387 4.13957 1.84615 4.69186 1.84615H14.5842V7.51385H20.2703L20.3047 21.1513Z" fill="#ffffff"/>
  <path d="M6.41504 11.9169H12.1289V13.763H6.41504V11.9169ZM6.41504 17.363H17.852V19.2092H6.41504V17.363Z" fill="#ffffff"/>
</svg>
`;
export default () => (
  <SvgXml xml={ruleSvg} width={theme.iconSize.l} height={theme.iconSize.l} />
);
