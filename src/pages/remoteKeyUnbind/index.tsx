import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Video from 'react-native-video';
import PageContainer from '@/components/PageContainer';
import AppIcon from '@/components/AppIcon';
import Flex from '@/components/Flex';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import {
  getDeviceKeyList,
  getDeviceKeyResponse,
  getTestDeviceKeyResponse,
  startPairing,
  startPairingResult,
  testStartPairing,
  testStartPairingResult,
  unbindKeyTest,
  unbindKeyTestResult,
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
const PAIRING_POLL_TIMEOUT_MS = 1000 * 60;
const UNBIND_POLL_TIMEOUT_MS = 10000;

type KeyItem = { label: string; value: string };

export default function RemoteKeyUnbind() {
  const { params } = useRoute<any>() as {
    params?: {
      deviceNo?: string;
      key?: string;
      id?: number | string;
      hasButtonKeyFlag?: boolean | string | number;
      pageType?: string;
    };
  };
  const navigation = useAppNavigation();

  const deviceNo = params?.deviceNo || '';
  const lockId = params?.id;
  const isTest = params?.pageType === 'test';
  const hasButtonKey = useMemo(() => {
    const flag = params?.hasButtonKeyFlag;
    return flag === true || flag === 1 || flag === '1' || flag === 'true';
  }, [params?.hasButtonKeyFlag]);

  const [showPlayBtn, setShowPlayBtn] = useState(true);
  const [paused, setPaused] = useState(true);
  const [videoKey, setVideoKey] = useState(0);
  const [showPoster, setShowPoster] = useState(true);
  const [showNotice, setShowNotice] = useState(false);
  const [keyList, setKeyList] = useState<KeyItem[]>([]);
  const [recognizedKeys, setRecognizedKeys] = useState<string[]>([]);
  const [selectedKey, setSelectedKey] = useState('');
  const [unbinding, setUnbinding] = useState(false);

  const videoRef = useRef<any>(null);
  const stopKeyPollRef = useRef<(() => void) | null>(null);
  const stopPairingPollRef = useRef<(() => void) | null>(null);
  const keyListRef = useRef(keyList);
  const recognizedKeysRef = useRef(recognizedKeys);

  useEffect(() => {
    keyListRef.current = keyList;
  }, [keyList]);

  useEffect(() => {
    recognizedKeysRef.current = recognizedKeys;
  }, [recognizedKeys]);

  const resetVideo = useCallback(() => {
    setShowPlayBtn(true);
    setPaused(true);
    setShowPoster(true);
    setVideoKey(k => k + 1);
  }, []);

  const stopAllPoll = useCallback(() => {
    stopPairingPollRef.current?.();
    stopPairingPollRef.current = null;
    stopKeyPollRef.current?.();
    stopKeyPollRef.current = null;
  }, []);

  // 拉取钥匙列表
  useEffect(() => {
    if (!deviceNo || !hasButtonKey) return;

    let cancelled = false;
    (async () => {
      try {
        const res: any = await getDeviceKeyList({ deviceNo });
        if (cancelled) return;
        if (res?.code === 200 && res?.success && Array.isArray(res?.data)) {
          setKeyList(
            res.data.map((item: any) => ({
              label: String(item),
              value: String(item),
            })),
          );
        }
      } catch {
        // 列表拉取失败时保持空列表
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [deviceNo, hasButtonKey]);

  // 进入页面后自动配对，成功后轮询钥匙响应
  useEffect(() => {
    if (!deviceNo || !hasButtonKey) return;

    let cancelled = false;

    const startKeyResponsePoll = () => {
      stopKeyPollRef.current?.();
      const { start, stop } = loopFunc(async () => {
        try {
          const res: any = isTest
            ? await getTestDeviceKeyResponse({ deviceNo })
            : await getDeviceKeyResponse({ deviceNo });
          if (res?.code === 200 && res?.success && res?.data) {
            const key = String(res.data);
            const inList = keyListRef.current?.some(
              item => String(item.value) === key,
            );
            if (inList && !recognizedKeysRef.current.includes(key)) {
              setRecognizedKeys([...recognizedKeysRef.current, key]);
            }
          }
        } catch {
          // 继续轮询
        }
        return true;
      }, POLL_INTERVAL_MS);
      stopKeyPollRef.current = stop;
      start();
    };

    const runPairingThenPoll = async () => {
      try {
        const res: any = isTest
          ? await testStartPairing({ deviceNo })
          : await startPairing({ deviceNo });
        if (cancelled) return;
        if (!(res?.code === 200 && res?.success)) {
          showToast({
            title: res?.message || res?.msg || '启动解绑失败',
            icon: 'info',
          });
          return;
        }

        const pollSuccess = await new Promise<boolean>(resolve => {
          let timeoutTimer: ReturnType<typeof setTimeout> | null = null;
          const { start: startPoll, stop: stopPoll } = loopFunc(async () => {
            if (cancelled) {
              stopPoll();
              resolve(false);
              return false;
            }
            try {
              const result: any = isTest
                ? await testStartPairingResult({ deviceNo })
                : await startPairingResult({ deviceNo });
              if (result?.code === 200 && result?.success && result?.data) {
                stopPoll();
                if (timeoutTimer) clearTimeout(timeoutTimer);
                resolve(true);
                return false;
              }
            } catch {
              // 继续轮询
            }
            return true;
          }, POLL_INTERVAL_MS);

          stopPairingPollRef.current = stopPoll;
          timeoutTimer = setTimeout(() => {
            stopPoll();
            resolve(false);
          }, PAIRING_POLL_TIMEOUT_MS);
          startPoll();
        });

        if (cancelled) return;
        if (pollSuccess) {
          startKeyResponsePoll();
        } else {
          showToast({ title: '解绑失败,稍后重试', icon: 'info' });
        }
      } catch {
        if (!cancelled) {
          showToast({ title: '解绑失败,稍后重试', icon: 'info' });
        }
      }
    };

    runPairingThenPoll();

    return () => {
      cancelled = true;
      stopAllPoll();
    };
  }, [deviceNo, hasButtonKey, isTest, stopAllPoll]);

  const handleSelectKey = useCallback(
    (value: string) => {
      if (!recognizedKeys.includes(value)) return;
      setSelectedKey(prev => (prev === value ? '' : value));
    },
    [recognizedKeys],
  );

  const handleUnbindKeyTest = useCallback(async () => {
    if (!deviceNo || !selectedKey || unbinding) return;

    setUnbinding(true);
    stopAllPoll();
    showLoading({ title: '解绑中...' });

    try {
      const res: any = await unbindKeyTest({ deviceNo, keyNo: selectedKey });
      if (!(res?.code === 200 && res?.success)) {
        hideLoading();
        setUnbinding(false);
        showToast({
          title: res?.message || res?.msg || '解绑失败',
          icon: 'info',
        });
        return;
      }

      const pollSuccess = await new Promise<boolean>(resolve => {
        let timeoutTimer: ReturnType<typeof setTimeout> | null = null;
        const { start: startPoll, stop: stopPoll } = loopFunc(async () => {
          try {
            const result: any = await unbindKeyTestResult({
              deviceNo,
              keyNo: selectedKey,
            });
            if (result?.data) {
              stopPoll();
              if (timeoutTimer) {
                clearTimeout(timeoutTimer);
                timeoutTimer = null;
              }
              resolve(true);
              return false;
            }
          } catch (e) {
            console.error('unbindKeyTestResult error:', e);
          }
          return true;
        }, POLL_INTERVAL_MS);

        stopKeyPollRef.current = stopPoll;
        timeoutTimer = setTimeout(() => {
          stopPoll();
          resolve(false);
        }, UNBIND_POLL_TIMEOUT_MS);
        startPoll();
      });

      hideLoading();
      if (pollSuccess) {
        showToast({ title: '解绑成功', icon: 'success' });
        setTimeout(() => navigation.goBack(), 800);
      } else {
        setUnbinding(false);
        showToast({ title: '解绑失败', icon: 'info' });
      }
    } catch {
      hideLoading();
      setUnbinding(false);
      showToast({ title: '解绑失败', icon: 'info' });
    }
  }, [deviceNo, navigation, selectedKey, stopAllPoll, unbinding]);

  const handleUnbind = useCallback(async () => {
    if (!selectedKey || !lockId) return;

    if (isTest) {
      void handleUnbindKeyTest();
      return;
    }

    const res: any = await getLockInfo({ id: lockId });
    if (res?.code === 200 && res?.success) {
      const phoneNumber = res?.data?.adminMobile;
      navigation.navigate('UnbindDevice' as any, {
        deviceNo,
        key: selectedKey,
        phoneNumber,
        type: 'remoteKey',
        id: lockId,
      });
      return;
    }
    showToast({
      title: res?.message || res?.msg || '获取设备信息失败',
      icon: 'info',
    });
  }, [deviceNo, handleUnbindKeyTest, isTest, lockId, navigation, selectedKey]);

  const unbindBtnDisabled = !selectedKey || unbinding;

  const footer = useMemo(() => {
    if (!hasButtonKey) return undefined;
    return (
      <View style={styles.footerWrap}>
        <TouchableOpacity
          activeOpacity={unbindBtnDisabled ? 1 : 0.85}
          disabled={unbindBtnDisabled}
          style={[
            styles.unbindBtn,
            unbindBtnDisabled ? styles.unbindBtnDisabled : null,
          ]}
          onPress={() => {
            if (unbindBtnDisabled) return;
            void handleUnbind();
          }}
        >
          <Text style={styles.unbindBtnText}>确定解绑</Text>
        </TouchableOpacity>
      </View>
    );
  }, [handleUnbind, hasButtonKey, unbindBtnDisabled]);

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
      footer={footer}
    >
      <View style={styles.container}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>遥控钥匙解绑视频</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.tips}
            onPress={() => setShowNotice(v => !v)}
          >
            <Text style={styles.tipsText}>解绑须知</Text>
            <AppIcon name="explain" size={px(18)} color="#333333" />
          </TouchableOpacity>

          {showNotice ? (
            <Text style={styles.noticeText}>
              地锁解除遥控钥匙后，将无法使用遥控钥匙控制地锁升降
            </Text>
          ) : null}
        </View>

        <View style={styles.videoWrap}>
          <Video
            key={videoKey}
            ref={videoRef}
            source={{ uri: DEFAULT_VIDEO_URL }}
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
              source={{ uri: DEFAULT_POSTER_URL }}
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

        {hasButtonKey ? (
          <View style={styles.keyListWrap}>
            <ScrollView
              style={styles.keyListScroll}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            >
              <Flex direction="column">
                {keyList.map(item => {
                  const value = String(item.value);
                  const isRecognized = recognizedKeys.includes(value);
                  const isSelected = selectedKey === value;
                  return (
                    <Flex
                      key={value}
                      isTouchView
                      direction="row"
                      align="center"
                      justify="between"
                      style={styles.keyItem}
                      onPress={() => handleSelectKey(value)}
                    >
                      <View style={styles.left}>
                        <Text style={styles.keyItemText}>{item.label}</Text>
                        <Text
                          style={[
                            styles.status,
                            isRecognized
                              ? styles.statusCompleted
                              : styles.statusUncompleted,
                          ]}
                        >
                          {isRecognized ? '已识别到钥匙' : '未识别到钥匙'}
                        </Text>
                      </View>
                      <View style={styles.right}>
                        <Image
                          source={{
                            uri: `https://g.18qjz.cn/img/boklock/${
                              isSelected ? 'radio_checked' : 'radio_default'
                            }.png`,
                          }}
                          style={styles.radioImg}
                          resizeMode="contain"
                        />
                      </View>
                    </Flex>
                  );
                })}
              </Flex>
            </ScrollView>
          </View>
        ) : null}
      </View>
    </PageContainer>
  );
}
