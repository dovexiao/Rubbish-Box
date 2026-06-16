import React, { useMemo, useRef, useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';
import { useSafeAreaInsets } from '@/libs/safeAreaContext';
import { routes } from '@/routes';
import appManager from '@/utils/env/rn/appManager';
import { showAppUpdateDialog } from '@/components';
import { pad } from 'crypto-js';
import { fontSize, px } from '@/utils/ui';

const Tab = createBottomTabNavigator();

export const MainTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const lastCheckTimeRef = useRef<number>(0);

  const handleCheckUpdateSilent = useCallback(async () => {
    const now = Date.now();
    // 20秒内多次切换只触发一次
    if (now - lastCheckTimeRef.current < 20 * 1000) {
      return;
    }
    lastCheckTimeRef.current = now;

    try {
      const manager = appManager();
      const info = await manager.checkAppVersion({ checkStorage: true });

      // 无感检测如果有更新且不是最新版才弹窗
      if (info && !info.isLast) {
        showAppUpdateDialog({
          id: info.id,
          version: info.version,
          content: info.content,
          packageUrl: info.packageUrl,
          forceUpdate: info.forceUpdate,
          isLast: info.isLast,
          onConfirm: () => manager.applyAppVerUpdate(info),
        });
      }
    } catch (e) {
      // 无感检测，网络异常等不弹 Toast 报错
    }
  }, []);

  const tabBarStyle = useMemo(() => {
    return {
      backgroundColor: '#ffffff',
      // 对齐 Taro 样式：上内边距 10，底部使用安全区
      paddingTop: px(5),
      paddingHorizontal: px(16),
      borderTopWidth: 1,
      borderTopColor: 'rgba(0,0,0,0.05)',
      height: px(60 + Math.max(insets.bottom, 20)),
      paddingBottom: px(Math.max(insets.bottom, 20)),
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

    // const isCenter = route.name === 'Index';
    // const iconSize = isCenter ? px(50) : px(30);
    // const marginBottom = isCenter ? 0 : px(3);
    const iconSize = px(30);
    const marginBottom = px(3);

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
      screenListeners={{
        state: handleCheckUpdateSilent,
      }}
      screenOptions={({ route }: { route: any }) => {
        // const isCenter = route.name === 'Index';
        return {
          tabBarIcon: ({
            focused,
            color,
            size,
          }: {
            focused: boolean;
            color: string;
            size: number;
          }) => getTabBarIcon(route, focused, color, size),
          tabBarActiveTintColor: '#333333',
          tabBarInactiveTintColor: '#666666',
          tabBarStyle,
          tabBarHideOnKeyboard: true,
          tabBarLabelStyle: {
            fontSize: fontSize(11),
            fontWeight: '400',
          },
          // 每个 Tab 外层加红色边框，Index 固定宽度 50，其它平均铺满
          tabBarItemStyle: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          },
          headerShown: false,
        };
      }}
    >
      {routes.tabs.map(route => {
        // const isCenter = route.name === 'Index';
        return (
          <Tab.Screen
            key={route.name}
            name={route.name}
            options={{
              // 中间的 Index 完全不渲染 label，避免占位高度
              tabBarLabel: route.label,
              tabBarIconStyle: { marginBottom: 0 },
              freezeOnBlur: true,
            }}
            component={route.component}
          />
        );
      })}
    </Tab.Navigator>
  );
};
