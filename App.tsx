import React, { useRef, useEffect, useState } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  NavigationContainer,
  CommonActions,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';
import AntdProvider from '@ant-design/react-native/lib/provider';
import { AppNavigator } from '@/navigation/AppNavigator';
import { queryClient } from '@/config/queryClient';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { setNavigationRef } from '@/utils/navigation';
import PopConfirm from '@/components/popConfirm';
import Flex from '@/components/Flex';
import { Text, Button } from '@ant-design/react-native';
import {
  cacheGet,
  cacheGetSync,
  cacheSet,
  getStorage,
  requestBluetoothPermissions,
  initAppPush,
  getMobPushDeviceInfo,
  jumpToPage,
  initAMapSdk,
  initAMapGeolocation,
} from '@/utils';
import appPush from '@/utils/push';
import { WeChatInit } from '@/utils/wechat';


function App() {
  const navigationRef = useNavigationContainerRef<any>();
  const agreePopRef = useRef<any>(null);
  const retainPopRef = useRef<any>(null);
  const [jumpListener, setJumpListener] = useState<{ remove?: () => void } | null>(null);

  // 设置导航引用，供 HTTP 拦截器使用
  useEffect(() => {
    setNavigationRef(navigationRef);
    return () => {
      setNavigationRef(null);
    };
  }, [navigationRef]);

  // 微信 SDK 初始化
  useEffect(() => {
    WeChatInit()
  }, []);

  // 高德地图 SDK 初始化（地图组件，不涉及隐私权限，可立即初始化）
  useEffect(() => {
    initAMapSdk();
  }, []);

  // 处理隐私协议同意后的初始化
  const handlePrivacyAgreed = async () => {
    try {
      // 初始化高德定位服务（涉及位置权限，需要在隐私协议同意后初始化）
      await initAMapGeolocation();

      // 请求蓝牙权限
      const bluetoothResult = await requestBluetoothPermissions();
      if (bluetoothResult.granted) {
        console.log('蓝牙权限已授予');
      }

      // 检查推送服务状态
      const [token, pushRes] = await Promise.all([
        cacheGet({ key: 'token' }).catch(() => undefined),
        getStorage({ key: 'pushEnabled' }).catch(() => ({ data: undefined }) as any),
      ]);

      const enabled = pushRes?.data === true;
      const loggedIn = !!token;

      if (enabled && loggedIn) {
        // 初始化推送服务
        await initAppPush();
        appPush.toggleNotifeeCore?.(true);
        appPush.toggleMobPushOEM?.(true);

        // 获取推送设备信息
        await getMobPushDeviceInfo();
      } else {
        appPush.submitPolicyGrantResult?.(false);
        appPush.stopPush?.();
        appPush.toggleNotifeeCore?.(false);
        appPush.toggleMobPushOEM?.(false);
      }
    } catch (error) {
      console.error('初始化服务失败:', error);
    }
  };

  // 检查隐私协议同意状态，首次进入显示弹窗
  useEffect(() => {
    const checkPrivacyAgreement = async () => {
      try {
        const agreed = await cacheGetSync('agreePrivacy');
        if (!agreed) {
          agreePopRef.current?.open?.();
        } else {
          // 已同意，初始化推送和蓝牙权限
          await handlePrivacyAgreed();
        }
      } catch (error) {
        console.error('检查隐私协议失败:', error);
      }
    };
    checkPrivacyAgreement();
  }, []);

  // 深链接/推送跳转监听
  useEffect(() => {
    const setupJumpListener = async () => {
      try {
        const [agree, token, pushRes] = await Promise.all([
          cacheGet({ key: 'agreePrivacy' }).catch(() => false),
          cacheGet({ key: 'token' }).catch(() => undefined),
          getStorage({ key: 'pushEnabled' }).catch(() => ({ data: undefined }) as any),
        ]);

        const enabled = pushRes?.data === true;
        const loggedIn = !!token;

        if (agree && enabled && loggedIn) {
          const listener = await jumpToPage();
          setJumpListener(listener);
        }
      } catch (error) {
        console.error('设置跳转监听失败:', error);
      }
    };

    setupJumpListener();

    return () => {
      if (jumpListener?.remove) {
        jumpListener.remove();
      }
    };
  }, []);

  // 应用状态变化处理（对应 useDidShow）
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // 应用激活时，检查并初始化推送
        try {
          const [agree, token, pushRes] = await Promise.all([
            cacheGet({ key: 'agreePrivacy' }).catch(() => false),
            cacheGet({ key: 'token' }).catch(() => undefined),
            getStorage({ key: 'pushEnabled' }).catch(() => ({ data: undefined }) as any),
          ]);

          const enabled = pushRes?.data === true;
          const loggedIn = !!token;

          if (agree && enabled && loggedIn) {
            // 主动拉取一次推送设备信息
            await getMobPushDeviceInfo();
          }
        } catch (error) {
          console.error('应用激活处理失败:', error);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // 错误处理回调
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    if (__DEV__) {
      console.error('全局错误:', error);
      console.error('错误信息:', errorInfo);
    }
  };

  // 导航到首页
  const navigateHome = () => {
    if (navigationRef?.isReady()) {
      navigationRef.dispatch(
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
              <NavigationContainer ref={navigationRef}>
                <AppNavigator />
              </NavigationContainer>

              {/* 全局隐私政策弹窗（首次进入App弹出） */}
              <PopConfirm
                ref={agreePopRef}
                title={
                  <Flex direction="column" align="center" justify="center">
                    <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
                      用户协议及隐私保护
                    </Text>
                    <Text style={{ fontSize: 14, lineHeight: 20 }}>
                      我已阅读并同意
                      <Text
                        style={{ color: '#1E80FF' }}
                        onPress={() => {
                          agreePopRef.current?.close?.();
                          if (navigationRef?.isReady()) {
                            navigationRef.navigate('WebView', {
                              url: 'https://g.18qjz.cn/protocol/boklock/userAgreement.html',
                              title: '泊刻地锁用户协议',
                            });
                          }
                        }}>
                        《泊刻地锁用户协议》
                      </Text>
                      和
                      <Text
                        style={{ color: '#1E80FF' }}
                        onPress={() => {
                          agreePopRef.current?.close?.();
                          if (navigationRef?.isReady()) {
                            navigationRef.navigate('WebView', {
                              url: 'https://g.18qjz.cn/protocol/boklock/privacyPolicy.html',
                              title: '泊刻地锁隐私政策',
                            });
                          }
                        }}>
                        《隐私政策》
                      </Text>
                    </Text>
                    {Platform.OS !== 'ios' && (
                      <Text style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
                        为保障设备状态提醒的可靠送达，在您同意隐私条款后，应用在退出后可能继续维持通知服务（包含自启动/关联启动的后台行为）。您可在设置中随时关闭通知服务。
                      </Text>
                    )}
                  </Flex>
                }
                cancelText="不同意"
                onCancel={() => {
                  agreePopRef.current?.close?.();
                  retainPopRef.current?.open?.();
                }}
                submitBtn={
                  <Button
                    style={{ backgroundColor: '#333', marginLeft: 16 }}
                    onPress={async () => {
                      try {
                        await cacheSet({ key: 'agreePrivacy', data: true });
                        await handlePrivacyAgreed();
                        agreePopRef.current?.close?.();
                      } catch (error) {
                        console.error('保存隐私协议同意状态失败:', error);
                      }
                    }}>
                    <Text style={{ color: '#fff' }}>同意并继续</Text>
                  </Button>
                }
              />

              {/* 拒绝后的挽留说明弹窗 */}
              <PopConfirm
                ref={retainPopRef}
                showClose={false}
                confirmText="我知道了"
                title={
                  <Flex direction="column" align="center" justify="center">
                    <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>温馨提示</Text>
                    <Text style={{ fontSize: 14, lineHeight: 20, textAlign: 'center' }}>
                      为保障您顺利绑定设备和正常使用定位、蓝牙、通知等功能，以及设备状态提醒的正常收取，建议您同意
                      <Text style={{ color: '#1E80FF' }}>《泊刻地锁用户协议》</Text>和
                      <Text style={{ color: '#1E80FF' }}>《隐私政策》</Text>
                      。您也可以选择暂不登录继续浏览。
                    </Text>
                  </Flex>
                }
              />
            </SafeAreaProvider>
          </GestureHandlerRootView>
        </AntdProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
