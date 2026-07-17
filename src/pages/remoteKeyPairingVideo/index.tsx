import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Video from 'react-native-video';
import PageContainer from '@/components/PageContainer';
import AppIcon from '@/components/AppIcon';
import PopConfirm, { type PopConfirmRef } from '@/components/popConfirm';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { useCountDown } from '@/hooks/useCountDown';
import {
  bindKey,
  bindKeyResult,
  getDeviceKeyResponse,
  getDeviceTestKeyResponse,
  startPairing,
  startPairingResult,
  testBindKey,
  testBindKeyResult,
  testStartPairing,
  testStartPairingResult,
} from '@/services/deviceInfo';
import { hideLoading, loopFunc, showLoading, showToast } from '@/utils';
import { px } from '@/utils/ui';
import { styles } from './style';

const DEFAULT_POSTER_URL =
  'https://g.18qjz.cn/img/boklock/remoteKeyPairingPoster.png';
const DEFAULT_VIDEO_URL =
  'https://g.18qjz.cn/img/boklock/remoteKeyPairingVideo.mp4';

const POLL_INTERVAL_MS = 1000;
const POLL_TIMEOUT_MS = 1000 * 60;
const KEY_RESPONSE_COUNTDOWN = 180;

type PairingPhase = 'idle' | 'pairing' | 'waitingBind' | 'readyBind';

