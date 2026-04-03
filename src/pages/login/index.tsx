import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  AppState,
  Platform,
  DeviceEventEmitter,
  InteractionManager,
} from 'react-native';
import { Flex, PageContainer } from '@/components';
import { getThirdState, thirdLogin } from '@/services';
import { tokenStorage } from '@/utils/storage';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import Sms from './com/sms';
import Password from './com/password';
import styles from './styles';
import AppIcon from '@/components/AppIcon';
import { cacheSet } from '@/utils/cache';
import {
  cacheGetSync,
  cacheSetSync,
  cacheRemoveSync,
  eventCenter,
  getMobPushDeviceInfo,
  getStorage,
  myNextTick,
  reLaunch,
  setStorage,
  showToast,
  showLoading,
  hideLoading,
} from '@/utils';
import appPush from '@/utils/push';
import PopConfirm from '@/components/popConfirm';
import { checkInstalledWeChat, wechatLogin } from '@/utils/wechat';

type LoginType = 'sms' | 'password' | 'mini';

const Login = () => {
  const navigation = useAppNavigation();
  const [agree, setAgree] = useState<boolean>(false);
  const [allowShowLoginContent, setAllowShowLoginContent] =
    useState<boolean>(false);
  const [loginType, setLoginType] = useState<LoginType>('sms');
  const [prevLoginType, setPrevLoginType] = useState<'sms' | 'password'>('sms');
  const [mobile, setMobile] = useState('');
  // const [needAuth, setNeedAuth] = useState(true);
  // const [tempToken, setTempToken] = useState<string | undefined>(undefined);
  // const [loading, setLoading] = useState(false);
  const agreePopRef = useRef<any>(null);
  const retainPopRef = useRef<any>(null);

  // 使用 ref 存储临时数据和设备信息
  const tempData = useRef<{
    appStateSub: any;
  }>({
    appStateSub: undefined,
  });

  const device = useRef<any>({});

  const syncAppPrivacyGateFromStorage = async () => {
    try {
      const agreed = await cacheGetSync('agreePrivacy');
      setAllowShowLoginContent(!!agreed);
    } catch {
      setAllowShowLoginContent(false);
    }
  };

  const syncLoginAgreeFromStorage = async () => {
    try {
      const checkedRes: any = await getStorage({
        key: 'loginAgreeChecked',
      }).catch(() => ({ data: false } as any));
      setAgree(checkedRes?.data === true);
    } catch {
      setAgree(false);
    }
  };

  const handleAgreementLinkPress = (
    type: 'userAgreement' | 'privacyPolicy',
  ) => {
    let url = '';
    if (type === 'userAgreement') {
      url = 'https://g.18qjz.cn/protocol/boklock/userAgreement.html';
    } else if (type === 'privacyPolicy') {
      url = 'https://g.18qjz.cn/protocol/boklock/privacyPolicy.html';
    }
    // 使用系统浏览器打开链接
    if (url) {
      navigation.navigate('WebView', {
        url,
        title:
          type === 'userAgreement' ? '泊刻地锁用户协议' : '泊刻地锁隐私政策',
      });
    }
  };

  // 微信登录
  const wxLogin = async () => {
    const isInstalledWeChat: any = await checkInstalledWeChat();
    if (!isInstalledWeChat.result) {
      showToast(isInstalledWeChat.message);
      return;
    }

    // 监听应用状态变化（用户可能从微信返回/中断授权）
    // 必须先注册监听，再发起微信授权；否则如果微信回调没有触发，后续逻辑会卡死。
    let settled = false;
    let hasGoneBackground = false;
    const appStatePromise = new Promise<any>(resolve => {
      tempData.current.appStateSub =
        AppState.addEventListener &&
        AppState.addEventListener('change', s => {
          console.log('s', s);
          if (s === 'inactive' || s === 'background') {
            hasGoneBackground = true;
          }
          if (s === 'active' && !settled) {
            // 去过后台后再进入 active 才被认为是从外部返回
            if (hasGoneBackground) {
              settled = true;
              resolve({
                result: false,
                errCode: -998,
                message: '用户手动返回应用，未完成登录',
              });
            }
          }
        });
    });

    const timeoutPromise = new Promise<any>(resolve => {
      setTimeout(() => {
        if (settled) return;
        settled = true;
        resolve({
          result: false,
          errCode: -997,
          message: hasGoneBackground ? '微信登录超时，请重试' : '',
        });
      }, 60_000);
    });

    const wechatPromise = wechatLogin().then(r => {
      settled = true;
      return r;
    });
    let r: any;
    try {
      showLoading({ title: '登录中...' });

      // 鸿蒙专属策略：如果短暂时间内没有去后台（也就是用户点了系统取消，或者正在犹豫），
      // 我们单纯把前端的 Loading 遮罩撤掉，让用户可以点击其他区域，但后台仍旧保持监听。
      // 防止因为鸿蒙 wechatSDK 不回调错误而造成的界面永久卡死。
      let harmonyHideTimer: any;
      if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
        harmonyHideTimer = setTimeout(() => {
          if (!hasGoneBackground && !settled) {
            hideLoading();
          }
        }, 3000);
      }

      r = await Promise.race([wechatPromise, appStatePromise, timeoutPromise]);
      if (harmonyHideTimer) clearTimeout(harmonyHideTimer);

      if (r.result) {
        showLoading({ title: '登录中...' }); // 无论之前有没有被隐去都重新调起
        const thirdState = await getThirdState({});
        let obj: any = { source: 1, code: r.code, state: thirdState.data };
        let deviceInfoStorage: any = {};
        try {
          deviceInfoStorage = await getStorage({ key: 'deviceInfo' });
        } catch (e) {}
        if (deviceInfoStorage?.data) {
          obj = { ...obj, ...deviceInfoStorage?.data };
        } else {
          obj = { ...obj, ...device.current };
        }

        const thirdLoginRes = await thirdLogin({ ...obj });
        if (thirdLoginRes.code === 200) {
          hideLoading();
          await cacheSetSync('token', thirdLoginRes.data.token);
          await cacheSetSync('guestMode', false);
          try {
            await getMobPushDeviceInfo();
          } catch {}
          if (thirdLoginRes.data.needBind) {
            navigation.navigate('BindPhone' as any);
          } else if (thirdLoginRes.data.needMobileVerify) {
            navigation.navigate('MiniBind' as any, {
              mobile: thirdLoginRes.data.mobile,
            });
          } else {
            showToast({ title: '登录成功', icon: 'success' });
            reLaunch('Index');
          }
        } else {
          hideLoading();
          showToast({ title: thirdLoginRes.message, icon: 'info' });
        }
      } else {
        hideLoading();
        if (r.errCode === -998) console.log('用户手动返回');
        else if (r.errCode === -996) console.log('取消或未响应权限弹框(鸿蒙)');
        else if (r.errCode === -997) {
          if (r.message) showToast({ title: r.message, icon: 'info' });
        } else if (r.message) showToast({ title: r.message, icon: 'info' });
      }
    } catch (e) {
      showToast({ title: '一键登录异常:' + e, icon: 'info' });
    } finally {
      hideLoading();
      tempData.current.appStateSub?.remove?.();
      tempData.current.appStateSub = undefined;
    }
  };

  const handleWxLogin = async () => {
    if (!agree) {
      setLoginType('mini');
      agreePopRef.current?.open();
      return;
    }
    await wxLogin();
  };

  const radioClick = async () => {
    const newState = !agree;
    setAgree(newState);
    await setStorage({ key: 'loginAgreeChecked', data: newState });
    if (newState) {
      await setStorage({ key: 'pushEnabled', data: true });
    }
  };

  // 页面加载时获取设备信息
  useEffect(() => {
    const loadDeviceInfo = async () => {
      let storageDevice: any = {};
      try {
        storageDevice = await getStorage({ key: 'deviceInfo' });
        if (storageDevice?.data) {
          device.current = storageDevice.data;
        }
      } catch (error) {
        device.current = {};
      }
    };

    InteractionManager.runAfterInteractions(() => {
      syncAppPrivacyGateFromStorage();
      syncLoginAgreeFromStorage();
      loadDeviceInfo();
    });

    const privacyAgreeListener = DeviceEventEmitter.addListener(
      'ON_PRIVACY_AGREED',
      () => {
        setAllowShowLoginContent(true);
      },
    );

    const appStateSub = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        syncAppPrivacyGateFromStorage();
        syncLoginAgreeFromStorage();
      }
    });

    // 清理函数（页面卸载时执行）
    return () => {
      // 清理事件监听
      eventCenter.off('onNext');
      // 清理应用状态监听
      if (tempData.current?.appStateSub) {
        tempData.current.appStateSub.remove?.();
        tempData.current.appStateSub = undefined;
      }
      privacyAgreeListener.remove();
      appStateSub.remove();
    };
  }, []);

  // 根据 agree 状态控制推送服务
  useEffect(() => {
    (async () => {
      try {
        const res = await getStorage({ key: 'pushEnabled' });
        // 合规：默认关闭推送，只有用户明确开启后才生效
        const enabled = res?.data === true;
        if (agree && enabled) {
          appPush.submitPolicyGrantResult?.(true);
          appPush.restartPush?.();
          appPush.toggleNotifeeCore?.(true);
          appPush.toggleMobPushOEM?.(true);
        } else {
          appPush.submitPolicyGrantResult?.(false);
          appPush.stopPush?.();
          appPush.toggleNotifeeCore?.(false);
          appPush.toggleMobPushOEM?.(false);
        }
      } catch (e) {
        // 读取失败时采取保守策略：未授权+停止推送
        appPush.submitPolicyGrantResult?.(false);
        appPush.stopPush?.();
        appPush.toggleNotifeeCore?.(false);
        appPush.toggleMobPushOEM?.(false);
      }
    })();
  }, [agree]);

  // 监听从协议/隐私 Web 返回后是否需要重开隐私弹窗
  useEffect(() => {
    const handler = async () => {
      try {
        const reopen = await cacheGetSync('reopenPrivacyAfterWeb');
        const agreed = await cacheGetSync('agreePrivacy');
        const byRes: any = await getStorage({ key: 'privacyOpenBy' }).catch(
          () => ({ data: undefined } as any),
        );
        const by = byRes?.data;
        if (reopen && !agreed && by === 'login') {
          try {
            await cacheSetSync('reopenPrivacyAfterWeb', false);
            await setStorage({ key: 'privacyOpenBy', data: '' });
          } catch {}
          agreePopRef.current?.open?.();
        }
      } catch {}
    };
    eventCenter.on('privacy:open', handler);
    return () => {
      eventCenter.off('privacy:open', handler);
    };
  }, []);

  return (
    <PageContainer
      key={allowShowLoginContent ? 'content' : 'blank'}
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      safeAreaEdges={['top', 'bottom']}
    >
      {!allowShowLoginContent ? (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />
      ) : (
        <>
          <View style={styles.container}>
            <Flex
              style={{ flex: 1 }}
              direction="column"
              align="center"
              // justify="center"
            >
              <Image
                source={{ uri: 'https://g.18qjz.cn/img/boklock/logo.png' }}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.logoTitle}>欢迎来到泊刻地锁</Text>
              {loginType === 'sms' ? (
                <Sms
                  agree={agree}
                  onChange={mobile => setMobile(mobile)}
                  popRef={agreePopRef}
                  initialMobile={mobile}
                />
              ) : (
                <Password
                  agree={agree}
                  onChange={mobile => setMobile(mobile)}
                  popRef={agreePopRef}
                  mobile={mobile}
                />
              )}
              <Flex
                align="center"
                isTouchView
                onPress={radioClick}
                style={{ marginTop: 16 }}
              >
                <AppIcon
                  size={17}
                  name={agree ? 'selected' : 'unselected'}
                  color={agree ? '#333333' : '#E1E1E1'}
                  style={{ marginRight: 8 }}
                />
                <Flex align="center">
                  <Text style={styles.agree}>我已阅读并同意</Text>
                  <Pressable
                    onPress={() => {
                      handleAgreementLinkPress('userAgreement');
                    }}
                  >
                    <Text style={styles.agreeLink}>《泊刻地锁用户协议》</Text>
                  </Pressable>

                  <Text style={styles.agree}>和</Text>
                  <Pressable
                    onPress={() => {
                      handleAgreementLinkPress('privacyPolicy');
                    }}
                  >
                    <Text style={styles.agreeLink}>《隐私政策》</Text>
                  </Pressable>
                </Flex>
              </Flex>
              <Text
                style={{ marginTop: 24, fontSize: 16, color: '#333333' }}
                onPress={() => {
                  // 控制点击后立刻有视觉响应，不再阻塞主线程导致的“卡住”感
                  requestAnimationFrame(async () => {
                    try {
                      await cacheRemoveSync('token');
                      await cacheSetSync('guestMode', true);
                    } catch {}
                    try {
                      await tokenStorage.remove();
                    } catch {}
                    reLaunch('Index');
                  });
                }}
              >
                暂不登录
              </Text>
            </Flex>
            <Flex style={{ height: 123 }} direction="column" align="center">
              <Flex align="center" style={styles.logTip}>
                <View style={styles.line} />
                <Text style={styles.fastDesc}>更多登录方式</Text>
                <View style={styles.line} />
              </Flex>
              <Flex direction="row" justify="center" align="center">
                <Flex
                  direction="column"
                  align="center"
                  isTouchView
                  onPress={handleWxLogin}
                >
                  <Image
                    source={{
                      uri: 'https://g.18qjz.cn/img/boklock/icon_wechat.png',
                    }}
                    style={styles.wxlogo}
                  />
                </Flex>
                <Flex
                  direction="column"
                  justify="center"
                  align="center"
                  style={{ marginLeft: 65 }}
                  isTouchView
                  onPress={() => {
                    const type =
                      (loginType === 'mini' ? prevLoginType : loginType) ===
                      'sms'
                        ? 'password'
                        : 'sms';
                    setLoginType(type);
                    setPrevLoginType(type);
                  }}
                >
                  <Image
                    source={{
                      uri: `https://g.18qjz.cn/img/boklock/loginIcon/icon_login_${
                        (loginType === 'mini' ? prevLoginType : loginType) ===
                        'sms'
                          ? 'password'
                          : 'mobile'
                      }.png`,
                    }}
                    style={styles.loginIcon}
                    resizeMode="contain"
                  />
                </Flex>
              </Flex>
            </Flex>
          </View>
          <PopConfirm
            ref={agreePopRef}
            maskClosable={false}
            title={'用户协议及隐私保护'}
            cancelText="不同意"
            onCancel={() => {
              agreePopRef.current?.close();
              retainPopRef.current?.open();
            }}
            confirmColors={['#282828', '#4A4A4A']}
            onConfirm={
              loginType === 'mini'
                ? async () => {
                    await agreePopRef.current?.close();
                    setAgree(true);
                    await setStorage({ key: 'loginAgreeChecked', data: true });
                    await setStorage({ key: 'pushEnabled', data: true });
                    setTimeout(() => {
                      wxLogin();
                    }, 300);
                  }
                : async () => {
                    setAgree(true);
                    await setStorage({ key: 'loginAgreeChecked', data: true });
                    await setStorage({ key: 'pushEnabled', data: true });
                    myNextTick(() => {
                      agreePopRef.current?.close();
                      hideLoading();
                      eventCenter.trigger('onNext');
                    });
                  }
            }
            confirmText="同意并继续"
          >
            <Text style={styles.popDesc}>
              我已阅读并同意
              <Text
                style={styles.popDescLink}
                onPress={async e => {
                  e?.stopPropagation?.();
                  try {
                    await cacheSetSync('reopenPrivacyAfterWeb', true);
                    await setStorage({ key: 'privacyOpenBy', data: 'login' });
                  } catch {}
                  agreePopRef.current?.close();
                  navigation.navigate('WebView', {
                    url: 'https://g.18qjz.cn/protocol/boklock/userAgreement.html',
                    title: '泊刻地锁用户协议',
                  });
                }}
              >
                《泊刻地锁用户协议》
              </Text>
              和
              <Text
                style={styles.popDescLink}
                onPress={async e => {
                  e?.stopPropagation?.();
                  try {
                    await cacheSetSync('reopenPrivacyAfterWeb', true);
                    await setStorage({ key: 'privacyOpenBy', data: 'login' });
                  } catch {}
                  agreePopRef.current?.close();
                  navigation.navigate('WebView', {
                    url: 'https://g.18qjz.cn/protocol/boklock/privacyPolicy.html',
                    title: '泊刻地锁隐私政策',
                  });
                }}
              >
                《隐私政策》
              </Text>
            </Text>
            <Text style={styles.popNotice}>
              为保障设备状态提醒的可靠送达，在您同意隐私条款后，应用在退出后可能继续维持通知服务（包含自启动/关联启动的后台行为）。您可在设置中随时关闭通知服务。
            </Text>
          </PopConfirm>

          {/* 拒绝后的挽留说明弹窗（仅确认按钮） */}
          <PopConfirm
            ref={retainPopRef}
            showClose={false}
            confirmText="我知道了"
            onConfirm={async () => {
              retainPopRef.current?.close();
              return;
              try {
                await cacheSetSync('guestMode', true);
              } catch {}
              try {
                // 确保访客模式下没有残留登录 token
                await tokenStorage.remove();
              } catch {}
              reLaunch('Index');
            }}
            title={
              <Flex direction="column" align="center" justify="center">
                <Text style={styles.popTitle}>温馨提示</Text>
                <Text style={styles.popDesc}>
                  为保障您顺利绑定设备和正常使用定位、蓝牙、通知等功能，以及设备状态提醒的正常收取，建议您同意
                  <Text style={styles.popDescLink}>《泊刻地锁用户协议》</Text>和
                  <Text style={styles.popDescLink}>《隐私政策》</Text>
                  。您也可以选择暂不登录继续浏览。
                </Text>
              </Flex>
            }
          ></PopConfirm>
        </>
      )}
    </PageContainer>
  );
};

export default Login;
