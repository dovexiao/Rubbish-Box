import React from 'react';
import Svg, {Path} from 'react-native-svg';

interface StarIconProps {
  size?: number;
  color?: string;
}

const StarIcon: React.FC<StarIconProps> = ({size = 40, color = '#01875f'}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 1024 1024">
      <Path
        d="M458.752 81.237333c16.768-51.413333 89.728-51.413333 106.453333 0L650.24 342.186667h275.072c54.186667 0 76.757333 69.205333 32.853333 100.992l-222.464 161.28 84.992 260.906666c16.725333 51.456-42.24 94.208-86.144 62.421334L512 766.464l-222.506667 161.28c-43.861333 31.786667-102.869333-10.965333-86.144-62.421333l84.992-260.906667-222.506666-161.28c-43.861333-31.786667-21.333333-100.992 32.896-100.992H373.76l84.992-260.906667z"
        fill={color}
      />
    </Svg>
  );
};

export default StarIcon;
