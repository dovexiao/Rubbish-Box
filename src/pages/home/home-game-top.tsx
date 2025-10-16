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

const BOX_GAP = 6;
const SIDE_PADDING = 14;
const boxWidthTwo = (screenWidth - SIDE_PADDING * 2 - BOX_GAP) / 2;
const boxWidthFull = screenWidth - SIDE_PADDING * 2;

// 分别设置两行的宽高比
const firstRowAspectRatio = 2; // 第一行盒子比例
const secondRowAspectRatio = 3.5; // 第二行全宽盒子比例

const HomeHotGame: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.boxTwo, {aspectRatio: firstRowAspectRatio}]}
          onPress={() =>
            goTo('GameWebView', {type: 'quick3d', params: 'id=103'})
          }>
          <ImageBackground
            source={require('@/assets/imgs/home/home-k3d.webp')}
            style={styles.imageBox}
            imageStyle={styles.image}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.boxTwo, {aspectRatio: firstRowAspectRatio}]}
          onPress={() =>
            goTo('GameWebView', {type: 'dice', params: 'configId=16'})
          }>
          <ImageBackground
            source={require('@/assets/imgs/home/home-dice.webp')}
            style={styles.imageBox}
            imageStyle={styles.image}
          />
        </TouchableOpacity>
      </View>
      {/*<View style={styles.row}>*/}
      {/*  <TouchableOpacity*/}
      {/*    style={[styles.boxFull, {aspectRatio: secondRowAspectRatio}]}*/}
      {/*    onPress={() => goTo('GameWebView', {type: 'color'})}>*/}
      {/*    <ImageBackground*/}
      {/*      source={require('@/assets/imgs/home/home-color.webp')}*/}
      {/*      style={styles.imageBox}*/}
      {/*      imageStyle={styles.image}*/}
      {/*    />*/}
      {/*  </TouchableOpacity>*/}
      {/*</View>*/}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: SIDE_PADDING,
    paddingBottom: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: BOX_GAP,
  },
  boxTwo: {
    width: boxWidthTwo,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  boxFull: {
    width: boxWidthFull,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  imageBox: {
    flex: 1,
  },
  image: {
    resizeMode: 'cover',
  },
});

export default HomeHotGame;
