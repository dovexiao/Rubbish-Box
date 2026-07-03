import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  AppState,
  InteractionManager,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Flex, PageContainer } from '@/components';
import AppIcon from '@/components/AppIcon';
import { getAccountInfo, getThirdState, userThirdBind } from '@/services/user';
import { checkInstalledWeChat, wechatLogin } from '@/utils/wechat';
import styles from './styles';
import PopConfirm from '@/components/popConfirm';
import { hideLoading, showLoading, showToast } from '@/utils';
import { useFocusEffect } from '@react-navigation/core';
import { px } from '@/utils/ui';

interface AccountInfo {
  mobile?: string;
  bindWechatApp?: boolean;
  wechatAppNickName?: string;
  setPwd?: boolean;
}

export default function Account() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const pageType = route.params?.pageType;
  const autoOpenAt = route.params?._autoOpenAt as number | undefined;

  const [detail, setDetail] = useState<AccountInfo | null>(null);
  const [shouldOpenMobilePop, setShouldOpenMobilePop] = useState(false);
  const [shouldOpenUnbindWechatPop, setShouldOpenUnbindWechatPop] =
    useState(false);
  const [mobilePopVisible, setMobilePopVisible] = useState(false);
  const [wechatPopVisible, setWechatPopVisible] = useState(false);
  const appStateSubRef = useRef<any>(null);
  const lastConsumedAutoOpenAt = useRef<number | undefined>();

  useFocusEffect(
    useCallback(() => {
      const isNewAutoOpen =
        autoOpenAt !== undefined &&
        autoOpenAt !== lastConsumedAutoOpenAt.current;
      const shouldOpen7 = isNewAutoOpen && String(pageType) === '7';
      const shouldOpen14 = isNewAutoOpen && String(pageType) === '14';
      if (shouldOpen7 || shouldOpen14) {
        lastConsumedAutoOpenAt.current = autoOpenAt;
        setShouldOpenMobilePop(shouldOpen7);
        setShouldOpenUnbindWechatPop(shouldOpen14);
      }

      let active = true;

      (async () => {
        try {
          const res = await getAccountInfo({});
          const data = (res as any)?.data ?? res ?? {};
          if (!active) return;
          setDetail(data);
        } catch (e) {
          if (active) {
            showToast({ title: '获取账号信息失败', icon: 'info' });
          }
        }
      })();

      return () => {
        active = false;
      };
    }, [autoOpenAt, pageType]),
  );

  const handleChangeMobile = () => {
    if (!detail?.mobile) return;
    setMobilePopVisible(true);
  };

  const handleWechat = () => {
    setWechatPopVisible(true);
  };

  // 微信绑定（已登录状态下绑定当前微信）
  const goBindWechat = useCallback(async () => {
    const isInstalledWeChat: any = await checkInstalledWeChat();
    if (!isInstalledWeChat.result) {
      showToast({
        title: isInstalledWeChat.message || '请先安装微信',
        icon: 'info',
      });
      return;
    }
    showLoading({ title: '授权中...' });
    let settled = false;
    let hasGoneBackground = false;

    const resPromise = wechatLogin().then(r => {
      settled = true;
      return r;
    });
    const appStatePromise = new Promise<any>(resolve => {
      appStateSubRef.current = AppState.addEventListener?.(
        'change',
        (s: string) => {
          if (s === 'background' || s === 'inactive') {
            hasGoneBackground = true;
          }
          if (s === 'active') {
            resolve({
              result: false,
              errCode: -998,
              message: '用户手动返回应用，未完成授权',
            });
          }
        },
      );
    });

    const timeoutPromise = new Promise<any>(resolve => {
      setTimeout(() => {
        if (settled) return;
        settled = true;
        resolve({
          result: false,
          errCode: -997,
          message: hasGoneBackground ? '微信授权超时，请重试' : '',
        });
      }, 60_000);
    });

    let harmonyHideTimer: ReturnType<typeof setTimeout> | undefined;
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      harmonyHideTimer = setTimeout(() => {
        if (!hasGoneBackground && !settled) {
          hideLoading();
        }
      }, 3000);
    }

    let r: any;
    try {
      r = await Promise.race([resPromise, appStatePromise, timeoutPromise]);
      console.log('r', r);
      if (r?.result) {
        const thirdState = await getThirdState({});
        const obj: any = { source: 1, code: r.code, state: thirdState.data };
        console.log('obj', obj);
        const bindRes = await userThirdBind(obj);
        console.log('bindRes', bindRes);
        if (Number((bindRes as any).code) === 200) {
          const accountRes = await getAccountInfo({});
          const data = (accountRes as any)?.data ?? accountRes ?? {};
          setDetail(data);
          hideLoading();
          showToast({ title: '绑定成功', icon: 'success' });
        } else {
          hideLoading();
          showToast({
            title:
              (bindRes as any).msg || (bindRes as any).message || '绑定失败',
            icon: 'error',
          });
        }
      } else {
        hideLoading();
        if (r?.errCode === -998) {
          console.log('用户手动返回');
        } else if (r?.errCode === -997) {
          if (r?.message) {
            showToast({ title: r.message, icon: 'info' });
          }
        } else {
          showToast({
            title: r?.message || '授权失败',
            icon: 'error',
          });
        }
      }
    } catch (e) {
      hideLoading();
      showToast({ title: '授权异常，请重试', icon: 'info' });
    } finally {
      if (harmonyHideTimer) clearTimeout(harmonyHideTimer);
      appStateSubRef.current?.remove?.();
      appStateSubRef.current = undefined;
    }
  }, []);

  const handlePassword = () => {
    if (!detail?.mobile) return;
    navigation.navigate('PasswordSet', {
      mobile: detail.mobile,
      type: detail?.setPwd ? 'edit' : 'add',
    });
  };

  const handleLogoff = () => {
    if (!detail?.mobile) return;
    navigation.navigate('Logoff', { mobile: detail.mobile });
  };

  // 延迟打开：避免「点击前往」的触摸事件穿透到 Modal 遮罩导致一闪即关
  useEffect(() => {
    if (!detail || !shouldOpenMobilePop) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const task = InteractionManager.runAfterInteractions(() => {
      timer = setTimeout(() => {
        if (!cancelled) {
          setMobilePopVisible(true);
          setShouldOpenMobilePop(false);
        }
      }, 450);
    });

    return () => {
      cancelled = true;
      task.cancel();
      if (timer) clearTimeout(timer);
    };
  }, [detail, shouldOpenMobilePop]);

  useEffect(() => {
    if (!detail || !shouldOpenUnbindWechatPop) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const task = InteractionManager.runAfterInteractions(() => {
      timer = setTimeout(() => {
        if (!cancelled) {
          setWechatPopVisible(true);
          setShouldOpenUnbindWechatPop(false);
        }
      }, 450);
    });

    return () => {
      cancelled = true;
      task.cancel();
      if (timer) clearTimeout(timer);
    };
  }, [detail, shouldOpenUnbindWechatPop]);

  return (
    <>
      <PageContainer
        backgroundColor="#FFFFFF"
        statusBarStyle="dark-content"
        statusBarBackgroundColor="#FFFFFF"
        safeAreaEdges={['top', 'bottom']}
        pageNavProps={{
          text: '账号与安全',
          showBack: true,
          background: '#FFFFFF',
        }}
        loading={!detail}
        footer={
          <View style={styles.footerWrap}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.logoffBtn}
              onPress={handleLogoff}
            >
              <Text style={styles.logoffText}>注销账号</Text>
            </TouchableOpacity>
          </View>
        }
      >
        <View style={styles.container}>
          {/* 手机号 */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.row, styles.rowTop]}
            onPress={handleChangeMobile}
          >
            <Text style={styles.label}>手机号</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.value}>{detail?.mobile ?? ''}</Text>
              <AppIcon name="a-headfor-20" size={px(16)} color="#333333" />
            </View>
          </TouchableOpacity>

          {/* 微信账号 */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.row, styles.rowMiddle]}
            onPress={handleWechat}
          >
            <Text style={styles.label}>微信账号</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text
                style={[
                  styles.value,
                  !detail?.bindWechatApp && styles.valueGray,
                ]}
              >
                {detail?.bindWechatApp
                  ? `已绑定${
                      detail?.wechatAppNickName
                        ? `(${detail.wechatAppNickName})`
                        : ''
                    }`
                  : '未绑定'}
              </Text>
              <AppIcon name="a-headfor-20" size={px(16)} color="#333333" />
            </View>
          </TouchableOpacity>

          {/* 登录密码 */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.row, styles.rowMiddle]}
            onPress={handlePassword}
          >
            <Text style={styles.label}>登录密码</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.value, !detail?.setPwd && styles.valueGray]}>
                {detail?.setPwd ? '已设置' : '未设置'}
              </Text>
              <AppIcon name="a-headfor-20" size={px(16)} color="#333333" />
            </View>
          </TouchableOpacity>
        </View>
      </PageContainer>

      {/* 弹窗放在 PageContainer 外，避免 loading 遮罩(zIndex:999)挡住 Modal */}
      <PopConfirm
        visible={mobilePopVisible}
        onVisibleChange={setMobilePopVisible}
        maskClosable={false}
        title={
          <Flex direction="column" align="center">
            <Text style={styles.popTitle}>更换绑定的手机号？</Text>
            <Text
              style={styles.popDesc}
            >{`当前绑定的手机号码为${detail?.mobile}`}</Text>
          </Flex>
        }
        confirmText="更换"
        onConfirm={() => {
          setMobilePopVisible(false);
          navigation.navigate('ChangeMobile', {
            mobile: detail?.mobile,
          });
        }}
      />
      <PopConfirm
        visible={wechatPopVisible}
        onVisibleChange={setWechatPopVisible}
        maskClosable={false}
        title={
          detail?.bindWechatApp
            ? '确定要解除绑定吗？'
            : '确定要绑定当前登录的微信账号吗？'
        }
        confirmText={detail?.bindWechatApp ? '解除' : '绑定'}
        onConfirm={() => {
          setWechatPopVisible(false);
          if (detail?.bindWechatApp) {
            navigation.navigate('WechatUnbind', {
              mobile: detail?.mobile,
            });
          } else {
            goBindWechat();
          }
        }}
      />
    </>
  );
}
