import theme from '@/style';
import {SVGProps} from '@/types';
import React from 'react';

const ResultSvg = ({color, width, height}: SVGProps) => (
  <svg
    width={width || theme.iconSize.l}
    height={height || theme.iconSize.l}
    viewBox="0 0 24 24"
    fill={color || theme.basicColor.primary}
    xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3 5C3 3.89543 3.89543 3 5 3H14.05V7.19096C12.8254 8.24544 12.05 9.80716 12.05 11.55C12.05 14.7256 14.6244 17.3 17.8 17.3C17.8669 17.3 17.9336 17.2988 18 17.2966V19C18 20.1046 17.1046 21 16 21H5C3.89543 21 3 20.1046 3 19V5ZM5.75 15V13H9.75V15H5.75ZM7.75 8H5.75V10H7.75V8ZM17.5 16C19.9853 16 22 13.9853 22 11.5C22 9.01472 19.9853 7 17.5 7C15.0147 7 13 9.01472 13 11.5C13 13.9853 15.0147 16 17.5 16ZM18.2435 10.5266L17.5 8.8L16.7565 10.5266L14.8846 10.7002L16.2969 11.9409L15.8836 13.7748L17.5 12.815L19.1164 13.7748L18.7031 11.9409L20.1154 10.7002L18.2435 10.5266ZM15.25 4C15.25 3.44772 15.6977 3 16.25 3H19.25C19.8023 3 20.25 3.44772 20.25 4V6.7358C19.441 6.26783 18.5018 6 17.5 6C16.6984 6 15.9368 6.17149 15.25 6.47979V4Z"
    />
  </svg>
);

export default ResultSvg;
