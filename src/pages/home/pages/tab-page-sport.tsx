import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

const HomeTabPageSport = () => {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Animated style for the header
  const headerStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: Math.max(scrollY.value, 0)}],
    };
  }, [scrollY]);

  return (
    <View style={styles.container}>
      {/* Sticky Header */}

      {/* Scrollable Content */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.contentContainer}>
        {/* The content should push the header */}
        <Animated.View style={[styles.header, headerStyle]}>
          <Text style={styles.headerText}>Sticky Header</Text>
        </Animated.View>
        <View style={styles.content}>
          {/* Replace this with your actual content */}
          {[...Array(50)].map((_, i) => (
            <Text key={i} style={styles.text}>
              Item {i + 1}
            </Text>
          ))}
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    backgroundColor: 'lightblue',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  contentContainer: {
    position: 'relative',
    paddingTop: 60, // Make space for the sticky header
  },
  content: {
    padding: 20,
  },
  text: {
    fontSize: 18,
    color: 'white',
  },
});

export default HomeTabPageSport;
