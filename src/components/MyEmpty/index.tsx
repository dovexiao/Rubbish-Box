import React, { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export type MyEmptyProps = {
  emptyText?: string;
  emptyIcon?: string;
};

const DEFAULT_EMPTY_ICON = 'https://img.yzcdn.cn/vant/empty-image-search.png';

export default function MyEmpty(props: MyEmptyProps) {
  const uri = useMemo(
    () => props.emptyIcon || DEFAULT_EMPTY_ICON,
    [props.emptyIcon],
  );
  const text = props.emptyText || '空空如也';

  return (
    <View style={styles.noDataSearch}>
      <Image
        source={{ uri }}
        style={[styles.emptyImage]}
        resizeMode="contain"
      />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  noDataSearch: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
    height: '100%',
    marginTop: 184,
    paddingBottom: 184,
  },
  emptyImage: {
    width: 120,
    height: 120,
  },

  emptyText: {
    fontSize: 14,
    color: '#999999',
    opacity: 0.5,
    marginTop: 16,
  },
});
