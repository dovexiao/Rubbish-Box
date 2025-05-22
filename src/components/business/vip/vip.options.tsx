import Tag from '@basicComponents/tag';
import LazyImage, {
  ImageUrlType,
  LazyImageBackground,
} from '@basicComponents/image';
import React, {ReactNode} from 'react';
import {View} from 'react-native';
import {designToDp} from '@utils';

export interface VipOptions {
  background: ImageUrlType;
  sign: ImageUrlType;
  small: ImageUrlType;
}

export const vipBgColors = [
  ['#9A007AFF', '#FB9B7BFF'],
  ['#006DEDFF', '#53A7FFFF'],
  ['#5B00B4FF', '#BC2FFFFF'],
  ['#4612BAFF', '#4F8AF4FF'],
  ['#A22941FF', '#FB9B7BFF'],
  ['#E66644FF', '#FDC304FF'],
  ['#7E037BFF', '#CF5B61FF'],
  ['#004F74FF', '#079F74FF'],
  ['#442AC5FF', '#7657E5FF'],
  ['#175EC6FF', '#00BEB9FF'],
];

export const vipColors = [
  '#9A007AFF',
  '#006DEDFF',
  '#5B00B4FF',
  '#4612BAFF',
  '#A22941FF',
  '#E66644FF',
  '#7E037BFF',
  '#004F74FF',
  '#442AC5FF',
  '#175EC6FF',
];

export const vipOptionsMap: VipOptions[] = [
  {
    background: require('@components/assets/icons/vip/background/v0.webp'),
    sign: require('@assets/icons/vip/sign/v0.webp'),
    small: require('@assets/icons/vip/small/v0.webp'),
  },
  {
    background: require('@components/assets/icons/vip/background/v1.webp'),
    sign: require('@assets/icons/vip/sign/v1.webp'),
    small: require('@assets/icons/vip/small/v1.webp'),
  },
  {
    background: require('@components/assets/icons/vip/background/v2.webp'),
    sign: require('@assets/icons/vip/sign/v2.webp'),
    small: require('@assets/icons/vip/small/v2.webp'),
  },
  {
    background: require('@components/assets/icons/vip/background/v3.webp'),
    sign: require('@assets/icons/vip/sign/v3.webp'),
    small: require('@assets/icons/vip/small/v3.webp'),
  },
  {
    background: require('@components/assets/icons/vip/background/v4.webp'),
    sign: require('@assets/icons/vip/sign/v4.webp'),
    small: require('@assets/icons/vip/small/v4.webp'),
  },
  {
    background: require('@components/assets/icons/vip/background/v5.webp'),
    sign: require('@assets/icons/vip/sign/v5.webp'),
    small: require('@assets/icons/vip/small/v5.webp'),
  },
  {
    background: require('@components/assets/icons/vip/background/v6.webp'),
    sign: require('@assets/icons/vip/sign/v6.webp'),
    small: require('@assets/icons/vip/small/v6.webp'),
  },
  {
    background: require('@components/assets/icons/vip/background/v7.webp'),
    sign: require('@assets/icons/vip/sign/v7.webp'),
    small: require('@assets/icons/vip/small/v7.webp'),
  },
  {
    background: require('@components/assets/icons/vip/background/v8.webp'),
    sign: require('@assets/icons/vip/sign/v8.webp'),
    small: require('@assets/icons/vip/small/v8.webp'),
  },
  {
    background: require('@components/assets/icons/vip/background/v9.webp'),
    sign: require('@assets/icons/vip/sign/v9.webp'),
    small: require('@assets/icons/vip/small/v9.webp'),
  },
];

export const maxVipLevel = 9;
const backgroundWidth = 335;
const backgroundHeight = 184;
const defaultSignWidth = 80;
const defaultSignHeight = 72;
const smallWidth = 82;
const smallHeight = 32;

export function createVipBadge(vipLevel: number) {
  if (vipLevel > maxVipLevel || vipLevel < 0) {
    return <View />;
  }
  return (
    <Tag
      type={'badge'}
      badgeSize={18}
      backgroundColor={vipColors[vipLevel]}
      content={`V${vipLevel}`}
    />
  );
}

type VipSize = 'small' | 'large';

export type VipRenderType = {
  backgroundFn: (children: ReactNode, width: number) => React.JSX.Element;
  sign: (size: VipSize) => React.JSX.Element;
  smallFn: (height?: number) => React.JSX.Element;
  badge: React.JSX.Element;
};

export function getVipRender(vipLevel: number): VipRenderType {
  let level = vipLevel;
  if (level < 0) {
    level = 0;
  }
  if (level > maxVipLevel) {
    level = maxVipLevel;
  }
  const currentVipOption = vipOptionsMap[level];

  return {
    backgroundFn: (children: ReactNode, width: number) => (
      <LazyImageBackground
        occupancy="#0000"
        imageUrl={currentVipOption.background}
        width={width}
        height={(width / backgroundWidth) * backgroundHeight}>
        {children}
      </LazyImageBackground>
    ),
    sign: (size: VipSize) => {
      const widthMap: Record<VipSize, number> = {
        small: 54,
        large: 80,
      };
      return (
        <LazyImage
          occupancy="#0000"
          imageUrl={currentVipOption.sign}
          width={designToDp(widthMap[size])}
          height={designToDp(
            (widthMap[size] / defaultSignWidth) * defaultSignHeight,
          )}
        />
      );
    },
    smallFn: (height: number = smallHeight) => (
      <LazyImage
        occupancy="#0000"
        imageUrl={currentVipOption.small}
        width={(height / smallHeight) * smallWidth}
        height={height}
      />
    ),
    badge: createVipBadge(level),
  };
}
