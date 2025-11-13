import React from 'react';
import Svg, {Path} from 'react-native-svg';

interface SearchIconProps {
  size: number;
  color?: string;
}

const SearchIcon: React.FC<SearchIconProps> = ({
  size = 40,
  color = '#8a8a8a',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 1024 1024">
      <Path
        d="M960 896l-204.224-204.48a47.104 47.104 0 0 0-14.848-10.112 383.776 383.776 0 0 0 83.008-238.848c0-212.8-172.544-385.28-385.408-385.28-212.736 0-385.344 172.48-385.344 385.344 0 212.8 172.544 385.216 385.344 385.216a383.36 383.36 0 0 0 239.04-83.008c2.432 5.376 5.76 10.432 10.176 14.784l204.096 204.544a48.256 48.256 0 0 0 68.096 0c18.88-18.816 18.88-49.28 0.064-68.16z m-521.536-164.48c-159.552 0-288.96-129.344-288.96-288.96s129.344-289.024 288.96-289.024c159.68 0 289.024 129.408 289.024 289.024s-129.344 288.96-289.024 288.96z"
        fill={color}
      />
    </Svg>
  );
};

export default SearchIcon;
