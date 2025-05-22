import theme from '@/style';
import React from 'react';
import {SvgXml} from 'react-native-svg';

export interface RuleHeaderIconProps {
  width?: number;
  height?: number;
  linear?: [string, string];
}
const RuleHeaderIcon: React.FC<RuleHeaderIconProps> = ({
  width,
  height,
  linear = theme.linearGradientColor.primaryLinearGradient,
}) => {
  const xml = `<svg
    width="218"
    height="32"
    viewBox="0 0 218 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <path
      d="M0 0H218L211.076 4.45134C206.491 7.39847 203.027 11.7973 201.237 16.9448C198.101 25.9587 189.604 32 180.06 32H37.9399C28.3963 32 19.8987 25.9587 16.7634 16.9448C14.973 11.7973 11.5087 7.39847 6.9243 4.45134L0 0Z"
      fill="url(#paint0_linear_4022_9921)"
    />
    <defs>
      <linearGradient
        id="paint0_linear_4022_9921"
        x1="0"
        y1="0"
        x2="9.19634"
        y2="62.6501"
        gradientUnits="userSpaceOnUse">
        <stop stop-color="${linear[0]}" />
        <stop offset="1" stop-color="${linear[1]}" />
      </linearGradient>
    </defs>
  </svg>`;
  return <SvgXml xml={xml} width={width} height={height} />;
};

export default RuleHeaderIcon;
