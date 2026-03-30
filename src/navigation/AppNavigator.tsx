import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { routes } from '@/routes';
import { MainTabNavigator } from '@/navigation/MainTabNavigator';
import { useAuth } from '@/hooks/useAuth';
import { Linking, View, Animated } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { HOME_STACK_ROUTE } from '@/constants';

const Stack = createNativeStackNavigator();

// const Splash = ({ onReady }: { onReady: () => void }) => {
//   const [isVideoReady, setIsVideoReady] = useState(false);
//   const videoOpacity = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     if (isVideoReady) {
//       // 视频准备好后，先淡入视频，再隐藏 BootSplash
//       Animated.timing(videoOpacity, {
//         toValue: 1,
//         duration: 200,
//         useNativeDriver: true,
//       }).start(() => {
//         // 视频完全显示后再隐藏 BootSplash
//         const BootSplash = require('react-native-bootsplash').default;
//         BootSplash.hide({ fade: false });
//       });
//     }
//   }, [isVideoReady]);

//   return (
//     <View
//       style={{
//         flex: 1,
//         backgroundColor: '#FFFFFF',
//       }}
//     >
//       <Animated.View
//         style={{
//           flex: 1,
//           opacity: videoOpacity,
//         }}
//       >
//         <Video
//           source={{
//             uri: require('@/public/home_video.mov'),
//           }}
//           style={{
//             width: '100%',
//             height: '100%',
//           }}
//           muted={true}
//           controls={false}
//           resizeMode="cover"
//           onReadyForDisplay={() => setIsVideoReady(true)}
//           onEnd={onReady}
//           repeat={false}
//           paused={false}
//         />
//       </Animated.View>
//     </View>
//   );
// };

export const AppNavigator: React.FC = () => {
  const { isLoggedIn, loading } = useAuth();

  // 加载中时先不渲染路由，避免闪一下登录页
  if (loading) {
    return null;
  }

  const initialRouteName = isLoggedIn ? 'MainTabs' : 'Login';

  return (
    <Stack.Navigator
      // 根据登录状态选择初始路由
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        animation: 'default',
      }}
    >
      {/* 登录页面 */}
      {routes.pages.map(route => (
        <Stack.Screen
          key={route.name}
          name={route.name}
          component={route.component}
          options={{
            orientation: 'portrait',
          }}
        />
      ))}
      {/* 主页面（需要登录） */}
      <Stack.Screen
        name="MainTabs"
        options={{
          orientation: 'portrait',
        }}
      >
        {() => <MainTabNavigator />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};
