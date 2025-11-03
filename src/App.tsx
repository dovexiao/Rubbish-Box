/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useCallback} from 'react';
import {
  // Alert,
  Image,
  // Linking,
  StatusBar,
  View,
  useWindowDimensions,
  Platform,
} from 'react-native';
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
import MainNav from './main-navigation';
import theme from '@style';
import {linking, routes} from './route';
import {
  getUUID,
  getUrlParams,
  navigationRef,
  envConfig,
  // fetchPushy,
} from '@utils';
import globalStore from './services/global.state';
import {BasicObject} from '@types';
import {DialogLoading} from '@basicComponents/dialog';
import {useToast} from '@basicComponents/modal';
import {
  getBalance,
  getMessageNotReadCount,
  // noticeCheckOut,
  postReadMessage,
} from '@services/global.service';
import {takeUntil, throttleTime} from 'rxjs';
import {
  // PopInfo,
  checkPop,
  dailyRecord,
  // initPush,
  setToken,
  setUserInfo,
  setVisitor,
} from './app.service';
import {useVersionModal} from './common-pages/hooks/versionmodal.hooks';
import {NativeTouchableOpacity} from './components/basic/touchable-opacity';
import {Overlay} from '@rneui/themed';
import Splash from './common-pages/splash';
import {useTranslation} from 'react-i18next';
import {useLanguageModal} from './components/business/language';
import ReuseWebView from './common-pages/webview/webview.reuse';
import {useSettingWindowDimensions} from './store/useSettingStore';
// import {LazyImageBackground} from './components/basic/image';
// import {renderOverlayLinkComponent} from './components/basic/swiper';
// import {goToUrl} from './common-pages/game-navigate';
import PopList from '@/components/basic/swiper/pop-list';
import dayjs from 'dayjs';
import {appPayWaster} from '@services/global.service';
import {UpdateProvider, Pushy} from 'react-native-update'; //useUpdate
import {GestureHandlerRootView} from 'react-native-gesture-handler';
const pushyClient = new Pushy({
  appKey: 'pzyfXnB4qhPsH6JtPfW3_sI-',
  updateStrategy: 'silentAndLater', //-----关闭pushy自带热更新
  // checkStrategy: null,
  // 注意，默认情况下，在开发环境中不会检查更新
  // 如需在开发环境中调试更新，请设置debug为true
  // 但即便打开此选项，也仅能检查、下载热更，并不能实际应用热更。实际应用热更必须在release包中进行。
  debug: true,
});
// import StartLoadingWeb from './common-pages/start-loading';
setVisitor(getUUID());

const Stack = createStackNavigator();
const params = getUrlParams();

