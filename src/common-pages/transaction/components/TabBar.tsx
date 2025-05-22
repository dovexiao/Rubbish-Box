import theme from '@/style';
import {TabProps} from '@rneui/themed';
import React from 'react';
import {View, StyleSheet, Animated, ScrollView} from 'react-native';
import Text from '@/components/basic/text';
import {TabType} from '../transaction-service';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';

const TabBar = (
  props: {
    routers: TabType[];
    onChange: (v: number) => void;
  } & TabProps,
) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const saveWidth = React.useRef<number[]>([]);
  const [tabItemWidth, setTabItemWidth] = React.useState<number[]>([]);
  const {routers, value = 0, onChange} = props;

  const inputRange = React.useMemo(() => {
    if (routers.length > 1) {
      return new Array(routers.length).fill(0).map((_, index) => index);
    }
    return [];
  }, [routers]);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: value,
      duration: 200,
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const saveItemWidth = (index: number, width: number) => {
    const copy = [...tabItemWidth];
    copy[index] = width;
    setTabItemWidth(copy);
  };

  const outputRange = React.useMemo(() => {
    if (saveWidth.current.length > 0) {
      return saveWidth.current.map((item, index) => {
        const current = (item - 20) / 2;
        if (index === 0) {
          return current;
        } else {
          const prev = saveWidth.current.slice(0, index);
          const totalPrev = prev.reduce((t, c) => t + c);
          return totalPrev + current;
        }
      });
    }
    return [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabItemWidth, routers]);

  return (
    <View style={[theme.background.white]}>
      <ScrollView
        scrollEventThrottle={16}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[theme.padding.btms, theme.padding.tops]}>
        {routers?.map((item, index) => (
          <NativeTouchableOpacity
            key={index}
            onPress={() => onChange(index)}
            style={[theme.padding.lrl]}
            onLayout={e => {
              saveWidth.current[index] = e.nativeEvent.layout.width;
              saveItemWidth(index, e.nativeEvent.layout.width);
            }}>
            <Text
              size="medium"
              textAlign="center"
              color={
                value === index ? theme.basicColor.dark : theme.fontColor.second
              }
              blod={value === index}>
              {item.typeName}
            </Text>
          </NativeTouchableOpacity>
        ))}

        {routers.length > 1 && inputRange.length === outputRange.length && (
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
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  resetButton: {
    flex: 0,
    paddingHorizontal: 0,
  },
  indicatorStyle: {
    position: 'absolute',
    bottom: 0,
    height: 4,
    width: 20,
    backgroundColor: theme.basicColor.primary,
  },
});

export default TabBar;
