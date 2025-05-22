import React from 'react';
import {Animated, View, StyleSheet} from 'react-native';
import Text from '@components/basic/text';
import theme from '@/style';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import BetsFilter from './bets-filter';
import {BasicObject} from '@/types';
import {scaleSize} from '@/utils';

const BetsTab = (props: {
  active: number;
  changeActive: (i: number) => void;
  filterValue?: string;
  onChangeFilter: (v: string) => void;
  currentDate?: Date;
  onSelectDate?: (date: Date) => void;
  menu: BasicObject[];
}) => {
  const {
    active = 0,
    menu = [],
    changeActive,
    onChangeFilter,
    filterValue,
  } = props;

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const saveWidth = React.useRef<number[]>([]);
  const [tabItemWidth, setTabItemWidth] = React.useState<number[]>([]);
  // const {width} = useResponsiveDimensions();
  // const inputRange = React.useMemo(() => {
  //   if (menu.length > 0) {
  //     return new Array(menu.length).fill(0).map((_, index) => index);
  //   }
  //   return [];
  // }, [menu]);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: active,
      duration: 200,
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const saveItemWidth = (index: number, itemWidth: number) => {
    const copy = [...tabItemWidth];
    copy[index] = itemWidth;
    setTabItemWidth(copy);
  };

  // const outputRange = React.useMemo(() => {
  //   const left = width - 24 - 80 - 28;
  //   if (saveWidth.current.length > 0) {
  //     const totalWidth = saveWidth.current.reduce((t, c) => t + c);
  //     const gap = (left - totalWidth) / 3;
  //     return saveWidth.current.map((item, index) => {
  //       const current = (item - 20) / 2;
  //       if (index === 0) {
  //         return current + 12;
  //       } else {
  //         const prev = saveWidth.current.slice(0, index);
  //         const totalPrev = prev.reduce((t, c) => t + c);
  //         return totalPrev + current + 12 + index * gap;
  //       }
  //     });
  //   }
  //   return [];
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [tabItemWidth]);

  return (
    <View style={[theme.margin.lrl]}>
      <View
        style={[
          theme.flex.row,
          theme.flex.centerByCol,
          styles.tabContainer,
          theme.background.black50,
          theme.borderRadius.s,
          // eslint-disable-next-line react-native/no-inline-styles
          {
            height: 42,
          },
        ]}>
        <View
          style={[
            theme.flex.row,
            theme.flex.centerByCol,
            theme.flex.flex1,
            theme.padding.lrl,
            theme.flex.around,
            theme.position.rel,
          ]}>
          {menu.map((item, index) => (
            <NativeTouchableOpacity
              key={index}
              onPress={() => changeActive(index)}
              onLayout={e => {
                saveWidth.current[index] = e.nativeEvent.layout.width;
                saveItemWidth(index, e.nativeEvent.layout.width);
              }}
              style={
                active === index
                  ? {
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 6,
                      backgroundColor: theme.basicColor.primary,
                    }
                  : {}
              }>
              <Text
                size="medium"
                textAlign="center"
                color={
                  active === index
                    ? theme.fontColor.white
                    : theme.fontColor.primaryMain
                }
                blod>
                {item.title}
              </Text>
            </NativeTouchableOpacity>
          ))}
          {/* {inputRange.length === outputRange.length && (
            <Animated.View
              style={[
                styles.indicatorStyle,
                {
                  transform: [
                    {
                      translateX: fadeAnim.interpolate({
                        inputRange: inputRange,
                        outputRange: outputRange,
                      }),
                    },
                  ],
                },
              ]}
            />
          )} */}
        </View>
      </View>
      <BetsFilter onChange={onChangeFilter} value={filterValue} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  indicatorStyle: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 4,
    width: 20,
    backgroundColor: 'white',
  },
  date: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 18,
    marginRight: 10,
    borderRadius: scaleSize(21),
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 80,
    backgroundColor: theme.basicColor.primary,
  },
  tabContainer: {
    // paddingVertical: theme.paddingSize.l,
  },
});

export default BetsTab;