function App(): JSX.Element {
  const basePx = globalStore.screenWidth / 375;
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // 关闭当前弹窗时逻辑
  const handleCloseBanner = () => {
    if (currentBannerIndex < bannerList.length - 1) {
      // 显示下一张
      setCurrentBannerIndex(currentBannerIndex + 1);
    } else {
      // 所有弹完关闭 Overlay
      setPopVisible(false);
      setCurrentBannerIndex(0); // 重置
    }
  };
  // const {
  //   // client,
  //   checkUpdate,
  //   downloadUpdate,
  //   // downloadAndInstallApk
  //   switchVersionLater,
  //   // switchVersion,
  //   // updateInfo,
  //   // markSuccess,
  //   // packageVersion,
  //   // currentHash,
  //   // progress: {received, total} = {},
  //   // restartApp,
  // } = useUpdate();
  if (params.channel) {
    globalStore.channel = params.channel;
  }
  if (params.channelId) {
    globalStore.channel = params.channelId;
  }
  if (params.code) {
    localStorage.setItem('invitationCode', params.code);
  }
  if (params.viewtype) {
    globalStore.viewType = params.viewtype === 'webview' ? 1 : 0;
  }
  const {i18n} = useTranslation();
  const routeNameRef = React.useRef<null | string>();
  // const remoteBundleRef = React.useRef<null | SafeAny>();
  // const downloadLock = React.useRef<boolean>(false);
  const [currentRouteName, setCurrentRouteName] = React.useState('');
  // const [loading, _setLoading] = React.useState(!globalStore.isWeb);
  const [loading, _setLoading] = React.useState(false);
  const [globalLoading, setGlobalLoading] = React.useState(false);
  const {renderModal: renderToast, show: toastShow} = useToast();
  const {updateWindowDimensions, screenWidth} = useSettingWindowDimensions();

  // const [codeInited, setCodeInited] = React.useState(false);
  const [available, _setAvailable] = React.useState(0);
  const {height} = useWindowDimensions();
  // const initChat = () => {
  //   const chatModule = require('@components/chat');
  //   const freshchatConfig = new chatModule.FreshchatConfig(
  //     '3431af1d-2d7a-41e3-b0d0-11bc0b3f3bd9',
  //     'e45c710e-7a8f-4629-9d05-9d84c379abce',
  //   );
  //   freshchatConfig.domain = 'msdk.freshchat.com';
  //   chatModule.Freshchat.init(freshchatConfig);
  // };

  /** 全局订阅 */
  const globalSubscriptions = () => {
    globalStore.globalLoading
      .pipe(takeUntil(globalStore.appDistory))
      .subscribe(bool => {
        setGlobalLoading(bool);
      });
    globalStore.globalTotal
      .pipe(takeUntil(globalStore.appDistory))
      .subscribe(config => {
        config.message = config.message;
        toastShow(config);
      });
    globalStore.tokenSubject
      .pipe(takeUntil(globalStore.appDistory))
      .subscribe(token => {
        if (!token) {
          globalStore.notificationSubject.next({
            messageTotalCount: 0,
            sysMessageCount: 0,
            sysUserMessageCount: 0,
          });
          return;
        }
        globalStore.updateAmount.next();
      });
    globalStore.refreshNotification
      .pipe(takeUntil(globalStore.appDistory))
      .subscribe(() => {
        getMessageNotReadCount().then(countInfo =>
          globalStore.notificationSubject.next(countInfo),
        );
      });
    globalStore.readNotification
      .pipe(takeUntil(globalStore.appDistory))
      .subscribe(({messageId, messageType}) => {
        postReadMessage(messageId, messageType).then(() => {});
      });
    globalStore.updateAmount
      .pipe(throttleTime(200), takeUntil(globalStore.appDistory))
      .subscribe(() => {
        globalStore.token &&
          getBalance().then(amount => {
            globalStore.setAmount(amount);
          });
      });
    // globalStore.amountCheckOut
    //   .pipe(throttleTime(200), takeUntil(globalStore.appDistory))
    //   .subscribe(() => {
    //     noticeCheckOut();
    //   });
  };
  const [chckedLang, setCheckLang] = React.useState(false);
  const {renderModal: renderLanguageModal, show: languageShow} =
    useLanguageModal({
      afterHidden: () => {
        setCheckLang(true);
      },
    });
  const checkLang = () => {
    globalStore.asyncGetItem('language').then(res => {
      if (res) {
        setCheckLang(true);
        globalStore.lang = res;
        i18n.changeLanguage(res);
      } else {
        languageShow();
      }
    });
  };
  // const checkUpdateVersion = async () => {
  //   try {
  //     const res = await checkUpdate();
  //     const info = res;
  //     if (info?.expired) {
  //       Alert.alert(
  //         'The version is too old',
  //         'Please download the latest version later',
  //         [
  //           {
  //             text: i18n.t('splash.tip.sure'),
  //             onPress: () => {
  //               setLoading(false);
  //             },
  //           },
  //         ],
  //       );
  //     } else if (info?.update) {
  //       // 强制更新
  //       Alert.alert(
  //         i18n.t('splash.tip.alertTitle'),
  //         i18n.t('splash.tip.alertContent'),
  //         [
  //           {
  //             text: i18n.t('splash.tip.download'),
  //             onPress: async () => {
  //               setAvailable(1);
  //               const ok = await downloadUpdate();
  //               if (ok) {
  //                 switchVersionLater();
  //                 Alert.alert(
  //                   'Update completed',
  //                   'The next startup will automatically apply the new version',
  //                   [
  //                     {
  //                       text: i18n.t('splash.tip.sure'),
  //                       onPress: () => {
  //                         setLoading(false);
  //                       },
  //                     },
  //                   ],
  //                 );
  //               }
  //             },
  //           },
  //         ],
  //       );
  //     } else {
  //       setLoading(false);
  //     }
  //   } catch (error) {
  //     setLoading(false);
  //   }
  // };
  const initApp = () => {
    setToken();
    setUserInfo();
    checkLang();
    globalSubscriptions();
    dailyRecord();
    if (globalStore.isAndroid) {
      // fetchPushy().then(flag => {
      //   if (flag) {
      //     checkUpdateVersion();
      //   } else {
      //     setLoading(false);
      //   }
      // });
      versionModal.handleUpdate();
      const ReactMoE = require('react-native-moengage').default;
      ReactMoE.setEventListener('pushClicked', (notificationPayload: any) => {
        /**
         * 点击PUSH事件回调在此处处理, 注意测试下该回调是在前台触发还是后台接收触发
         */
        console.log('pushClicked', notificationPayload);
      });
    } else if (globalStore.isWeb) {
      globalStore.asyncGetItem('channel').then(channel => {
        globalStore.channel = channel || getUrlParams().channel;
        globalStore.updateDimensions();
        updateWindowDimensions();
        window.addEventListener('resize', () => {
          globalStore.updateDimensions();
          updateWindowDimensions();
        });
      });
    }
  };

  const initChannelId = () => {
    const chatModule = require('@components/chat');
    chatModule.Freshchat.getChannelId((res: any) => {
      globalStore.channel = res;
    });
  };

  React.useEffect(() => {
    globalStore.asyncGetItem('channel').then(c => {
      if (globalStore.isWeb) {
        globalStore.channel = c || (envConfig.getChannelId as string);
      }
      if (globalStore.isAndroid) {
        initChannelId();
      }
      if (globalStore.channel !== null && globalStore.channel !== undefined) {
        globalStore.asyncSetItem('hasChecked', globalStore.channel);
      }
      initApp();
    });
    return () => {
      globalStore.appDistory.next(true);
      globalStore.appDistory.complete();
    };
  }, []);

  // React.useEffect(() => {
  //   if (codeInited && globalStore.isAndroid) {
  //     // 先更新，在干其他的
  //     // initChat();
  //     // initPush();
  //     setLoading(false);
  //   }
  // }, [codeInited]);

  const popImageWidth = screenWidth * 0.85;
  const [popVisible, setPopVisible] = React.useState(false);
  const [bannerList, setBannerList] = useState<any[]>([]);
  // const [overlayState, setOverlayState] = useState<
  //   PopInfo & {imageRatio: number}
  // >({
  //   bannerImg: '',
  //   bannerImgWeb: '',
  //   bannerPosition: 1,
  //   popImg: '',
  //   popUrl: '',
  //   buttonStyle: 1,
  //   status: 0,
  //   subTitle: '',
  //   title: '',
  //   imageRatio: 281 / 360,
  // });
  const [imageRatio, setImageRatio] = useState(948 / 712);
  const versionModal = useVersionModal(
    false,
    () => {
      // 如果需要更新,就不触发弹窗
      globalStore.asyncGetItem('last_check_pop').then(_res => {
        // const timeCode = parseInt(res || '0', 10);
        // if (
        //   !timeCode ||
        //   timeCode < new Date(new Date().toLocaleDateString()).getTime()
        // ) {
        setTimeout(() => {
          checkPop().then(popInfo => {
            if (popInfo?.length > 0) {
              // 先获取第一张图片真实尺寸
              Image.getSize(
                popInfo[0].bannerImg,
                (width, height) => {
                  setImageRatio(height / width);
                  setBannerList(popInfo); // 设置弹窗列表
                  setPopVisible(true); // 延迟显示弹窗，确保高度正确
                  setCurrentBannerIndex(0); // 显示第一张
                },
                error => {
                  // 如果获取失败，使用默认比例显示
                  setImageRatio(948 / 712);
                  setBannerList(popInfo);
                  setPopVisible(true);
                  setCurrentBannerIndex(0);
                },
              );
            } else {
              setBannerList([]); // 没有弹窗图片
            }
            globalStore.asyncSetItem(
              'last_check_pop',
              new Date().getTime() + '',
            );
          });
        }, 1000);
        // }
      });
    },
    false,
  );

  const checkLangRef = React.useRef(false);
  const trigglePop = () => {
    // 直接延迟是因为为了避免被顶号的情况导致弹窗被带到login
    if (globalStore.isWeb) {
      const id = setInterval(() => {
        if (location.href.indexOf('/index/') > -1) {
          clearInterval(id);
          !popVisible && setPopVisible(true);
        }
      }, 1000);
    }
  };
  React.useEffect(() => {
    checkLangRef.current = chckedLang;
  }, [chckedLang]);
  React.useEffect(() => {
    if (globalStore.isAndroid && bannerList.length && !loading && chckedLang) {
      !popVisible && setPopVisible(true);
    }
  }, [loading, chckedLang, bannerList]);

  // 初始化Adjust配置（使用原生已配置的App Token）
  const initAdjust = () => {
    if (Platform.OS !== 'web') {
      // ios的在TS文件中已调用start方法，这边在调用就会多次触发
      const {Adjust, AdjustConfig} = require('react-native-adjust');
      const adjustConfig = new AdjustConfig(
        '33z3sllv0cqo',
        __DEV__
          ? AdjustConfig.EnvironmentSandbox
          : AdjustConfig.EnvironmentProduction,
      );
      // 开启详细日志（生产环境建议关闭）
      // adjustConfig.setLogLevel(AdjustConfig.LogLevelVerbose);
      // 初始化SDK
      Adjust.create(adjustConfig);
      // 获取adid
      Adjust.getAdid((adid: string) => {
        globalStore.adjustId = adid;
      });
    } else {
      const Adjust = require('@adjustcom/adjust-web-sdk');
      Adjust.initSdk({
        appToken: '33z3sllv0cqo',
        environment: __DEV__ ? 'sandbox' : 'production', // 或'production'
        logLevel: 'verbose', // 可选
      });
    }
  };

  React.useEffect(() => {
    // 在应用启动时调用
    initAdjust();
  }, []);

  const getWaterString = (list: any[], paramKey: string) => {
    return list
      .map((item: any) => {
        const createTime = dayjs(item.createTime).format(
          'DD-MM YYYY hh:mm:ss A',
        );
        return `《${createTime} -- ${item[paramKey]}》
        `;
      })
      .join('');
  };
  const getPayWaster = useCallback(async () => {
    const data = await appPayWaster();
    const orderStr = getWaterString(data?.listWaterVo || [], 'tradeNo');
    globalStore.currentOrder = orderStr || '';
    globalStore.currentOrderInfo = {
      phone: data.userInfo || '',
      packageId: data.packageId || '',
    };
  }, []);
  React.useEffect(() => {
    globalStore.tokenSubject.subscribe(token => {
      if (token) {
        getPayWaster();
      }
    });
  }, []);
  React.useEffect(() => {
    if (Platform.OS !== 'android') {
      const subscription = globalStore.userSubject
        .pipe(takeUntil(globalStore.appDistory))
        .subscribe(userInfo => {
          const w = window as any;
          const defaultUserInfo = {
            userId: 'player_111111',
            userName: 'tourist_player_0000000',
            language: 'en',
            userPhone: 'No Phone',
            email: 'No Email',
            description: 'No Desc',
            label_names: ['label_1', 'label_2'],
            custom_fields_ext: {'1210': 'test11', more: ['s1', 's2']},
          };
          const selfInfo = userInfo || defaultUserInfo || {};
          const orderUserInfo = globalStore.currentOrderInfo || {};
          w.ssq.push('setLoginInfo', {
            user_id: selfInfo.userId || '',
            user_name: selfInfo.userId || '',
            language: globalStore.lang || 'en',
            phone: orderUserInfo.phone || selfInfo.userPhone || '',
            email: `packageId@${orderUserInfo.packageId || ''}`,
            description: globalStore.currentOrder || 'Web user',
            label_names: ['label_1', 'label_2'],
            custom_fields_ext: {'1210': 'test11', more: ['s1', 's2']},
          });
        });
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [globalStore.currentOrder, globalStore.currentOrderInfo]);
  const addHeight = Platform.OS === 'web' ? 50 : 50;
  return (
    <SafeAreaProvider style={[theme.position.rel]}>
      {/* <StartLoadingWeb /> */}
      <StatusBar barStyle="light-content" />
      <SafeAreaView
        style={[
          globalStore.isWeb &&
            ({
              height: `${height}px`,
              width: '100vw',
              maxWidth: '500px',
              marginHorizontal: 'auto',
            } as BasicObject),
          theme.flex.col,
          theme.overflow.hidden,
          theme.position.rel,
        ]}>
        <View style={[theme.fill.fill]}>
          <NavigationContainer
            ref={navigationRef}
            linking={linking}
            onReady={() => {
              const currentRoute = navigationRef.getCurrentRoute()?.name ?? '';
              routeNameRef.current = currentRoute;
              setCurrentRouteName(currentRoute);
            }}
            onStateChange={() => {
              const currentRoute = navigationRef.getCurrentRoute()?.name ?? '';
              if (routeNameRef.current !== currentRoute) {
                routeNameRef.current = currentRoute;
                setCurrentRouteName(currentRoute);
              }
            }}>
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
                cardStyleInterpolator: globalStore.isWeb
                  ? undefined
                  : CardStyleInterpolators.forHorizontalIOS,
              }}>
              {loading ? (
                <Stack.Screen name="Splash">
                  {props => <Splash {...props} available={available} />}
                </Stack.Screen>
              ) : (
                <>
                  <Stack.Screen name="Index" component={MainNav} />
                  {Object.values(routes).map(route => (
                    <Stack.Screen
                      key={route.name}
                      name={route.name}
                      component={route.component}
                      options={{headerShown: route.headerShown || false}}
                    />
                  ))}
                </>
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </View>
        <ReuseWebView />
      </SafeAreaView>
      <DialogLoading isVisible={globalLoading} />
      {renderToast}
      {versionModal.versionModal.renderModal}
      {popVisible && ['Home', 'Index'].includes(currentRouteName) && (
        <Overlay
          isVisible={popVisible}
          backdropStyle={[{backgroundColor: 'rgba(0,0,0,0.60)'}]}
          overlayStyle={[
            theme.padding.zorro,
            theme.flex.centerByCol,
            {
              width: popImageWidth,
              height: popImageWidth * imageRatio + addHeight,
              backgroundColor: theme.basicColor.newTransparent,
              shadowOpacity: 0, // 取消阴影透明度
              elevation: 0,
            },
          ]}>
          <GestureHandlerRootView style={{flex: 1}}>
            <View
              style={{
                width: popImageWidth,
                height: popImageWidth * imageRatio + addHeight,
                overflow: 'hidden',
              }}>
              <PopList
                type={2}
                bannerList={bannerList}
                bannerWidth={popImageWidth}
                bannerHeight={popImageWidth * imageRatio + addHeight}
                bannerOverlaySize="small"
                currentIndex={currentBannerIndex}
                onClose={() => setPopVisible(false)}
              />
            </View>
          </GestureHandlerRootView>

          {/* 关闭按钮 */}
          <NativeTouchableOpacity
            style={{
              right: -110 * basePx,
              bottom: 535 * basePx,
            }}
            onPress={handleCloseBanner}>
            <Image
              style={[theme.icon.xxl, theme.position.abs]}
              source={require('@assets/icons/home/button-close.png')}
            />
          </NativeTouchableOpacity>
        </Overlay>
      )}
      {!loading && renderLanguageModal}
    </SafeAreaProvider>
  );
}

export default function Root() {
  if (globalStore.isWeb || !pushyClient) {
    return <App />;
  }
  return (
    <UpdateProvider client={pushyClient}>
      <App />
    </UpdateProvider>
  );
}
