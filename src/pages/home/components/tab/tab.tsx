import theme from '@/style';
import React from 'react';
import {View, Animated, Image, ScrollView} from 'react-native';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import Text from '@/components/basic/text';
const gameTabs = [
  {title: '3 Digits', icon: require('@assets/imgs/home/welcome-1.webp')},
  {title: 'State', icon: require('@assets/imgs/home/welcome-1.webp')},
  {title: 'Color', icon: require('@assets/imgs/home/welcome-1.webp')},
  {title: 'Kerala', icon: require('@assets/imgs/home/welcome-1.webp')},
  {title: 'Dice', icon: require('@assets/imgs/home/welcome-1.webp')},
  {title: 'Matka', icon: require('@assets/imgs/home/welcome-1.webp')},
];

const Tabs = ({
  activeTab = 0,
  scrollToCurrentGame = () => {},
}: {
  scrollToCurrentGame: (index: number) => void;
  activeTab: number;
}) => {
  const tabAnim = React.useRef(new Animated.Value(0)).current;
  // const [itemWidth, setItemWidth] = React.useState(0);

  // const outputRange = React.useMemo(() => {
  //   return gameTabs.map((_, i) => i * itemWidth);
  // }, [itemWidth]);

  React.useEffect(() => {
    Animated.timing(tabAnim, {
      toValue: activeTab,
      duration: 120,
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  return (
    <View
      // eslint-disable-next-line react-native/no-inline-styles
      style={[theme.padding.tbl, theme.padding.tbxs, {height: 81}]}>
      <ScrollView
        // eslint-disable-next-line react-native/no-inline-styles
        style={[theme.flex.flex1, theme.padding.leftl, {height: 69}]}
        horizontal
        showsHorizontalScrollIndicator={false}>
        {/* <Image
            style={[theme.icon.l, theme.margin.rights]}
            source={require('@assets/imgs/home/ball.webp')}
          /> */}
        {gameTabs.map((item, i) => (
          <NativeTouchableOpacity
            onPress={() => scrollToCurrentGame(i)}
            key={i}
            style={[
              theme.flex.center,
              theme.margin.rightl,
              activeTab === i
                ? // eslint-disable-next-line react-native/no-inline-styles
                  {
                    ...theme.background.primary10,
                    ...theme.borderRadius.s,
                    ...theme.border.primary50,
                    width: 64,
                    height: 69,
                  }
                : // eslint-disable-next-line react-native/no-inline-styles
                  {
                    ...theme.border.white10,
                    ...theme.borderRadius.s,
                    backgroundColor: theme.basicColor.primary10,
                    width: 64,
                    height: 69,
                  },
            ]}>
            <Image source={item?.icon} style={[theme.image.s]} />
            <Text size="medium" blod={activeTab === i} white>
              {item?.title}
            </Text>
          </NativeTouchableOpacity>
        ))}
      </ScrollView>
      {/* <Animated.View
        style={[
          {width: itemWidth},
          styles.lineContainer,
          {
            transform: [
              {
                translateX: tabAnim.interpolate({
                  inputRange: gameTabs.map((i, index) => index),
                  outputRange: outputRange,
                }),
              },
            ],
          },
        ]}>
        <View style={[styles.line]} />
      </Animated.View> */}
    </View>
  );
};

// const styles = StyleSheet.create({
//   lineContainer: {
//     position: 'absolute',
//     bottom: 6,
//     left: 44,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   line: {
//     ...theme.background.primary,
//     height: 4,
//     width: 20,
//   },
// });

export default Tabs;
