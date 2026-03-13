import React, { useState, useRef } from 'react';
import { View, Text, AppState, Button, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { styles } from './styles';
import { Flex, PageContainer, LinearGradient } from '@/components';
import AppIcon from '@/components/AppIcon';
import GradientButton from '@/components/GradientButton';
import { showToast } from '@/utils';
import {
  hasWeChatShareCapability,
  isWxAppInstalled,
  shareWeChatMiniProgram,
} from '@/utils/wechat';
import { stringify } from '@/utils/stringify';
import { DEPLOY_ENV } from '@/config';

export default function ShareSuccessPage() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const [isSharing, setIsSharing] = useState(false);
  const appStateSub = useRef<any>(null);
  const timeoutId = useRef<any>(null);

  const shareToWeChat = async () => {
    if (isSharing) return;

    if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
      showToast({ title: '当前平台暂不支持微信分享', icon: 'none' });
      return;
    }

    if (!hasWeChatShareCapability()) {
      showToast({ title: '微信分享能力不可用', icon: 'none' });
      return;
    }

    setIsSharing(true);

    const lockType = route.params?.lockType;
    const lockId = route.params?.lockId;
    try {
      const installed = await isWxAppInstalled();
      if (!installed) {
        showToast({ title: '未安装微信', icon: 'error' });
        setIsSharing(false);
        return;
      }
    } catch (e) {
      // 异常情况下也允许继续尝试
    }
    const shareOptions = {
      title: '邀请你使用我的地锁，快来使用吧！',
      userName: 'gh_00245e3a7d08',
      path: `/pages/index/index?${stringify({ lockId, lockType })}`,
      webpageUrl: 'https://your-domain.com/fallback.html',
      thumbImageUrl: 'https://g.18qjz.cn/img/boklock/wechat_invite.png',
      scene: 0,
      miniProgramType: DEPLOY_ENV === 'dev' ? 2 : 0,
    };

    const sharePromise = shareWeChatMiniProgram(shareOptions);
    const appStatePromise = new Promise<any>(resolve => {
      appStateSub.current = AppState.addEventListener('change', s => {
        if (s === 'active') {
          resolve({ errCode: -998, message: 'user_returned_without_share' });
        }
      });
    });
    const timeoutPromise = new Promise(resolve => {
      timeoutId.current = setTimeout(
        () => resolve({ errCode: -999, message: 'share_timeout' }),
        6000,
      );
    });

    let result: any;
    try {
      result = await Promise.race([
        sharePromise,
        appStatePromise,
        timeoutPromise,
      ]);
      if (result?.errCode === 0) {
        showToast({ title: '分享成功', icon: 'success' });
      } else if (result?.errCode === -998) {
        showToast({ title: '用户返回应用，未完成分享', icon: 'none' });
      } else if (result?.errCode === -999) {
        showToast({ title: '分享超时', icon: 'none' });
      } else {
        showToast({ title: '分享失败', icon: 'error' });
      }
    } catch (e) {
      showToast({ title: '分享异常', icon: 'error' });
    } finally {
      clearTimeout(timeoutId.current);
      appStateSub.current?.remove?.();
      appStateSub.current = null;
      setIsSharing(false);
    }
  };

  const goBack = () => {
    if (route.params?.navigateBackCount === 2) {
      navigation.goBack();
      setTimeout(() => navigation.goBack(), 0);
    } else {
      navigation.goBack();
    }
  };

  return (
    <PageContainer
      pageNavProps={{
        text: '',
        showBack: true,
      }}
      backgroundColor="#fff"
    >
      <Flex direction="row" justify="center" align="center" style={styles.row}>
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          locations={[0, 1]}
          colors={['#383D44', '#7F8895']}
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            borderWidth: 3,
            borderStyle: 'solid',
            borderColor: '#d8d9dd',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Flex style={styles.iconBox}>
            <AppIcon name="tick-white" color="#fff" size={40} />
          </Flex>
        </LinearGradient>
        <Text style={styles.title}>添加成功</Text>
      </Flex>
      <Flex
        direction="row"
        justify="center"
        align="center"
        style={{ marginTop: 24 }}
      >
        <Text style={styles.text}>通知成员可以使用地锁了</Text>
      </Flex>
      <Flex
        direction="row"
        justify="center"
        align="center"
        style={{ marginTop: 60 }}
      >
        <GradientButton
          onPress={shareToWeChat}
          disabled={isSharing}
          style={[
            styles.btnContainer,
            { backgroundColor: isSharing ? '#666' : '#333' },
          ]}
        >
          <Text style={styles.btnContainerShareText}>分享到微信</Text>
        </GradientButton>
      </Flex>
      <Flex
        direction="row"
        justify="center"
        align="center"
        style={{ marginTop: 16 }}
      >
        <Flex
          isTouchView
          onPress={goBack}
          style={{
            ...styles.btnContainer,
            backgroundColor: '#fff',
            borderColor: '#e5e5e5',
            borderWidth: 1,
          }}
        >
          <Text style={styles.btnContainerConfirmText}>完成</Text>
        </Flex>
      </Flex>
    </PageContainer>
  );
}
