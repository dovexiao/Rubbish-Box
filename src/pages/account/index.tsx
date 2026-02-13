import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, AppState } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Toast } from '@ant-design/react-native';
import { Flex, PageContainer } from '@/components';
import IconFont from '@/iconfont';
import { getAccountInfo, getThirdState, userThirdBind } from '@/services/user';
import { checkInstalledWeChat, wechatLogin } from '@/utils/wechat';
import styles from './styles';
import PopConfirm from '@/components/popConfirm';

interface AccountInfo {
  mobile?: string;
  bindWechatApp?: boolean;
  wechatAppNickName?: string;
  setPwd?: boolean;
}

export default function Account() {
  const navigation = useNavigation<any>();
  const [detail, setDetail] = useState<AccountInfo | null>(null);
  const popConfirmRef = useRef<any>(null);
  const unbindWechatRef = useRef<any>(null);
  const appStateSubRef = useRef<any>(null);

  const loadAccount = useCallback(async () => {
    try {
      const res = await getAccountInfo({});
      const data = (res as any)?.data ?? res ?? {};
      setDetail(data);
    } catch (e) {
      Toast.fail('获取账号信息失败');
    }
  }, []);

  useEffect(() => {
    loadAccount();
  }, [loadAccount]);

  const handleChangeMobile = () => {
    if (!detail?.mobile) return;
    // 这里仅保留占位，具体改号流程可按需要后续迁移
    popConfirmRef.current.open();
  };

  const handleWechat = () => {
    unbindWechatRef.current.open();
  };

  // 微信绑定（已登录状态下绑定当前微信）
  const goBindWechat = useCallback(async () => {
    const isInstalledWeChat: any = await checkInstalledWeChat();
    if (!isInstalledWeChat.result) {
      Toast.fail(isInstalledWeChat.message || '请先安装微信');
      return;
    }
    const loadingKey = Toast.loading('授权中...', 0);
    const resPromise = wechatLogin();
    const appStatePromise = new Promise<any>(resolve => {
      appStateSubRef.current =
        AppState.addEventListener?.('change', (s: string) => {
          if (s === 'active') {
            resolve({
              result: false,
              errCode: -998,
              message: '用户手动返回应用，未完成授权',
            });
          }
        });
    });
    let r: any;
    try {
      r = await Promise.race([resPromise, appStatePromise]);
      if (r?.result) {
        const thirdState = await getThirdState({});
        const obj: any = { source: 1, code: r.code, state: thirdState };
        const bindRes = await userThirdBind(obj);
        if (Number((bindRes as any).code) === 200) {
          const accountRes = await getAccountInfo({});
          const data = (accountRes as any)?.data ?? accountRes ?? {};
          setDetail(data);
          Toast.success('绑定成功');
        } else {
          Toast.fail((bindRes as any).msg || (bindRes as any).message || '绑定失败');
        }
      } else {
        if (r?.errCode !== -998) {
          Toast.fail(r?.message || '授权失败');
        }
      }
    } catch (e) {
      Toast.fail('授权异常，请重试');
    } finally {
      Toast.remove(loadingKey);
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

  return (
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
            <IconFont name="a-headfor-20" size={16} color="#333333" />
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
              style={[styles.value, !detail?.bindWechatApp && styles.valueGray]}
            >
              {detail?.bindWechatApp
                ? `已绑定${
                    detail?.wechatAppNickName
                      ? `(${detail.wechatAppNickName})`
                      : ''
                  }`
                : '未绑定'}
            </Text>
            <IconFont name="a-headfor-20" size={16} color="#333333" />
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
            <IconFont name="a-headfor-20" size={16} color="#333333" />
          </View>
        </TouchableOpacity>
      </View>

      {/* 更换手机号码弹窗 */}
      <PopConfirm
        ref={popConfirmRef}
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
          popConfirmRef.current.close();
          navigation.navigate('ChangeMobile', {
            mobile: detail?.mobile,
          });
        }}
      />
      {/* 微信 */}
      <PopConfirm
        ref={unbindWechatRef}
        title={
          detail?.bindWechatApp
            ? '确定要解除绑定吗？'
            : '确定要绑定当前登录的微信账号吗？'
        }
        confirmText={detail?.bindWechatApp ? '解除' : '绑定'}
        onConfirm={() => {
          unbindWechatRef.current?.close();
          if (detail?.bindWechatApp) {
            navigation.navigate('WechatUnbind', {
              mobile: detail?.mobile,
            });
          } else {
            goBindWechat();
          }
        }}
      />
    </PageContainer>
  );
}
