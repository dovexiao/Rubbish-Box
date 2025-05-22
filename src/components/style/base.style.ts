import {StyleSheet, Platform} from 'react-native';
import {
  backgroundColor,
  fontColor,
  fontSize,
  basicColor,
  borderRadiusSize,
  iconSize,
  imageSize,
  borderColor,
} from './base.variable';
import globalStore from '@/services/global.state';

export const fill = StyleSheet.create({
  fillW: {
    width: '100%',
  },
  fillH: {
    height: '100%',
  },
  fill: {
    height: '100%',
    width: '100%',
  },
});

export const position = StyleSheet.create({
  rel: {
    position: 'relative',
  },
  abs: {
    position: 'absolute',
  },
});

export const overflow = StyleSheet.create({
  hidden: {
    overflow: 'hidden',
  },
  visible: {
    overflow: 'visible',
  },
});

export const flex = StyleSheet.create({
  flex: {
    display: 'flex',
  },
  col: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
  start: {
    justifyContent: 'flex-start',
  },
  end: {
    justifyContent: 'flex-end',
  },
  alignStart: {
    alignItems: 'flex-start',
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  centerByCol: {
    alignItems: 'center',
  },
  centerByRow: {
    justifyContent: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  around: {
    justifyContent: 'space-around',
  },
  between: {
    justifyContent: 'space-between',
  },
  wrap: {
    flexWrap: 'wrap',
  },
  flex1: {
    flex: 1,
    ...overflow.hidden,
  },
  flex1NoHidden: {
    flex: 1,
  },
  flex2: {
    flex: 2,
    ...overflow.hidden,
  },
  flex3: {
    flex: 3,
    ...overflow.hidden,
  },
  flex4: {
    flex: 4,
    ...overflow.hidden,
  },
  shrink0: {
    flexShrink: 0,
  },
  basis0: {
    flexBasis: 0,
  },
});

export const font = StyleSheet.create({
  ...Object.entries(fontColor ?? {}).reduce((acc, [key, value]) => {
    return Object.assign(acc, {
      [`${key}`]: {
        color: value,
      },
    });
  }, {} as any),
  ...Object.entries(fontSize ?? {}).reduce((acc, [key, value]) => {
    return Object.assign(acc, {
      [`${key}`]: {
        fontSize: value,
      },
    });
  }, {} as any),
  bold: {
    fontWeight: 'bold',
  },
  fontDin: {
    fontFamily: 'din',
  },
  fontAnybody: {
    fontFamily: 'Anybody',
  },
  fontInter: {
    ...Platform.select({
      android: {
        fontFamily: 'Inter',
      },
      default: {
        fontWeight: 'normal',
      },
    }),
  },
  fontInterBold: {
    ...Platform.select({
      android: {
        fontFamily: 'Inter-Bold',
      },
      default: {
        fontWeight: 'bold',
      },
    }),
  },
  fontDinBold: {
    fontFamily: 'din-bold',
  },
  fontDinMid: {
    fontFamily: 'din-mid',
  },
  fontDinBlack: {
    fontFamily: 'din-black',
  },
  italic: {
    fontStyle: 'italic',
  },
  lineThrough: {
    textDecorationLine: 'line-through',
  },
  center: {
    textAlign: 'center',
  },
});

export const background = StyleSheet.create({
  ...Object.entries({...basicColor, ...backgroundColor}).reduce(
    (acc, [key, value]) => {
      return Object.assign(acc, {
        [`${key}`]: {
          backgroundColor: value,
        },
      });
    },
    {} as any,
  ),
});

export const border = StyleSheet.create({
  ...Object.entries(borderColor ?? {}).reduce((acc, [key, value]) => {
    return Object.assign(acc, {
      [`${key}`]: {
        borderWidth: 1,
        borderColor: value,
      },
    });
  }, {} as any),
});

export const borderRadius = StyleSheet.create({
  ...Object.entries(borderRadiusSize ?? {}).reduce((acc, [key, value]) => {
    return Object.assign(acc, {
      [`${key}`]: {
        borderRadius: value,
      },
    });
  }, {} as any),
});

export const shadow = {
  defaultShadow: {
    startColor: 'rgba(204, 206, 228, 0.5)',
    distance: 8,
    style: {},
  },
  bottomShadow: {
    startColor: 'rgba(204, 206, 228, 0.5)',
    distance: 8,
    offset: [0, -20],
    style: {},
  },
  noShadow: {
    startColor: 'rgba(0, 0, 0, 0)',
    distance: 0,
    style: {},
  },
};

if (globalStore.isWeb) {
  shadow.defaultShadow.distance = 0;
  shadow.defaultShadow.style = {
    boxShadow: '0 2px 8px 4px rgba(204, 206, 228, 0.5)',
  };
  shadow.bottomShadow.distance = 0;
  shadow.bottomShadow.style = {
    boxShadow: '0 2px 8px 4px rgba(204, 206, 228, 0.5)',
  };
  shadow.noShadow.style = {
    boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)',
  };
}

export const icon = StyleSheet.create({
  ...Object.entries(iconSize ?? {}).reduce((acc, [key, value]) => {
    return Object.assign(acc, {
      [`${key}`]: {
        width: value,
        height: value,
      },
    });
  }, {} as any),
});

export const image = StyleSheet.create({
  ...Object.entries(imageSize ?? {}).reduce((acc, [key, value]) => {
    return Object.assign(acc, {
      [`${key}`]: {
        width: value,
        height: value,
      },
    });
  }, {} as any),
});
