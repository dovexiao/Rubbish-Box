import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Video from 'react-native-video';
import PageContainer from '@/components/PageContainer';
import AppIcon from '@/components/AppIcon';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { useCountDown } from '@/hooks/useCountDown';
import {
  getDeviceKeyResponse,
  startPairing,
  startPairingResult,
} from '@/services/deviceInfo';
import { getLockInfo } from '@/services';
import { hideLoading, loopFunc, showLoading, showToast } from '@/utils';
import { px } from '@/utils/ui';
import { styles } from './style';

const DEFAULT_POSTER_URL =
  'https://g.18qjz.cn/img/boklock/remoteKeyUnbindPoster.png';
const DEFAULT_VIDEO_URL =
  'https://g.18qjz.cn/img/boklock/remoteKeyUnbindVideo.mp4';

const POLL_INTERVAL_MS = 1000;
const POLL_TIMEOUT_MS = 10000;
const KEY_RESPONSE_COUNTDOWN = 180;

type UnbindPhase = 'idle' | 'pairing' | 'waitingUnbind' | 'readyUnbind';

export default function RemoteKeyUnbind() {
  const { params } = useRoute<any>() as {
    params?: {
      deviceNo?: string;
      key?: string;
      id?: number;
      hasButtonKeyFlag?: boolean;
    };
  };
  const navigation = useAppNavigation();
  const pollStopRef = useRef<(() => void) | null>(null);
  const countdownActiveRef = useRef(false);
  const videoRef = useRef<any>(null);

  const deviceNo = params?.deviceNo || '';

  const [showPlayBtn, setShowPlayBtn] = useState(true);
  const [paused, setPaused] = useState(true);
  const [videoKey, setVideoKey] = useState(0);
  const [phase, setPhase] = useState<UnbindPhase>('idle');
  const [keyResponse, setKeyResponse] = useState('');

  const {
    start: startCountdown,
    stop: stopCountdown,
    count,
    isCounting,
  } = useCountDown(KEY_RESPONSE_COUNTDOWN);

  const videoUrl = DEFAULT_VIDEO_URL;
  const posterUrl = DEFAULT_POSTER_URL;

  const resetVideo = useCallback(() => {
    setShowPlayBtn(true);
    setPaused(true);
    setVideoKey(k => k + 1);
  }, []);

  const stopKeyResponsePoll = useCallback(() => {
    pollStopRef.current?.();
    pollStopRef.current = null;
  }, []);

  const resetToIdle = useCallback(() => {
    stopKeyResponsePoll();
    stopCountdown();
    countdownActiveRef.current = false;
    setKeyResponse('');
    setPhase('idle');
  }, [stopCountdown, stopKeyResponsePoll]);

  const startKeyResponsePoll = useCallback(() => {
    if (!deviceNo) return;

    stopKeyResponsePoll();
    const { start, stop } = loopFunc(async () => {
      try {
        const res: any = await getDeviceKeyResponse({ deviceNo });
        if (res?.code === 200 && res?.success && res?.data) {
          countdownActiveRef.current = false;
          stopCountdown();
          setKeyResponse(String(res.data));
          setPhase('readyUnbind');
          stop();
          pollStopRef.current = null;
          return false;
        }
      } catch (e) {
        console.error('getDeviceKeyResponse error:', e);
      }
      return true;
    }, POLL_INTERVAL_MS);

    pollStopRef.current = stop;
    start();
  }, [deviceNo, stopCountdown, stopKeyResponsePoll]);

  const pollPairingResult = useCallback((): Promise<boolean> => {
    return new Promise(resolve => {
      let timeoutTimer: ReturnType<typeof setTimeout> | null = null;
      const { start: startPoll, stop: stopPoll } = loopFunc(async () => {
        try {
          const res: any = await startPairingResult({ deviceNo });
          if (res?.data) {
            stopPoll();
            if (timeoutTimer) {
              clearTimeout(timeoutTimer);
              timeoutTimer = null;
            }
            resolve(true);
            return false;
          }
        } catch (e) {
          console.error('startPairingResult error:', e);
        }
        return true;
      }, POLL_INTERVAL_MS);

      timeoutTimer = setTimeout(() => {
        stopPoll();
        resolve(false);
      }, POLL_TIMEOUT_MS);
      startPoll();
    });
  }, [deviceNo]);

  const handleStartUnbind = useCallback(async () => {
    if (!deviceNo || phase === 'pairing') return;

    setPhase('pairing');
    setKeyResponse('');
    showLoading({ title: '配对中...' });

    try {
      const res: any = await startPairing({ deviceNo });
      if (!(res?.code === 200 && res?.success)) {
        hideLoading();
        setPhase('idle');
        showToast({
          title: res?.message || res?.msg || '配对失败',
          icon: 'info',
        });
        return;
      }

      const pairOk = await pollPairingResult();
      hideLoading();

      if (!pairOk) {
        setPhase('idle');
        showToast({ title: '配对失败', icon: 'info' });
        return;
      }

      setPhase('waitingUnbind');
      countdownActiveRef.current = true;
      startCountdown();
      startKeyResponsePoll();
    } catch {
      hideLoading();
      setPhase('idle');
      showToast({ title: '配对失败', icon: 'info' });
    }
  }, [
    deviceNo,
    phase,
    pollPairingResult,
    startCountdown,
    startKeyResponsePoll,
  ]);

  const handleUnbind = useCallback(async () => {
    if (!keyResponse || !params?.id) return;

    const res: any = await getLockInfo({ id: params.id });
    if (res?.code === 200 && res?.success) {
      const phoneNumber = res?.data?.adminMobile;
      navigation.navigate('UnbindDevice', {
        deviceNo,
        key: keyResponse,
        phoneNumber,
        type: 'remoteKey',
      });
      return;
    }
    showToast({
      title: res?.message || res?.msg || '获取设备信息失败',
      icon: 'info',
    });
  }, [deviceNo, keyResponse, navigation, params?.id]);

  const handleActionPress = useCallback(() => {
    if (phase === 'idle') {
      void handleStartUnbind();
      return;
    }
    if (phase === 'readyUnbind' && keyResponse) {
      void handleUnbind();
    }
  }, [handleStartUnbind, handleUnbind, keyResponse, phase]);

  const disableUnbind = useMemo(() => {
    if (phase === 'pairing') return true;
    if (phase === 'waitingUnbind') return true;
    if (phase === 'readyUnbind') return false;
    return false;
  }, [phase]);

  const showCountdown = useMemo(
    () => phase === 'waitingUnbind' || phase === 'readyUnbind',
    [phase],
  );

  const actionBtnText = useMemo(() => {
    if (phase === 'idle') return '开始解绑';
    if (phase === 'pairing') return '配对中...';
    if (phase === 'waitingUnbind') return '解绑';
    if (phase === 'readyUnbind') return `解绑${keyResponse}`;
    return '开始解绑';
  }, [keyResponse, phase]);

  useEffect(() => {
    if (
      !countdownActiveRef.current ||
      isCounting ||
      count > 0 ||
      phase !== 'waitingUnbind'
    ) {
      return;
    }

    countdownActiveRef.current = false;
    resetToIdle();
    showToast({
      title: '未识别到要解绑的钥匙，请重试',
      icon: 'info',
    });
  }, [count, isCounting, phase, resetToIdle]);

  useEffect(() => {
    return () => {
      stopKeyResponsePoll();
      stopCountdown();
      countdownActiveRef.current = false;
    };
  }, [stopCountdown, stopKeyResponsePoll]);

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      safeAreaEdges={['top', 'bottom']}
      navBorder
      pageNavProps={{
        text: '解绑',
        showBack: true,
      }}
      scrollable={false}
    >
      <View style={styles.container}>
        {showCountdown ? (
          <View style={styles.countdownSection}>
            <Text style={styles.countdownLabel}>
              {phase === 'readyUnbind'
                ? '已检测到钥匙，请尽快解绑'
                : '请按视频操作遥控钥匙'}
            </Text>
            {isCounting ? (
              <Text style={styles.countdownNumber}>{count}s</Text>
            ) : null}
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>遥控钥匙解绑视频</Text>
        <View style={styles.videoWrap}>
          <Video
            key={videoKey}
            ref={videoRef}
            source={{ uri: videoUrl }}
            paused={paused}
            controls={false}
            poster={posterUrl}
            posterResizeMode="cover"
            resizeMode="cover"
            onEnd={resetVideo}
            onError={() => {
              showToast({ title: '视频加载失败', icon: 'info' });
              resetVideo();
            }}
            style={styles.video}
          />
          {showPlayBtn ? (
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.playOverlay}
              onPress={() => {
                setShowPlayBtn(false);
                setPaused(false);
              }}
            >
              <View style={styles.playCircle}>
                <AppIcon name="play" size={px(48)} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.noticeSection}>
          <Text style={styles.sectionTitle}>解除绑定须知</Text>
          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>
              地锁解除遥控钥匙后，将无法使用遥控钥匙控制地锁升降
            </Text>
          </View>
        </View>

        {!params?.hasButtonKeyFlag && (
          <View style={styles.footerWrap}>
            <TouchableOpacity
              activeOpacity={disableUnbind ? 1 : 0.85}
              disabled={disableUnbind}
              style={[
                styles.unbindBtn,
                disableUnbind ? styles.unbindBtnDisabled : {},
              ]}
              onPress={handleActionPress}
            >
              <Text style={styles.unbindBtnText}>{actionBtnText}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </PageContainer>
  );
}
