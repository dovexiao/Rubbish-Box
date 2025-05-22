import React from 'react';
import Drawer, {DrawerRef} from './drawer';
import {Text, View, Pressable} from 'react-native';
import theme from '@style';

const DrawerDemo = () => {
  const leftDrawer = React.useRef<DrawerRef>(null);
  const topDrawer = React.useRef<DrawerRef>(null);
  const rightDrawer = React.useRef<DrawerRef>(null);
  const bottomDrawer = React.useRef<DrawerRef>(null);

  return (
    <View style={[theme.fill.fill, theme.flex.col]}>
      <View style={[theme.flex.row, theme.flex.center]}>
        <Pressable onPress={() => leftDrawer.current?.open()}>
          <Text>点击打开左侧抽屉</Text>
        </Pressable>
      </View>
      <Drawer ref={leftDrawer}>
        <View>
          <Pressable
            onPress={() => {
              leftDrawer.current?.close();
            }}>
            <Text>点击关闭左侧抽屉</Text>
          </Pressable>
        </View>
      </Drawer>
      <View style={[theme.flex.row, theme.flex.center, theme.margin.tbl]}>
        <Pressable onPress={() => topDrawer.current?.open()}>
          <Text>点击打开顶部抽屉</Text>
        </Pressable>
      </View>
      <Drawer ref={topDrawer} mode="top">
        <View>
          <Text>顶部抽屉</Text>
          <Text>顶部抽屉</Text>
          <Text>顶部抽屉</Text>
          <Text>顶部抽屉</Text>
          <Text>顶部抽屉</Text>
          <Text>顶部抽屉</Text>
          <Text>顶部抽屉</Text>
          <Text>顶部抽屉</Text>
          <Text>顶部抽屉</Text>
          <Text>顶部抽屉</Text>
          <Text>顶部抽屉</Text>
          <Text>顶部抽屉</Text>
        </View>
      </Drawer>
      <View style={[theme.flex.row, theme.flex.center]}>
        <Pressable onPress={() => rightDrawer.current?.open()}>
          <Text>点击打开右侧抽屉</Text>
        </Pressable>
      </View>
      <Drawer ref={rightDrawer} mode="right">
        <View>
          <Text>右侧抽屉</Text>
        </View>
      </Drawer>
      <View style={[theme.flex.row, theme.flex.center, theme.margin.tbl]}>
        <Pressable onPress={() => bottomDrawer.current?.open()}>
          <Text>点击打开底部抽屉</Text>
        </Pressable>
      </View>
      <Drawer ref={bottomDrawer} mode="bottom">
        <View>
          <Text>底部抽屉</Text>
          <Text>底部抽屉</Text>
          <Text>底部抽屉</Text>
          <Text>底部抽屉</Text>
          <Text>底部抽屉</Text>
          <Text>底部抽屉</Text>
          <Text>底部抽屉</Text>
          <Text>底部抽屉</Text>
          <Text>底部抽屉</Text>
          <Text>底部抽屉</Text>
        </View>
      </Drawer>
    </View>
  );
};

export default DrawerDemo;