export default function RemoteKeyPairingVideo() {
  const { params } = useRoute<any>() as {
    params?: {
      lockId?: string | number;
      videoUrl?: string;
      posterUrl?: string;
      pageType?: string;
    };
  };
  const navigation = useAppNavigation();
  const popConfirmRef = useRef<PopConfirmRef>(null);
  const pollStopRef = useRef<(() => void) | null>(null);
  const countdownActiveRef = useRef(false);
  /** 仅在倒计时真正跑过（isCounting true→false）后才判定超时，避免初始 count=0 误触发 */
  const wasCountingRef = useRef(false);
  const videoRef = useRef<any>(null);

  const deviceNo = params?.lockId ? String(params.lockId) : '';
  const isAddKeyMode = !!deviceNo;

  const [showPlayBtn, setShowPlayBtn] = useState(true);
  const [paused, setPaused] = useState(true);
  const [showPoster, setShowPoster] = useState(true);
  const [videoKey, setVideoKey] = useState(0);
  const [phase, setPhase] = useState<PairingPhase>('idle');
  const [keyResponse, setKeyResponse] = useState('');

  const {
    start: startCountdown,
    stop: stopCountdown,
    count,
    isCounting,
  } = useCountDown(KEY_RESPONSE_COUNTDOWN);

  const videoUrl = params?.videoUrl || DEFAULT_VIDEO_URL;
  const posterUrl = params?.posterUrl || DEFAULT_POSTER_URL;
  const pageType = params?.pageType || 'normal';

  const resetVideo = useCallback(() => {
    setShowPlayBtn(true);
    setPaused(true);
    setShowPoster(true);
    setVideoKey(k => k + 1);
  }, []);

  const stopKeyResponsePoll = useCallback(() => {
    pollStopRef.current?.();
    pollStopRef.current = null;
  }, []);

  const resetToIdle = useCallback(() => {
    countdownActiveRef.current = false;
    wasCountingRef.current = false;
    stopKeyResponsePoll();
    stopCountdown();
    setKeyResponse('');
    setPhase('idle');
  }, [stopCountdown, stopKeyResponsePoll]);

  const startKeyResponsePoll = useCallback(() => {
    if (!deviceNo) return;

    stopKeyResponsePoll();
    const { start, stop } = loopFunc(async () => {
      try {
        const res: any =
          pageType === 'test'
            ? await getDeviceTestKeyResponse({ deviceNo })
            : await getDeviceKeyResponse({ deviceNo });
        if (res?.code === 200 && res?.success && res?.data) {
          countdownActiveRef.current = false;
          wasCountingRef.current = false;
          stopCountdown();
          setKeyResponse(String(res.data));
          setPhase('readyBind');
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
          const res: any =
            pageType === 'test'
              ? await testStartPairingResult({ deviceNo })
              : await startPairingResult({ deviceNo });
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

  const pollBindResult = useCallback(
    (keyNo: string): Promise<boolean> => {
      return new Promise(resolve => {
        let timeoutTimer: ReturnType<typeof setTimeout> | null = null;
        const { start: startPoll, stop: stopPoll } = loopFunc(async () => {
          try {
            const res: any =
              pageType === 'test'
                ? await testBindKeyResult({ deviceNo, keyNo })
                : await bindKeyResult({ deviceNo, keyNo });
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
            console.error('bindKeyResult error:', e);
          }
          return true;
        }, POLL_INTERVAL_MS);

        timeoutTimer = setTimeout(() => {
          stopPoll();
          resolve(false);
        }, POLL_TIMEOUT_MS);
        startPoll();
      });
    },
    [deviceNo],
  );

  const handleStartPairing = useCallback(async () => {
    if (!deviceNo || phase === 'pairing') return;

    setPhase('pairing');
    setKeyResponse('');
    showLoading({ title: '开始绑定...' });

    try {
      const res: any =
        pageType === 'test'
          ? await testStartPairing({ deviceNo })
          : await startPairing({ deviceNo });
      if (!(res?.code === 200 && res?.success)) {
        hideLoading();
        setPhase('idle');
        showToast({
          title: res?.message || res?.msg || '绑定失败',
          icon: 'info',
        });
        return;
      }

      const pairOk = await pollPairingResult();
      hideLoading();

      if (!pairOk) {
        setPhase('idle');
        showToast({ title: '绑定失败', icon: 'info' });
        return;
      }

      wasCountingRef.current = false;
      startCountdown();
      countdownActiveRef.current = true;
      setPhase('waitingBind');
      startKeyResponsePoll();
    } catch {
      hideLoading();
      setPhase('idle');
      showToast({ title: '绑定失败', icon: 'info' });
    }
  }, [
    deviceNo,
    phase,
    pollPairingResult,
    startCountdown,
    startKeyResponsePoll,
  ]);

  const handleConfirmBind = useCallback(async () => {
    if (!deviceNo || !keyResponse) return;

    popConfirmRef.current?.close();
    showLoading({ title: '绑定中...' });

    try {
      const res: any =
        pageType === 'test'
          ? await testBindKey({ deviceNo, keyNo: keyResponse })
          : await bindKey({ deviceNo, keyNo: keyResponse });

      if (!(res?.code === 200 && res?.success)) {
        hideLoading();
        showToast({
          title: res?.message || res?.msg || '绑定失败',
          icon: 'info',
        });
        return;
      }

      const bindOk = await pollBindResult(keyResponse);
      hideLoading();

      if (bindOk) {
        countdownActiveRef.current = false;
        stopCountdown();
        stopKeyResponsePoll();
        showToast({ title: '绑定成功', icon: 'success' });
        setTimeout(() => navigation.goBack(), 800);
      } else {
        showToast({ title: '绑定失败', icon: 'info' });
      }
    } catch {
      hideLoading();
      showToast({ title: '绑定失败', icon: 'info' });
    }
  }, [
    deviceNo,
    keyResponse,
    navigation,
    pollBindResult,
    stopCountdown,
    stopKeyResponsePoll,
  ]);

  const handleActionPress = useCallback(() => {
    if (phase === 'idle') {
      void handleStartPairing();
      return;
    }
    if (phase === 'readyBind' && keyResponse) {
      popConfirmRef.current?.open();
    }
  }, [handleStartPairing, keyResponse, phase]);

  const disableAction = useMemo(() => {
    if (phase === 'pairing') return true;
    if (phase === 'waitingBind') return true;
    if (phase === 'readyBind') return false;
    return false;
  }, [phase]);

  const showCountdown = useMemo(
    () => phase === 'waitingBind' || phase === 'readyBind',
    [phase],
  );

  const actionBtnText = useMemo(() => {
    if (phase === 'idle') return '开始绑定';
    if (phase === 'pairing') return '查找钥匙中...';
    if (phase === 'waitingBind') return '绑定';
    if (phase === 'readyBind') return `绑定${keyResponse}`;
    return '开始绑定';
  }, [count, isCounting, keyResponse, phase]);

  useEffect(() => {
    if (isCounting) {
      wasCountingRef.current = true;
      return;
    }

    // 必须曾进入过倒计时，再变为结束，才算超时（避免刚进入 waitingBind 时 count/isCounting 仍是初值误触发）
    if (
      !countdownActiveRef.current ||
      !wasCountingRef.current ||
      count > 0 ||
      phase !== 'waitingBind'
    ) {
      return;
    }

    countdownActiveRef.current = false;
    wasCountingRef.current = false;
    resetToIdle();
    showToast({
      title: '未识别到要绑定的钥匙，请重新',
      icon: 'info',
    });
  }, [count, isCounting, phase, resetToIdle]);

  useEffect(() => {
    return () => {
      stopKeyResponsePoll();
      stopCountdown();
      countdownActiveRef.current = false;
      wasCountingRef.current = false;
    };
  }, [stopCountdown, stopKeyResponsePoll]);

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      safeAreaEdges={['top', 'bottom']}
      navBorder
      pageNavProps={{
        text: '遥控钥匙配对视频',
        showBack: true,
      }}
      scrollable={false}
    >
      <View style={styles.container}>
        {showCountdown ? (
          <View style={styles.countdownSection}>
            <Text style={styles.countdownLabel}>
              {phase === 'readyBind'
                ? '已检测到钥匙，请尽快绑定'
                : '请按视频操作遥控钥匙'}
            </Text>
            {isCounting ? (
              <Text style={styles.countdownNumber}>{count}s</Text>
            ) : null}
          </View>
        ) : null}
        <View style={styles.videoWrap}>
          <Video
            key={videoKey}
            ref={videoRef}
            source={{ uri: videoUrl }}
            paused={paused}
            controls={false}
            resizeMode="cover"
            onLoadStart={() => {
              setShowPoster(true);
            }}
            onReadyForDisplay={() => {
              if (!paused) {
                setShowPoster(false);
              }
            }}
            onEnd={resetVideo}
            onError={() => {
              showToast({ title: '视频加载失败', icon: 'info' });
              resetVideo();
            }}
            style={styles.video}
          />
          {showPoster ? (
            <Image
              source={{ uri: posterUrl }}
              resizeMode="cover"
              style={styles.poster}
            />
          ) : null}
          {showPlayBtn ? (
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.playOverlay}
              onPress={() => {
                setShowPlayBtn(false);
                setPaused(false);
                setShowPoster(true);
              }}
            >
              <View style={styles.playCircle}>
                <AppIcon name="play" size={px(48)} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          ) : null}
        </View>

        {isAddKeyMode ? (
          <>
            <View style={styles.footerWrap}>
              <TouchableOpacity
                activeOpacity={disableAction ? 1 : 0.85}
                disabled={disableAction}
                style={[
                  styles.actionBtn,
                  disableAction ? styles.actionBtnDisabled : {},
                ]}
                onPress={handleActionPress}
              >
                <Text style={styles.actionBtnText}>{actionBtnText}</Text>
              </TouchableOpacity>
            </View>

            <PopConfirm
              ref={popConfirmRef}
              title={`是否绑定${keyResponse}？`}
              confirmText="确定"
              cancelText="取消"
              onConfirm={handleConfirmBind}
              onCancel={() => {
                popConfirmRef.current?.close();
              }}
            />
          </>
        ) : null}
      </View>
    </PageContainer>
  );
}
