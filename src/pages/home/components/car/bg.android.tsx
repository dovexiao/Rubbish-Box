import React from 'react';
import {SvgXml} from 'react-native-svg';

const xml = `
<svg
  width="76"
  height="76"
  viewBox="0 0 76 76"
  version="1.1"
  xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="RadialGradient1">
      <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
      <stop offset="100%" stopColor="rgba(255,255,255,0)" />
    </radialGradient>
  </defs>

  <circle cx="38" cy="38" r="38" fill="url(#RadialGradient1)" />
</svg>
`;

export default () => <SvgXml xml={xml} width={76} height={76} />;
