import React, { useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { routes } from '@/routes';
const Tab = createBottomTabNavigator();

export const MainTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const tabBarStyle = useMemo(() => {
    return {
      backgroundColor: '#ffffff',
      // 对齐 Taro 样式：上内边距 10，底部使用安全区
      paddingTop: 5,
      paddingHorizontal: 16,
      borderTopWidth: 1,
      borderTopColor: 'rgba(0,0,0,0.05)',
      height: 60 + insets.bottom,
      paddingBottom: insets.bottom + 5,
    };
  }, [insets]);

  const getTabBarIcon = (
    route: any,
    focused: boolean,
    color: string,
    size: number,
  ) => {
    const routeConfig = routes.tabs.find(tab => tab.name === route.name);
    if (!routeConfig) return null;
    const iconUri = focused ? routeConfig.chooseIcon : routeConfig.icon;

    const isCenter = route.name === 'Index';
    const iconSize = isCenter ? 50 : 30;
    const marginBottom = isCenter ? 0 : 3;

    return (
      <Image
        source={{ uri: iconUri }}
        style={{
          width: iconSize,
          height: iconSize,
          marginBottom,
        }}
        resizeMode="contain"
      />
    );
  };


  return (
    <Tab.Navigator
      initialRouteName="Index"
      screenOptions={({ route }) => {
        const isCenter = route.name === 'Index';
        return {
          tabBarIcon: ({ focused, color, size }) =>
            getTabBarIcon(route, focused, color, size),
          tabBarActiveTintColor: '#333333',
          tabBarInactiveTintColor: '#CCCCCC',
          tabBarStyle,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '400',
          },
          // 每个 Tab 外层加红色边框，Index 固定宽度 50，其它平均铺满
          tabBarItemStyle: isCenter
            ? {
              width: 50,
              flexShrink: 0,
              flexGrow: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }
            : {
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            },
          headerShown: false,
        };
      }}
    >
      {routes.tabs.map(route => {
        const isCenter = route.name === 'Index';
        return (
          <Tab.Screen
            key={route.name}
            name={route.name}
            options={{
              // 中间的 Index 完全不渲染 label，避免占位高度
              tabBarLabel: isCenter ? (() => null) : route.label,
              tabBarIconStyle: isCenter
                ? { marginBottom: 0, marginTop: 4 }
                : { marginBottom: 0 },
              freezeOnBlur: true,
            }}
            component={route.component}
          />
        );
      })}
    </Tab.Navigator>
  );
};
