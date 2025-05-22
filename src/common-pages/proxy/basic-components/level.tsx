import React from 'react';
import {View, StyleProp, ViewStyle} from 'react-native';

import LazyImage, {ImageUrlType} from '@/components/basic/image';
import {vip1Image, vip2Image, vip3Image, vip4Image} from '../proxy.variable';

export interface LevelProps {
  level: number;
  style?: StyleProp<ViewStyle>;
}

const levelOptions: Record<number, ImageUrlType> = {
  1: vip1Image,
  2: vip2Image,
  3: vip3Image,
  4: vip4Image,
};

const Level: React.FC<LevelProps> = props => {
  const {level, style} = props;

  const levelImage = levelOptions[level] || levelOptions[0];

  return (
    <View style={style}>
      {level > 0 && level <= 4 && (
        <LazyImage
          occupancy="#0000"
          width={52}
          height={20}
          imageUrl={levelImage}
        />
      )}
    </View>
  );
};

export default Level;
