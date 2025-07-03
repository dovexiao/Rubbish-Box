import React from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import {goTo} from '@utils';
import globalStore from '@/services/global.state';

const screenWidth = globalStore.screenWidth;

const BOX_GAP = 5;
const SIDE_PADDING = 14;
const boxWidth = (screenWidth - SIDE_PADDING * 2 - BOX_GAP * 2) / 3;
const boxHeight = boxWidth * 1.2; // 👉 你可以改这里调整高度

const HomeHotGame: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.boxContainer}>
        <TouchableOpacity onPress={() => goTo('GameWebView', {type: 'color'})}>
          <ImageBackground
            source={require('@/assets/imgs/home/home-color.webp')}
            style={styles.box}
            imageStyle={styles.image}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            goTo('GameWebView', {type: 'dice', params: 'configId=16'})
          }>
          <ImageBackground
            source={require('@/assets/imgs/home/home-dice.webp')}
            style={styles.box}
            imageStyle={styles.image}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            goTo('GameWebView', {type: 'quick3d', params: 'id=103'})
          }>
          <ImageBackground
            source={require('@/assets/imgs/home/home-k3d.webp')}
            style={styles.box}
            imageStyle={styles.image}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: SIDE_PADDING,
    paddingBottom: 14,
  },
  boxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  box: {
    width: boxWidth,
    height: boxHeight,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  image: {
    resizeMode: 'cover', // ✅ 重要：填满不变形
  },
});

export default HomeHotGame;
