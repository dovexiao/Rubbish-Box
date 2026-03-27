import React, { useRef, useEffect, useState } from 'react';
import { AppState, AppStateStatus, BackHandler, Platform } from 'react-native';
import { SafeAreaProvider } from '@/libs/safeAreaContext';
import {
  NavigationContainer,
  CommonActions,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { GestureHandlerRootView } from '@/libs/gestureHandler';
import { QueryClientProvider } from '@tanstack/react-query';
import AntdProvider from '@ant-design/react-native/lib/provider';
import { AppNavigator } from '@/navigation/AppNavigator';
import { queryClient } from '@/config/queryClient';
import { BASE_URL, DEPLOY_ENV } from '@/config';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { setNavigationRef } from '@/utils/navigation';
import PopConfirm from '@/components/popConfirm';
import Flex from '@/components/Flex';
import { Text, Button, View } from '@ant-design/react-native';
import {
  cacheGet,
  cacheGetSync,
  cacheSet,
  eventCenter,
  getAppPackageName,
  getBluetoothDeviceInfo,
  getCurrentPages,
  getStorage,
  getSystemConnectedDevices,
  isSameMac,
  removeStorage,
  requestBluetoothPermissions,
  reLaunch,
  setStorage,
  initAppPush,
  getMobPushDeviceInfo,
  jumpToPage,
  initAMapSdk,
  initAMapGeolocation,
  hideLoading,
  showToast,
} from '@/utils';
import appPush from '@/utils/push';
import { WeChatInit } from '@/utils/wechat';
import appUpdate from '@/utils/appUpdate';
import { bind } from '@/services/bindDevice';
import {
  getBluetoothStatus,
  openBluetoothProximity,
} from '@/services/bluetooth';
import { Toast } from '@ant-design/react-native';
import GradientButton from '@/components/GradientButton';
import { AppUpdateDialogHost } from '@/components/AppUpdateDialog';
import { GlobalLoading, GlobalToast } from '@/components';
import { ThemeProvider } from '@/context/ThemeContext';
import { StoreProvider } from '@/store/provider';

function App() {
  const navigationRef = useNavigationContainerRef<any>();
  const agreePopRef = useRef<any>(null);
  const retainPopRef = useRef<any>(null);
  const globalPopConfirmRef = useRef<any>(null);
  const [jumpListener, setJumpListener] = useState<{
    remove?: () => void;
  } | null>(null);
  const [globalPopConfirmConfig, setGlobalPopConfirmConfig] = useState<{
    title: string | React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => any;
    onCancel?: () => any;
    showClose?: boolean;
    confirmColors?: [string, string];
    confirmTextColor?: string;
    children?: React.ReactElement;
  } | null>(null);

  // Harmony: 拦截系统返回（按键/手势），优先让 React Navigation 处理
  useEffect(() => {
    if (Platform.OS == 'ios' || Platform.OS == 'android') return;

    const onBackPress = () => {
      // 导航未就绪时交给系统处理
      if (!navigationRef.isReady()) {
        return false;
      }

      if (navigationRef.canGoBack()) {
        navigationRef.goBack();
        return true; // 已消费，避免直接退回桌面
      }

      // 栈中没有上一页时交给系统默认行为（退出应用）
      return false;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );

    return () => {
      subscription.remove();
    };
  }, [navigationRef]);

  // 设置导航引用，供 HTTP 拦截器使用
  useEffect(() => {
    setNavigationRef(navigationRef);
    return () => {
      setNavigationRef(null);
    };
  }, [navigationRef]);

  // 微信 SDK 初始化
  useEffect(() => {
    WeChatInit();
  }, []);

  // 输出当前包名（便于排查环境/安装包）
  useEffect(() => {
    getAppPackageName().then(pkg => {
      console.log('[App] 当前包名:', pkg);
      console.log('[App] 部署环境:', DEPLOY_ENV);
      console.log('[App] API 地址:', BASE_URL);
    });
  }, []);

  // 高德地图 SDK 初始化（地图组件，不涉及隐私权限，可立即初始化）
  useEffect(() => {
    initAMapSdk();
  }, []);

  // 处理隐私协议同意后的初始化
  const handlePrivacyAgreed = async () => {
    try {
      // 初始化高德定位服务和蓝牙权限仅在 Android / iOS 上执行
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        // 初始化高德定位服务（涉及位置权限，需要在隐私协议同意后初始化）
        await initAMapGeolocation();

        // 请求蓝牙权限
        const bluetoothResult = await requestBluetoothPermissions();
        if (bluetoothResult.granted) {
          console.log('蓝牙权限已授予');
        }
      }

      // 检查推送服务状态
      const [token, pushRes] = await Promise.all([
        cacheGet({ key: 'token' }).catch(() => undefined),
        getStorage({ key: 'pushEnabled' }).catch(
          () => ({ data: undefined } as any),
        ),
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

  // 监听从 Web 协议页返回后的重开指令（App 层处理，当 privacyOpenBy 不是 'login' 时）
  useEffect(() => {
    const handler = async () => {
      try {
        const agreed = await cacheGetSync('agreePrivacy');
        const flagRes: any = await getStorage({
          key: 'reopenPrivacyAfterWeb',
        }).catch(() => ({ data: undefined } as any));
        const byRes: any = await getStorage({ key: 'privacyOpenBy' }).catch(
          () => ({ data: undefined } as any),
        );
        const needReopen = flagRes?.data === true;
        const by = byRes?.data;
        // 仅当来源非 login（或未设置）时由 App 层重弹
        if (!agreed && needReopen && by !== 'login') {
          setTimeout(() => agreePopRef.current?.open?.(), 600);
        }
        // 无论是否打开，均重置标记
        try {
          await setStorage({ key: 'reopenPrivacyAfterWeb', data: false });
          await setStorage({ key: 'privacyOpenBy', data: '' });
        } catch {}
      } catch {}
    };
    eventCenter.on('privacy:open', handler);
    return () => {
      eventCenter.off('privacy:open', handler);
    };
  }, []);

  // 监听全局 PopConfirm 显示事件
  useEffect(() => {
    const handler = (config: any) => {
      setGlobalPopConfirmConfig(config);
      setTimeout(() => globalPopConfirmRef.current?.open?.(), 600);
    };
    eventCenter.on('global:popConfirm:show', handler);
    return () => {
      eventCenter.off('global:popConfirm:show', handler);
    };
  }, []);

  // 应用更新管理
  useEffect(() => {
    if (__DEV__) return; // 开发环境不检查更新

    // 鸿蒙等非 Android/iOS 平台暂不启用内置更新逻辑，避免依赖原生 FS 等模块
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      return;
    }

    const updateManager = appUpdate();
    updateManager.onUpdateReady(() => {
      const updateInfo = updateManager.getUpdateInfo();
      if (updateInfo.hasUpdate) {
        const updateType =
          updateInfo.updateType === 'app' ? '应用更新' : '热更新';
        Toast.info(`发现新版本`, 2000);
        // 可以在这里显示更新提示
        setTimeout(() => {
          updateManager.applyUpdate();
        }, 2000);
      }
    });
  }, []);

  // 深链接/推送跳转监听
  useEffect(() => {
    const setupJumpListener = async () => {
      try {
        const [agree, token, pushRes] = await Promise.all([
          cacheGet({ key: 'agreePrivacy' }).catch(() => false),
          cacheGet({ key: 'token' }).catch(() => undefined),
          getStorage({ key: 'pushEnabled' }).catch(
            () => ({ data: undefined } as any),
          ),
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
  }, [jumpListener]);

  // 应用状态变化处理（对应 useDidShow）
  useEffect(() => {
    const runOnActiveLogic = async () => {
      if (__DEV__) {
        console.log('[rn][restore] runOnActiveLogic 执行');
      }
      // 清理可能遗留的全局 Loading
      try {
        Toast.removeAll();
      } catch {}

      // 应用激活时，检查并初始化推送
      try {
        const [agree, token, pushRes] = await Promise.all([
          cacheGet({ key: 'agreePrivacy' }).catch(() => false),
          cacheGet({ key: 'token' }).catch(() => undefined),
          getStorage({ key: 'pushEnabled' }).catch(
            () => ({ data: undefined } as any),
          ),
        ]);

        const enabled = pushRes?.data === true;
        const loggedIn = !!token;

        if (agree && enabled && loggedIn) {
          // 主动拉取一次推送设备信息
          await getMobPushDeviceInfo();
        }

        // 处理从系统设置返回的逻辑（rnReLaunchPath）
        try {
          const rnReLaunchRes = await getStorage<{
            path?: string;
            params?: Record<string, any>;
            value?: any;
          }>({ key: 'rnReLaunchPath' }).catch(() => null);
          // getStorage 返回的就是存入的值本身，不是 { data: xxx }
          const data = rnReLaunchRes ?? undefined;
          if (__DEV__) {
            console.log(
              '[rn][restore] rnReLaunchPath 读取结果',
              data ? { path: data.path } : '(未存储或已清除，跳过恢复)',
            );
          }
          if (!data?.path) return;

          try {
            // 获取当前栈顶路由，判断app是否被杀掉
            const pages = getCurrentPages();
            const top = pages && pages[pages.length - 1];
            const route =
              (top as any)?.routeName ||
              (top as any)?.route ||
              (top as any)?.path;

            const normalize = (p?: string) =>
              (p || '').replace(/^\//, '').replace(/^pages\//, '');
            const currentRoute = normalize(route as string);
            const targetRoute = normalize(data.path);

            // 如果当前页面就是目标页面，说明app未被杀掉，由页面自己的onShow处理
            if (currentRoute === targetRoute) {
              await setStorage({
                key: 'rnReLaunchPathProcessing',
                data: true,
              }).catch(() => {});
              // 延迟检查，如果页面处理完会清除记录
              setTimeout(async () => {
                const stillExists = await getStorage({
                  key: 'rnReLaunchPath',
                }).catch(() => null);
                if (stillExists?.path) {
                  await removeStorage({ key: 'rnReLaunchPath' }).catch(
                    () => {},
                  );
                }
                await removeStorage({
                  key: 'rnReLaunchPathProcessing',
                }).catch(() => {});
              }, 3000);
              return;
            }
          } catch (e) {
            console.log('[rn][restore] route check failed', e);
          }

          const { path, params } = data;
          // 先清除记录，避免重复处理
          await removeStorage({ key: 'rnReLaunchPath' }).catch(() => {});

          try {
            // 检查是否正在处理中（避免与页面onShow重复处理）
            const processing = await getStorage({
              key: 'rnReLaunchPathProcessing',
            }).catch(() => null);
            if (processing) {
              console.log('[rn][restore] 页面正在处理中，跳过app.tsx处理');
              return;
            }

            const info = await getSystemConnectedDevices();
            if (path === 'FindDevice') {
              const isPaired =
                info.data?.some((item: any) =>
                  isSameMac(item.deviceId || item.mac, params?.bleNo),
                ) ||
                info.data?.some((item: any) => item.name === params?.bleName) ||
                false;
              const deviceInfo =
                info.data?.find((item: any) =>
                  isSameMac(item.deviceId || item.mac, params?.bleNo),
                ) ||
                info.data?.find((item: any) => item.name === params?.bleName);
              if (isPaired) {
                const bluetoothDeviceInfoList =
                  (await getBluetoothDeviceInfo().catch(() => null)) || {};
                const { bleNo, imageMap, lockId, mode, pageName, needPin } =
                  params || {};
                let res: any;
                let bindRes: any;

                if (pageName?.includes('BindDevice')) {
                  Toast.loading('绑定中...', 0);
                  bindRes = await bind({
                    deviceNo: params?.deviceNo,
                    userId: null,
                  });
                  res = bindRes;
                } else {
                  Toast.loading('连接中...', 0);
                  res = await openBluetoothProximity({ id: lockId });
                }

                Toast.removeAll();
                if (res?.code === 200 || res?.code === '200') {
                  if (pageName?.includes('BindDevice')) {
                    Toast.success('绑定成功');
                    if (bindRes?.data) {
                      await setStorage({
                        key: 'rnBindSuccessData',
                        data: bindRes.data,
                      });
                      // 先写入蓝牙设备列表，再 reLaunch，避免 reLaunch 导致后续代码不执行
                      if (bleNo) {
                        const newMap = { ...bluetoothDeviceInfoList };
                        newMap[bleNo] = {
                          bleNo: bleNo,
                          deviceId: deviceInfo?.deviceId || deviceInfo?.mac,
                          name: deviceInfo?.name || deviceInfo?.localName,
                          imageMap: imageMap,
                          isPaired: true,
                        };
                        await setStorage({
                          key: 'bluetoothDeviceInfoList',
                          data: newMap,
                        });
                      }

                      eventCenter.trigger('rnBindSuccess', bindRes.data);
                      reLaunch('Index', { lockId: bindRes.data?.id });
                    }
                  }

                  if (pageName?.includes('BluetoothControl') && !mode) {
                    if (!!!needPin) {
                      const pollOk = async (): Promise<boolean> => {
                        const start = Date.now();
                        const timeoutMs = 10000;
                        const intervalMs = 1000;

                        while (Date.now() - start < timeoutMs) {
                          try {
                            const res: any = await getBluetoothStatus({
                              id: lockId,
                              bluetoothStatus: 1,
                            });
                            const codeOk =
                              res?.success === true || res?.code === 200;

                            if (res?.data) return true;
                          } catch {
                            // 轮询继续
                          }

                          await new Promise(resolve =>
                            setTimeout(resolve, intervalMs),
                          );
                        }

                        return false;
                      };

                      const ok = await pollOk();
                      if (!ok) {
                        setTimeout(() => {
                          showToast({
                            title: '自动动升降开启失败，请重试',
                            icon: 'none',
                          });
                        }, 600);
                        return;
                      }

                      setTimeout(() => {
                        Toast.success('自动升降开启成功');
                      }, 600);
                      return;
                    }
                    Toast.success('自动升降开启成功');
                  }
                  if (pageName?.includes('BluetoothControl') && mode) {
                    Toast.success('连接成功');
                  }

                  try {
                    if (bleNo && !pageName?.includes('BindDevice')) {
                      const newMap = { ...bluetoothDeviceInfoList };
                      newMap[bleNo] = {
                        bleNo: bleNo,
                        deviceId: deviceInfo?.deviceId || deviceInfo?.mac,
                        name: deviceInfo?.name || deviceInfo?.localName,
                        imageMap: imageMap,
                        isPaired: true,
                      };
                      await setStorage({
                        key: 'bluetoothDeviceInfoList',
                        data: { data: newMap },
                      });
                    }
                  } catch (e) {
                    console.error('更新 bluetoothDeviceInfoList 映射失败:', e);
                  }
                } else {
                  Toast.fail(res?.message || '操作失败');
                }
              }
            } else {
              // 其他路径直接跳转
              reLaunch(data.path, params);
            }
          } catch (e) {
            // URLSearchParams 失败则只跳路径
            reLaunch('Index');
          }
        } catch (e) {
          console.error('处理 rnReLaunchPath 失败:', e);
        }
      } catch (error) {
        console.error('应用激活处理失败:', error);
      }
    };

    // 冷启动：App 被系统杀掉后重新打开时，AppState 一开始就是 'active'，不会触发 change，
    // 因此挂载时若已是 active，延迟执行一次“从设置返回”的逻辑（延迟稍长以确保 AsyncStorage/导航已就绪）
    let coldStartTimer: ReturnType<typeof setTimeout> | null = null;
    if (AppState.currentState === 'active') {
      if (__DEV__) {
        console.log(
          '[rn][restore] 冷启动检测到 active，将在 1.2s 后执行 runOnActiveLogic',
        );
      }
      coldStartTimer = setTimeout(() => {
        runOnActiveLogic();
      }, 1200);
    }

    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          runOnActiveLogic();
        }
      },
    );

    return () => {
      subscription.remove();
      if (coldStartTimer != null) clearTimeout(coldStartTimer);
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
          <StoreProvider>
            <ThemeProvider>
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
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: '600',
                            marginBottom: 12,
                          }}
                        >
                          用户协议及隐私保护
                        </Text>
                        <Text style={{ fontSize: 14, lineHeight: 20 }}>
                          我已阅读并同意
                          <Text
                            style={{ color: '#1E80FF' }}
                            onPress={async e => {
                              e?.stopPropagation?.();
                              // 跳转前先关闭弹窗，避免覆盖目标页面
                              agreePopRef.current?.close?.();
                              // 标记返回后需要重开隐私弹窗
                              try {
                                await setStorage({
                                  key: 'reopenPrivacyAfterWeb',
                                  data: true,
                                });
                                await setStorage({
                                  key: 'privacyOpenBy',
                                  data: 'app',
                                });
                              } catch {}
                              if (navigationRef?.isReady()) {
                                navigationRef.navigate('WebView', {
                                  url: 'https://g.18qjz.cn/protocol/boklock/userAgreement.html',
                                  title: '泊刻地锁用户协议',
                                });
                              }
                            }}
                          >
                            《泊刻地锁用户协议》
                          </Text>
                          和
                          <Text
                            style={{ color: '#1E80FF' }}
                            onPress={async e => {
                              e?.stopPropagation?.();
                              // 跳转前先关闭弹窗，避免覆盖目标页面
                              agreePopRef.current?.close?.();
                              // 标记返回后需要重开隐私弹窗
                              try {
                                await setStorage({
                                  key: 'reopenPrivacyAfterWeb',
                                  data: true,
                                });
                                await setStorage({
                                  key: 'privacyOpenBy',
                                  data: 'app',
                                });
                              } catch {}
                              if (navigationRef?.isReady()) {
                                navigationRef.navigate('WebView', {
                                  url: 'https://g.18qjz.cn/protocol/boklock/privacyPolicy.html',
                                  title: '泊刻地锁隐私政策',
                                });
                              }
                            }}
                          >
                            《隐私政策》
                          </Text>
                        </Text>
                        <Text
                          style={{ fontSize: 12, color: '#999', marginTop: 8 }}
                        >
                          为保障设备状态提醒的可靠送达，在您同意隐私条款后，应用在退出后可能继续维持通知服务（包含自启动/关联启动的后台行为）。您可在设置中随时关闭通知服务。
                        </Text>
                      </Flex>
                    }
                    cancelText="不同意"
                    onCancel={() => {
                      agreePopRef.current?.close?.();
                      setTimeout(() => retainPopRef.current?.open?.(), 600);
                    }}
                    submitBtn={
                      <GradientButton
                        width={124}
                        colors={['#282828', '#4A4A4A']}
                        style={{
                          backgroundColor: '#333',
                          marginLeft: 15,
                          borderRadius: 12,
                          height: 42,
                        }}
                        onPress={async () => {
                          try {
                            await cacheSet({ key: 'agreePrivacy', data: true });
                            await handlePrivacyAgreed();
                            agreePopRef.current?.close?.();
                          } catch (error) {
                            console.error('保存隐私协议同意状态失败:', error);
                          }
                        }}
                      >
                        <Text style={{ color: '#fff' }}>同意并继续</Text>
                      </GradientButton>
                    }
                  />

                  {/* 拒绝后的挽留说明弹窗 */}
                  <PopConfirm
                    ref={retainPopRef}
                    showClose={false}
                    confirmText="我知道了"
                    title={
                      <Flex direction="column" align="center" justify="center">
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: '600',
                            marginBottom: 12,
                          }}
                        >
                          温馨提示
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            lineHeight: 20,
                            textAlign: 'center',
                          }}
                        >
                          为保障您顺利绑定设备和正常使用定位、蓝牙、通知等功能，以及设备状态提醒的正常收取，建议您同意
                          <Text style={{ color: '#1E80FF' }}>
                            《泊刻地锁用户协议》
                          </Text>
                          和
                          <Text style={{ color: '#1E80FF' }}>《隐私政策》</Text>
                          。您也可以选择暂不登录继续浏览。
                        </Text>
                      </Flex>
                    }
                  />

                  {/* 全局 PopConfirm 弹窗（用于工具函数调用） */}
                  {globalPopConfirmConfig && (
                    <PopConfirm
                      ref={globalPopConfirmRef}
                      title={
                        <Flex
                          direction="column"
                          align="center"
                          justify="center"
                        >
                          <View
                            style={{
                              paddingTop: 24,
                              fontSize: 16,
                              fontWeight: '500',
                              textAlign: 'center',
                            }}
                          >
                            {globalPopConfirmConfig.title}
                          </View>
                        </Flex>
                      }
                      confirmText={globalPopConfirmConfig.confirmText || '确定'}
                      cancelText={globalPopConfirmConfig.cancelText || '取消'}
                      showClose={globalPopConfirmConfig.showClose !== false}
                      confirmColors={globalPopConfirmConfig.confirmColors}
                      confirmTextColor={globalPopConfirmConfig.confirmTextColor}
                      onConfirm={async () => {
                        const result =
                          await globalPopConfirmConfig.onConfirm?.();
                        if (result !== false) {
                          globalPopConfirmRef.current?.close();
                          setGlobalPopConfirmConfig(null);
                        }
                      }}
                      onCancel={async () => {
                        await globalPopConfirmConfig.onCancel?.();
                        globalPopConfirmRef.current?.close();
                        setGlobalPopConfirmConfig(null);
                      }}
                    >
                      {globalPopConfirmConfig.children || undefined}
                    </PopConfirm>
                  )}
                </SafeAreaProvider>
              </GestureHandlerRootView>
            </ThemeProvider>
          </StoreProvider>
          <AppUpdateDialogHost />
          <GlobalLoading />
          <GlobalToast />
        </AntdProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
