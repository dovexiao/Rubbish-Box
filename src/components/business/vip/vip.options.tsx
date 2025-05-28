import Tag from '@basicComponents/tag';
import LazyImage, {
  ImageUrlType,
  LazyImageBackground,
} from '@basicComponents/image';
import React, {ReactNode} from 'react';
import {View} from 'react-native';
import {designToDp} from '@utils';

export interface VipOptions {
  sign: ImageUrlType;
  small: ImageUrlType;
}

export const vipBgColors = [
  ['#E2BB60', '#FB9B7BFF'],
  ['#E2BB60', '#53A7FFFF'],
  ['#E2BB60', '#BC2FFFFF'],
  ['#E2BB60', '#4F8AF4FF'],
  ['#E2BB60', '#FB9B7BFF'],
  ['#E2BB60', '#FDC304FF'],
  ['#E2BB60', '#CF5B61FF'],
  ['#E2BB60', '#079F74FF'],
  ['#E2BB60', '#7657E5FF'],
  ['#E2BB60', '#00BEB9FF'],
];

export const vipColors = [
  '#E2BB60',
  '#E2BB60',
  '#E2BB60',
  '#E2BB60',
  '#E2BB60',
  '#E2BB60',
  '#E2BB60',
  '#E2BB60',
  '#E2BB60',
  '#E2BB60',
];

export const vipOptionsMap: VipOptions[] = [
  {
    sign: require('@assets/icons/vip/sign/v0.webp'),
    small: require('@assets/icons/vip/small/v0.webp'),
  },
  {
    sign: require('@assets/icons/vip/sign/v1.webp'),
    small: require('@assets/icons/vip/small/v1.webp'),
  },
  {
    sign: require('@assets/icons/vip/sign/v2.webp'),
    small: require('@assets/icons/vip/small/v2.webp'),
  },
  {
    sign: require('@assets/icons/vip/sign/v3.webp'),
    small: require('@assets/icons/vip/small/v3.webp'),
  },
  {
    sign: require('@assets/icons/vip/sign/v4.webp'),
    small: require('@assets/icons/vip/small/v4.webp'),
  },
  {
    sign: require('@assets/icons/vip/sign/v5.webp'),
    small: require('@assets/icons/vip/small/v5.webp'),
  },
  {
    sign: require('@assets/icons/vip/sign/v6.webp'),
    small: require('@assets/icons/vip/small/v6.webp'),
  },
  {
    sign: require('@assets/icons/vip/sign/v7.webp'),
    small: require('@assets/icons/vip/small/v7.webp'),
  },
  {
    sign: require('@assets/icons/vip/sign/v8.webp'),
    small: require('@assets/icons/vip/small/v8.webp'),
  },
  {
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
