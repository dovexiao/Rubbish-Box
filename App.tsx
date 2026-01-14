import React, { useRef, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  NavigationContainer,
  NavigationContainerRef,
  CommonActions,
} from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';
import AntdProvider from '@ant-design/react-native/lib/provider';
import { AppNavigator } from '@/navigation/AppNavigator';
import { queryClient } from '@/config/queryClient';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { setNavigationRef } from '@/utils/navigation';


function App() {
  const navigationRef = useRef<NavigationContainerRef<any>>(null);

  // 设置导航引用，供 HTTP 拦截器使用
  useEffect(() => {
    // 在 NavigationContainer 准备好后设置引用
    const handleReady = () => {
      setNavigationRef(navigationRef.current);
    };

    // 如果已经准备好，立即设置
    if (navigationRef.current?.isReady()) {
      setNavigationRef(navigationRef.current);
    }

    return () => {
      setNavigationRef(null);
    };
  }, []);

  // 错误处理回调
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // 这里可以集成错误上报服务
    // 例如：Sentry.captureException(error, { extra: errorInfo });
    if (__DEV__) {
      console.error('全局错误:', error);
      console.error('错误信息:', errorInfo);
    }
  };



  // 导航到首页
  const navigateHome = () => {
    if (navigationRef.current?.isReady()) {
      navigationRef.current.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Index' }],
        }),
      );
    }
  };

  return (
    <ErrorBoundary onError={handleError} onNavigateHome={navigateHome}>
      <QueryClientProvider client={queryClient}>
        <AntdProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider accessibilityIgnoresInvertColors={true}>
              <NavigationContainer
                ref={navigationRef}
                onReady={() => {
                  // 导航容器准备好后设置引用
                  setNavigationRef(navigationRef.current);
                }}>
                <AppNavigator />
              </NavigationContainer>
            </SafeAreaProvider>
          </GestureHandlerRootView>
        </AntdProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
