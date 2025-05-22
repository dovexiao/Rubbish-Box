import theme from '@/style';
import React from 'react';
import {SvgXml} from 'react-native-svg';

const xml = `<svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M10.25 21.5C10.25 22.7426 11.2574 23.75 12.5 23.75C13.7426 23.75 14.75 22.7426 14.75 21.5V14.75H21.5C22.7426 14.75 23.75 13.7426 23.75 12.5C23.75 11.2574 22.7426 10.25 21.5 10.25H14.75V3.5C14.75 2.25736 13.7426 1.25 12.5 1.25C11.2574 1.25 10.25 2.25736 10.25 3.5V10.25H3.5C2.25736 10.25 1.25 11.2574 1.25 12.5C1.25 13.7426 2.25736 14.75 3.5 14.75H10.25V21.5Z" fill=${theme.basicColor.primary}/>
</svg>
`;

const iconSize = 25;

export default () => <SvgXml xml={xml} width={iconSize} height={iconSize} />;
