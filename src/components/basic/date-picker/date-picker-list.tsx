import theme from '@/style';
import React from 'react';
import {ScrollView, View, StyleSheet, ViewProps} from 'react-native';
import Text from '../text';
import globalStore from '@/services/global.state';
import {debounce} from '@/utils';

const styles = StyleSheet.create({
  emptyView: {
    height: 45,
    minHeight: 45,
    maxHeight: 45,
    width: '100%',
  },
  emptyViewTop: {
    top: 0,
    borderBottomColor: theme.fontColor.grey,
    borderBottomWidth: 1,
    width: '100%',
    height: 45,
    position: 'absolute',
    pointerEvents: 'none',
  },
  emptyViewBtm: {
    position: 'absolute',
    bottom: 0,
    borderTopColor: theme.fontColor.grey,
    borderTopWidth: 1,
    width: '100%',
    height: 45,
    pointerEvents: 'none',
  },
});

interface PickerListProps extends ViewProps {
  value: number;
  setValue?: (v: number) => void;
  list: number[];
}

const DatePickerList = ({
  value,
  setValue,
  list,
  style,
  ...otherProps
}: PickerListProps) => {
  const scrollTo = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: 0,
      y: index * 45,
      animated: true,
    });
  };
  const scrollViewRef = React.useRef<ScrollView>(null);
  const updatePosition = (v = value) => {
    const defaultValueIndex = listRef.current.indexOf(v);
    if (defaultValueIndex > -1) {
      scrollTo(defaultValueIndex);
    } else {
      setValue?.(listRef.current[0]);
    }
  };
  const listRef = React.useRef<number[]>([]);
  React.useEffect(() => {
    listRef.current = list;
  }, [list]);
  React.useEffect(() => {
    updatePosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  React.useEffect(() => {
    if (globalStore.isWeb) {
      const scrollbox = scrollViewRef.current as unknown as HTMLDivElement;
      const onscrollEnd = debounce(() => {
        const currentValue =
          listRef.current[Math.round(scrollbox.scrollTop / 45)];
        setValue?.(currentValue);
        updatePosition(currentValue);
      });
      // 使用scroll而不是scrollend是为了兼容Safari浏览器
      scrollbox.addEventListener('scroll', onscrollEnd);
      return () => {
        scrollbox.removeEventListener('scroll', onscrollEnd);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <View style={[theme.position.rel, style]} {...otherProps}>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={
          globalStore.isWeb
            ? undefined
            : e => {
                const currentValue =
                  list[Math.round(e.nativeEvent.contentOffset.y / 45)];
                setValue?.(currentValue);
                updatePosition(currentValue);
              }
        }>
        <View style={[styles.emptyView]} />
        {list.map((v, i) => {
          return (
            <View
              key={i}
              style={[
                theme.fill.fillW,
                theme.padding.tbl,
                theme.flex.center,
                styles.emptyView,
              ]}>
              <Text
                white
                blod
                size="large"
                style={[
                  // eslint-disable-next-line react-native/no-inline-styles
                  {
                    opacity: v === value ? 1 : 0.3,
                    lineHeight: 21,
                  },
                ]}>
                {v}
              </Text>
            </View>
          );
        })}
        <View style={[styles.emptyView]} />
      </ScrollView>
      <View style={[styles.emptyViewTop]} />
      <View style={[styles.emptyViewBtm]} />
    </View>
  );
};

export default DatePickerList;
