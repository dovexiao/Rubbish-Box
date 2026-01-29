import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { routes } from '@/routes';
import { MainTabNavigator } from '@/navigation/MainTabNavigator';
import { useAuth } from '@/hooks/useAuth';
import { Linking, View, Animated } from 'react-native';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { CommonActions } from '@react-navigation/native';

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
  const navigation = useAppNavigation();

  // 根据登录状态决定初始路由
  const initialRouteName = useMemo(() => {
    // 如果还在加载中，默认显示登录页，避免闪烁
    if (loading) {
      return 'Login';
    }
    return isLoggedIn ? 'Index' : 'Login';
  }, [isLoggedIn, loading]);

  // 登录后（含 guest 模式）若当前仍停留在登录页，可在需要时通过业务代码显式跳转到首页。
  // 这里不再在未登录时强制重置到登录页，以便支持“暂不登录”场景通过导航工具自行控制路由。

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        animation: 'none',
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
        name="Index"
        options={{
          orientation: 'portrait',
        }}
      >
        {() => <MainTabNavigator />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};
