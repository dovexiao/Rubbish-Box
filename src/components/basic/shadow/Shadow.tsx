import globalStore from '@/services/global.state';
import {BasicObject} from '@/types';
import React, {useMemo} from 'react';
import {Shadow, ShadowProps} from 'react-native-shadow-2';

export interface BaseBoxShadowItem {
  x: number;
  y: number;
  blur: number;
  color: string;
}

export interface BoxShadowStyle {
  out?: BaseBoxShadowItem;
  inset?: BaseBoxShadowItem;
  radius?: number;
}

export interface BoxShadowProps extends ShadowProps {
  shadowStyle: BoxShadowStyle;
}

const BoxShadow: React.FC<BoxShadowProps> = props => {
  const {shadowStyle, style, ...otherProps} = props;
  const {
    inset = {x: 0, y: 0, blur: 0, color: '#0000'},
    out = {x: 0, y: 0, blur: 0, color: '#0000'},
    radius = 0,
  } = shadowStyle;
  const shadowResult = useMemo(() => {
    const _shadow = {
      startColor: out.color,
      distance: out.blur,
      offset: [out.x, out.y],
      style: [
        {
          borderRadius: radius,
        },
        style,
      ] as BasicObject[],
    } as BasicObject;

    if (globalStore.isWeb) {
      _shadow.distance = 0;
      delete _shadow.offset;
      _shadow.style.push({
        boxShadow: `${inset.x}px ${inset.y}px ${inset.blur}px 0px ${inset.color} inset, ${out.x}px ${out.y}px ${out.blur}px 0px ${out.color}`,
      });
    } else {
      _shadow.style.push({
        borderLeftWidth: inset.x,
        borderTopWidth: inset.y,
        borderTopColor: inset.color,
        borderLeftColor: inset.color,
        backgroundColor: out.color,
      });
    }
    return _shadow;
  }, [
    out.color,
    out.blur,
    out.x,
    out.y,
    radius,
    style,
    inset.x,
    inset.y,
    inset.blur,
    inset.color,
  ]);
  return <Shadow {...shadowResult} {...otherProps} />;
};

export default BoxShadow;
