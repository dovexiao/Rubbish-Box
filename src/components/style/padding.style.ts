import {StatusBar, StyleSheet} from 'react-native';
import {paddingSize} from './base.variable';

export const padding = StyleSheet.create({
  ...Object.entries(paddingSize ?? {}).reduce((acc, [key, value]) => {
    return Object.assign(acc, {
      topBar: {
        paddingTop: StatusBar.currentHeight || 0,
      },
      [`${key}`]: {
        padding: value,
      },
      [`left${key}`]: {
        paddingLeft: value,
      },
      [`right${key}`]: {
        paddingRight: value,
      },
      [`top${key}`]: {
        paddingTop: value,
      },
      [`btm${key}`]: {
        paddingBottom: value,
      },
      [`lr${key}`]: {
        paddingLeft: value,
        paddingRight: value,
      },
      [`tb${key}`]: {
        paddingTop: value,
        paddingBottom: value,
      },
    });
  }, {} as any),
});

export const margin = StyleSheet.create({
  ...Object.entries(paddingSize ?? {}).reduce((acc, [key, value]) => {
    return Object.assign(acc, {
      [`${key}`]: {
        margin: value,
      },
      [`left${key}`]: {
        marginLeft: value,
      },
      [`right${key}`]: {
        marginRight: value,
      },
      [`top${key}`]: {
        marginTop: value,
      },
      [`btm${key}`]: {
        marginBottom: value,
      },
      [`lr${key}`]: {
        marginLeft: value,
        marginRight: value,
      },
      [`tb${key}`]: {
        marginTop: value,
        marginBottom: value,
      },
    });
  }, {} as any),
});

export const gap = StyleSheet.create({
  ...Object.entries(paddingSize ?? {}).reduce((acc, [key, value]) => {
    return Object.assign(acc, {
      [`${key}`]: {
        gap: value,
      },
      [`row${key}`]: {
        rowGap: value,
      },
      [`col${key}`]: {
        columnGap: value,
      },
    });
  }, {} as any),
});
