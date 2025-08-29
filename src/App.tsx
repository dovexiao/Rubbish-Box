/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState} from 'react';
import {
  Alert,
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
import {getUUID, getUrlParams, navigationRef, envConfig} from '@utils';
import globalStore from './services/global.state';
import {BasicObject, SafeAny} from '@types';
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
import {BannerSwiper} from '@/components/basic/swiper';
// import StartLoadingWeb from './common-pages/start-loading';
setVisitor(getUUID());

declare var CodePush: any;
declare var AppWithCodePush: any;
if (globalStore.isAndroid) {
  CodePush = require('react-native-code-push');
}
const Stack = createStackNavigator();
const params = getUrlParams();

function App(): JSX.Element {
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
  const remoteBundleRef = React.useRef<null | SafeAny>();
  const downloadLock = React.useRef<boolean>(false);
  const [currentRouteName, setCurrentRouteName] = React.useState('');
  const [loading, setLoading] = React.useState(!globalStore.isWeb);
  const [globalLoading, setGlobalLoading] = React.useState(false);
  const {renderModal: renderToast, show: toastShow} = useToast();
  const {updateWindowDimensions, screenWidth} = useSettingWindowDimensions();
  // const [screenHeight, setScreenHeight] = useState(
  //   globalStore.isWeb ? innerHeight + 'px' : innerHeight,
  // );
  const [codeInited, setCodeInited] = React.useState(false);
  const [available, setAvailable] = React.useState(0);
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

  const checkUpdate = async () => {
    if (__DEV__ || !envConfig.codePushKey) {
      return setCodeInited(true);
    }
    if (globalStore.isWeb) {
      return;
    }
    try {
      remoteBundleRef.current = await CodePush.checkForUpdate(
        envConfig.codePushKey,
      );
      checkRemoteBoundle(remoteBundleRef.current);
    } catch (error) {
      checkRemoteBoundle(null);
    }
  };

  const checkRemoteBoundle = async (remoteBundle: SafeAny) => {
    if (remoteBundle) {
      if (remoteBundle.isMandatory) {
        // 强制更新
        setAvailable(1);
        const bundle = await remoteBundle.download();
        await bundle.install(CodePush.InstallMode.ON_NEXT_RESTART);
        Alert.alert(
          i18n.t('splash.tip.alertTitle'),
          i18n.t('splash.tip.alertContent'),
          [
            {
              text: i18n.t('splash.tip.restart'),
              onPress: async () => {
                await CodePush.notifyAppReady();
                await CodePush.restartApp();
              },
            },
          ],
        );
      } else {
        // 后台下载 先去首页
        setCodeInited(true);
      }
    } else {
      setCodeInited(true);
    }
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

  const initApp = () => {
    setToken();
    setUserInfo();
    checkLang();
    globalSubscriptions();
    dailyRecord();
    if (globalStore.isAndroid) {
      versionModal.handleUpdate();
      const ReactMoE = require('react-native-moengage').default;
      ReactMoE.setEventListener('pushClicked', (notificationPayload: any) => {
        /**
         * 点击PUSH事件回调在此处处理, 注意测试下该回调是在前台触发还是后台接收触发
         */
        console.log('pushClicked', notificationPayload);
      });
      checkUpdate();
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

  const startBackDownload = async () => {
    if (remoteBundleRef.current && !remoteBundleRef.current.isMandatory) {
      downloadLock.current = true;
      const bundle = await remoteBundleRef.current.download(
        (progress: {receivedBytes: any; totalBytes: any}) => {
          const {receivedBytes, totalBytes} = progress;
          const rate = (receivedBytes / totalBytes).toFixed(2);
          globalStore.rate = parseFloat(rate);
        },
      );
      await bundle.install(CodePush.InstallMode.ON_NEXT_RESTART);
      Alert.alert(
        i18n.t('splash.tip.alertTitle'),
        i18n.t('splash.tip.alertContent'),
        [
          {
            text: i18n.t('splash.tip.restart'),
            onPress: async () => {
              globalStore.rate = 0;
              await CodePush.notifyAppReady();
              await CodePush.restartApp();
            },
          },
          {
            text: i18n.t('label.cancel'),
            onPress: async () => {
              globalStore.rate = 0;
              remoteBundleRef.current = null;
              await CodePush.notifyAppReady();
            },
          },
        ],
      );
    }
  };

  React.useEffect(() => {
    if (codeInited && globalStore.isAndroid) {
      // 先更新，在干其他的
      // initChat();
      // initPush();
      setLoading(false);
    }
  }, [codeInited]);

  React.useEffect(() => {
    if (
      currentRouteName === 'Home' &&
      globalStore.isAndroid &&
      !downloadLock.current
    ) {
      startBackDownload();
    }
  }, [currentRouteName]);

  const popImageWidth = screenWidth * 0.75;
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
  const [imageRatio, setImageRatio] = useState(281 / 360);
  const versionModal = useVersionModal(
    false,
    versionInfo => {
      if (versionInfo) {
        // 如果需要更新,就不触发弹窗
        return;
      }
      globalStore.asyncGetItem('last_check_pop').then(_res => {
        // const timeCode = parseInt(res || '0', 10);
        // if (
        //   !timeCode ||
        //   timeCode < new Date(new Date().toLocaleDateString()).getTime()
        // ) {
        setTimeout(() => {
          checkPop().then(popInfo => {
            setBannerList(popInfo);
            if (popInfo?.length > 0) {
              Image.getSize(popInfo[0].bannerImg, (width, height) => {
                setImageRatio(height / width);
                trigglePop();
              });
            }
            // if (popInfo?.status === 1 && popInfo?.popImg) {
            //   Image.getSize(popInfo.popImg, (width, height) => {
            //     setOverlayState({
            //       ...popInfo,
            //       imageRatio: height / width,
            //     });
            //     trigglePop();
            //   });
            // }
          });
          globalStore.asyncSetItem('last_check_pop', new Date().getTime() + '');
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
  const addHeight = Platform.OS === 'web' ? 50 : 300;
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
            onStateChange={() => {
              const previousRouteName = routeNameRef.current;
              const currentRoute = navigationRef!.getCurrentRoute()!.name;
              if (previousRouteName !== '') {
                setCurrentRouteName(currentRoute);
              }
              routeNameRef.current = currentRouteName;
            }}
            ref={navigationRef}
            linking={linking}>
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
      <Overlay
        isVisible={popVisible}
        overlayStyle={[
          theme.padding.zorro,
          theme.flex.centerByCol,
          {
            // borderRadius: 8,
            width: popImageWidth,
            height: popImageWidth * imageRatio + addHeight,
            backgroundColor: theme.basicColor.newTransparent,
          },
        ]}>
        <View
          style={[
            {
              width: popImageWidth,
              height: popImageWidth * imageRatio + addHeight,
              overflow: 'hidden',
            },
          ]}>
          <BannerSwiper
            type={2}
            bannerList={bannerList}
            bannerWidth={popImageWidth}
            bannerHeight={popImageWidth * imageRatio + addHeight}
            bannerOverlaySize="small"
          />
        </View>
        {/* <NativeTouchableOpacity
          onPress={() => {
            if (overlayState?.popUrl) {
              Linking.openURL(overlayState?.popUrl);
            }
          }}>
          <LazyImageBackground
            imageUrl={overlayState?.popImg}
            width={popImageWidth}
            height={popImageWidth * overlayState?.imageRatio}>
            {renderOverlayLinkComponent({
              item: {
                bannerPosition: overlayState?.bannerPosition,
                title: overlayState?.title,
                subTitle: overlayState?.subTitle,
              },
              onPress: () => {
                goToUrl(overlayState?.popUrl, overlayState?.title);
              },
              sizeWidth: popImageWidth,
              sizeHeight: popImageWidth * overlayState?.imageRatio,
            })}
          </LazyImageBackground>
        </NativeTouchableOpacity> */}
        <NativeTouchableOpacity
          style={{
            right: theme.paddingSize.xxl,
            top: theme.paddingSize.xxl,
          }}
          onPress={() => {
            setPopVisible(false);
          }}>
          <Image
            style={[theme.icon.xxl, theme.position.abs]}
            source={require('@assets/icons/home/button-close.png')}
          />
        </NativeTouchableOpacity>
      </Overlay>
      {renderLanguageModal}
    </SafeAreaProvider>
  );
}

if (globalStore.isAndroid) {
  let codePushOptions = {checkFrequency: CodePush.CheckFrequency.MANUAL};
  AppWithCodePush = CodePush(codePushOptions)(App);
}

export default globalStore.isWeb ? App : AppWithCodePush;
